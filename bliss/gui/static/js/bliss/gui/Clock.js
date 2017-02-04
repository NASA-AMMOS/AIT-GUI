import m from 'mithril'
import * as format from 'bliss/format'


/**
 * BLISS Clock UI Widget
 *
 * The BLISS Clock UI Widget displays a clock with date and time that
 * updates every second.  The display is configurable with at
 * initialization time or by clicking on specific parts of the time.
 *
 * Configurable / Toggleable options include:
 *
 *   - 12-hour or 24-hour time
 *   - Date (month and day) or Day of Year (DOY)
 *   - UTC or localtime
 */
const Clock =
{
    _now: null,
    _h24: true,
    _utc: true,
    _doy: false,


    toggleH24 () { this._h24 = !this._h24 },
    toggleUTC () { this._utc = !this._utc },
    toggleDOY () { this._doy = !this._doy },
    update()     { this._now = new Date() },


    // Mithril lifecycle method
    oninit (vnode) {
        this._h24 = vnode.attrs.h24 || Clock._h24
        this._utc = vnode.attrs.utc || Clock._utc
        this._doy = vnode.attrs.doy || Clock._doy
        this.update()
    },


    // Mithril lifecycle method
    oncreate (vnode) {
        setInterval( () => { Clock.update.call(this); m.redraw(); }, 1000 )
    },


    // Mithril view() method
    view (vnode) {
        const opts = { doy: this._doy, h24: this._h24, utc: this._utc }
        const date = format.date(this._now, opts)
        const time = format.time(this._now, opts)
        const tz   = format.tz  (this._now, opts)


        return m('bliss-clock', vnode.attrs, [
            m('span.date', { onclick: Clock.toggleDOY.bind(this) }, date), ' ',
            m('span.time', { onclick: Clock.toggleH24.bind(this) }, time), ' ',
            m('span.tz'  , { onclick: Clock.toggleUTC.bind(this) }, tz)
        ])
    }
}

export default Clock
export { Clock }
