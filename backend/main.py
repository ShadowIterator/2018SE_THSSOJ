# encoding = utf-8
import json
import aiopg
import bcrypt
# import markdown
import os.path
import psycopg2
import re
import tornado.escape
import tornado.httpserver
import tornado.ioloop
import tornado.locks
import tornado.options
import tornado.web
import unicodedata
from apis.base import maybe_create_tables, Application
from apis.db import BaseDB
from tornado.locks import Condition, Lock
from tornado import gen
from tornado.options import define, options
import hashlib

define("port", default=8000, help="run on the given port")
define("db_host", default="127.0.0.1", help="blog database host")
define("db_port", default=5432, help="blog database port")
define("db_database", default="test", help="blog database name")
define("db_user", default="postgres", help="blog database user")
define("db_password", default="", help="blog database password")
define('settings', default=None, help='tornado settings file', type=str)
define('RoutineList', default=None, help='tornado settings file', type=list)
define('AppConfig', default=None, help='tornado settings file', type=dict)
define('traditionalJudgerAddr', default=None, help='judger', type=str)
define('scriptJudgerAddr', default=None, help='judger', type=str)
define('judgerSecret', default='no_secret', help='secret', type=str)

define('superuser_username', default='admin', help='superuser_username', type=str)
define('superuser_password', default='1234', help='superuser_password', type=str)
define('superuser_email', default='1234', help='superuser_password', type=str)
define('in_test', default=False, help='superuser_username', type=bool)

# superuser_username = 'admin'
# superuser_password = '1234'


def get_md5(str):
    md5_tool = hashlib.md5()
    md5_tool.update(str.encode('utf-8'))
    return md5_tool.hexdigest()


async def main():
    tornado.options.parse_command_line()

    options.parse_config_file('settings/app_config.py')# % (options.settings))
    if(not os.getenv('USE_TRAVIS', None)):
        options.parse_config_file('settings/env_config.py')# % (options.settings))
    else:
        options.parse_command_line('settings/env_config_example.py')

    print(options.db_host, options.db_port, options.db_user ,options.db_password, options.db_database)

    # Create the global connection pool.

    while True:
        try:
            db = await aiopg.create_pool(
                host=options.db_host,
                port=options.db_port,
                user=options.db_user,
                password=options.db_password,
                dbname=options.db_database)
            # print_test('create pool done')
            break
        except:
            # print_test("retrying to connect test database")
            pass
    await maybe_create_tables(db, './sql/schema.sql')

    # async with aiopg.create_pool(
    #         host=options.db_host,
    #         port=options.db_port,
    #         user=options.db_user,
    #         password=options.db_password,
    #         dbname=options.db_database) as db:
    print(options.AppConfig)
    rdb = BaseDB(db)
    app = Application(rdb,
                      'root/',
                      options.RoutineList,
                      **options.AppConfig,
                      )
    await app.async_init()

    # --INSERT
    # INTO
    # users(username, password, email, role, TA_courses, student_courses, create_time, secret)
    # VALUES('admin', '1234', 'admin@admin.com', 3, '{}', '{}', TIMESTAMP
    # '2011-05-16 15:36:38', 'fa3ijfa3ffsa9324953');
    if(not options.in_test):
        await rdb.createObject('users', username = options.superuser_username, password = get_md5(options.superuser_password), email = 'admin@admin.com', role = 3, TA_courses = [], student_courses = [],
                          secret = 'alifejaliejflifjilewgh23094eowfijf23ioeaida')

    # user_obj = await rdb.getObjectOne('users', id = 1)
    # print('main: ', user_obj)
    # user_obj['username'] = 'hz'
    # await rdb.saveObject('users', user_obj)
    # print('main-2: ', await rdb.getObjectOne('users', id = 1))
    app.listen(options.port)
    shutdown_event = tornado.locks.Event()
    await shutdown_event.wait()


if __name__ == "__main__":
    tornado.ioloop.IOLoop.current().run_sync(main)
