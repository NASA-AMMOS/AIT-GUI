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

    /**
     * Check if a limit exists for the field.
     */
    hasLimitCheck() {
        if (this._limits === null) {
            if (typeof bliss.limit === 'undefined') return false

            let limitIndex = this._pname + '.' + this._fname
            if (limitIndex in bliss.limit.dict) {
                this._limits = bliss.limit.dict[this._pname + '.' + this._fname]
            } else {
                this._limits = false
            }
        }

        return this._limits
    },

    /**
     * Check if a value is within the limit range(s) specified as an error
     */
    valueIsInErrorRange(value) {
        if ('value' in this._limits && 'error' in this._limits.value) {
            if (typeof(this._limits.value.error) === 'string') {
                return value === this._limits.value.error
            } else {
                return this._limits.value.error.includes(value)
            }
        } else {
            if ('upper' in this._limits && 'error' in this._limits.upper) {
                return value > this._limits.upper.error
            } else if ('lower' in this._limits && 'error' in this._limits.lower) {
                return value < this._limits.lower.error
            }
        }
        return false
    },

    /**
     * Check if a value is within the limit range(s) specified as a warning
     */
    valueIsInWarnRange(value) {
        if ('value' in this._limits && 'warn' in this._limits.value) {
            if (typeof(this._limits.value.warn) === 'string') {
                return value === this._limits.value.warn
            } else {
                return this._limits.value.warn.includes(value)
            }
        } else {
            if ('upper' in this._limits && 'warn' in this._limits.upper) {
                return value > this._limits.upper.warn
            } else if ('lower' in this._limits && 'warn' in this._limits.lower) {
                return value < this._limits.lower.warn
            }
        }
        return false
    },

    // Mithril lifecycle method
    oninit (vnode) {
        this._fname  = vnode.attrs.name
        this._pname  = vnode.attrs.packet
        this._raw    = vnode.attrs.raw === true
        this._cached = { packet: null, rawval: null }
        this._limits = null
    },


    // Mithril lifecycle method
    onbeforeupdate (vnode, old) {
        return this.hasChanged()
    },


    // Mithril view() method
    view (vnode) {
        const packet = this.getPacket()
        let   value  = this.getValue(packet, this._raw)

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
            } else {
                // If the Field doesn't have a format specified and is
                // displaying a float we default to 5 digits after the
                // decimal point.
                if (! isNaN(value) && ! Number.isInteger(value)) {
                    value = Number(value).toFixed(5)
                }
            }

            if (this.hasLimitCheck()) {
                if (! 'class' in vnode.attrs) {
                    vnode.attrs.class = ""
                }

                if (this.valueIsInErrorRange(value)) {
                    vnode.attrs.class += "alert alert-danger"
                } else if (this.valueIsInWarnRange(value)) {
                    vnode.attrs.class += "alert alert-warning"
                }
            }
        }

        return m('bliss-field', vnode.attrs, value)
    }
}

export default Field
export { Field }
