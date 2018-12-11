import json
import aiopg
import bcrypt
# import markdown
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
            print('catch_exception: return code = -1\n', repr(e))
            print(traceback.print_exc())
            self.write(json.dumps({'code': 1}).encode())
    return wrapper

def check_password(func):
    async def wrapper(self, *args, **kw):
        user = await self.get_current_user_object()
        print('checkpassword: ', user['password'], self.args['auth_password'])
        if(user['password'] == self.args['auth_password']):
            return await func(self, *args, **kw)
        raise BaseError('password incorrect')
    return wrapper


async def maybe_create_tables(db, filename):
    # try:
    #     with (await db.cursor()) as cur:
    #         await cur.execute("SELECT COUNT(*) FROM entries LIMIT 1")
    #         await cur.fetchone()
    #     print("in create")
    # except psycopg2.ProgrammingError:
        print('create tables')
        with open(filename) as f:
            schema = f.read()
        with (await db.cursor()) as cur:
            await cur.execute(schema)
    # with open('schema.sql') as f:
    #     schema = f.read()
    # with (await db.cursor()) as cur:
    #     await cur.execute(schema)

class Application(tornado.web.Application):
    def __init__(self, db, *args, **kw):
        self.db_instance = db
        super(Application, self).__init__(*args, **kw)

    def setDB(self, db):
        self.db_instance = db




class BaseHandler(tornado.web.RequestHandler):
    async def try_query(self):
        print('try_query')
        print('handler_query: ', await self.db.getObject('users', username='ss'))

    def __init__(self, *args, **kw):
        super(BaseHandler, self).__init__(*args, **kw)
        self.db = self.application.db_instance
        self.getargs()
        self.set_header("Access-Control-Allow-Origin", "http://localhost:3000")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with, Content-type")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.set_header("Access-Control-Allow-Credentials", 'true')

        self.root_dir='root'
        self.user = None

    # async def get(self, type): #detail
    #     print('get: ', type)
    #     await self._call_method('''_{action_name}_get'''.format(action_name = type))

    @catch_exception_write
    async def get(self, type):  # detail
        # self.getargs()
        print('get: ', type)
        res = await self._call_method('''_{action_name}_get'''.format(action_name=type))
        self.write(json.dumps(res).encode())

    # async def post(self, type):
    #     print('post: ', type)
    #     await self._call_method('''_{action_name}_post'''.format(action_name = type))

    @catch_exception_write
    async def post(self, type):
        print('post: ', type)
        res = await self._call_method('''_{action_name}_post'''.format(action_name=type))
        print('return: ', res)
        self.write(json.dumps(res).encode())

    async def get_current_user_object(self):
        if(self.user != None):
            return self.user
        try:
            user_id = self.get_secure_cookie('user_id')
            print('user_id:', int(user_id))
            users = await self.db.getObject('users', id = int(user_id))
            print('users: ', users)
            return users[0]
        except:
            print('get_user: not loged in')
            return None

    def get_current_user(self):
        return self.get_secure_cookie('user_id')

    async def _testhello_post(self):
        print('app: in testhello')
        self.write('hello: ' + self.__class__.__name__  + ' ' + self.args['msg'])
        return None

    def getargs(self):
        # print('getargs: ', self.request.body.decode() or '{}')
        self.args = json.loads(self.request.body.decode() or '{}')
        # self.argFilter()
        print('getargs\n', self.request, '\n', self.args)
        print(self.request.method)


    async def _call_method(self, method, *args, **kw):
        print(method)
        func = getattr(self, method, None)
        if(not callable(func)):
            print('no method')
            raise NoMethodError
        print('await to call function')
        return await func(*args, **kw)
        # res = await func(*args, **kw)
        # print('call method res = ', res)
        # return res

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