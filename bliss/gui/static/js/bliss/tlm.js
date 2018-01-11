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

import * as dtype from './dtype'


class FieldDefinition
{
    constructor(args) {
        args = args === undefined ? {} : args

        this.name    = args.name
        this.mask    = args.mask
        this.type    = dtype.get(args.type)
        this.enum    = args.enum
        this.shift   = 0
        this.bytes   = args.bytes
        this.dntoeu  = args.dntoeu
        this.desc    = args.desc
        this.aliases = args.aliases

        // Bytes can be either one integer or an array,
        // all we need is the head
        if (args.bytes instanceof Array) {
            this.offset = args.bytes[0]
        }
        else {
            this.offset = args.bytes
        }

        // Set the shift based on the bitmask
        let mask = this.mask

        if (mask !== undefined && mask !== null) {
            while (mask !== 0 && (mask & 1) === 0) {
                this.shift += 1
                mask >>= 1
            }
        }
    }


    decode (view, skipEnumeration=false) {
        let value = null

        if (this.type) {
            value = this.type.decode(view, this.offset)

            if (this.mask !== undefined && this.mask !== null) {
                value &= this.mask
            }

            if (this.shift > 0) {
                value >>= this.shift
            }

            // If enumeration exists, display that value
            if (!skipEnumeration && this.enum !== undefined) {
                value = this.enum[value]
            }
        }

        return value
    }
}


class Packet
{
    constructor (defn, data, raw=false) {
        this._defn = defn
        this._data = data
        this._raw  = raw

        if (Packet.prototype.__init__ === undefined) {
            for (const name in this._defn.fields) {
                //const getter = () => this.__get__(name)
                Object.defineProperty(Packet.prototype, name, {
                    get: function () {
                        return this.__get__(name)
                    }
                })
            }
            Packet.prototype.__init__ = true
        }
    }

    __get__ (name, raw=false) {
        let value = undefined

        if (this._data instanceof DataView) {
            const defn = this._defn.fields[name]

            if (defn) {
                if (raw || this._raw || !defn.dntoeu) {
                    value = defn.decode(this._data, raw)
                }
                else if (defn.dntoeu && defn.dntoeu.equation) {
                    value = this._defn.scope.eval(this, defn.dntoeu.equation)
                }
            }
        }

        return value
    }

    __clone__ (data, raw=false) {
        return new Packet(this._defn, data, raw)
    }
}


class PacketDefinition
{
    constructor (obj) {
        this._constants = obj.constants
        this._desc      = obj.desc
        this._fields    = { }
        this._functions = obj.functions
        this._history   = obj.history
        this._name      = obj.name
        this._scope     = new PacketScope(this)
        this._uid       = obj.uid

        for (let key in obj.fields) {
            this._fields[key] = new FieldDefinition( obj.fields[key] )
        }
    }

    get constants () {
        return this._constants
    }

    get fields () {
        return this._fields
    }

    get functions () {
        return this._functions
    }

    get name () {
        return this._name
    }

    get scope () {
        return this._scope
    }

    get uid () {
        return this._uid
    }

    static parse (obj) {
        if (typeof obj === 'string') {
            obj = JSON.parse(obj)
        }

        return new PacketDefinition(obj)
    }
}


class PacketScope
{
    /**
     * Creates a new PacketScope based on the given PacketDefinition,
     * which defines constants and functions.
     *
     * To evaluate an expression within the PacketScope, call
     * PacketScope.eval(packet, expr).
     */
    constructor (defn) {
        // The underlying scope object must be created using a
        // Javascript Function object (with a string body), so that
        // the scope it creates does not have 'use strict' semantics.
        // (Since the code in this module is ES6, 'use strict'
        // semantics are in effect by definition.)
        //
        // A function scope without 'use strict' allows the
        // eval()uation of the string returned by this.toCode() to
        // create new variables ("constants") and function definitions
        // within the function scope.
        //
        // Thus, this._scope will contain definitions for each
        // constant and function defined in the given packet
        // definition.  New expressions will be evaluated in this
        // scope when calling PacketScope.eval(packet, expr).
        this._defn  = defn
        this._scope = new Function(`
            eval('${this.toCode()}')
            return {
              'eval': function(packet, expr) {
                  var raw = packet.__clone__(packet._data, true)
                  try {
                    return eval(expr)
                  } catch (e) {
                    return null
                  }
              }
            }
        `).call()
    }


    /**
     * Evaluates the given expression within the context of this
     * PacketScope and the given Packet.  The packet parameter is
     * first so that you can bind() this function to a packet and
     * evaluate many expressions.
     */
    eval (packet, expr) {
        return this._scope.eval(packet, expr)
    }


    toCode () {
        let code = ''

        for (const name in this._defn.constants) {
            const value  = this._defn.constants[name]
            code        += 'var ' + name + '=' + value + ';'
        }

        for (const sig in this._defn.functions) {
            const body  = this._defn.functions[sig]
            code       += 'function ' + sig + '{ return (' + body + ')};'
        }

        return code
    }
}


class TelemetryDictionary
{
    /**
     * Creates a new (empty) TelemetryDictionary.
     */
    constructor () { }

    /**
     * Adds the given PacketDefinition to this TelemetryDictionary.
     */
    add (defn) {
        if (defn instanceof PacketDefinition) {
            this[defn.name] = defn
        }
    }

    /**
     * Parses the given plain Javascript Object or JSON string and
     * returns a new TelemetryDictionary, mapping packet names to
     * PacketDefinitions.
     */
    static parse (obj) {
        let dict = new TelemetryDictionary()

        if (typeof obj === 'string') {
            obj = JSON.parse(obj)
        }

        for (let name in obj) {
            dict.add( new PacketDefinition(obj[name]) )
        }

        return dict
    }
}


class TelemetryStream
{
    constructor (url, dict) {
        this._dict     = { }
        this._interval = 0
        this._socket   = new WebSocket(url)
        this._stale    = 0
        this._url      = url

        // Re-map telemetry dictionary to be keyed by a PacketDefinition
        // 'id' instead of 'name'.
        for (let name in dict) {
            let defn             = dict[name]
            this._dict[defn.uid] = defn
        }

        this._socket.binaryType = 'arraybuffer'
        this._socket.onclose    = event => this.onClose  (event)
        this._socket.onmessage  = event => this.onMessage(event)
        this._socket.onopen     = event => this.onOpen   (event)
    }

    _emit (name, data) {
        bliss.events.emit('bliss:tlm:' + name, data)
    }

    onClose (event) {
        clearInterval(this._interval)
        this._emit('close', this)
    }


    onMessage (event) {
        if ( !(event.data instanceof ArrayBuffer) ) return

        let uid  = new DataView(event.data, 1, 4).getUint32(0)
        let data = new DataView(event.data, 5)
        let defn = this._dict[uid]

        // Since WebSockets can stay open indefinitely, the BLISS GUI
        // server will occasionally probe for dropped client
        // connections by sending empty packets (data.byteLength == 0)
        // with a packet UID of zero.  These can should be safely
        // ignored.
        //
        // A UID of zero can indicate a valid packet, so it's
        // important to also check the data length that follows.
        //
        // It's also possible that the packet UID is not in the client
        // telemetry dictionary (defn === undefined).  Without a
        // packet definition, the packet cannot be processed further.
        if ((uid == 0 && data.byteLength == 0) || !defn) return

        let packet = new Packet(defn, data)

        clearInterval(this._interval)
        this._stale    = 0
        this._interval = setInterval(this.onStale.bind(this), 5000)

        bliss.packets.insert(defn.name, packet)
        this._emit('packet', packet)
    }


    onOpen (event) {
        this._interval = setInterval(this.onStale.bind(this), 5000)
        this._stale    = 0

        //bliss.packets.create(this._defn.name)
        this._emit('open', this)
    }


    onStale () {
        this._stale++
        this._emit('stale', this)
    }
}


export {
    FieldDefinition,
    Packet,
    PacketDefinition,
    PacketScope,
    TelemetryDictionary,
    TelemetryStream
}
