#!/usr/bin/env python

# Advanced Multi-Mission Operations System (AMMOS) Instrument Toolkit (AIT)
# Bespoke Link to Instruments and Small Satellites (BLISS)
#
# Copyright 2013, by the California Institute of Technology. ALL RIGHTS
# RESERVED. United States Government Sponsorship acknowledged. Any
# commercial use must be negotiated with the Office of Technology Transfer
# at the California Institute of Technology.
#
# This software may be subject to U.S. export control laws. By accepting
# this software, the user agrees to comply with all applicable U.S. export
# laws and regulations. User has the responsibility to obtain export licenses,
# or other export authority as may be required before exporting such
# information to foreign countries or providing access to foreign persons.

import argparse
import socket
import sys

import gevent
import gevent.monkey
import geventwebsocket

gevent.monkey.patch_all()

import ait.core
import ait.gui

try:
    ait.core.log.begin()
    parser = argparse.ArgumentParser()
    parser.add_argument('--browser', dest='browser', default='none')
    parser.add_argument('--host', dest='host')
    parser.add_argument('port', nargs='?', type=int, default=ait.config.get('gui.port', 8080))

    arguments = parser.parse_args()
    browser = arguments.browser
    host = arguments.host
    port = arguments.port

    if host is None:
        if sys.platform == 'darwin':
            host = 'localhost'
        else:
            host = socket.gethostname().split('.')[0]

    url = 'http://%s:%d' % (host, port)

    ait.gui.init(host, port)
    ait.gui.startBrowser(url, browser)

    ait.core.log.info('Connect to %s' % url)
    ait.core.log.info('Ctrl-C to exit')

    ait.gui.wait()


except KeyboardInterrupt:
    ait.core.log.info('Received Ctrl-C.  Stopping AIT GUI.')
    ait.gui.cleanup()

except Exception as e:
    ait.core.log.error('AIT GUI error: %s' % str(e))

ait.core.log.end()
