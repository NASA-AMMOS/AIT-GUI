import m from 'mithril'
import {sprintf}  from 'sprintf-js'
import * as strftime from 'strftime'

import { CommandDefinition } from '../cmd.js'
import { EVRDefinition }     from '../evr.js'

const Field =
{
    _limitOut: false,

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
            if (typeof bliss.limits === 'undefined') return false

            let limitIndex = this._pname + '.' + this._fname
            if (limitIndex in bliss.limits.dict) {
                this._limits = bliss.limits.dict[this._pname + '.' + this._fname]
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
        let isError = false;
        if ('value' in this._limits && 'error' in this._limits.value) {
            if (typeof(this._limits.value.error) === 'string') {
                isError = value === this._limits.value.error
            } else {
                isError = this._limits.value.error.includes(value)
            }
        } else {
            if ('upper' in this._limits && 'error' in this._limits.upper) {
                isError = value > this._limits.upper.error
            }
            
            if ('lower' in this._limits && 'error' in this._limits.lower) {
                isError = value < this._limits.lower.error || isError
            }
        }
        return isError
    },

    /**
     * Check if a value is within the limit range(s) specified as a warning
     */
    valueIsInWarnRange(value) {
        let isWarning = false;
        if ('value' in this._limits && 'warn' in this._limits.value) {
            if (typeof(this._limits.value.warn) === 'string') {
                isWarning = value === this._limits.value.warn
            } else {
                isWarning = this._limits.value.warn.includes(value)
            }
        } else {
            if ('upper' in this._limits && 'warn' in this._limits.upper) {
                isWarning =  value > this._limits.upper.warn
            } 

            if ('lower' in this._limits && 'warn' in this._limits.lower) {
                isWarning = value < this._limits.lower.warn || isWarning
            }
        }
        return isWarning
    },

    // Mithril lifecycle method
    oninit (vnode) {
        this._fname  = vnode.attrs.name
        this._pname  = vnode.attrs.packet
        this._raw    = vnode.attrs.raw === true
        this._cached = { packet: null, rawval: null }
        this._limits = null
        this._field_defn = null

    },

    oncreate(vnode) {
        bliss.tlm.promise.then(() => {
            if (bliss.tlm.dict[this._pname] &&
                bliss.tlm.dict[this._pname].fields[this._fname]) {
                this._field_defn = bliss.tlm.dict[this._pname].fields[this._fname]
            }

            if (this._field_defn) {
                let popover_content = ""
                let desc = this._field_defn.desc ? this._field_defn.desc : "None"
                popover_content += "<b>Description:</b> " + desc + "<br />"

                let type = this._field_defn.type ? this._field_defn.type._name : "Unknown"
                popover_content += "<b>Data Type:</b> " + type + "<br />"

                let bytes = typeof(this._field_defn.bytes) == "object" ? (
                    this._field_defn.bytes[0] + " - " + this._field_defn.bytes[1]) : (
                    this._field_defn.bytes)
                popover_content += "<b>Byte(s) in Packet:</b> " + bytes + "<br />"

                let mask = this._field_defn.mask ? this._field_defn.mask : 'None'
                popover_content += "<b>Bit Mask:</b> " + mask + "<br />"

                if (this._field_defn.enum) {
                    let enums = "<b>Enumerated Values:</b><br />"
                    let _enum = this._field_defn.enum
                    for (let k in _enum) {
                        enums += "&emsp;<b>" + _enum[k] + ':</b> ' + k + "<br />"
                    }
                    popover_content += enums
                }

                if (this._field_defn.dntoeu) {
                    let dntoeu = "<b>DN-to-EU:</b><br />"
                    let _dntoeu = this._field_defn.dntoeu
                    for (let k in _dntoeu) {
                        dntoeu += "&emsp;<b>" + k + ':</b> ' + _dntoeu[k] + "<br />"
                    }
                    popover_content += dntoeu
                }

                if (this._field_defn.aliases) {
                    let aliases = "<b>Aliases:</b><br />"
                    let _aliases = this._field_defn.aliases
                    for (let k in _aliases) {
                        aliases += "&emsp;<b>" + k + ':</b> ' + _aliases[k] + "<br />"
                    }
                    popover_content += aliases
                }

                $(vnode.dom).popover({
                    content : popover_content,
                    title : this._field_defn.name,
                    html: true,
                    container: 'body'
                }).tooltip({
                    placement : 'right',
                    title : this._field_defn.desc,
                    container: 'body'
                }).on('show.bs.popover', () => {
                    $(vnode.dom).tooltip('hide')
                }).on('mouseout', () => {
                    $(vnode.dom).tooltip('hide')
                    $(vnode.dom).popover('hide')
                })
            }
        })
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
            value = value.name ? value.name : (value.opcode ? value.opcode : 'Unidentified Cmd')
        }
        else if (value instanceof EVRDefinition) {
            value = value.name ? value.name : (value.code ? value.code : 'Unidentified EVR')
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
                    this._limitOut = true
                    vnode.attrs.class += "alert alert-danger"
                    bliss.events.emit('field:limitOut', {
                        field: this._pname + '_' + this._fname,
                        type: 'error'
                    })
                } else if (this.valueIsInWarnRange(value)) {
                    this._limitOut = true
                    vnode.attrs.class += "alert alert-warning"
                    bliss.events.emit('field:limitOut', {
                        field: this._pname + '_' + this._fname,
                        type: 'warning'
                    })
                } else if (this._limitOut) {
                    this._limitOut = false
                    bliss.events.emit('field:limitIn', this._pname + '_' + this._fname)
                }
            }
        }

        return m('bliss-field', vnode.attrs, value)
    }
}

export default Field
export { Field }
