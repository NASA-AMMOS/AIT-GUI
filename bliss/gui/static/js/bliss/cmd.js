class CommandDictionary
{
    /**
     * Creates a new (empty) CommandDictionary.
     */
    constructor () {
        this._byOpcode    = { }
        this._bySubsystem = { }
    }

    /**
     * Adds the given CommandDefinition to this CommandDictionary.
     */
    add (defn) {
        if (defn instanceof CommandDefinition) {
            this[defn.name]             = defn
            this._byOpcode[defn.opcode] = defn

            if (defn.subsystem) {
                let commands = this._bySubsystem[defn.subsystem] || [ ]

                commands.push(defn)
                this._bySubsystem[defn.subsystem] = commands
            }
        }
    }

    get bySubsystem () {
        return this._bySubsystem
    }

    /**
     * Returns the CommandDefinition with the given opcode or the
     * given opcode if no definition exists for it.
     */
    getByOpcode (opcode) {
        if (this._byOpcode[opcode]) {
            return this._byOpcode[opcode]
        } else {
            return opcode
        }
    }

    /**
     * Parses the given plain Javascript Object or JSON string and
     * returns a new CommandDictionary, mapping packet names to
     * PacketDefinitions.
     */
    static parse (obj) {
        let dict = new CommandDictionary()

        if (typeof obj === 'string') {
            obj = JSON.parse(obj)
        }

        for (let name in obj) {
            dict.add( new CommandDefinition(obj[name]) )
        }

        return dict
    }
}


class CommandDefinition
{
    constructor (obj) {
        this._arguments = obj.arguments
        this._desc      = obj.desc
        this._name      = obj.name
        this._opcode    = obj.opcode
        this._subsystem = obj.subsystem
        this._title     = obj.title
    }

    get arguments () {
        return this._arguments
    }

    get desc () {
        return this._desc
    }

    get name () {
        return this._name
    }

    get opcode () {
        return this._opcode
    }

    get subsystem () {
        return this._subsystem
    }

    get title () {
        return this._title
    }

    static parse (obj) {
        if (typeof obj === 'string') {
            obj = JSON.parse(obj)
        }

        return new CommandDefinition(obj)
    }
}


export {
    CommandDictionary,
    CommandDefinition
}
