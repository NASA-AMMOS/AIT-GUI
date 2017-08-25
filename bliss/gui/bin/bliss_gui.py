#!/usr/bin/env python

import argparse
import socket
import sys

import gevent
import gevent.monkey
import geventwebsocket

gevent.monkey.patch_all()

import bliss.core
import bliss.gui

try:
    bliss.core.log.begin()
    parser = argparse.ArgumentParser()
    parser.add_argument('--browser', dest='browser')
    parser.add_argument('--host', dest='host')
    parser.add_argument('port', nargs='?', type=int, default=bliss.config.get('gui.port', 8080))

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

    bliss.gui.init(host, port)
    bliss.gui.startBrowser(url, browser)

    bliss.core.log.info('Connect to %s' % url)
    bliss.core.log.info('Ctrl-C to exit')

    bliss.gui.wait()


except KeyboardInterrupt:
    bliss.core.log.info('Received Ctrl-C.  Stopping BLISS GUI.')
    bliss.gui.cleanup()

except Exception as e:
    bliss.core.log.error('BLISS GUI error: %s' % str(e))

bliss.core.log.end()
