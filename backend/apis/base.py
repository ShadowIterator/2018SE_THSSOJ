import json
import aiopg
import bcrypt
import os.path
import psycopg2
import datetime
import time
import re
import tornado.escape
import tornado.httpserver
import tornado.ioloop
import tornado.locks
import tornado.options
import tornado.web
import traceback
import asyncio
import unicodedata
import site
from tornado.options import define, options





def print_debug(*args, **kw):
    # print(*args, **kw)
    pass

def print_test(*args, **kw):
    # print(*args, **kw)
    pass

class Roles:
    NOROLE = 0
    STUDENT = 1
    TA = 2
    ADMIN = 3

class NoResultError(Exception):
    pass

class NoMethodError(Exception):
    pass

class BaseError(Exception):
    pass

def catch_exception_write(func):
    async def wrapper(self, *args, **kw):
        try:
            return await func(self, *args, **kw)
        except Exception as e:
            print_debug('catch_exception: return code = -1\n', repr(e))
            print_debug(traceback.print_exc())
            self.write(json.dumps({'code': 1}).encode())
    return wrapper

def check_password(func):
    async def wrapper(self, *args, **kw):
        user = await self.get_current_user_object()
        print_debug('checkpassword: ', user['password'], self.args['auth_password'])
        if(user['password'] == self.args['auth_password']):
            return await func(self, *args, **kw)
        raise BaseError('password incorrect')
    return wrapper


async def re_create_tables(db, filename):
    print_debug('re-create tables')
    with open(filename, encoding = 'utf-8') as f:
        schema = f.read()
    with (await db.cursor()) as cur:
        # print_debug('maybe-create-tables: ', schema)
        await cur.execute(schema)

async def maybe_create_tables(db, filename):
    try:
        with (await db.cursor()) as cur:
            await cur.execute("SELECT COUNT(*) FROM entries LIMIT 1")
            await cur.fetchone()
        print_debug("table already exists")
    except psycopg2.ProgrammingError:
        print_debug('re-create tables')
        with open(filename, encoding='utf-8') as f:
            schema = f.read()
        with (await db.cursor()) as cur:
            await cur.execute(schema)

class Application(tornado.web.Application):
    def __init__(self, db, root_dir, *args, **kw):
        self.db_instance = db
        self.root_dir = root_dir
        super(Application, self).__init__(*args, **kw)

    def setDB(self, db):
        self.db_instance = db

    async def async_init(self):
        await self.db_instance.async_init()

class BaseHandler(tornado.web.RequestHandler):
    async def try_query(self):
        print_debug('try_query')
        print_debug('handler_query: ', await self.db.getObject('users', username='ss'))

    def __init__(self, *args, **kw):
        super(BaseHandler, self).__init__(*args, **kw)
        self.db = self.application.db_instance
        self.getargs()
        self.set_header("Access-Control-Allow-Origin", "http://localhost:3000")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with, Content-type, X-Requested-With")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.set_header("Access-Control-Allow-Credentials", 'true')

        self.root_dir= self.application.root_dir
        self.user = None

    @catch_exception_write
    async def get(self, type):  # detail
        # self.getargs()
        print_debug('get: ', type)
        res = await self._call_method('''_{action_name}_get'''.format(action_name=type))
        self.write(json.dumps(res).encode())

    @catch_exception_write
    async def post(self, type):
        print_debug('''request-type = {type} request-header = {headers}'''.format(headers = self.request.headers, type = type))
        # print_debug('post: ', type)
        res = await self._call_method('''_{action_name}_post'''.format(action_name=type))
        print_debug('return: ', res)
        self.write(json.dumps(res).encode())

    async def get_current_user_object(self):
        if(self.user != None):
            return self.user
        try:
            user_id = self.get_secure_cookie('user_id')
            print_debug('user_id:', int(user_id))
            users = await self.db.getObject('users', id = int(user_id))
            print_debug('users: ', users)
            return users[0]
        except:
            print_debug('get_user: not loged in')
            return None

    def get_current_user(self):
        return self.get_secure_cookie('user_id')

    async def _testhello_post(self):
        print_debug('app: in testhello')
        self.write('hello: ' + self.__class__.__name__  + ' ' + self.args['msg'])
        return None

    def getargs(self):
        self.args = json.loads(self.request.body.decode() or '{}')
        print_debug('getargs\n', self.request, '\n', self.args)
        print_debug(self.request.method)


    async def _call_method(self, method, *args, **kw):
        print_debug(method)
        func = getattr(self, method, None)
        if(not callable(func)):
            print_debug('no method')
            raise NoMethodError
        print_debug('await to call function')
        return await func(*args, **kw)

    def options(self, *args, **kw):
        # no body
        self.set_status(204)
        self.finish()

    def return_json(self, res_dict):
        self.write(tornado.escape.json_encode(res_dict))

    def set_res_dict(self, res_dict, **contents):
        for key in contents.keys():
            res_dict[key] = contents[key]

    def check_input(self, *keys):
        for key in keys:
            if key not in self.args:
                return False
        return True

    def str_to_bytes(self, src, tgt):
        for each_char in src:
            tgt.append(ord(each_char))

    def bytes_to_str(self, src):
        tgt = ''
        for each_char in src:
            tgt+=chr(each_char)
        return tgt

    def property_filter(self, object_selected, allowed_properties, abandoned_properties):
        rtn = {}
        for key, value in object_selected.items():
            if (((allowed_properties == None) or (key in allowed_properties)) and ((abandoned_properties == None) or (key not in abandoned_properties))):
                rtn[key] = value
        return rtn
