import m from 'mithril'
import { DOY, timezone } from './time'


function date (obj, { doy = false, utc = true } = {}) {
    let   yyyy, mm, dd, formatted
    const date = normalize(obj)


    if (utc) {
        yyyy = date.getUTCFullYear()
        mm   = date.getUTCMonth()
        dd   = date.getUTCDate()
    }
    else {
        yyyy = date.getFullYear()
        mm   = date.getMonth()
        dd   = date.getDate()
    }

    if (doy) {
        formatted = yyyy + '-' + pad3( DOY(yyyy, mm, dd) )
    }
    else {
        formatted = yyyy + '- ' + pad2(mm + 1) + '-' + pad2(dd)
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


function time (obj, { h24 = true, utc = true } = {}) {
    let   hh, mm, ss, formatted
    let   suffix = ' AM'
    const time   = normalize(obj)


    if (utc) {
        hh = time.getUTCHours()
        mm = time.getUTCMinutes()
        ss = time.getUTCSeconds()
    }
    else {
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


function tz (obj, { utc = true } = {}) {
    return utc ? 'UTC' : timezone(obj)
}


export { date, datetime, time, tz }
