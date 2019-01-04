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
from apis.base import maybe_create_tables, Application, re_create_tables
from apis.user import *
from apis.record import *
from apis.notice import *
from apis.course import *
from apis.problem import *
from apis.homework import *
from apis.db import BaseDB
from tornado.options import define, options
from apis.base import print_test, print_debug


from tornado.options import define, options
from tornado.httpclient import AsyncHTTPClient
from tornado.testing import AsyncHTTPTestCase, AsyncTestCase
import tornado.httputil

define("port", default=8000, help="run on the given port")
define("db_host", default="127.0.0.1", help="blog database host")
define("db_port", default=5432, help="blog database port")
define("db_database", default="test", help="blog database name")
define("db_user", default="postgres", help="blog database user")
define("db_password", default="", help="blog database password")
define('settings', default=None, help='tornado settings file', type=str)
define('RoutineList', default=None, help='tornado settings file', type=list)
define('AppConfig', default={
              'debug': True,
              'cookie_secret':'ahsdfhksadjfhksjahfkashdf',
}, help='tornado settings file', type=dict)
define('traditionalJudgerAddr', default=None, help='judger', type=str)
define('scriptJudgerAddr', default=None, help='judger', type=str)


def get_md5(str):
    md5_tool = hashlib.md5()
    md5_tool.update(str.encode('utf-8'))
    return md5_tool.hexdigest()

def async_aquire_db(func):
    @tornado.testing.gen_test
    async def wrapper(self, *args, **kw):
        await self.set_application_db()
        await self._app.async_init()
        await self.prepare()
        res = await func(self, *args, **kw)
        await self.done()
        return res
    return wrapper

class SIClient:
    def __init__(self, client = None, *args, **kw):
        # self.client = client
        if(client == None):
            self.client = AsyncHTTPClient()
        else:
            self.client = client
        self.user_id_cookie = ''

    async def get_response(self, url, *args, **kw):
        header = tornado.httputil.HTTPHeaders({'content-type': 'application/json', 'Cookie': self.user_id_cookie})
        print_debug('''si-client fetch {url} with header = {header}'''.format(url = url, header = header))
        res = await self.client.fetch(url, headers = header, *args, **kw)
        for cookie in res.headers.get_list('Set-Cookie'):
            parsed_cookie = tornado.httputil.parse_cookie(cookie)
            if 'user_id' in parsed_cookie.keys():
                self.user_id_cookie = '''user_id=\"{secure_cookie}\"'''.format(secure_cookie = parsed_cookie['user_id'])
        return res


class BaseTestCase(AsyncHTTPTestCase):
    async def prepare(self):
        pass

    async def done(self):
        pass

    async def createUser(self, *args, **kw):
        create_param = {}
        for key, value in kw.items():
            if key == 'password':
                create_param[key] = get_md5(value)
            else:
                create_param[key] = value
        rtn = await  self.db.createObject('users', **create_param)
        if('password' in kw.keys()):
            rtn['password'] = kw['password']
        return rtn

    async def set_application_db(self):
        print_test('in get_db', options.db_host,
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
                await re_create_tables(db, './sql/schema.sql')
                print_test('create pool done')
                break
            except:
                print_test("retrying to connect test database")
                pass
        rdb = BaseDB(db)
        self.db = rdb
        self._app.setDB(rdb)
        print_test('get_db done')

    async def try_createObject(self):
        print_test('try_createObj')
        await self.db.createObject('users', username='ss', password='zz', email='dd')
        print_test('create: ', await self.db.getObject('users', username = 'ss'))

    def setUp(self):
        self.admin_pass = '1234'
        self.root_dir = 'test_root/'
        options.parse_config_file('./settings/app_test_config.py')
        if (not os.getenv('USE_TRAVIS', None)):
            options.parse_config_file('./settings/env_config.py')
        else:
            options.parse_command_line('./settings/env_config_example.py')
            print_test('travis: parse env config example')
        print_test('parse env config, Appconfig = ', options.AppConfig)
        self.db = None
        self.cookies = dict()
        self.user_id_cookie = ''
        super(BaseTestCase, self).setUp()


    def get_app(self):
        print_test('call get_app')
        return Application(None,
                           self.root_dir,
                          options.RoutineList,
                          **options.AppConfig,
                           )

    def getbodyObject(self, response):
        return json.loads(response.body)

    async def get_response(self, uri, client = None, *args, **kw):
        if(client == None):
            header = tornado.httputil.HTTPHeaders({'content-type': 'application/json', 'Cookie': self.user_id_cookie})
            res = await self.http_client.fetch(self.get_url(uri), headers = header, *args, **kw)
            for cookie in res.headers.get_list('Set-Cookie'):
                parsed_cookie = tornado.httputil.parse_cookie(cookie)
                if 'user_id' in parsed_cookie.keys():
                    self.user_id_cookie = '''user_id=\"{secure_cookie}\"'''.format(secure_cookie = parsed_cookie['user_id'])
            return res
        else:
            return await client.get_response(self.get_url(uri), *args, **kw)

    async def post_request(self, uri, client = None, **kw):
        print_debug('post_request', kw)
        return await self.get_response(uri, method = 'POST', body = json.dumps(kw).encode(), client = client)

    async def get_request(self, uri, client = None, **kw):
        return await self.get_response(uri, method = 'GET', body = None, client = client)

    async def login(self, username, password, client = None):
        response = self.getbodyObject(await self.post_request('/api/user/login',
                                                              username=username,
                                                              password=password,
                                                              client = client))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 0)
    
    async def login_object(self, obj, client = None):
        print_debug('login_object: ', obj, client)

    async def logout(self, user_id):
        response = self.getbodyObject(await self.post_request('/api/user/logout',
                                                              id=user_id))
        self.assertEqual(response['code'], 0)

    async def login_object(self, obj, client = None):
        response = self.getbodyObject(await self.post_request('/api/user/login',
                                                              username=obj['username'],
                                                              password=obj['password'],
                                                              client = client))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 0)

    async def logout_object(self, obj):
        response = self.getbodyObject(await self.post_request('/api/user/logout',
                                                              id=obj['id']))
        self.assertEqual(response['code'], 0)

    async def post_request_return_object(self, url, client = None, *args, **kw):
        return self.getbodyObject(await self.post_request(url, client = client, *args, **kw))

