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



define("port", default=8000, help="run on the given port")
define("db_host", default="postgres", help="blog database host")
define("db_port", default=5432, help="blog database port")
define("db_database", default="test", help="blog database name")
define("db_user", default="thssoj", help="blog database user")
define("db_password", default="thssoj", help="blog database password")
define('settings', default=None, help='tornado settings file', type=str)
define('RoutineList', default=None, help='tornado settings file', type=list)
define('AppConfig', default=None, help='tornado settings file', type=dict)
define('traditionalJudgerAddr', default=None, help='judger', type=str)
define('scriptJudgerAddr', default=None, help='judger', type=str)
define('judgerSecret', default='no_secret', help='secret', type=str)





async def main():
    tornado.options.parse_command_line()

    options.parse_config_file('settings/app_config.py')# % (options.settings))
    options.parse_config_file('settings/env_config.py')# % (options.settings))

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
    rdb = BaseDB(db)
    app = Application(rdb,
                      options.RoutineList,
                      **options.AppConfig
                      )
    await app.async_init()

    # user_obj = await rdb.getObjectOne('users', id = 1)
    # print('main: ', user_obj)
    # user_obj['username'] = 'hz'
    # await rdb.saveObject('users', user_obj)
    # print('main-2: ', await rdb.getObjectOne('users', id = 1))

    # await maybe_create_tables(db, 'sql/schema.sql')
    app.listen(options.port)
    shutdown_event = tornado.locks.Event()
    await shutdown_event.wait()


if __name__ == "__main__":
    tornado.ioloop.IOLoop.current().run_sync(main)
