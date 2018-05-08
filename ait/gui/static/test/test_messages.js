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

import * as ait from 'ait'
global.ait = ait

import m from 'mithril'
global.m = m

import cloneDeep from 'lodash/cloneDeep'

describe('Messages component', () => {
    let msgs = ait.gui.Messages
    let msg = {
        'timestamp': '2017-09-06T15:29:45.915448Z',
        'msgid': 'WARNING',
        'msg': 'This is a test msg'
    }

    beforeEach(() => {
        msgs = cloneDeep(ait.gui.Messages)
    })

    it('should properly normalize log messages', () => {
        let retMsg = msgs.normalizeMessage(msg)

        assert.property(retMsg, 'timestamp')
        assert.property(retMsg, 'severity')
        assert.property(retMsg, 'message')

        retMsg.timestamp.should.equal(Date.parse(msg.timestamp))
        retMsg.severity.should.equal(msg.msgid)
        retMsg.message.should.equal(msg.msg)
    })

    it('should display messages with proper formatting', ()=> {
        // Mock up EventSource so we can init the Messages component
        // without running into problems with objects that don't exist.
        let fakeEventSource = {}
        global.EventSource = sinon.stub().returns(fakeEventSource)

        // Add a message and render the component
        msgs.add(msg)
        let msgsOutput = mq(msgs)

        // Check ait-messages primary container structure
        msgsOutput.should.have('ait-messages')
        // We should have a single Warning message in our container
        msgsOutput.should.have(
            'ait-messages > div.entry_container > div.entry.entry--warning'
        )
        // Our warning message should contain the relevant log info
        msgsOutput.should.have(
            'div.entry.entry--warning > ' +
                'div.timestamp + ' +
                'div.severity + ' +
                'div.message'
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
