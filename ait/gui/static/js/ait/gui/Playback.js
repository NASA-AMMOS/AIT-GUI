import m from 'mithril'
import map from 'lodash/map'
import {TelemetryDictionary, TelemetryStream} from '../tlm'

/**
 * Playback historical telemetry data by inputting packet name and time range
 * Provides a timeline slider for jumping to specific timestamp location
 *
 * @example
 * <ait-playback></ait-playback>
 */
const Playback = {
    _range: [],
    _packet: null,
    _start_time: null,
    _end_time: null,
    _validation_errors: {},
    _slider: null,
    _current_time: null,
    _timer: null,
    _first_click: true,

    oninit(vnode) {
        // Get time ranges for each packet from database
        m.request({
            method: 'GET',
            url: '/playback/range'
        }).then((r) => {
            this._range = r
        })

        // Time for range updates
        this._minute = this.getCurrentMinute()

        // Initalize slider
        this._slider = m('input', {class: 'slider', type: 'range', min: '0', max: '1', value: '0',
            oninput: (e) => {
                let current_value = vnode.dom.getElementsByClassName('slider')[0].value
                let formatted_time = new Date(current_value * 100).toISOString().substring(0, 21) + 'Z'
                this._current_time = m('div', {class: 'timeline-current'}, 'Current time: ' + formatted_time)
            }
        })
    },

    getCurrentMinute() {
        // return current minute
        var today = new Date()
        return today.getMinutes()
    },

    onupdate(vnode) {
        // update time range available every new minute
        if ( this.getCurrentMinute() != this._minute ) {
            this._minute = this.getCurrentMinute()
            m.request({
                method: 'GET',
                url: '/playback/range'
            }).then((r) => {
                this._range = r
            })
        }
    },

    view(vnode) {
        // Display time ranges available
        let range = m('div', {class: 'form-group'}, [
            m('label', 'Time ranges available'),
            m('div', {'class': 'alert alert-warning'},
                'No time ranges found. Is your database connection configured?'
            )
        ])

        if (this._range.length > 0) {
            range = m('div', {class: 'form-group'}, [
                m('label', 'Time ranges available'),
                this._range.map(function(i) {
                    return m('div', i[0] + ': ' + i[1] + ' to ' + i[2])
                })
            ])
        }

        // Packet select drop down menu
        let packets = m('div', {class: 'form-group col-xs-3'}, [
            m('label', 'Telemetry packet:'),
            m('select', {class: 'form-control', name: 'packet'}, [
                m('option', {disabled: 'disabled', selected: 'selected'}, 'Select an option')].concat(
                    map(this._range, (i) => {
                        return m('option', {value: i[0]}, i[0])
                    })
                )
            )
        ])
        if (this._validation_errors['packet']) {
            packets.attrs.className += ' has-error'
        }

        // Start time input
        let startTime = m('div', {class: 'form-group col-xs-3'}, [
            m('label', 'Start time:'),
            m('input', {class: 'form-control', placeholder: 'YYYY-MM-DDTHH:MM:SSZ', name: 'startTime'})
        ])
        if (this._validation_errors['startTime']) {
            startTime.attrs.className += ' has-error'
        }

        // End time input
        let endTime = m('div', {class: 'form-group col-xs-3'}, [
            m('label', 'End time:'),
            m('input', {class: 'form-control', placeholder: 'YYYY-MM-DDTHH:MM:SSZ', name: 'endTime'})
        ])
        if (this._validation_errors['endTime']) {
            endTime.attrs.className += ' has-error'
        }

        // Query button
        let queryBtn = m('div', {class: 'form-group col-xs-3'}, [
            m('div', {style: 'height: 25px'}),
            m('button', {class: 'btn btn-success query', type: 'submit'}, 'Query')
        ])

        // Form created when query button is clicked
        let form = m('form', {
            class: 'form-row',
            onsubmit: (e) => {
                e.preventDefault()
                let form = e.currentTarget
                let data = new FormData()

                if (!this._validate_form(form)) {
                    return false
                }

                // Get packet, start time, and end time from form and append to data
                this._packet = form.elements['packet'].value
                this._start_time = form.elements['startTime'].value.substr(0, 19) + '.0' + 'Z'
                this._end_time = form.elements['endTime'].value.substr(0, 19) + '.0' + 'Z'
                data.append('packet', this._packet)
                data.append('startTime', this._start_time)
                data.append('endTime', this._end_time)

                // Send data to backend
                m.request({
                    url: '/playback/query',
                    method: 'POST',
                    data: data
                })

                // Set timeline values and display timeline
                vnode.dom.getElementsByClassName('slider')[0].min = Date.parse(this._start_time) / 100
                vnode.dom.getElementsByClassName('slider')[0].max = Date.parse(this._end_time) / 100
                vnode.dom.getElementsByClassName('slider')[0].value = 0
                this._current_time = m('div', {class: 'timeline-current'}, 'Current time: ' + this._start_time)
                vnode.dom.getElementsByClassName('timeline')[0].style.display = 'block'

                // Display controls and hide query button
                vnode.dom.getElementsByClassName('controls')[0].style.display = 'block'
                vnode.dom.getElementsByClassName('play')[0].style.display = 'inline-block'
                vnode.dom.getElementsByClassName('pause')[0].style.display = 'none'
                vnode.dom.getElementsByClassName('query')[0].style.display = 'none'

                this._first_click = true
            }
        }, [packets, startTime, endTime, queryBtn,])

        // Timeline container
        let timeline =
            m('div', {class:'timeline', style:'display:none'}, [
                this._slider,
                m('div', {class:'timeline-start'}, this._start_time),
                m('div', {class:'timeline-end'}, this._end_time),
                this._current_time,
            ])

        // Button to start playback
        let playBtn =
            m('button', {
                class: 'btn btn-success play', style: 'display: none',
                onclick: (e) => {

                    // Run when play button clicked for first time
                    if (this._first_click) {
                        // Emit event that playback is on
                        ait.events.emit('ait:playback:on')
                        m.request({
                            url: '/playback/on',
                            method: 'PUT'
                        })

                        this._first_click = false
                    }

                    this.start_slider(vnode, this._end_time)
                    vnode.dom.getElementsByClassName('play')[0].style.display = 'none'
                    vnode.dom.getElementsByClassName('pause')[0].style.display = 'inline-block'
                },
            }, 'Play')

        // Button to pause playback
        let pauseBtn =
            m('button', {
                class: 'btn btn-success pause', style: 'display: none',
                onclick: (e) => {
                    this.stop_slider()
                    vnode.dom.getElementsByClassName('pause')[0].style.display = 'none'
                    vnode.dom.getElementsByClassName('play')[0].style.display = 'inline-block'
                },
            }, 'Pause')

        // Button to abort playback and return to realtime
        let abortBtn =
            m('button', {
                class: 'btn btn-danger', style: 'display: inline-block',
                onclick: (e) => {

                    // Hide timeline and controls and display query button
                    vnode.dom.getElementsByClassName('timeline')[0].style.display = 'none'
                    vnode.dom.getElementsByClassName('controls')[0].style.display = 'none'
                    vnode.dom.getElementsByClassName('query')[0].style.display = 'inline-block'

                    // Only run if play button was clicked
                    if (this._first_click == false) {
                        // Emit event that playback is off
                        ait.events.emit('ait:playback:off')

                        this.stop_slider()

                        // Abort playback on backend
                        m.request({
                            url: '/playback/abort',
                            method: 'PUT'
                        })
                    }
                },
            }, 'Abort')

        // Button controls
        let controls = m('div', {class: 'controls', style: 'display: none'}, [playBtn, pauseBtn, abortBtn])

        return m('ait-playback', vnode.attrs, [
            range, form, timeline, controls
        ])
    },

    start_slider(vnode, end_time) {
        // Move the slider to the right every 0.1 seconds
        if (this._timer) return
        let start = Date.now()
        let difference = 0

        // Timer that updates every 0.01 seconds
         this._timer = setInterval(function() {
            let delta = Math.floor((Date.now() - start) / 100)
            if (delta > difference) {
                difference = delta
                let current_value = ++vnode.dom.getElementsByClassName('slider')[0].value
                let formatted_time = new Date(current_value * 100).toISOString().substring(0, 21) + 'Z'

                if (formatted_time <= end_time) {
                    vnode.dom.getElementsByClassName('timeline-current')[0].innerHTML = 'Current time: ' + formatted_time
                    // Send timestamp to be evaluated by backend
                    let data = new FormData()
                    data.append('timestamp', formatted_time)
                    m.request({
                        url: '/playback/send',
                        method: 'POST',
                        data: data
                    })
                }
            }
        },10)
    },

    stop_slider() {
        // Stop moving the slider
        clearInterval(this._timer)
        this._timer = null
    },

    _validate_form(form) {
        // Check form for errors
        this._validation_errors = {}

        if (form.elements['packet'].selectedIndex === 0) {
            this._validation_errors['packet'] = true
        }
        let datetimeRegex = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\dZ$/
        if (!datetimeRegex.test(form.elements['startTime'].value)) {
            this._validation_errors['startTime'] = true
        }
        if (!datetimeRegex.test(form.elements['endTime'].value)) {
            this._validation_errors['endTime'] = true
        }

        return Object.keys(this._validation_errors).length === 0
    },
}


export default Playback
export { Playback }
