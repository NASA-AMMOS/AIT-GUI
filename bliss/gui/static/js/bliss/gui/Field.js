import m from 'mithril'
import {sprintf}  from 'sprintf-js'
import * as strftime from 'strftime'

import { CommandDefinition } from '../cmd.js'
import { EVRDefinition }     from '../evr.js'

const Field =
{
    /**
     * Caches the current packet and raw value (for use by
     * hasChanged()).
     */
    cache (packet) {
        if (!packet) return

        this._cached.packet = packet
        this._cached.rawval = this.getValue(packet, true)
    },


    /**
     * @returns the current packet displayed by this Field.
     */
    getPacket () {
        const buffer = bliss.packets[this._pname]
        return buffer && buffer.get(0)
    },


    /**
     * @returns the value displayed by this Field, for the given
     * packet.
     *
     * If the optional parameter raw is true, no conversions
     * (e.g. DN-to-EU, Commands, EVRs, etc.) are performed when
     * retrieving the packet value.
     */
    getValue (packet, raw=false) {
        return packet && packet.__get__(this._fname, raw)
    },


    /**
     * @returns true if the value displayed by this field has changed,
     * false otherwise.
     */
    hasChanged () {
        const packet = this.getPacket()
        return this._cached.packet !== packet &&
               this._cached.rawval !== this.getValue(packet, true)
    },


    // Mithril lifecycle method
    oninit (vnode) {
        this._fname  = vnode.attrs.name
        this._pname  = vnode.attrs.packet
        this._cached = { packet: null, rawval: null }
    },


    // Mithril lifecycle method
    onbeforeupdate (vnode, old) {
        return this.hasChanged()
    },


    // Mithril view() method
    view (vnode) {
        const packet = this.getPacket()
        let   value  = this.getValue(packet)

        this.cache(packet)

        if (value === undefined || value === null) {
            value = 'N/A'
        }
        else if (value instanceof CommandDefinition) {
            value = value.opcode ? value.name : 'N/A'
        }
        else if (value instanceof EVRDefinition) {
            value = value.code ? value.name : 'N/A'
        }
        else {
            if (vnode.attrs.format) {
                const defn = packet._defn.fields[this._fname]
                const type = defn && defn.type

                value = (type && type.isTime) ?
                    strftime.utc()(vnode.attrs.format, value) :
                    sprintf(vnode.attrs.format, value)
            }
        }

        return m('bliss-field', vnode.attrs, value)
    }
}

export default Field
export { Field }
