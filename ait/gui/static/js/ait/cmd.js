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

            let subsys = null
            if (!defn.subsystem) {
                subsys = 'GENERAL'
            } else {
                subsys = defn.subsystem
            }

            let commands = this._bySubsystem[subsys] || [ ]
            commands.push(defn)
            this._bySubsystem[subsys] = commands
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
