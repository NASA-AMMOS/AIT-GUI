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
