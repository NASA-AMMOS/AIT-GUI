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

        const dict   = ait.cmd.dict
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

        const dict = ait.evr.dict
        const code = view.getUint16(offset, false)

        return dict ? dict.getByCode(code) : code
    }
}


class ArrayType
{
    constructor(name) {
        // Note: We need to strip out the primitive type that the array
        // is composed of as well as the number of elements from the type
        // string (E.g., ArrayType('U8[3]')). It would be nice if we
        // received the type as only 'U8[3]' so we could handle this
        // more elegantly.
        this._elem_type = name.slice(11, name.indexOf('['))
        this._prim_type = TypeMap[this._elem_type]
        this._num_elems = parseInt(name.slice(name.indexOf('[') + 1, name.indexOf(']')))
        this._name = name.slice(11, name.length - 2)
        this._nbytes = this._num_elems * this._prim_type._nbytes
    }

    decode(view, offset=0) {
        if (!inBounds(view, this._nbytes, offset)) return null

        let retVals = []
        for (let i = 0; i < this._num_elems; i++) {
            let curOffset = (i * this._prim_type._nbytes) + offset
            retVals.push(this._prim_type.decode(view, curOffset))
        }

        return retVals
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
    decode (raw) {
        return new Date(GPSEpoch + (raw * 1000))
    }
}


class Time64Type extends TimeType
{
    decode (raw) {
        let parts = [0, 0]
        if (raw % 1 === 0) {
            parts = [parseInt(raw), 0]
        } else {
            parts = String(raw).split('.').map(x => parseInt(x))
        }

        return new Date(GPSEpoch + (parts[0] * 1000) + (parts[1] / 1e6))
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
// Maps typenames to PrimitiveType.  Use ait.dtype.get(typename).
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
    let type = undefined

    if (typename in TypeMap) {
        type = TypeMap[typename]
    } else if (typename.startsWith('ArrayType')) {
        type = new ArrayType(typename)
    }

    return type
}

function isComplexType(typeName) {
    return typeName === 'CMD16' ||
           typeName === 'EVR16' ||
           typeName === 'TIME8' ||
           typeName === 'TIME32' ||
           typeName === 'TIME64'
}


export { PrimitiveType, get, isComplexType }
