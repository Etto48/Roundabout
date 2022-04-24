#!/usr/bin/python3
import logging
import sys

logging.basicConfig(stream=sys.stderr)
sys.path.insert(0, '/var/www/Roundabout/')
from Roundabout.app import app as application
application.secret_key = '4bb5c2a6ffd793fdb261a805e36f1ffc'