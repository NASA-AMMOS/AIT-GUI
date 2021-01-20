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


    _sanitize (cond) {
        return cond.replace('\u2264', '<=').replace('\u2265', '>=')
    }


    /**
     * Transforms a tenary relational expression conditional into a pair of
     * binary relational expression conditionals. For example, given the string
     * expression '1268.1041 <= r < 6522.7358' this function returns
     * '(1268.1041 <= r) && (r < 6522.735)'.
     */
    _toBinaryCond (cond) {
        const regex = /==|!=|<=|>=|<|>/g
        const op    = cond.match(regex)
        const t     = cond.split(regex)

        return (op.length === 2) && (t.length === 3) ?
            `(${t[0]} ${op[0]} ${t[1]}) && (${t[1]} ${op[1]} ${t[2]})` : cond
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
            code        += `var ${name} = ${this._defn.constants[name]}; `
        }

        for (const sig in this._defn.functions) {
            const body = this._defn.functions[sig]

            code += `function ${sig} { `

            if (typeof body === 'string') {
                code += `return (${body}) `
            }
            else if (typeof body === 'object') {
                for (const cond in body) {
                    const pred  = this._toBinaryCond( this._sanitize(cond) )
                    code       += `if (${pred}) { return (${body[cond]}) } `
                }
            }

            code += '};'
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
        this.getFullPacketStates()

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
        ait.events.emit('ait:tlm:' + name, data)
    }

    onClose (event) {
        clearInterval(this._interval)
        this._emit('close', this)
    }

    getFullPacketStates () {
        m.request({ url: '/tlm/latest' }).then( (latest) => {
            this._pkt_states = latest['states']
            this._counters = latest['counters']
        })
    }

    checkCounter (packetName, counter) {
        // returns true if counter is as expected, false if not
        let lastCounter = this._counters[packetName]
        if ( counter == lastCounter + 1) {
            return true
        } else if ( lastCounter == Math.pow(2, 31) - 1 && counter == 0 ) {
            return true
        }
        console.log('counter mismatch: had ' + lastCounter + ' , got ' + counter)
        return false
    }

    onMessage (event) {
        if ( !(typeof event.data == "string") ) return

        let now = Date.now()
        let data = JSON.parse(event.data)
        let packet_name = data['packet']
        let delta = data['data']
        let dntoeus = data['dntoeus']
        let counter = data['counter']

        if ( packet_name in this._pkt_states ) {
            // check counter is as expected and request full packet states if not
            let gotNextCounter = this.checkCounter(packet_name, counter)
            if ( !gotNextCounter ) {
                this.getFullPacketStates()
            } else {
                // add delta to current packet state and update counter
                if ( Object.keys(delta).length !== 0 ) {
                    for ( var field in delta ) {
                        this._pkt_states[packet_name]['raw'][field] = delta[field]
                    }
                    for ( var field in dntoeus ) {
                        this._pkt_states[packet_name]['dntoeu'][field] = dntoeus[field]
                    }
                }
                this._counters[packet_name] = counter
            }
        } else { // new packet type
            if ( Object.keys(delta).length == 0 ) {
                // empty delta - request full packet from backend
                this.getFullPacketStates()
            } else {
                this._pkt_states[packet_name] = {}
                this._pkt_states[packet_name]['raw'] = delta
                this._pkt_states[packet_name]['dntoeu'] = dntoeus
                this._counters[packet_name] = counter
            }
        }

        // Since WebSockets can stay open indefinitely, the AIT GUI
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

        clearInterval(this._interval)
        this._stale    = 0
        this._interval = setInterval(this.onStale.bind(this), 5000)

        let current_pkt = JSON.parse(JSON.stringify(this._pkt_states[packet_name]))
        ait.packets.insert(packet_name, current_pkt)
        this._emit('packet', {'packet': packet_name,
                              'data': this._pkt_states[packet_name]})
    }


    onOpen (event) {
        this._interval = setInterval(this.onStale.bind(this), 5000)
        this._stale    = 0

        //ait.packets.create(this._defn.name)
        this._emit('open', this)
    }


    onStale () {
        this._stale++
        this._emit('stale', this)
    }
}


export {
    FieldDefinition,
    PacketDefinition,
    PacketScope,
    TelemetryDictionary,
    TelemetryStream
}
