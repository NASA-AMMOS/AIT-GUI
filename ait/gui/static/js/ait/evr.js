/*
 * Advanced Multi-Mission Operations System (AMMOS) Instrument Toolkit (AIT)
 * Bespoke Link to Instruments and Small Satellites (BLISS)
 *
 * Copyright 2016, by the California Institute of Technology. ALL RIGHTS
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

import {sprintf, vsprintf}  from 'sprintf-js'
import * as dtype from './dtype'

class EVRDictionary
{
    /**
     * Creates a new (empty) EVRDictionary.
     */
    constructor () {
        this._codes = { }
    }

    /**
     * Adds the given EVRDefinition to this EVRDictionary.
     */
    add (defn) {
        if (defn instanceof EVRDefinition) {
            this[defn.name]        = defn
            this._codes[defn.code] = defn
        }
    }

    /**
     * Returns the EVRDefinition with the given code or the
     * supplied code if no definition exists for it.
     */
    getByCode (code) {
        if (this._codes[code]) {
            return this._codes[code]
        } else {
            return code
        }
    }

    /**
     * Parses the given plain Javascript Object or JSON string and
     * returns a new EVRDictionary, mapping EVR names to
     * EVRDefinitions.
     */
    static parse (obj) {
        let dict = new EVRDictionary()

        if (typeof obj === 'string') {
            obj = JSON.parse(obj)
        }

        for (let k in obj) {
            dict.add(new EVRDefinition(obj[k]))
        }

        return dict
    }
}


class EVRDefinition
{
    constructor (obj) {
        this._desc = obj.desc
        this._name = obj.name
        this._code = obj.code
        this._msg = obj.message || null
    }

    get desc () {
        return this._desc
    }

    get name () {
        return this._name
    }

    get code () {
        return this._code
    }

    get msg () {
        return this._msg
    }

    formatMessage(data) {
        if (this._msg === null || data.length === 0) return this._desc

        let da = new Uint8Array(data)
        let dv = new DataView(da.buffer)


        let size_formatter_info = {
            's' : -1,
            'c' : 1,
            'i' : 4,
            'd' : 4,
            'u' : 4,
            'x' : 4,
            'hh': 1,
            'h' : 2,
            'l' : 4,
            'll': 8,
            'f' : 8,
            'g' : 8,
            'e' : 8,
        }

        let type_formatter_info = {
            'c' : 'U%u',
            'i' : 'MSB_I%u',
            'd' : 'MSB_I%u',
            'u' : 'MSB_U%u',
            'f' : 'MSB_D%u',
            'e' : 'MSB_D%u',
            'g' : 'MSB_D%u',
            'x' : 'MSB_U%u',
        }

        let formatRegex = new RegExp("%(?:\d+\$)?([cdiefgGosuxXhlL]+)", "g")
        let match
        let cur_byte_index = 0
        let data_chunks = []
        let formattedMsg = this.msg

        while (match = formatRegex.exec(this.msg)) {
            let formatter = match[1]

            let f_size_char = formatter[formatter.length - 1]
            let f_type = formatter[formatter.length - 1]

            if (formatter.length > 1)
                f_size_char = formatter.slice(0, formatter.length - 1)
            let fsize = size_formatter_info[f_size_char.toLowerCase()]

            let d
            let end_index = cur_byte_index
            if (f_type !== 's') {
                end_index = cur_byte_index + fsize
                let fstr = sprintf(type_formatter_info[f_type.toLowerCase()], fsize*8)

                if (fsize === 1 && fstr.indexOf('MSB_') !== -1) {
                    fstr = fstr.slice(4, fstr.length)
                }

                d = new dtype.PrimitiveType(fstr).decode(dv, cur_byte_index)
            } else {
                end_index = da.indexOf(0, cur_byte_index)
                d = data.slice(cur_byte_index, end_index).map((v) => String.fromCharCode(v)).join('')
            }

            data_chunks.push(d)
            cur_byte_index = end_index

            if (formatter === 's') {
                cur_byte_index += 1
            }

            if (formatter.length > 1) {
                formattedMsg = formattedMsg.replace('%' + formatter, '%' + f_type)
            }
        }

        if (data_chunks.length > 0) {
            formattedMsg = vsprintf(formattedMsg, data_chunks)
        }

        return formattedMsg
    }

    static parse (obj) {
        if (typeof obj === 'string') {
            obj = JSON.parse(obj)
        }

        return new EVRDefinition(obj)
    }
}


export {
    EVRDictionary,
    EVRDefinition
}
