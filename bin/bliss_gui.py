#!/usr/bin/env python
"""
Usage:
  bliss-gui.py [<port> --host=<host> --browser=<browser>]

Options:
  port       GUI client HTTP connections port
  host       GUI client HTTP connections hostname
  browser    GUI client browser to start (may be "none")
"""

import socket
import sys

import docopt
import gevent
import gevent.monkey
import geventwebsocket

gevent.monkey.patch_all()

import bliss.core
import bliss.gui

try:
    bliss.core.log.begin()
    arguments = docopt.docopt(__doc__, version='bliss-gui 0.1.0')
    browser   = arguments['--browser']
    host      = arguments['--host']
    port      = int(arguments['<port>']) or 8000


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
