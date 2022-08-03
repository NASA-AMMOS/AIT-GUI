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
import {sprintf}  from 'sprintf-js'
import * as strftime from 'strftime'

import { CommandDefinition } from '../cmd.js'
import { isComplexType }     from '../dtype.js'
import { EVRDefinition }     from '../evr.js'

/**
 * Display a given packet's telemetry point value in the display.
 *
 * **Required Attributes:**
 *
 * packet
 *   The packet name where the telemetry point is located
 *
 * name
 *   The name of the field in the packet to display
 *
 * **Optional Attributes:**
 *
 * raw
 *   Toggle whether the field should be displayed as a raw value instead
 *   of the default of displaying a DN-to-EU value. (default: false)
 *
 * disable-tlm-popover
 *   Toggle whether a popover should be placed on the field value displaying
 *   telemetry dictionary information for the displayed field. (default: false)
 *
 * format
 *   Format string to use when displaying the value. The value for the field
 *   is passed through either strftime or sprintf depending on type if format
 *   is specified. If the field is an array type the format attribute is
 *   ignored. By default, a field is displayed as a 5 digit precision number.
 *   (default: none)
 */
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
        this._cached.val = this.getValue(packet, this._raw)
    },


    /**
     * @returns the current packet displayed by this Field.
     */
    getPacket () {
        const buffer = ait.packets[this._pname]
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
        if ( !raw ) {
            if ( packet && this._fname in packet['dntoeu']) {
                return packet && packet['dntoeu'][this._fname]
            }
        }

        return packet && packet['raw'][this._fname]
    },


    /**
     * @returns true if the value displayed by this field has changed,
     * false otherwise.
     */
    hasChanged () {
        const packet = this.getPacket()
        return this._cached.packet !== packet &&
               this._cached.val !== this.getValue(packet, this._raw)
    },

    /**
     * Check if a limit exists for the field.
     */
    hasLimitCheck() {
        if (this._limits === null) {
            if (typeof ait.limits === 'undefined') return false

            let limitIndex = this._pname + '.' + this._fname
            if (limitIndex in ait.limits.dict) {
                this._limits = ait.limits.dict[this._pname + '.' + this._fname]
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
        this._cached = { packet: null, val: null }
        this._limits = null
    },

    oncreate(vnode) {
        ait.tlm.promise.then(() => {
            this._fieldDefn = null

            if (ait.tlm.dict[this._pname] &&
                ait.tlm.dict[this._pname].fields[this._fname]) {
                this._fieldDefn = ait.tlm.dict[this._pname].fields[this._fname]
            }

            let title = '<div>' + this._fieldDefn.name +
                        '<span class="pull-right" style="cursor:pointer">' +
                          '\u00D7' +
                        '</span></div>'

            let popover_id
            let bodyClickClosePopoverHandler = () => {
                $(vnode.dom).popover('hide')
            }

            if (this._fieldDefn && !('disable-tlm-popover' in vnode.attrs)) {
                $(vnode.dom).popover({
                    content : () => {return this.createPopoverContent()},
                    title: title,
                    html: true,
                    placement: 'auto right',
                    container: 'body'
                }).on('shown.bs.popover', (e) => {
                    let popover_id = e.currentTarget.attributes['aria-describedby'].value
                    let popover_title = document.getElementById(popover_id).getElementsByClassName('popover-title')[0]
                    let span = popover_title.getElementsByTagName('span')[0]

                    // Add handler to the close icon span in the popover title
                    // so it can be used to close the popover.
                    span.addEventListener('click', () => {
                        $(vnode.dom).popover('hide')
                    })

                    // Add handler to body so that clicks outside of the popover
                    // cause it to close.
                    document.body.addEventListener('click', bodyClickClosePopoverHandler)

                    // Capture click events on the popover so they don't
                    // propagate up to the body and close the popover.
                    document.getElementById(popover_id).addEventListener('click', (e) => {
                        e.stopPropagation()
                    })
                }).on('hide.bs.popover', (e) => {
                    // Clean up our popover click handler from body when we're done.
                    document.body.removeEventListener('click', bodyClickClosePopoverHandler)
                }).on('hidden.bs.popover', (e) => {
                    // Resets the popover click state that gets out of sync when
                    // the popover is open/closed programmatically. Without this
                    // the Field can end up in a state where you need to click
                    // it twice to toggle the popover if the close icon or body
                    // click handler caused it to close previously.
                    $(e.target).data("bs.popover").inState.click = false;
                })
            }
        })
    },

    createPopoverContent() {
        let desc = this._fieldDefn.desc ? this._fieldDefn.desc : "None"
        let type = this._fieldDefn.type ? this._fieldDefn.type._name : "Unknown"
        let bytes = typeof(this._fieldDefn.bytes) === "object" ? (
            this._fieldDefn.bytes[0] + " - " + this._fieldDefn.bytes[1]) : (
            this._fieldDefn.bytes)

        let hex_padding = 2
        if (typeof(this._fieldDefn.bytes) === "object") {
            hex_padding = (this._fieldDefn.bytes[1] - this._fieldDefn.bytes[0] + 1) * 2
        }

        let mask = this._fieldDefn.mask ? (
            `0x${sprintf(`%0${hex_padding}X`, this._fieldDefn.mask)}`) : (
            "None")

        let popover_content = `
            <p><b>Description:</b> ${desc}</p>
            <p><b>Data Type:</b> ${type}</p>
            <p><b>Byte(s) in Packet:</b> ${bytes}</p>
            <p><b>Bit Mask:</b> ${mask}</p>
        `

        if (this._fieldDefn.enum) {
            let enums = ""
            let _enum = this._fieldDefn.enum
            for (let k in _enum) {
                enums += `<dt>${k}</dt><dd>${_enum[k]}`
            }
            popover_content += `<b>Enumerated Values:</b><dl>${enums}</dl>`
        }

        if (this._fieldDefn.dntoeu) {
            let dntoeu = ""
            let _dntoeu = this._fieldDefn.dntoeu
            for (let k in _dntoeu) {
                dntoeu += `<dt>${k}</dt><dd>${_dntoeu[k]}`
            }
            popover_content += `<b>DN-to-EU:</b><dl>${dntoeu}</dl>`
        }

        if (this._fieldDefn.aliases) {
            let aliases = ""
            let _aliases = this._fieldDefn.aliases
            for (let k in _aliases) {
                aliases += `<dt>${k}</dt><dd>${_aliases[k]}`
            }
            popover_content += `<b>Aliases:</b><dl>${aliases}</dl>`
        }

        return `<ait-field-popover>${popover_content}</ait-field-popover>`
    },

    onbeforeupdate (vnode, old) {
        return this.hasChanged()
    },

    view (vnode) {
        const packet = this.getPacket()
        let   value  = this.getValue(packet, this._raw)

        this.cache(packet)

        if (value === undefined || value === null) {
            value = 'N/A'
        }
        else {
            if (vnode.attrs.format) {
                const defn = ait.tlm.dict[this._pname]._fields[this._fname]
                const type = defn && defn.type

                if (this._raw === false && isComplexType(type._name) ||
                    typeof(value) !== "number") {
                    value = this.getValue(packet, true)
                }

                if (type && type.isTime) {
                    value = type.decode(value)
                    value = strftime.utc()(vnode.attrs.format, value)
                } else {
                    value = sprintf(vnode.attrs.format, value)
                }
            } else {
                // If the Field doesn't have a format specified and is
                // displaying a float we default to 5 digits after the
                // decimal point.
                if (! isNaN(value) && ! Number.isInteger(value)) {
                    value = Number(value).toFixed(5)
                }
            }
        }

        if (this.hasLimitCheck()) {
                // Limit checks should always be performed against a DN-to-EU
                // converted value since limits are expected to be defined
                // in EU values.
                let limitChkVal = (this._raw) ? this.getValue(packet, false) : value

                if (! ('class' in vnode.attrs)) {
                    vnode.attrs.class = ""
                }

                if (this.valueIsInErrorRange(limitChkVal)) {
                    this._limitOut = true
                    vnode.attrs.class += "alert-danger"
                    ait.events.emit('field:limitOut', {
                        field: this._pname + '_' + this._fname,
                        type: 'error'
                    })
                } else if (this.valueIsInWarnRange(limitChkVal)) {
                    this._limitOut = true
                    vnode.attrs.class += "alert-warning"
                    ait.events.emit('field:limitOut', {
                        field: this._pname + '_' + this._fname,
                        type: 'warning'
                    })
                } else if (this._limitOut) {
                    this._limitOut = false
                    ait.events.emit('field:limitIn', this._pname + '_' + this._fname)
                }
            }

        let dname = ""
        if (vnode.attrs.display_name) {
            dname = vnode.attrs.display_name + ': '
        }

        return m('ait-field', vnode.attrs, [m('name', dname),
                                            m('value', value)])
    }
}

const EVRField = Object.assign(Object.create(Field), {
    oninit(vnode) {
        this._fname  = vnode.attrs.name
        this._pname  = vnode.attrs.packet
        this._raw    = vnode.attrs.raw === true
        this._cached = { packet: null, val: null }
        this._data_fields = []

        vnode.children.forEach(child => {
                if (child.tag === 'ait-evrdata') {
                    this._data_fields.push(child.attrs.name)
                }
        })
    },

    createPopoverContent() {
        let desc = this._fieldDefn.desc ? this._fieldDefn.desc : "None"
        let type = this._fieldDefn.type ? this._fieldDefn.type._name : "Unknown"
        let bytes = typeof(this._fieldDefn.bytes) === "object" ? (
            this._fieldDefn.bytes[0] + " - " + this._fieldDefn.bytes[1]) : (
            this._fieldDefn.bytes)

        let hex_padding = 2
        if (typeof(this._fieldDefn.bytes) === "object") {
            hex_padding = (this._fieldDefn.bytes[1] - this._fieldDefn.bytes[0] + 1) * 2
        }

        let mask = this._fieldDefn.mask ? (
            `0x${sprintf(`%0${hex_padding}X`, this._fieldDefn.mask)}`) : (
            "None")

        let popover_content = `
            <p><b>Description:</b> ${desc}</p>
            <p><b>Data Type:</b> ${type}</p>
            <p><b>Byte(s) in Packet:</b> ${bytes}</p>
            <p><b>Bit Mask:</b> ${mask}</p>
        `

        if (this._cached.val && this._cached.val.msg) {
            let da = []
            if (this._cached.packet) {
                for (let c of this._data_fields) {
                    da.push(this._cached.packet.__get__(c, true))
                }
            }

            let msg = (this._cached.val) ? this._cached.val.formatMessage(da) : ''
            popover_content += `<p><b>EVR Message:</b> ${msg}</p>`
        }

        return `<ait-field-popover>${popover_content}</ait-field-popover>`
    },

    view(vnode) {
        const packet = this.getPacket()
        let   value  = this.getValue(packet, this._raw)

        this.cache(packet)

        if (value === undefined || value === null) {
            value = 'N/A'
        } else {
            value = value.name ? value.name : (value.code ? value.code : 'Unidentified EVR')
        }
        return m('ait-field', vnode.attrs, value)
    }
})

export default {Field, EVRField}
export {Field, EVRField}
