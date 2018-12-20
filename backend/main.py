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
    async with aiopg.create_pool(
            host=options.db_host,
            port=options.db_port,
            user=options.db_user,
            password=options.db_password,
            dbname=options.db_database) as db:
        rdb = BaseDB(db)
        app = Application(rdb,
                          options.RoutineList,
                          **options.AppConfig
                          )
        await app.async_init()

        # with (await db.cursor()) as cur:
            # print('maybe-create-tables: ', schema)
            # await cur.execute(schema)

        await maybe_create_tables(db, 'sql/schema.sql')
        # await rdb.createObject('users', username = 'hfz', password = '1234')

        # user = await rdb.createObject('users', email = 'xx')
        # user['email'] = 'adfdsfe'
        # await rdb.saveObject('users', {'id': user['id'], 'email': '12423'})
        # stmt = ''''''
        # await rdb

        # await rdb.ins'ert_element_in_array('users', 'student_courses', 5, 1)
        # await rdb.remove_element_in_array('users', 'student_courses', 2, 1)
        # print('get user:', await rdb.getObjectOne('users', id = 1))
        # stmt = '''SELECT * FROM users WHERE username LIKE \'%%{keyword}%%\';'''.format(keyword = 'hfz')
        # print('stmt = ', stmt)

        # for user in await rdb.getTable('problems').search_by_title(filter(lambda s: s!='', ' dfsdfli HTML    hfz '.split(' '))):
        #     print('get user: ', user)

        # stmt = 'SELECT * FROM users WHERE username LIKE \'%%hfz%%\';'
        # print('stmt = ', stmt)
        # for user in await rdb.query(stmt):
        #     print('get user: ', user)
        # app.listen(options.port)

        # print('after op: ', await rdb.getObjectOne('judgestates', id = 1))
        # In this demo the server will simply run until interrupted
        # with Ctrl-C, but if you want to shut down more gracefully,
        # call shutdown_event.set().
        shutdown_event = tornado.locks.Event()
        await shutdown_event.wait()


if __name__ == "__main__":
    tornado.ioloop.IOLoop.current().run_sync(main)
