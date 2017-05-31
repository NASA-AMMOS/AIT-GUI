import m from 'mithril'
import {sprintf}  from 'sprintf-js'
import * as strftime from 'strftime'


const Field =
{
    // Mithril lifecycle method
    oninit (vnode) {
        this._name   = vnode.attrs.name
        this._packet = vnode.attrs.packet
    },


    // Mithril view() method
    view (vnode) {
        const pname  = this._packet
        const buffer = bliss.packets[pname]
        const packet = buffer && buffer.get(0)
        let   value  = packet && packet[this._name]

        if (value === undefined) {
            value = 'N/A'
        }
        else {
            if (vnode.attrs.format) {
                const defn = packet._defn[this._name]
                const type = defn && defn.type
                
                if (type && type.indexOf('TIME', 0) === 0) {
                    // For some reason GPS times of 0 are being sent through
                    // as the GPS epoch date (6 January 1980) instead of just 0.
                    // This catches that and makes sure we don't end up with a
                    // giant mess when we run strftime on it.
                    if (typeof value === 'string' && value.indexOf('1980-01-06') === 0) {
                        value = 0
                    }
                    // Adjust the date from the seconds since the GPS epoch to
                    // milliseconds since the Javascript epoch (1 January 1970)
                    let date = new Date((value * 1000) + 315964800000)
                    value = strftime.utc()(vnode.attrs.format, date)
                }
                else {
                    value = sprintf(vnode.attrs.format, value)
                }
            }
        }
        
        return m('bliss-field', vnode.attrs, value)
    }
}

export default Field
export { Field }
