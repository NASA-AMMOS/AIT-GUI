import * as dtype from './dtype'


class FieldDefinition
{
    constructor(args) {
        args = args === undefined ? {} : args

        this.name   = args.name
        this.mask   = args.mask
        this.type   = dtype.get(args.type)
        this.enum   = args.enum
        this.shift  = 0
        this.bytes  = args.bytes
        this.dntoeu = args.dntoeu

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


    decode (view) {
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
            if (this.enum !== undefined) {
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

        for (let name in this._defn.fields) {
            const getter = () => this.__get__(name)
            Object.defineProperty(this, name, { get: getter })
        }
    }

    __get__ (name) {
        let value = undefined

        if (this._data instanceof DataView) {
            const defn = this._defn.fields[name]

            if (defn) {
                value = defn ? defn.decode(this._data) : undefined
            }
            // else if (defn.dntoeu) {
            //    value = defn.dntoeu.eval(this)
            // }
        }

        return value
    }

    __clone__ (data, raw=false) {
        const proto = Object.getPrototypeOf(obj)
        const props = Object.getOwnPropertyDescriptors(obj)
        let   obj   = Object.create(proto, props)

        obj._data = data
        obj._raw  = raw

        return obj
    }
}


class PacketDefinition
{
    constructor (obj) {
        this._name   = obj.name
        this._desc   = obj.desc
        this._fields = { }
        this._uid    = obj.uid

        for (let key in obj.fields) {
            this._fields[key] = new FieldDefinition( obj.fields[key] )
        }
    }

    get fields () {
        return this._fields
    }

    get name () {
        return this._name
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

        if (defn) {
            // FIXME: packet.__clone__(data)?
            let packet = new Packet(defn, data)

            clearInterval(this._interval)
            this._stale    = 0
            this._interval = setInterval(this.onStale.bind(this), 1500)

            bliss.packets.insert(defn.name, packet)
            this._emit('packet', packet)
        }
    }


    onOpen (event) {
        this._interval = setInterval(this.onStale.bind(this), 1500)
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
    TelemetryDictionary,
    TelemetryStream
}
