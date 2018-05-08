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

import m from 'mithril'
import * as format from 'ait/format'

/**
 * AIT Clock UI Widget
 *
 * The AIT Clock UI Widget displays a clock with date and time that
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
    _utc: false,
    _gps: true,
    _doy: false,
    _utc_gps_offset: 0,

    toggleH24() { this._h24 = !this._h24 },
    toggleTimeFormat() {
        if (this._gps) {
            this._gps = false
            this._utc = true
        } else if (this._utc) {
            this._gps = false
            this._utc = false
        } else {
            this._gps = true
            this._utc = false
        }
    },
    toggleDOY() { this._doy = !this._doy },
    update()     { this._now = new Date() },


    oninit (vnode) {
        const attrs = vnode.attrs

        m.request({
            url: '/leapseconds',
            method: 'GET'
        }).then((data) => {
            this._utc_gps_offset = data[data.length - 1][1]
        })

        this._h24 = attrs.h24 !== undefined ? attrs.h24 : Clock._h24
        this._utc = attrs.utc !== undefined ? attrs.utc : Clock._utc
        this._gps = attrs.gps !== undefined ? attrs.gps : Clock._gps
        this._doy = attrs.doy !== undefined ? attrs.doy : Clock._doy
        this.update()
    },


    oncreate (vnode) {
        setInterval( () => { Clock.update.call(this); m.redraw(); }, 1000 )
    },


    view (vnode) {
        const opts = {
            doy: this._doy,
            h24: this._h24,
            utc: this._utc,
            gps: this._gps,
            utc_gps_offset: this._utc_gps_offset
        }

        // Create a copy of the clock's time to avoid flickering. This will
        // happen when the clock is in GPS mode and the current time updates.
        let datetime = new Date(this._now.getTime())

        format.adjustUTCtoGPS(datetime, opts)
        const date = format.date(datetime, opts)
        const time = format.time(datetime, opts)
        const tz   = format.tz  (datetime, opts)


        return m('ait-clock', vnode.attrs, [
            m('span.date', { onclick: Clock.toggleDOY.bind(this) }, date), ' ',
            m('span.time', { onclick: Clock.toggleH24.bind(this) }, time), ' ',
            m('span.tz'  , { onclick: Clock.toggleTimeFormat.bind(this) }, tz)
        ])
    }
}

export default Clock
export { Clock }
