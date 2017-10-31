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

/**
 * Number of milliseconds between the Unix and GPS Epochs.
 */
const GPSEpoch = 315964800000


/**
 * Returns true if reading nbytes starting at offset is in-bounds for
 * the given DataView, false otherwise.
 */
function inBounds (view, nbytes, offset) {
    return (offset + nbytes) <= view.byteLength
}


class CommandType
{
    constructor(name) {
        this._name = name
    }

    get isTime() {
        return false
    }

    decode(view, offset=0) {
        if (!inBounds(view, 2, offset)) return null

        const dict   = bliss.cmd.dict
        const opcode = view.getUint16(offset, false)

        return dict ? dict.getByOpcode(opcode) : opcode
    }
}


class EVRType
{
    constructor(name) {
        this._name = name
    }

    get isTime() {
        return false
    }

    decode(view, offset=0) {
        if (!inBounds(view, 2, offset)) return null

        const dict = bliss.evr.dict
        const code = view.getUint16(offset, false)

        return dict ? dict.getByCode(code) : code
    }
}


/**
 * PrimitiveType
 *
 * A PrimitiveType contains a number of fields that provide
 * information on the details of a primitive type, including: name
 * (e.g. "MSB_U32"), endianness ("MSB" or "LSB"), float, signed,
 * nbits, nbytes, min, and max.
 *
 * PrimitiveTypes can decode() binary representations stored in a
 * Javascript DataView.
 */
class PrimitiveType
{
    /**
     * Creates a new PrimitiveType based on the given typename
     * (e.g. 'MSB_U16' for a big endian, 16-bit short integer).
     */
    constructor(name) {
        this._name   = name
        this._decode = PrimitiveTypeDecoder[name]
        this._endian = null
        this._float  = false
        this._max    = null
        this._min    = null
        this._signed = false
        this._string = false

        if (this._name.startsWith('LSB_') || this._name.startsWith('MSB_')) {
            this._endian = this._name.substr(0, 3)
            this._signed = this._name[4] !== 'U'
            this._float  = this._name[4] === 'F' || this._name[4] === 'D'
            this._nbits  = parseInt(this._name.substr(-2))
        }
        else if (this._name.startsWith('S')) {
            this._nbits  = parseInt(this._name.substr(1)) * 8
            this._string = true
        }
        else {
            this._signed = this._name[0] !== 'U'
            this._nbits  = parseInt(this._name.substr(-1))
        }

        this._nbytes = this._nbits / 8

        if (this._float) {
            this._max = +Number.MAX_VALUE
            this._min = -Number.MAX_VALUE
        }
        else if (this._signed) {
            this._max =  Math.pow(2, this._nbits - 1)
            this._min = -1 * (this._max - 1)
        }
        else if (this._string === false) {
            this._max = Math.pow(2, this._nbits) - 1
            this._min = 0
        }
    }

    get isTime () { return false }

    /**
     * Decodes the given DataView (starting at optional byte offset)
     * according to this PrimitiveType definition
     *
     * @return the decoded value or null (on error).
     */
    decode (view, offset=0) {
        return this._decode && inBounds(view, this._nbytes, offset) ?
            this._decode(view, offset) : null
    }
}


class TimeType
{
    constructor(name) {
        this._name = name
    }

    get isTime () {
        return true
    }
}


// FIXME: Time8 is relative, while Time32 and Time64 are absolute.
class Time8Type extends TimeType
{
    decode (view, offset=0) {
        if (!inBounds(view, 1, offset)) return null
        return view.getUint8(offset, false) / 256.0
    }
}


class Time32Type extends TimeType
{
    decode (view, offset=0) {
        if (!inBounds(view, 4, offset)) return null

        const tv_sec = view.getUint32(offset, false)
        return new Date(GPSEpoch + (tv_sec * 1000))
    }
}


class Time64Type extends TimeType
{
    decode (view, offset=0) {
        if (!inBounds(view, 8, offset)) return null

        const tv_sec   = view.getUint32(offset, false)
        const tv_nsec  = view.getUint32(offset + 4, false)

        return new Date(GPSEpoch + (tv_sec * 1000) + (tv_nsec / 1e6))
    }
}


// Used by PrimitiveType.decode():
//
//     PrimitiveTypeDecoder[typename](view, offset)
//
const PrimitiveTypeDecoder = {
    'I8'     : (view, offset) => view.getUint8  (offset),
    'U8'     : (view, offset) => view.getUint8  (offset),
    'LSB_I16': (view, offset) => view.getInt16  (offset, true ),
    'MSB_I16': (view, offset) => view.getInt16  (offset, false),
    'LSB_U16': (view, offset) => view.getUint16 (offset, true ),
    'MSB_U16': (view, offset) => view.getUint16 (offset, false),
    'LSB_I32': (view, offset) => view.getInt32  (offset, true ),
    'MSB_I32': (view, offset) => view.getInt32  (offset, false),
    'LSB_U32': (view, offset) => view.getUint32 (offset, true ),
    'MSB_U32': (view, offset) => view.getUint32 (offset, false),
    'LSB_F32': (view, offset) => view.getFloat32(offset, true ),
    'MSB_F32': (view, offset) => view.getFloat32(offset, false),
    'LSB_D64': (view, offset) => view.getFloat64(offset, true ),
    'MSB_D64': (view, offset) => view.getFloat64(offset, false),
}


//
// TypeMap
//
// Maps typenames to PrimitiveType.  Use bliss.dtype.get(typename).
// (Populated below based on information in PrimitiveTypeDecoder).
//
let TypeMap = { }
Object.keys(PrimitiveTypeDecoder).map( (typename) => {
    TypeMap[typename] = new PrimitiveType(typename)
})

TypeMap['CMD16']  = new CommandType('CMD16')
TypeMap['EVR16']  = new EVRType('EVR16')
TypeMap['TIME8']  = new Time8Type ('TIME8' )
TypeMap['TIME32'] = new Time32Type('TIME32')
TypeMap['TIME64'] = new Time64Type('TIME64')

/**
 * @returns the PrimitiveType for typename or undefined.
 */
function get (typename) {
    return TypeMap[typename]
}


export { get }
