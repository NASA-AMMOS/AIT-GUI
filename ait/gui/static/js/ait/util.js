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
 * Object.assign(target, ...sources) merges sources into target.
 *
 * @return target
 */
 /// TODO Figure out if we want to just use _.assign here
const merge = Object.assign


/**
 * Moves array element at index `from` to index `to`, shifting all
 * other values up and down, as appropriate.
 *
 * Note, there is a proposal for this to end up in Lodash, but at the
 * moment it hasn't been integrated.
 *
 * https://github.com/lodash/lodash/issues/1701
 */
function move (array, from, to) {
    array.splice(to, 0, array.splice(from, 1)[0])
}

/**
 * Returns DN to EU value if it exists unless the `raw` parameter is true,
 * otherwise return raw value.
 */
function getFieldType (data, raw=false) {

    // Default to the raw value since it will always be avilable
    let value = data['raw']

    // If raw==false and a DN to EU value exists, grab that
    if (!raw && data['dntoeu']) {
        value = data['dntoeu']
    }

    return value
}

export { merge, move, getFieldType }
