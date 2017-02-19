import pyrebase
import sys
import random
import math
import time
import os

from os.path import join, dirname
from dotenv import load_dotenv


# Load configs from .env file
dotenv_path = join(dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)


UPDATE_TIMER = .5  # 1 second

CONFIG = {
  'apiKey': os.environ.get('apiKey'),
  'authDomain': os.environ.get('authDomain'),
  'databaseURL': os.environ.get('databaseURL'),
  'storageBucket': os.environ.get('storageBucket'),
  'serviceAccount': 'serviceAccountCredentials.json',
}

random.seed(math.pi)


def main(latlng):
    latitude, longitude = parse_latlng(latlng)

    firebase = pyrebase.initialize_app(CONFIG)

    auth = firebase.auth()
    db = firebase.database()

    state = {
        'latitude': latitude,
        'longitude': longitude,
        'db': db,
    }

    populate_fake_drivers(state)

    while True:
        updated_driver = update_random_driver(state)
        print('Updated driver -- {} '.format(updated_driver))
        time.sleep(UPDATE_TIMER)

def populate_fake_drivers(state):
    fake_drivers = get_fake_drivers(state['latitude'], state['longitude'])

    state['db'].child('drivers').remove()

    for driver in fake_drivers:
        state['db'].child('drivers').child(driver['id']).update(driver)

    state['fake_drivers'] = fake_drivers

def update_random_driver(state):
    drivers = state['fake_drivers']

    i = random.randint(0, len(drivers) - 1)
    driver = drivers[i]

    driver['position'] = random_position(driver['position']['latitude'],
                                         driver['position']['longitude'])

    state['db'].child('drivers').child(driver['id']).update(drivers[i])

    return drivers[i]

def get_fake_drivers(latitude, longitude):
    args = (latitude, longitude, 600)

    return [
        {'id': 1, 'name': 'Blick', 'position': random_position(*args)},
        {'id': 2, 'name': 'Flick', 'position': random_position(*args)},
        {'id': 3, 'name': 'Glick', 'position': random_position(*args)},
        {'id': 4, 'name': 'Plick', 'position': random_position(*args)},
        {'id': 5, 'name': 'Quick', 'position': random_position(*args)},
        {'id': 6, 'name': 'Snick', 'position': random_position(*args)},
        {'id': 7, 'name': 'Whick', 'position': random_position(*args)},
    ]

def parse_latlng(latlng):
    return map(float, latlng.split(',', 1))

def random_position(latitude, longitude, meters=50):
    r = meters / 111300.0

    y0 = latitude
    x0 = longitude

    u = random.random()
    v = random.random()

    w = r * math.sqrt(u)
    t = 2 * math.pi * v

    x = w * math.cos(t)

    y1 = w * math.sin(t)
    x1 = x / math.cos(y0)

    return {'latitude': (y0 + y1), 'longitude': (x0 + x1)}


main(*sys.argv[1:])
