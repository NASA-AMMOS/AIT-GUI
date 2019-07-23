import m from 'mithril'
import map from 'lodash/map'


/**
 * Playback historical telemetry data by inputting packet name and time range
 * Provides a timeline slider for jumping to specific timestamp location
 *
 * @example
 * <ait-playback></ait-playback>
 */
const Playback = {
    _range: [],
    _packet_bars: [],
    _packet: null,
    _start_time: null,
    _end_time: null,
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
            this._packet_bars = [m(PacketBar, {range: r})]
        })

        // Initialize slider to update current time when sliding
        this._slider = m('input', {class: 'slider', type: 'range', min: '0', max: '1', value: '0',
            oninput: (e) => {
                let current_value = vnode.dom.getElementsByClassName('slider')[0].value
                let current_time = new Date(current_value * 100).toISOString().substring(0, 21) + 'Z'
                this._current_time = 'Current time: ' + current_time
            }
        })
    },

    view(vnode) {

        // Update time ranges every time a packet is sent
        ait.events.on('ait:tlm:packet', () => {
            m.request({
                method: 'GET',
                url: '/playback/range'
            }).then((r) => {
                this._range = r
            })
        })

        // Display time ranges available
        let range = m('div', {class: 'form-group'}, [
            m('label', 'Time ranges available'),
            this._range.map(function(i) {
                return m('div', i[0] + ': ' + i[1] + ' to ' + i[2])
            })
        ])

        let addPacketBtn =
            m('button', {
                class: 'btn btn-success add-packet',
                onclick: (e) => {
                    this._packet_bars.push(m(PacketBar, {range: this._range}))
                }
            }, 'Add packet')

        let removePacketBtn =
            m('button', {
                class: 'btn btn-danger remove-packet',
                onclick: (e) => {
                    if (this._packet_bars.length > 1)
                        this._packet_bars.pop()
                }
            }, 'Remove packet')

        // Query button
        let queryBtn =
            m('button', {
                class: 'btn btn-success pull-right query',
                onclick: (e) => {
                    let data = new FormData()

                    // Get packet, start time, and end time lists from form
                    let packet_list = vnode.dom.getElementsByClassName('packets')
                    let start_list = vnode.dom.getElementsByClassName('start-time')
                    let end_list = vnode.dom.getElementsByClassName('end-time')
                    if (!this._validate_form(packet_list, start_list, end_list))
                        return false
                    // Extract values from lists
                    let packet_values = []
                    let start_values = []
                    let end_values = []
                    for (let i = 0; i < packet_list.length; ++i) {
                        packet_values.push(packet_list[i].value)
                        start_values.push(start_list[i].value)
                        end_values.push(end_list[i].value)
                    }

                    // Append value lists to data
                    data.append('packet', JSON.stringify(packet_values))
                    data.append('startTime', JSON.stringify(start_values))
                    data.append('endTime', JSON.stringify(end_values))
                    // Send data to backend
                    m.request({
                        url: '/playback/query',
                        method: 'POST',
                        data: data
                    })

                    // Find start and end time for timeline
                    this._start_time = start_values[0]
                    this._end_time = end_values[0]
                    for (let i = 1; i < start_values.length; ++i) {
                        if (start_values[i] < this._start_time)
                            this._start_time = start_values[i]
                        if (end_values[i] > this._end_time)
                            this._end_time = end_values[i]
                    }
                    this._current_time = this._start_time

                    // Set timeline values and display timeline
                    this._current_time = 'Current time: ' + this._start_time
                    vnode.dom.getElementsByClassName('slider')[0].min = Date.parse(this._start_time) / 100
                    vnode.dom.getElementsByClassName('slider')[0].max = Date.parse(this._end_time) / 100
                    vnode.dom.getElementsByClassName('slider')[0].value = 0
                    vnode.dom.getElementsByClassName('timeline-label')[0].style.display = 'block'
                    vnode.dom.getElementsByClassName('timeline')[0].style.display = 'block'

                    // Display controls and hide packet/query buttons
                    vnode.dom.getElementsByClassName('controls')[0].style.display = 'block'
                    vnode.dom.getElementsByClassName('play')[0].style.display = 'inline-block'
                    vnode.dom.getElementsByClassName('pause')[0].style.display = 'none'
                    vnode.dom.getElementsByClassName('add-packet')[0].style.display = 'none'
                    vnode.dom.getElementsByClassName('remove-packet')[0].style.display = 'none'
                    vnode.dom.getElementsByClassName('query')[0].style.display = 'none'

                    this._first_click = true
                }
            }, 'Query')

        // Timeline container
        let timeline = [
            m('label', {class: 'timeline-label', style:'display:none'}, 'Timeline: '),
            m('div', {class:'timeline', style:'display:none'}, [
                this._slider,
                m('div', {class:'timeline-start'}, this._start_time),
                m('div', {class:'timeline-end'}, this._end_time),
                m('div', {class: 'timeline-current'}, this._current_time)
            ])
        ]

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
                class: 'btn btn-danger abort', style: 'display: inline-block',
                onclick: (e) => {

                    // Hide timeline and controls and display packet/query button
                    vnode.dom.getElementsByClassName('timeline-label')[0].style.display = 'none'
                    vnode.dom.getElementsByClassName('timeline')[0].style.display = 'none'
                    vnode.dom.getElementsByClassName('controls')[0].style.display = 'none'
                    vnode.dom.getElementsByClassName('add-packet')[0].style.display = 'inline-block'
                    vnode.dom.getElementsByClassName('remove-packet')[0].style.display = 'inline-block'
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
            range, this._packet_bars.slice(), addPacketBtn, removePacketBtn, queryBtn, timeline, controls
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
                let current_time = new Date(current_value * 100).toISOString().substring(0, 21) + 'Z'

                // If 0.1 has have passed
                if (current_time <= end_time) {
                    // Update current time
                    vnode.dom.getElementsByClassName('timeline-current')[0].innerHTML = 'Current time: ' + current_time
                    // Send timestamp to be evaluated by backend
                    let data = new FormData()
                    data.append('timestamp', current_time)
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

    _validate_form(packet_list, start_list, end_list) {
        let datetimeRegex = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\dZ$/

        // Check form for errors
        for (let i = 0; i < packet_list.length; ++i) {
            if (packet_list[i].selectedIndex == 0)
                return false
            if (!datetimeRegex.test(start_list[i].value)) {
                return false
            }
            if (!datetimeRegex.test(end_list[i].value)) {
                return false
            }
        }
        return true
    }
}

const PacketBar = {

    view(vnode) {
        // Packet select drop down menu
        let packets = m('div', {class: 'form-group col-xs-4'}, [
            m('label', 'Telemetry packet:'),
            m('select', {class: 'form-control packets'}, [
                m('option', {disabled: 'disabled', selected: 'selected'}, 'Select an option')].concat(
                    map(vnode.attrs.range, (i) => {
                        return m('option', {value: i[0]}, i[0])
                    })
                )
            )
        ])

        // Start time input
        let startTime = m('div', {class: 'form-group col-xs-4'}, [
            m('label', 'Start time:'),
            m('input', {class: 'form-control start-time', placeholder: 'YYYY-MM-DDTHH:MM:SSZ'})
        ])

        // End time input
        let endTime = m('div', {class: 'form-group col-xs-4'}, [
            m('label', 'End time:'),
            m('input', {class: 'form-control end-time', placeholder: 'YYYY-MM-DDTHH:MM:SSZ'})
        ])

        let form = m('div', {class: 'form-row'}, [packets, startTime, endTime])

        return form
    }
}


export default Playback
export { Playback }