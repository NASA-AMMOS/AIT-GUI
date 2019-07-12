import m from 'mithril'
import map from 'lodash/map'
import {TelemetryDictionary, TelemetryStream} from '../tlm'


const Playback = {
    _range: [],
    _packet: null,
    _start_time: null,
    _end_time: null,
    _validation_errors: {},
    _slider: null,
    _current_time: null,
    _timer: null,

    oninit(vnode) {
        this._slider = m('input', {class: 'slider', type: 'range', min: '0', max: '1', value: '0',
            oninput: (e) => {
                let current_value = vnode.dom.getElementsByClassName('slider')[0].value
                let formatted_time = new Date(current_value * 100).toISOString().substring(0, 21) + 'Z'
                this._current_time = m('div', {class: 'timeline-current'}, 'Current time: ' + formatted_time)
            }
        })
    },

    view(vnode) {

        m.request({
            method: 'GET',
            url: '/playback/range'
        }).then((r) => {
            this._range = r
        })

        let range = m('div', {class: 'form-group'}, [
            m('label', 'Time ranges available'),
            this._range.map(function(i) {
                return m('div', i[0] + ': ' + i[1] + ' to ' + i[2])
            })
        ])

        let packets = m('div', {class: 'form-group col-xs-3'}, [
            m('label', 'Telemetry packet:'),
            m('select', {
                class: 'form-control',
                    name: 'packet',
                },
                [m('option', {
                    disabled: 'disabled',
                    selected: 'selected'
                }, 'Select an option')].concat(
                    map(this._range, (i) => {
                        return m('option', {value: i[0]}, i[0])
                    })
                )
            )
        ])
        if (this._validation_errors['packet']) {
            packets.attrs.className += ' has-error'
        }

        let startTime = m('div', {class: 'form-group col-xs-3'}, [
            m('label', 'Start time:'),
            m('input', {class: 'form-control', placeholder: 'YYYY-MM-DDTHH:MM:SSZ', name: 'startTime'})
        ])
        if (this._validation_errors['startTime']) {
            startTime.attrs.className += ' has-error'
        }

        let endTime = m('div', {class: 'form-group col-xs-3'}, [
            m('label', 'End time:'),
            m('input', {class: 'form-control', placeholder: 'YYYY-MM-DDTHH:MM:SSZ', name: 'endTime'})
        ])
        if (this._validation_errors['endTime']) {
            endTime.attrs.className += ' has-error'
        }

        let queryBtn = m('div', {class: 'form-group col-xs-3'}, [
            m('div', {style: 'height: 25px'}),
            m('button', {class: 'btn btn-success', type: 'submit'}, 'Query')
            ]
        )

        let form = m('form', {
            class: 'form-row',
            onsubmit: (e) => {
                e.preventDefault()
                let form = e.currentTarget
                let data = new FormData()

                if (!this._validate_form(form)) {
                    return false
                }

                this._packet = form.elements['packet'].value
                this._start_time = form.elements['startTime'].value.substr(0, 19) + '.0' + 'Z'
                this._end_time = form.elements['endTime'].value.substr(0, 19) + '.0' + 'Z'
                data.append('packet', this._packet)
                data.append('startTime', this._start_time)
                data.append('endTime', this._end_time)

                m.request({
                    url: '/playback/query',
                    method: 'POST',
                    data: data
                })

                ait.events.emit('ait:playback:on')

                ait.tlm = {dict: {}}
                ait.tlm.promise = m.request({ url: '/tlm/dict' })
                ait.tlm.promise.then((dict) => {
                    const proto = location.protocol === 'https:' ? 'wss' : 'ws'
                    const url = proto + '://' + location.host + '/playback/playback'

                    ait.tlm.dict   = TelemetryDictionary.parse(dict)
                    ait.tlm.stream = new TelemetryStream(url, ait.tlm.dict)
                })

                vnode.dom.getElementsByClassName('slider')[0].min = Date.parse(this._start_time) / 100
                vnode.dom.getElementsByClassName('slider')[0].max = Date.parse(this._end_time) / 100
                vnode.dom.getElementsByClassName('slider')[0].value = 0
                vnode.dom.getElementsByClassName('timeline')[0].style.display = 'block'
                this._current_time = m('div', {class: 'timeline-current'}, 'Current time: ' + this._start_time)

                vnode.dom.getElementsByClassName('btn btn-success')[0].style.display = 'none'
                let buttons = vnode.dom.getElementsByClassName('btn btn-success pull-right')
                for (let i = 0; i < buttons.length; ++i) {
                    buttons[i].style.display = 'block'
                }

            }}, [
                packets,
                startTime,
                endTime,
                queryBtn,
            ]
        )

        let timeline =
            m('div', {class:'timeline', style:'display:none'},
                [
                    this._slider,
                    m('div', {class:'timeline-start'}, this._start_time),
                    m('div', {class:'timeline-end'}, this._end_time),
                    this._current_time,
                ])

        let playBtn =
            m('button',
                {class: 'btn btn-success pull-right',
                    onclick: (e) => {
                        this.start_slider(vnode, this._end_time)
                    },
                    style: 'display:none'
                }, 'Play'
            )

        let pauseBtn =
            m('button',
                {class: 'btn btn-success pull-right',
                    onclick: (e) => {
                        this.stop_slider()
                    },
                    style: 'display:none'
                }, 'Pause'
            )

        let abortBtn =
            m('button',
                {class: 'btn btn-success pull-right',
                    onclick: (e) => {
                        this.stop_slider()
                        vnode.dom.getElementsByClassName('timeline')[0].style.display = 'none'
                        vnode.dom.getElementsByClassName('btn btn-success')[0].style.display = 'inline-block'
                        let buttons = vnode.dom.getElementsByClassName('btn btn-success pull-right')
                        for (let i = 0; i < buttons.length; ++i) {
                            buttons[i].style.display = 'none'
                        }

                        m.request({
                            url: '/playback/abort',
                            method: 'PUT'
                        })

                        ait.events.emit('ait:playback:off')

                        ait.tlm = {dict: {}}
                        ait.tlm.promise = m.request({ url: '/tlm/dict' })
                        ait.tlm.promise.then((dict) => {
                            const proto = location.protocol === 'https:' ? 'wss' : 'ws'
                            const url = proto + '://' + location.host + '/tlm/realtime'

                            ait.tlm.dict   = TelemetryDictionary.parse(dict)
                            ait.tlm.stream = new TelemetryStream(url, ait.tlm.dict)

                            ait.events.on('ait:tlm:packet', () => {
                                m.redraw()
                            })
                        })
                    },
                    style: 'display:none'
                }, 'Abort'
            )

        let controls = [abortBtn, pauseBtn, playBtn]

        return m('ait-playback', vnode.attrs, [
            range, form, timeline, controls
        ])
    },

    start_slider(vnode, end_time) {
        if (this._timer) return
        let start = Date.now()
        let difference = 0

         this._timer = setInterval(function() {
            let delta = Math.floor((Date.now() - start) / 100)
            if (delta > difference) {
                difference = delta
                let current_value = ++vnode.dom.getElementsByClassName('slider')[0].value
                let formatted_time = new Date(current_value * 100).toISOString().substring(0, 21) + 'Z'

                if (formatted_time <= end_time) {
                    vnode.dom.getElementsByClassName('timeline-current')[0].innerHTML = 'Current time: ' + formatted_time
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
        clearInterval(this._timer)
        this._timer = null
    },

    _validate_form(form) {
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