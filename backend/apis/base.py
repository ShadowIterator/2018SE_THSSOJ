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
import traceback
import unicodedata
import site
from tornado.options import define, options

# from tornado.options import define, options
# define("port", default=8000, help="run on the given port", type=int)
# define("db_host", default="127.0.0.1", help="blog database host")
# define("db_port", default=5432, help="blog database port")
# define("db_database", default="thssoj", help="blog database name")
# define("db_user", default="postgres", help="blog database user")
# define("db_password", default="zUY3Z2N2ul", help="blog database password")

class NoResultError(Exception):
    pass

class NoMethodError(Exception):
    pass

class BaseError(Exception):
    pass

# permLevel = {
#     'NORMAL' : 0,
#     'STUDENT' : 1,
#     'TA': 2,
#     'ADMIN': 3,
#     'EVERYONE': 0,
#     'ONESELF': 1
# }

class PERMISSIONLEVEL(object):
    NORMAL = 0
    STUDENT = 1
    TA = 2
    ADMIN = 3
    EVERYONE = 0
    ONESELF = 1

permissions = {
    'users': {
        'read': {
            'id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'username': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'password': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'status': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'realname': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'student_id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'validate_time': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'create_time': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'role': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'validate_code': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'gender': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'student_courses': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'ta_courses': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'email': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
        },
        'write': {
            'id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'username': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'password': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'status': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.ONESELF),
            'realname': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'student_id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'validate_time': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'create_time': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'role': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'validate_code': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'gender': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'student_courses': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'ta_courses': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'email': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
        }
    },
    'courses': {
        'write': {
            'id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'name': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'description': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'tas': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'students': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'status': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'homeworks': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'notices': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
        },
        'read': {
            'id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'name': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'description': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'tas': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'students': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'status': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'homeworks': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'notices': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
        }
    },
    'homeworks': {
        'write': {
            'id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'name': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'deadline': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'problems': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'records': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
        },
        'read': {
            'id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'name': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'deadline': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'problems': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'records': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
        }
    },
    'problems': {
        'write': {
            'id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'title': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'time_limit': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'memory_limit': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'judge_method': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'records': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'openness': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
        },
        'read': {
            'id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'title': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'time_limit': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'memory_limit': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'judge_method': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'records': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'openness': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
        }
    },
    'records': {
        'write': {
            'id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'description': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'submit_time': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'user_id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'problem_id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'homework_id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'result': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'consume_time': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'consume_memory': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'src_size': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
        },
        'read': {
            'id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'description': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'submit_time': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'user_id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'problem_id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'homework_id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'result': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'consume_time': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'consume_memory': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'src_size': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
        }
    },
    'notices': {
        'read': {
            'id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'user_id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'course_id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'title': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'content': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
        },
        'write': {
            'id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'user_id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'course_id': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'title': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
            'content': (PERMISSIONLEVEL.NORMAL, PERMISSIONLEVEL.EVERYONE),
        }
    }
}

database_keys = {
    'users': ['id', 'username', 'password', 'status', 'email', 'realname', 'student_id', 'validate_time', 'create_time', 'role', 'validate_code', 'gender', 'student_courses', 'ta_courses'],
    'courses': ['id', 'name', 'description', 'tas', 'students', 'status', 'homeworks', 'notices'],
    'homeworks': ['id', 'name', 'deadline', 'problems', 'records'],
    'problems': ['id', 'title', 'time_limit', 'memory_limit', 'judge_method', 'records', 'openness'],
    'records': ['id', 'description', 'submit_time', 'user_id', 'problem_id', 'homework_id', 'result', 'submit_status', 'consume_time', 'consume_memory', 'src_size'],
    'notices': ['id', 'user_id', 'course_id', 'title', 'content'],
}

# class DatabaseRowObject(tornado.util.ObjectDict):
#     def __init__(self, db, *args, **kw):
#         self.db = db
#         super(DatabaseRowObject, self).__init__(*args, **kw)
#
#     async def execute(self, stmt, *args):
#         """Execute a SQL statement.
#
#         Must be called with ``await self.execute(...)``
#         """
#         with (await self.application.db.cursor()) as cur:
#             await cur.execute(stmt, args)
#
#     async def save(self):
#         properties = []
#         for key, value in self:
#             if key != 'db' and key != 'id':
#                 properties.append(str(key) + ' = ' + str(value))
#                 print(key)
#         # self.execute('''UPDATE ''')

def filterKeys(si_table_name, kw):
    # print('filterKeys: ', kw)
    rtn = {}
    keyslist = database_keys[si_table_name]
    for key,value in kw.items():
        if(key in keyslist):
            rtn[key] = value
    return rtn


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
        # try:
        #     if(self.user['password'] == self.args['auth_password']):
        #         return
        #
        # except:
        #     raise BaseError('check password failed')

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
        self.db = db
        super(Application, self).__init__(*args, **kw)


class BaseHandler(tornado.web.RequestHandler):
    def __init__(self, *args, **kw):
        super(BaseHandler, self).__init__(*args, **kw)
        self.getargs()
        self.set_header("Access-Control-Allow-Origin", "http://localhost:3000")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with, Content-type")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.set_header("Access-Control-Allow-Credentials", 'true')
        self.set_header("Access-Control-Max-Age", "3600")
        self.user = None
        # if(not self.user):
        #     self.user = {
        #         'role':
        #     }
        self.root_dir = 'root'

    def row_to_obj(self, row, cur):
        """Convert a SQL row to an object supporting dict and attribute access."""
        # obj = tornado.util.ObjectDict()
        obj = tornado.util.ObjectDict()
        for val, desc in zip(row, cur.description):
            obj[desc.name] = val
        return obj

    async def get_current_user_object(self):
        # user_id = self.get_secure_cookie('user_id')
        # print('get_usr: ', user_id)
        # users = self.getObject('users', id = user_id)
        # if(len(users) < 1):
        #     # raise Exception("no such user")
        #     return None
        # else:
        #     return users[0]
        if(self.user != None):
            return self.user
        try:
            user_id = self.get_secure_cookie('user_id')
            print('user_id:', int(user_id))
            users = await self.getObject('users', id = int(user_id))
            print('users: ', users)
            return users[0]
        except:
            print('get_user: not loged in')
            return None

    def get_current_user(self):
        return self.get_secure_cookie('user_id')

    async def execute(self, stmt, *args):
        """Execute a SQL statement.
        Must be called with ``await self.execute(...)``
        """
        print('execute: ', stmt, args)
        with (await self.application.db.cursor()) as cur:
            await cur.execute(stmt, args)

    async def query(self, stmt, *args):
        """Query for a list of results.
        Typical usage::
            results = await self.query(...)
        Or::
            for row in await self.query(...)
        """
        with (await self.application.db.cursor()) as cur:
            await cur.execute(stmt, args)
            res = [self.row_to_obj(row, cur)
                    for row in await cur.fetchall()]
            # for item in res:
            #     print(item)
            # for xx in res:
            #     xx.save()
            # res[0].name = 'ycdfwzy'
            # self.saveObject('users', res[0])
            return res

    async def queryone(self, stmt, *args):
        """Query for exactly one result.
        Raises NoResultError if there are no results, or ValueError if
        there are more than one.
        """
        results = await self.query(stmt, *args)
        if len(results) == 0:
            raise NoResultError()
        elif len(results) > 1:
            raise ValueError("Expected 1 result, got %d" % len(results))
        print(results[0])
        return results[0]

    async def prepare(self):
        pass
        # get_current_user cannot be a coroutine, so set
        # self.current_user in prepare instead.
        # user_id = self.get_secure_cookie("blogdemo_user")
        # print(user_id)
        # if user_id:
        #     self.current_user = await self.queryone("SELECT * FROM authors WHERE id = %s",
        #                                             int(user_id))

    async def any_author_exists(self):
        return bool(await self.query("SELECT * FROM authors LIMIT 1"))

    async def dropTable(self, si_table_name):
        await self.execute('''DROP TABLE IF EXISTS {table_name};'''.format(table_name = si_table_name))


    async def createTable(self, si_table_name, **kw):
        await self.execute('''CREATE TABLE {table_name} (\n{cols_info}\n );'''.format(table_name = si_table_name, cols_info = ',\n'.join(map(lambda tp : str(tp[0]) + ' ' + str(tp[1]), kw.items()))), None)

    async def saveObject(self, si_table_name, object, secure = 0):
        if(secure):
            object = await self.objectFilter(si_table_name, 'write', object)
        print('saveObject-before: ', object)
        object = filterKeys(si_table_name, object)
        print('saveObject: ', object)
        fmtList = []
        valueList = []
        for key,value in object.items():
            if key != 'id':
                fmtList.append(str(key) + ' = %s')
                valueList.append(value)
        sfmt = ' , '.join(fmtList)
        print('''UPDATE {table_name} SET {prop} WHERE id = {oid}'''.format(table_name = si_table_name, prop = sfmt, oid = object['id']), valueList)
        await self.execute('''UPDATE {table_name} SET {prop} WHERE id = {oid}'''.format(table_name = si_table_name, prop = sfmt, oid = object['id']), *valueList)
        # plst = []
        # for key, value in object.items():
        #     if key != 'id':
        #         plst.append(str(key) + ' = ' + str(value))
        #     slst = ','.join(plst)
        # await self.execute('''UPDATE {table_name} SET {prop} WHERE id = {oid}'''.format(table_name = si_table_name, prop = slst, oid = object['id']))

    async def all(self, si_table_name, secure = 0):
        res = await self.query('''SELECT * FROM {table_name}'''.format(table_name = si_table_name))
        if(secure):
            rtn = []
            for item in res:
                rtn.append(await self.objectFilter(si_table_name, 'read', item))
            return rtn
        else:
            return res

    async def getObject(self, si_table_name, secure = 0, **kw):
        print('getobject: ', kw)
        kw = filterKeys(si_table_name, kw)
        print('getobject after filter: ', kw)
        plst = []
        valuelist = []
        for key, value in kw.items():
            plst.append(str(key) + ' = %s')
            valuelist.append(value)
        slst = ' AND '.join(plst)
        print("slst = ", slst)
        res = await self.query('''SELECT * FROM {table_name} WHERE {conditions}'''.format(table_name = si_table_name, conditions = slst), *valuelist)
        if(secure):
            rtn = []
            for item in res:
                rtn.append(await self.objectFilter(si_table_name, 'read', item))
            return rtn
        else:
            return res


    async def deleteObject(self, si_table_name, **kw):
        plst = []
        valuelist = []
        for key, value in kw.items():
            plst.append(str(key) + ' = %s')
            valuelist.append(value)
        slst = ' AND '.join(plst)
        print("slst = ", slst)
        return await self.execute('''DELETE FROM {table_name} WHERE {conditions}'''.format(table_name = si_table_name, conditions = slst), *valuelist)


    async def createObject(self, si_table_name, **kw):
        print('createObject: kw = ', kw)
        kw = filterKeys(si_table_name, kw)
        propfmt = ['%s'] * len(kw)
        spropfmt = ','.join(propfmt)
        # propfmt = []
        propkeys = []
        propvalues = []
        for key, value in kw.items():
            propkeys.append(str(key))
            propvalues.append(value)

        str_fmt = '''INSERT INTO {table_name} ({property_keys})\n VALUES ({property_fmt});'''.format(table_name = si_table_name, property_keys = ','.join(propkeys), property_fmt = spropfmt)
        print('fmt = ', str_fmt, propvalues)
        await self.execute(str_fmt, *propvalues)

    async def objectFilter(self, table_name, method, dic):
        user = await self.get_current_user_object()
        per_owner = 0
        per_role = 0
        try:
            if (table_name == 'users' and 'id' in dic.keys()):
                if (dic['id'] == user['id']):
                    per_owner = 1
            per_role = user['role']
        except:
            print('object filter: user not loged in')
        print('permission: ', per_role, per_owner)
        return self.jsonFilter(table_name, method, dic, per_role, per_owner)

    def jsonFilter(self, table_name, method, dic, per_role, per_owner):
        rtn = {}
        permissionList = permissions[table_name][method]
        print('jsonFilter: ', dic)
        for key,value in dic.items():
            if(key in permissionList.keys()):
                permission = permissionList[key]
                print(permission)
                if(permission[0] <= per_role and permission[1] <= per_owner):
                    rtn[key] = value
        return rtn


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