/*
 * Advanced Multi-Mission Operations System (AMMOS) Instrument Toolkit (AIT)
 * Bespoke Link to Instruments and Small Satellites (BLISS)
 *
 * Copyright 2017, by the California Institute of Technology. ALL RIGHTS
 * RESERVED. United States Government Sponsorship acknowledged. Any
 * commercial use must be negotiated with the Office of Technology Transfer
 * at the California Institute of Technology.
 *
 * This software may be subject to U.S. export control laws. By accepting
 * this software, the user agrees to comply with all applicable U.S. export
 * laws and regulations. User has the responsibility to obtain export licenses,
 * or other export authority as may be required before exporting such
 * information to foreign countries or providing access to foreign persons.
 */

/**
 * Displays internal state information via styled Glyphicon and tracks
 * transitions through its' states via monitoring of the system event queue.
 *
 * Allows for configuration of 4 state event handlers
 * ('on', 'off', 'pending', and 'error') via attributes on the ait-led tag.
 *
 * Example:
 *   <ait-led on="seq:exec" off="seq:done" error="seq:err"></ait-led>
 *  
 *  You can specify multiple triggers for a single state by separating the
 *  event names with a ','
 *
 * Example:
 *   <ait-led on="seq:exec,seq:sent" off="seq:done"></ait-led>
 *
 *  If you want to start the LED in a state besides 'off' set it via
 *  the 'default' attribute
 *
 * Example:
 *   <ait-led on="seq:exec,seq:sent" default="pending"></ait-led>
 */
const LED = {
    _states: ['on', 'off', 'pending', 'error'],
    _state: 'off',

    oninit(vnode) {
        // Set event listeners for each of the valid LED states
        this._states.forEach((s) => {
            if (s in vnode.attrs) {
                vnode.attrs[s].split(',').forEach((e) => {
                    ait.events.on(e, () => {this._state = s})
                })
            }
        })

        this._state = vnode.attrs.default || 'off'
    },

    view(vnode) {
        const classes = 'glyphicon glyphicon-dot ait-led-' + this._state
        return m('span', {class: classes})
    },
}

/**
 * An expansion of the base LED object for controlling the state of
 * simulators and displaying state information with regards to their
 * operation.
 *
 * Allows for configuration of 4 state event handlers for displaying information
 * about the state of the simulator. You can configure these states
 * ('on', 'off', 'pending', and 'error') via attributes on the tag.
 *
 * Example:
 *   <ait-simmonitor on='sim:iss:on'
 *                     off='sim:iss:off'
 *                     pending='sim:iss:pending'
 *                     error='sim:iss:error'
 *                     default='off' action='/sim/iss/'></ait-simmonitor>
 *  
 *  You can specify multiple triggers for a single state by separating the
 *  event names with a ','.
 *
 *  The 'default' attribute specifies the state of the monitored sim on bootup.
 *  If you start your sim in a particular state you should update 'default'
 *  accordingly so the component can properly track the sim. The 'off' state
 *  is the default.
 *
 *  The 'action' attribute is the URL for POSTs to be made for starting and
 *  stopping the monitored Sim. SimStatus expects the following interface
 *  with the sim:
 *
 *      POST 'action' + '/start' to start the sim.
 *      POST 'action' + '/stop' to stop the sim.
 *
 */
const SimStatus = Object.assign(Object.create(LED), {
    _hoverState: null,
    _simRunning: false,

    oninit(vnode) {
        LED.oninit.call(this, vnode)
        this.action = vnode.attrs.action
        ait.events.on(vnode.attrs.on, () => {this._simRunning = true})
        ait.events.on(vnode.attrs.off, () => {this._simRunning = false})

        if (this._state === 'on') {
            this._simRunning = true
        }
    },

    view(vnode) {
        let classes = 'sim-monitor glyphicon'

        if (this._hoverState === 'mouseover') {
            if (this._simRunning) {
                classes += ' glyphicon-stop ait-led-stop'
            } else {
                classes += ' glyphicon-play ait-led-start'
            }
        } else {
            classes += ' glyphicon-dot ait-led-' + this._state
        }

        return m('span',
                 {
                     class: classes,
                     onclick: SimStatus.toggleSimState.bind(this),
                     onmouseover: (event) => {
                         this._hoverState = event.type
                         m.redraw()
                     },
                     onmouseout: (event) => {
                         this._hoverState = event.type
                         m.redraw()
                     }
                 })
    },

    toggleSimState() {
        let url = this.action
        if (this._simRunning) {
            url += '/stop'
        } else {
            url += '/start'
        }

        m.request({url: url, action: 'POST', data: {}})
    },
})


const Prompt = {
    _display_prompt: false,
    _type: null,
    _options: null,

    oncreate(vnode) {
        ait.events.on('prompt:init', (data) => {
            this._display_prompt = true
            this._type = data['type']
            this._options = data['options']
            m.redraw()
        })

        ait.events.on('prompt:timeout', () => {
            this._reset_prompt()
            m.redraw()
        })

        ait.events.on('prompt:done', () => {
            this._reset_prompt()
            m.redraw()
        })
    },

    _reset_prompt() {
        this._display_prompt = false
        this._type = null
        this._options = null
    },

    view(vnode) {
        let title = m('h4', {class: 'modal-title'}, 'Title')
        let body = m('div', 'Prompt')
        let footer = m('div', 'Footer')

        if (this._type === 'confirm') {
            title = m('h4', {class: 'modal-title'}, 'Please Confirm')
            body = m('div', this._options['msg'])
            footer = m('div', [
                m('div', {
                    type: 'button',
                    class: 'btn btn-success',
                    'data-dismiss': 'modal',
                    onclick: () => {
                        m.request({
                            'method': 'POST',
                            'url': '/prompt/response',
                            'data': {response: 'confirm'}
                        }).then(() => {
                            this._reset_prompt()
                        })
                    }
                }, 'Confirm'),
                m('div', {
                    type: 'button',
                    class: 'btn btn-danger',
                    'data-dismiss': 'modal',
                    onclick: () => {
                        m.request({
                            'method': 'POST',
                            'url': '/prompt/response',
                            'data': {response: 'deny'}
                        }).then(() => {
                            this._reset_prompt()
                        })
                    }
                }, 'Deny')
            ])
        }

        let modal = m('div', {class: 'modal show', tabindex: '-1', role: 'dialog'},
            m('div', {class: 'modal-dialog', 'role': 'document'},
                m('div', {class: 'modal-content'}, [
                    m('div', {class: 'modal-header'}, [
                        title
                    ]),
                    m('div', {class: 'modal-body'}, [
                        body
                    ]),
                    m('div', {class: 'modal-footer'}, [
                        footer
                    ])
                ])
            )
        )

        if (this._display_prompt) {
            return m('ait-prompt', modal)
        } else {
            return m('ait-prompt')
        }
    }
}

export default {LED, SimStatus, Prompt}
export {LED, SimStatus, Prompt}
