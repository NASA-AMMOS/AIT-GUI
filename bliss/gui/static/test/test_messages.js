import 'babel-polyfill'

global.window = Object.assign(
    require("mithril/test-utils/browserMock.js")(),
    require('mithril/test-utils/domMock.js')(),
    require('mithril/test-utils/pushStateMock')()
)

global.document = window.document
let mq = require('mithril-query')

let chai = require('chai')
let assert = chai.assert
chai.should()

let sinon = require('sinon')

import * as bliss from 'bliss'
global.bliss = bliss

import m from 'mithril'
global.m = m

import cloneDeep from 'lodash/cloneDeep'

describe('Messages component', () => {
    let msgs = bliss.gui.Messages
    let msg = {
        'asctime': '2017-09-06T15:29:45.915448Z',
        'levelname': 'WARNING',
        'message': 'This is a test msg'
    }

    beforeEach(() => {
        msgs = cloneDeep(bliss.gui.Messages)
    })

    it('should properly normalize log messages', () => {
        let retMsg = msgs.normalizeMessage(msg)

        assert.property(retMsg, 'timestamp')
        assert.property(retMsg, 'severity')
        assert.property(retMsg, 'message')

        retMsg.timestamp.should.equal(Date.parse(msg.asctime))
        retMsg.severity.should.equal(msg.levelname)
        retMsg.message.should.equal(msg.message)
    })

    it('should display messages with proper formatting', ()=> {
        // Mock up EventSource so we can init the Messages component
        // without running into problems with objects that don't exist.
        let fakeEventSource = {}
        global.EventSource = sinon.stub().returns(fakeEventSource)

        // Add a message and render the component
        msgs.add(msg)
        let msgsOutput = mq(msgs)

        // Check bliss-messages primary container structure
        msgsOutput.should.have('bliss-messages > div.bliss-messages')
        // We should have a single Warning message in our container
        msgsOutput.should.have(
            'bliss-messages > div.bliss-messages > ' +
                'div.bliss-messages__entry.bliss-messages__entry--warning'
        )
        // Our warning message should contain the relevant log info
        msgsOutput.should.have(
            'div.bliss-messages__entry.bliss-messages__entry--warning > ' +
                'div.bliss-messages__timestamp + ' +
                'div.bliss-messages__severity + ' +
                'div.bliss-messages__message'
        )

    })

    it('should listen for log message events', () => {
        // Mock up EventSource so we can init the Messages component
        // without running into problems with objects that don't exist.
        // This will let us simulate message receive events as well.
        let fakeEventSource = {}
        global.EventSource = sinon.stub().returns(fakeEventSource)

        // Render the component so we init everything
        let msgsOutput = mq(msgs)

        // Simulate message receive events and check that the component
        // properly handles the message receive.
        msgs._messages.should.have.lengthOf(0)
        fakeEventSource.onmessage({data: JSON.stringify(msg)})
        msgs._messages.should.have.lengthOf(1)
        fakeEventSource.onmessage({data: JSON.stringify(msg)})
        msgs._messages.should.have.lengthOf(2)
    })
})
