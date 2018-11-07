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

require('jsdom-global')()
import 'babel-polyfill'

global.window = Object.assign(require('mithril/test-utils/domMock.js')(), require('mithril/test-utils/pushStateMock')())
var mq = require('mithril-query')

var chai = require('chai')
chai.should()

import * as ait from 'ait'

describe('Clock object', function () {
    it('should allow for toggling to/from 24 hour time', function() {
        var clock = ait.gui.Clock
        clock._h24.should.equal(true)
        clock.toggleH24()
        clock._h24.should.equal(false)
    })

    it('should allow for toggling to/from GPS/UTC/Local time', function() {
        var clock = ait.gui.Clock
        clock._utc.should.equal(false)
        clock._gps.should.equal(true)
        clock._local.should.equal(false)
        clock.toggleTimeFormat()
        clock._utc.should.equal(true)
        clock._gps.should.equal(false)
        clock._local.should.equal(false)
        clock.toggleTimeFormat()
        clock._utc.should.equal(false)
        clock._gps.should.equal(false)
        clock._local.should.equal(true)
        clock.toggleTimeFormat()
        clock._utc.should.equal(false)
        clock._gps.should.equal(true)
        clock._local.should.equal(false)
    })

    it('should allow for toggling Julian date to/from DOY', function() {
        var clock = ait.gui.Clock
        clock._doy.should.equal(false)
        clock.toggleDOY()
        clock._doy.should.equal(true)
    })

    it('should output proper DOM format', function() {
        let clock = ait.gui.Clock
        let output = mq(clock)
        output.should.have('ait-clock')
        output.should.have('ait-clock > span.date')
        output.should.have('ait-clock > span.time')
        output.should.have('ait-clock > span.tz')
    })
})
