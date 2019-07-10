import m from 'mithril'
import map from 'lodash/map'
import {TelemetryDictionary, TelemetryStream} from '../tlm'


const Playback = {
    _range: [],
    _packet: null,
    _start_time: null,
    _end_time: null,
    _validation_errors: {},
    _timeline: null,
    _play: null,
    _pause: null,
    _abort: null,
    _slider: null,
    _timer: null,

    oninit(vnode) {
        m.request({
            method: 'GET',
            url: '/playback/range'
        }).then((r) => {
            this._range = r
        })

        this._slider = m('input', {class: 'slider', type: 'range', min: '0', max: '1', value: '0'})
    },

    view(vnode) {

        let range = [
            m('h3', 'Time ranges available in database'),
            m('ul',
                this._range.map(function(i) {
                    return m('li', [m('div', 'Telemetry packet: ' + i[0]),
                        m('div', 'Start time: ' + i[1]),
                        m('div', 'End time: ' + i[2])]
                    )
                })
            )
        ]

        let packets = m('div', {class: 'form-group'}, [
            m('label', 'Telemetry packet'),
            m('select', {
                class: 'form-control',
                    name: 'packet',
                },
                [m('option', {
                    disabled: 'disabled',
                    selected: 'selected'
                }, 'Select an option ...')].concat(
                    map(this._range, (k) => {
                        return m('option', {value: k[0]}, k[0])
                    })
                )
            ),
            m('p', {class: 'help-block'}, 'Telemetry packet from database')
        ])
        if (this._validation_errors['packet']) {
            packets.attrs.className += ' has-error'
        }

        let startTime = m('div', {class: 'form-group'}, [
            m('label', 'Start time'),
            m('input', {class: 'form-control', placeholder: 'Start time YYYY-MM-DDTHH:MM:SSZ', name: 'startTime'}),
            m('p', {class: 'help-block'}, 'Start time for data query. Expected format: YYYY-MM-DDTHH:MM:SSZ')
        ])
        if (this._validation_errors['startTime']) {
            startTime.attrs.className += ' has-error'
        }

        let endTime = m('div', {class: 'form-group'}, [
            m('label', 'End time'),
            m('input', {class: 'form-control', placeholder: 'End time YYYY-MM-DDTHH:MM:SSZ', name: 'endTime'}),
            m('p', {class: 'help-block'}, 'End time for data query. Expected format: YYYY-MM-DDTHH:MM:SSZ')
        ])
        if (this._validation_errors['endTime']) {
            endTime.attrs.className += ' has-error'
        }

        let queryBtn = m('button',
            {class: 'btn btn-success pull-right', type: 'submit', id: 'playback-query'}, 'Query')

        this._timeline =
            m('div', {class:'timeline', style:'display:none'},
                [
                    this._slider,
                    m('div', {class:'timeline-start'}, this._start_time),
                    m('div', {class:'timeline-end'}, this._end_time)
                ])

        function move_right() {
            ++vnode.dom.getElementsByClassName('slider')[0].value
        }

        this._play =
            m('button',
                {class: 'btn btn-success pull-right',
                    onclick: (e) => {
                        if (!this._timer)
                            this._timer = setInterval(move_right, 1000)

                        m.request({
                            url: '/playback/play',
                            method: 'PUT'
                        })
                    },
                    style: 'display:none',
                    id: 'playback-control'
                }, 'Play'
            )

        this._pause =
            m('button',
                {class: 'btn btn-success pull-right',
                    onclick: (e) => {
                        clearInterval(this._timer)
                        this._timer = null

                        m.request({
                            url: '/playback/pause',
                            method: 'PUT'
                        })
                    },
                    style: 'display:none',
                    id: 'playback-control'
                }, 'Pause'
            )

        this._abort =
            m('button',
                {class: 'btn btn-success pull-right',
                    onclick: (e) => {
                        vnode.dom.getElementsByClassName('timeline')[0].style.display = 'none'
                        clearInterval(this._timer)
                        this._timer = null

                        let buttons = vnode.dom.getElementsByClassName('btn btn-success pull-right')
                        for (var i = 0; i < buttons.length; ++i) {
                            if (buttons[i].id == 'playback-control')
                                buttons[i].style.display = 'none'
                            if (buttons[i].id == 'playback-query')
                                buttons[i].style.display = 'block'
                        }
                        m.request({
                            url: '/playback/abort',
                            method: 'PUT'
                        })
                    },
                    style: 'display:none',
                    id: 'playback-control'
                }, 'Abort'
            )

        let form = m('form', {
            onsubmit: (e) => {
                e.preventDefault()
                let form = e.currentTarget
                let data = new FormData()

                if (!this._validate_form(form)) {
                    return false
                }

                this._packet = form.elements['packet'].value
                this._start_time = form.elements['startTime'].value
                this._end_time = form.elements['endTime'].value
                data.append('packet', this._packet)
                data.append('startTime', this._start_time)
                data.append('endTime', this._end_time)

                vnode.dom.getElementsByClassName('slider')[0].min = Date.parse(this._start_time) / 1000
                vnode.dom.getElementsByClassName('slider')[0].max = Date.parse(this._end_time) / 1000
                vnode.dom.getElementsByClassName('slider')[0].value = 0
                vnode.dom.getElementsByClassName('timeline')[0].style.display = 'block'
                if (!this._timer)
                    this._timer = setInterval(move_right, 1000)

                let buttons = vnode.dom.getElementsByClassName('btn btn-success pull-right')
                for (var i = 0; i < buttons.length; ++i) {
                    if (buttons[i].id == 'playback-control')
                        buttons[i].style.display = 'block'
                    if (buttons[i].id == 'playback-query')
                        buttons[i].style.display = 'none'
                }

                m.request({
                    url: '/playback/query',
                    method: 'POST',
                    data: data
                }).then((q) => {

                    ait.tlm = {dict: {}}
                    ait.tlm.promise = m.request({ url: '/tlm/dict' })
                    ait.tlm.promise.then((dict) => {
                        const proto = location.protocol === 'https:' ? 'wss' : 'ws'
                        const url = proto + '://' + location.host + '/playback/playback'

                        ait.tlm.dict   = TelemetryDictionary.parse(dict)
                        ait.tlm.stream = new TelemetryStream(url, ait.tlm.dict)

                        ait.events.on('ait:tlm:packet', () => {
                            m.redraw()
                        })
                    })
                })
            },
        }, [
            m('h3', 'Query data from database'),
            packets,
            startTime,
            endTime,
            queryBtn,
        ])

        return m('ait-playback', vnode.attrs, [
            range, form, this._timeline, this._abort, this._pause, this._play
        ])
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