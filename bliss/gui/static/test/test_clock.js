require('jsdom-global')()
import 'babel-polyfill'

var chai = require('chai')
chai.should()

import * as bliss from 'bliss'

describe('Clock object', function () {
    it('should allow for toggling to/from 24 hour time', function() {
        var clock = bliss.format.Clock
        clock._h24.should.equal(true)
        clock.toggleH24()
        clock._h24.should.equal(false)
    })
})
