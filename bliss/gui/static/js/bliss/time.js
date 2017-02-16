/**
 * @returns the Day Of Year (DOY) for the given date.
 */
function DOY (year, month, day) {
    const  days = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    doy = days[month] + day;
    if (isLeap(year)) {
        if (month >= 2) {
            doy += 1;
        }
    }

    return doy;
}


/**
 * @returns true if year is a leap year, false otherwise.
 */ 
function isLeap (year) {
    return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)
}


/**
 * @returns the timezone string for the given Javascript Date.
 */
function timezone (date) {
    const match = /\((\w+)\)$/.exec( date.toString() )
    return Array.isArray(match) && match.length > 1 ? match[1] : ''
}


export { DOY, isLeap, timezone }
