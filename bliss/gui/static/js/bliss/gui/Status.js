/**
 * Displays internal state information via styled Glyphicon and tracks
 * transitions through its' states via monitoring of the system event queue.
 *
 * Allows for configuration of 4 state event handlers
 * ('on', 'off', 'pending', and 'error') via attributes on the bliss-led tag.
 *
 * Example:
 *   <bliss-led on="seq:exec" off="seq:done" error="seq:err"></bliss-led>
 *  
 *  You can specify multiple triggers for a single state by separating the
 *  event names with a ','
 *
 * Example:
 *   <bliss-led on="seq:exec,seq:sent" off="seq:done"></bliss-led>
 *
 *  If you want to start the LED in a state besides 'off' set it via
 *  the 'default' attribute
 *
 * Example:
 *   <bliss-led on="seq:exec,seq:sent" default="pending"></bliss-led>
 */
const LED = {
    _states: ['on', 'off', 'pending', 'error'],
    _state: 'off',

    oninit(vnode) {
        // Set event listeners for each of the valid LED states
        this._states.forEach((s) => {
            if (s in vnode.attrs) {
                vnode.attrs[s].split(',').forEach((e) => {
                    bliss.events.on(e, () => {this._state = s})
                })
            }
        })

        this._state = vnode.attrs.default || 'off'
    },

    view(vnode) {
        const classes = 'glyphicon glyphicon-dot bliss-led-' + this._state
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
 *   <bliss-simmonitor on='sim:iss:on'
 *                     off='sim:iss:off'
 *                     pending='sim:iss:pending'
 *                     error='sim:iss:error'
 *                     default='off' action='/sim/iss/'></bliss-simmonitor>
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
        bliss.events.on(vnode.attrs.on, () => {this._simRunning = true})
        bliss.events.on(vnode.attrs.off, () => {this._simRunning = false})
    },

    view(vnode) {
        let classes = 'sim-monitor glyphicon'

        if (this._hoverState === 'mouseover') {
            if (this._simRunning) {
                classes += ' glyphicon-stop bliss-led-stop'
            } else {
                classes += ' glyphicon-play bliss-led-start'
            }
        } else {
            classes += ' glyphicon-dot bliss-led-' + this._state
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


export default {LED, SimStatus}
export {LED, SimStatus}
