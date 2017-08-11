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
     * Returns the EVRDefinition with the given code.
     */
    getByCode (code) {
        return this._codes[code]
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
