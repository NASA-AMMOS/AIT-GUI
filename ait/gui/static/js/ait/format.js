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

import { DOY, timezone } from './time'


function adjustUTCtoGPS(obj, {gps = true, utc = false, utc_gps_offset = 0}) {
    if (gps) {
        let datetime = normalize(obj)
        datetime.setSeconds(datetime.getSeconds() + utc_gps_offset)
    }
}


function date (obj, { doy = false, gps = true, utc = false } = {}) {
    let yyyy, mm, dd, formatted
    let date = normalize(obj)

    if (gps || utc) {
        yyyy = date.getUTCFullYear()
        mm   = date.getUTCMonth()
        dd   = date.getUTCDate()
    } else {
        yyyy = date.getFullYear()
        mm   = date.getMonth()
        dd   = date.getDate()
    }

    if (doy) {
        formatted = yyyy + '-' + pad3( DOY(yyyy, mm, dd) )
    }
    else {
        formatted = yyyy + '-' + pad2(mm + 1) + '-' + pad2(dd)
    }

    return formatted
}


function datetime (obj, opts = {})
{
    return date(obj, opts) + ' ' + time(obj, opts) + ' ' + tz(obj, opts)
}


/**
 * @returns a Javascript Date object given either a date string or a
 * Javascript Date object.
 */
function normalize (obj) {
    let result = obj


    if (typeof obj === 'string') {
        result = Date.parse(obj)
    }
    else if (typeof obj === 'number') {
        result = new Date(obj)
    }

    return result
}


/**
 * @returns the number n, as a string, padded with a leading zero if
 * less-than 10.
 */
function pad2 (n) {
    return (n < 10) ? '0' + n : n
}


/**
 * @returns the number n, as a string, padded with one or two leading
 * zero if less-than 100 and 10, respectively.
 */
function pad3 (n) {
    return (n < 100) ? '0' + pad2(n) : n
}


function time (obj, { h24 = true, gps = true, utc = false } = {}) {
    let hh, mm, ss, formatted
    let suffix = ' AM'
    let time = normalize(obj)

    if (gps || utc) {
        hh = time.getUTCHours()
        mm = time.getUTCMinutes()
        ss = time.getUTCSeconds()
    } else {
        hh = time.getHours()
        mm = time.getMinutes()
        ss = time.getSeconds()
    }

    if (!h24 && hh > 12) {
        hh     -= 12
        suffix  = ' PM'
    }

    formatted = pad2(hh) + ':' + pad2(mm) + ':' + pad2(ss)

    if (!h24) {
        formatted += suffix
    }

    return formatted
}


function tz (obj, { utc = false, gps = true, local = false } = {}) {
    if (gps) {
        return 'GPS'
    } else if (utc) {
        return 'UTC'
    } else if (local) {
        return 'Local Time'
    } else {
        return timezone(obj)
    }
}


export { date, datetime, time, tz, adjustUTCtoGPS }
