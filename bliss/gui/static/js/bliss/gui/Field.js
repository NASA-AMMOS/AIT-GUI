import m from 'mithril'
import {sprintf}  from 'sprintf-js'
import * as strftime from 'strftime'

import { CommandDefinition } from '../cmd.js'
import { EVRDefinition }     from '../evr.js'

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
                const defn = packet._defn.fields[this._name]
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
