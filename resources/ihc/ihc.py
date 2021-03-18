import logging
import argparse
import sys
import os
import signal
import json
import time


from jeedom.jeedom import jeedom_utils, jeedom_com, jeedom_socket, JEEDOM_SOCKET_MESSAGE

from ihcsdk.ihccontroller import IHCController
from datetime import datetime

# ----------------------------------------------------------------------------

_log_level = "error"
_socket_port = 55066
_socket_host = 'localhost'
_pidfile = '/tmp/ihc.pid'
_apikey = ''
_callback = ''
_cycle = 30

parser = argparse.ArgumentParser(description='Daemon for Jeedom plugin')
parser.add_argument("--loglevel", help="Log Level for the daemon", type=str)
parser.add_argument("--controllerID", help="controllerID", type=str)
parser.add_argument("--controllerPW", help="controllerPW", type=str)
parser.add_argument("--controllerIP", help="controllerIP", type=str)
parser.add_argument("--IhcSoft", help="IhcSoft", type=str)
parser.add_argument("--socketport", help="Socket Port", type=int)
parser.add_argument("--callback", help="Value to write", type=str)
parser.add_argument("--apikey", help="Value to write", type=str)
parser.add_argument("--pid", help="Value to write", type=str)

parser.add_argument("--cycle", help="Cycle to send event", type=str)
args = parser.parse_args()

_log_level = args.loglevel
_socket_port = args.socketport
_pidfile = args.pid
_apikey = args.apikey
_callback = args.callback
_controllerID = args.controllerID
_controllerPW = args.controllerPW
_controllerIP = args.controllerIP
_IhcSoft = args.IhcSoft

jeedom_utils.set_log_level(_log_level)

logging.info('Start daemon')
logging.info('Log level : '+str(_log_level))
logging.debug('Socket port : '+str(_socket_port))
logging.debug('PID file : '+str(_pidfile))
logging.debug('User : '+str(_controllerID))
logging.debug('Controller IP : '+str(_controllerIP))

# ----------------------------------------------------------------------------

def main():
    starttime = datetime.now()

    def on_ihc_change(ihcid, value):
        """Callback when ihc resource changes"""
        logging.info("Resource change " + str(ihcid) + "->" + str(value) + " time: " + gettime())
        tmp = {}
        tmp["method"] = "updateValue"
        tmp["ResourceID"] = str(ihcid)
        tmp["Value"] = str(value)

        jeedomCom.send_change_immediate(tmp)

    def gettime():
        dif = datetime.now() - starttime
        return str(dif)

    url = _IhcSoft + "://" + _controllerIP
    ihc = IHCController(url, _controllerID, _controllerPW)
    if not ihc.authenticate():
       logging.info("Authenticate failed")
       exit()
    logging.info("Authenticate succeeded\r\n")

    def read_socket():
        global JEEDOM_SOCKET_MESSAGE
        if not JEEDOM_SOCKET_MESSAGE.empty():
            logging.debug("Message received in socket JEEDOM_SOCKET_MESSAGE")
            message = json.loads(JEEDOM_SOCKET_MESSAGE.get().decode('utf-8'))
            try:
                if message['method'] == 'IHC_Write':
                    try:
                        ihc.set_runtime_value_bool(message['resid'], message['cmd'])
                    except Exception as e:
                        logging.error('IHC_Write error : '+str(e))
                elif message['method'] == 'IHC_Notify':
                    try:
                        ihc.disconnect()
                        for i in range(0, len(message['resids'])):
                            ihc.add_notify_event(message['resids'][i]['ResourceID'], on_ihc_change, True)
                    except Exception as e:
                        logging.error('IHC_Notify error : '+str(e))
                elif message['method'] == 'IHC_Read':
                    try:
                        value = ihc.get_runtime_value(message['resid'])
                        tmp = {}
                        tmp["method"] = "updateValue"
                        tmp["ResourceID"] = message['resid']
                        tmp["Value"] = str(value)
                        jeedomCom.send_change_immediate(tmp)
                    except Exception as e:
                        logging.error('IHC_Notify error : '+str(e))
                else:
                    logging.error("unknown method:" + str(message['method']))
            except Exception as e:
                logging.error('Send command to demon error : '+str(e))

    def listen():
        logging.debug("Start listening")
        jeedomSocket.open()
        try:
            while 1:
                time.sleep(0.01)
                read_socket()
        except KeyboardInterrupt:
            shutdown()

    # ----------------------------------------------------------------------------

    def handler(signum=None, frame=None):
        logging.debug("Signal %i caught, exiting..." % int(signum))
        shutdown()

    def shutdown():
        logging.debug("Shutdown")
        ihc.disconnect()
        ihc.client.connection.session.close()
        logging.debug("Removing PID file " + str(_pidfile))
        try:
            os.remove(_pidfile)
        except:
            pass
        try:
            jeedomSocket.close()
        except:
            pass
        logging.debug("Exit 0")
        sys.stdout.flush()
        os._exit(0)

    # ----------------------------------------------------------------------------

    signal.signal(signal.SIGINT, handler)
    signal.signal(signal.SIGTERM, handler)

    try:
        jeedom_utils.write_pid(str(_pidfile))
        jeedomSocket = jeedom_socket(port=_socket_port,address=_socket_host)
        jeedomCom = jeedom_com(apikey = _apikey,url = _callback,cycle=_cycle)


        listen()
    except Exception as e:
        logging.error('Fatal error : '+str(e))

    shutdown()

main()