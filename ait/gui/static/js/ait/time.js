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
 * @returns the Day Of Year (DOY) for the given date.
 */
function DOY (year, month, day) {
    const  days = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
    var doy = days[month] + day
    if (isLeap(year) && month >=2) {
        doy += 1
    }

    return doy
}

/**
 * @returns true if year is a leap year, false otherwise.
 */
function isLeap (year) {
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)
}

/**
 * @returns the timezone string for the given Javascript Date.
 */
function timezone (date) {
    const match = /\((\w+)\)$/.exec( date.toString() )
    return Array.isArray(match) && match.length > 1 ? match[1] : ''
}

export { DOY, isLeap, timezone }
