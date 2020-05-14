import ait.gui
import ait.core
import mock
import argparse
from collections import defaultdict
from time import sleep
from ait.core import cfg, tlm, limits, log

"""
This script tests that notifications are triggered at the threshold
and frequency specified in the configs. To run the test, execute the script,
wait up to 10 seconds for it to run, and then quit the process using Ctrl-C.
"""


def main():
    global pkt_defn, pkt, limit_dict, limit_defn
    pkt_defn, pkt = get_packet_and_defn()
    limit_dict = get_limit_dict()
    limit_defn = limit_dict[pkt_defn.name]['Voltage_A']

    parser = argparse.ArgumentParser()
    parser.add_argument('-default', action='store_true',
                        help='flag for testing the default notif options')

    args = parser.parse_args()
    enable_monitoring_test(args.default)


@mock.patch('ait.core.notify.trigger_notification')
def enable_monitoring_test(default, mock_notify):
    try:
        if not default:
            set_notif_options(thrshld=3, freq=2)
            # value should notify 3 times for 8 packets (msg 3, 5, 7)
            expected = 3
        else:
            expected = 1
        log_notif_options()

        ait.gui.init('localhost', 8080)
        ait.gui.enable_monitoring()
        sleep(1)
        add_telemetry()
        ait.gui.wait()
        sleep(1)
        ait.gui.cleanup()

    except KeyboardInterrupt:
        log.info('Received Ctrl-C.  Stopping AIT GUI.')
        ait.gui.cleanup()

    except Exception as e:
        log.error('AIT GUI error: %s' % str(e))

    # define expected calls
    call_list = [mock.mock.call(
                  'limit-error',
                  'Field Voltage_A error out of limit with value 0')] * expected
    call_list.extend([mock.mock.call(
                      'limit-error',
                      'Field Voltage_A error out of limit with value 50')] * expected)

    log.info('Notification was triggered {} times.'
            .format(mock_notify.call_count))

    assert mock_notify.call_args_list == call_list


def add_telemetry():
    # error value
    pkt.Voltage_A = 0
    for i in range(8):
        ait.gui.Sessions.addTelemetry(pkt_defn.uid, pkt._data)
    sleep(1)

    # good value - no notifs
    pkt.Voltage_A = 20
    for i in range(2):
        ait.gui.Sessions.addTelemetry(pkt_defn.uid, pkt._data)
    sleep(1)

    # error value
    pkt.Voltage_A = 50
    for i in range(8):
        ait.gui.Sessions.addTelemetry(pkt_defn.uid, pkt._data)


def get_packet_and_defn():
    first_stream = ait.config.get('gui.telemetry')[0]
    stream = cfg.AitConfig(config=first_stream).get('stream')
    name = stream.get('name', '<unnamed>')
    pkt_defn = tlm.getDefaultDict().get(name, None)
    pkt = tlm.Packet(pkt_defn)

    return pkt_defn, pkt


def get_limit_dict():
    limit_dict = defaultdict(dict)
    for k, v in limits.getDefaultDict().items():
        packet, field = k.split('.')
        limit_dict[packet][field] = v

    return limit_dict


def log_notif_options():
    thrshld = ait.config.get('notifications.options.threshold')
    freq = ait.config.get('notifications.options.frequency')
    log.info('Threshold and frequency are {} and {} respectively.'
              .format(thrshld, freq))


def set_notif_options(thrshld=None, freq=None):
    pathvars = {}
    if thrshld:
        pathvars['notifications.options.threshold'] = thrshld
        log.info('Changing notif threshold to {}.'.format(thrshld))
    if freq:
        pathvars['notifications.options.frequency'] = freq
        log.info ('Changing notif freq to {}.'.format(freq))

    ait.config.addPathVariables(pathvars)
    ait.config.reload()


if __name__ == "__main__":
    main()
