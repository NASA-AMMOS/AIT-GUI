require('jsdom-global')()
import 'babel-polyfill'

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
})
