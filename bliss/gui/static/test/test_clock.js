require('jsdom-global')()
import 'babel-polyfill'

global.window = Object.assign(require('mithril/test-utils/domMock.js')(), require('mithril/test-utils/pushStateMock')())
var mq = require('mithril-query')

var chai = require('chai')
chai.should()

import * as bliss from 'bliss'

describe('Clock object', function () {
    it('should allow for toggling to/from 24 hour time', function() {
        var clock = bliss.gui.Clock
        clock._h24.should.equal(true)
        clock.toggleH24()
        clock._h24.should.equal(false)
    })

    it('should allow for toggling to/from UTC time', function() {
        var clock = bliss.gui.Clock
        clock._utc.should.equal(true)
        clock.toggleUTC()
        clock._utc.should.equal(false)
    })

    it('should allow for toggling Julian date to/from DOY', function() {
        var clock = bliss.gui.Clock
        clock._doy.should.equal(false)
        clock.toggleDOY()
        clock._doy.should.equal(true)
    })

    it('should output proper DOM format', function() {
        let clock = bliss.gui.Clock
        let output = mq(clock)
        output.should.have('bliss-clock')
        output.should.have('bliss-clock > span.date')
        output.should.have('bliss-clock > span.time')
        output.should.have('bliss-clock > span.tz')
    })
})
