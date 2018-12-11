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
import tornado.httputil

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
        await self.prepare()
        return await func(self, *args, **kw)
    return wrapper

class BaseTestCase(AsyncHTTPTestCase):
    async def prepare(self):
        pass

    async def set_application_db(self):
        print('in get_db', options.db_host,
                options.db_port,
                options.db_user,
                options.db_password,
                options.db_database)
        while True:
            try:
                db = await aiopg.create_pool(
                        host=options.db_host,
                        port=options.db_port,
                        user=options.db_user,
                        password=options.db_password,
                        dbname=options.db_database)
                await maybe_create_tables(db, './sql/schema.sql')
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
        options.parse_config_file('./settings/app_config.py')
        self.db = None
        self.cookies = dict()
        self.user_id_cookie = ''
        super(BaseTestCase, self).setUp()


    def get_app(self):
        print('call get_app')
        return Application(None,
                          options.RoutineList,
                          **options.AppConfig
                           )

    def getbodyObject(self, response):
        return json.loads(response.body)

    async def get_response(self, uri, *args, **kw):
        header = tornado.httputil.HTTPHeaders({'content-type': 'application/json', 'Cookie': self.user_id_cookie})
        # for key, value in self.cookies.items():
        #     header.add('Cookie', '='.join((key, value)))
        # print('post header: ', header)
        res = await self.http_client.fetch(self.get_url(uri), headers = header, *args, **kw)
        for cookie in res.headers.get_list('Set-Cookie'):
            parsed_cookie = tornado.httputil.parse_cookie(cookie)
            # print('setcookie: ', parsed_cookie)
            # for key, value in parsed_cookie.items():
            #     if(key != 'Path'):
            #         self.cookies[key] = '='.join((key, value))
            if 'user_id' in parsed_cookie.keys():
                self.user_id_cookie = '''user_id=\"{secure_cookie}\"'''.format(secure_cookie = parsed_cookie['user_id'])
        # print('selfcookies: ', self.user_id_cookie)
        return res

    async def post_request(self, uri, **kw):
        return await self.get_response(uri, method = 'POST', body = json.dumps(kw).encode())

    async def get_request(self, uri, **kw):
        return await self.get_response(uri, method = 'GET', body = None)

    # an example
    # @async_aquire_db
    # async def test_hello(self):
    #     await self.db.createObject('users', username = 'hfzzz', password = 'pwd', email = 'xx@xx.com')
    #     response = await self.http_client.fetch(self.get_url('/api/user/query'), method = 'POST', body = '{ "username" : "hfzzz"}')
    #     self.assertIn(b'st', response.body)
    #     print(response.body)
    #     print('getobj in db: ', await self.db.getObject('users', username = 'hfzzz'))


    # @async_aquire_db
    # async def test_2(self):
    #     print('test_2')
    #     await self.db.createObject('users', username = 'hfzzz', password = 'pwd', email = 'xx@xx.com')
    #     await self.db.createObject('users', username = 'hfzzz1', password = 'pwd', email = 'xx@xx.com')
    #     response = await self.http_client.fetch(self.get_url('/api/user/query'), method = 'POST', body = '{ "username" : "hfzzz1"}')
    #     self.assertIn(b'st', response.body)
    #     print(response.body)
    #     print('getobj in db: ', await self.db.getObject('users', username = 'hfzzz'))
    #
