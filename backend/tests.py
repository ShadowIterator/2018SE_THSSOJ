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
import asyncio
from apis.base import maybe_create_tables, Application
from apis.user import *
from apis.record import *
from apis.notice import *
from apis.course import *
from apis.problem import *
from apis.homework import *
from apis.db import BaseDB
from tornado.options import define, options


from tornado.options import define, options
from tornado.httpclient import AsyncHTTPClient
from tornado.testing import AsyncHTTPTestCase, AsyncTestCase
from tornado.httpserver import HTTPRequest
from unittest.mock import Mock

define("port", default=8000, help="run on the given port")
define("db_host", default="postgres", help="blog database host")
define("db_port", default=5432, help="blog database port")
define("db_database", default="test", help="blog database name")
define("db_user", default="thssoj", help="blog database user")
define("db_password", default="thssoj", help="blog database password")
define('settings', default=None, help='tornado settings file', type=str)
define('RoutineList', default=None, help='tornado settings file', type=list)
define('AppConfig', default=None, help='tornado settings file', type=dict)

def async_aquire_db(func):
    @tornado.testing.gen_test
    async def wrapper(self, *args, **kw):
        await self.set_application_db()
        return await func(self, *args, **kw)
    return wrapper

class BaseTest(AsyncHTTPTestCase):
    async def set_application_db(self):
        # print('in get_db', options.db_host,
        #         options.db_port,
        #         options.db_user,
        #         options.db_password,
        #         options.db_database)
        while True:
            try:
                db = await aiopg.create_pool(
                        host=options.db_host,
                        port=options.db_port,
                        user=options.db_user,
                        password=options.db_password,
                        dbname=options.db_database)
                await maybe_create_tables(db, 'sql/schema.sql')
                print('create pool done')
                break
            except:
                pass
        rdb = BaseDB(db)
        self.db = rdb
        self._app.setDB(rdb)
        print('get_db done')

    async def try_createObject(self):
        print('try_createObj')
        await self.db.createObject('users', username='ss', password='zz', email='dd')
        print('create: ', await self.db.getObject('users', username = 'ss'))

    def setUp(self):
        options.parse_config_file('settings/app_config.py')
        self.db = None
        super(BaseTest, self).setUp()


    def get_app(self):
        print('call get_app')
        return Application(None,
                          options.RoutineList,
                          **options.AppConfig
                           )

    # an example
    # @async_aquire_db
    # async def test_hello(self):
    #     await self.db.createObject('users', username = 'hfzzz', password = 'pwd', email = 'xx@xx.com')
    #     response = await self.http_client.fetch(self.get_url('/api/user/query'), method = 'POST', body = '{ "username" : "hfzzz"}')
    #     self.assertIn(b'st', response.body)
    #     print(response.body)
    #     print('getobj in db: ', await self.db.getObject('users', username = 'hfzzz'))


    @async_aquire_db
    async def test_2(self):
        print('test_2')
        await self.db.createObject('users', username = 'hfzzz', password = 'pwd', email = 'xx@xx.com')
        await self.db.createObject('users', username = 'hfzzz1', password = 'pwd', email = 'xx@xx.com')
        response = await self.http_client.fetch(self.get_url('/api/user/query'), method = 'POST', body = '{ "username" : "hfzzz1"}')
        self.assertIn(b'st', response.body)
        print(response.body)
        print('getobj in db: ', await self.db.getObject('users', username = 'hfzzz'))

