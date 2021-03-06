import aiopg
import bcrypt
import os.path
# import psycopg2
import re
import json
import base64
import random
import tornado.escape
import tornado.httpserver
import tornado.ioloop
import tornado.locks
import tornado.options
import tornado.web
import datetime
import time
# import unicodedata
import asyncio
# from aiopg.sa import create_engine
# import sqlalchemy as sa
# import aiopg.sa as sa
from tornado.locks import Condition, Lock
from apis.base import print_debug

class NoResultError(Exception):
    pass

class NoMethodError(Exception):
    pass

class BaseError(Exception):
    pass


class BaseDB:
    def __init__(self, db):
        self.db = db
        self.tables = {}
        self.tables['users'] = Users(self, 'users')
        self.tables['courses'] = Courses(self, 'courses')
        self.tables['homeworks'] = Homeworks(self, 'homeworks')
        self.tables['problems'] = Problems(self, 'problems')
        self.tables['records'] = Records(self, 'records')
        self.tables['notices'] = Notices(self, 'notices')
        self.tables['judgestates'] = Judgestates(self, 'judgestates')
        self.tables['ratios'] = Ratios(self, 'ratios')
        self.tables['global'] = Global(self, 'global', 2047)

    async def async_init(self):
        for name, table in self.tables.items():
            await table.async_init()
        # self.table_name = si_table_name

    @staticmethod
    def row_to_obj(row, cur):
        """Convert a SQL row to an object supporting dict and attribute access."""
        # obj = tornado.util.ObjectDict()
        obj = tornado.util.ObjectDict()
        for val, desc in zip(row, cur.description):
            obj[desc.name] = val
        return obj

    async def execute(self, stmt, *args):
        """Execute a SQL statement.

        Must be called with ``await self.execute(...)``
        """
        # print_debug('execute: ', stmt, args)
        with (await self.db.cursor()) as cur:
            await cur.execute(stmt, args)

    async def execute_without_args(self, stmt):
        print_debug('exe-without: ', stmt)
        with (await self.db.cursor()) as cur:
            await cur.execute(stmt)

    async def query(self, stmt, *args):
        """Query for a list of results.

        Typical usage::

            results = await self.query(...)

        Or::

            for row in await self.query(...)
        """
        # print_debug('query: ', stmt, args)
        with (await self.db.cursor()) as cur:
            await cur.execute(stmt, args)
            res = [self.row_to_obj(row, cur)
                    for row in await cur.fetchall()]
            # for item in res:
            #     print_debug(item)
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
        print_debug(results[0])
        return results[0]

    async def querylr(self, si_table_name, l , r, **kw):
        return await self.tables[si_table_name].querylr(l, r, **kw)

    async def any_author_exists(self):
        return bool(await self.query("SELECT * FROM authors LIMIT 1"))

    async def dropTable(self, si_table_name):
        await self.execute('''DROP TABLE IF EXISTS {table_name};'''.format(table_name = si_table_name))

    async def createTable(self, si_table_name, **kw):
        await self.db.execute('''CREATE TABLE {table_name} (\n{cols_info}\n );'''.format(table_name = si_table_name, cols_info = ',\n'.join(map(lambda tp : str(tp[0]) + ' ' + str(tp[1]), kw.items()))), None)

    def generate_table_object(self, si_table_name):
        rtn = globals()[si_table_name](self.db, si_table_name)
        return rtn

    def getTable(self, si_table_name):
        return self.tables[si_table_name]

    async def saveObject(self, si_table_name, object, cur_user = None):
        return await self.tables[si_table_name].saveObject(object, cur_user)

    async def all(self, si_table_name, cur_user = None):
        return await self.tables[si_table_name].all(cur_user)

    async def getObject(self, si_table_name, cur_user = None, **kw):
        return await self.tables[si_table_name].getObject(cur_user, **kw)

    async def getObjectOne(self, si_table_name, **kw):
        return await self.tables[si_table_name].getObjectOne(**kw)

    async def deleteObject(self, si_table_name, **kw):
        return await self.tables[si_table_name].deleteObject(**kw)

    async def createObject(self, si_table_name, **kw):
        return await self.tables[si_table_name].createObject(**kw)

    async def acquire_lock(self, si_table_name, hash_id):
        return await self.tables[si_table_name].acquire_lock(hash_id)

    async def release_lock(self, si_table_name, hash_id):
        return await self.tables[si_table_name].release_lock(hash_id)

    def get_lock_object(self, si_table_name, hash_id):
        return self.tables[si_table_name].get_lock_object(hash_id)

    async def insert_element_in_array(self, si_table_name, column_name, value, id):
        return await self.tables[si_table_name].insert_element_in_array(column_name, value, id)

    async def insert_element_in_array_unique(self, si_table_name, column_name, value, id):
        return await self.tables[si_table_name].insert_element_in_array_unique(column_name, value, id)

    async def remove_element_in_array(self, si_table_name, column_name, value, id):
        return await self.tables[si_table_name].remove_element_in_array(column_name, value, id)


condition = Condition()

class BaseTable:

    def __init__(self, db, si_table_name, lock_cnt = 17):
        self.db = db
        # self.table_name = self.__class__.__name__.lower()
        self.table_name = si_table_name
        self.database_keys = []
        self.lockN = lock_cnt
        self.lock = [Lock() for i in range(lock_cnt)]

        # self.locker = Condition()
        # loop = asyncio.get_event_loop()
        # loop.run_until_complete(self.async_init())
        # loop.close()

    async def async_init(self):
        database_keys = await self.db.query(
            'SELECT column_name FROM information_schema.columns WHERE table_schema = %s and table_name = %s', 'public',
            self.table_name)
        self.database_keys = list(map(lambda item: item['column_name'], database_keys))
        # print_debug(self.database_keys)

    #
    async def insert_element_in_array(self, column_name, value, id):
        stmt = '''UPDATE {table_name} SET {column_name} = array_append({column_name}, {value}) WHERE id = {id};'''.format(table_name = self.table_name, column_name = column_name, value = value, id = id)
        await self.db.execute(stmt)

    async def insert_element_in_array_unique(self, column_name, value, id):
        stmt = '''UPDATE {table_name} SET {column_name} = (CASE WHEN ARRAY[{value}] <@ {column_name} THEN {column_name} ELSE array_append({column_name}, {value}) END) WHERE id = {id};'''.format(
            table_name = self.table_name, column_name = column_name, value = value, id = id)
        await self.db.execute(stmt)

    async def remove_element_in_array(self, column_name, value, id):
        # stmt = '''UPDATE {table_name} SET {column_name} = arrary_remove({column_name}, %s) WHERE id = %s'''.format(table_name = self.table_name, column_name = column_name)
        stmt = '''UPDATE {table_name} SET {column_name} = array_remove({column_name}, {value}) WHERE id = {id};'''.format(table_name = self.table_name, column_name = column_name, value = value, id = id)
        await self.db.execute(stmt)

        # await self.db.execute(stmt, value, id)

    # to use this, u must
    # I do not want to write a comment
    async def acquire_lock(self, hash_id):
        await self.lock[hash_id % self.lockN].acquire()
        print_debug('before_ac lock')
        # await condition.wait()

    async def release_lock(self, hash_id):
        self.lock[hash_id % self.lockN].release()
        print_debug('release lock lock')
        # condition.notify()

    def get_lock_object(self, hash_id):
        return self.lock[hash_id % self.lockN]

    async def saveObject(self, object, cur_user = None):
        si_table_name = self.table_name
        if(cur_user):
            object = await self.objectFilter('write', object, cur_user)
        # print_debug('saveObject-before: ', object)
        object = self.filterKeys(object)
        # print_debug('saveObject: ', object)
        fmtList = []
        valueList = []
        for key,value in object.items():
            if key != 'id':
                fmtList.append(str(key) + ' = %s')
                valueList.append(value)
        sfmt = ' , '.join(fmtList)
        # print_debug('''UPDATE {table_name} SET {prop} WHERE id = {oid}'''.format(table_name = si_table_name, prop = sfmt, oid = object['id']), valueList)
        if(len(valueList)):
            await self.db.execute('''UPDATE {table_name} SET {prop} WHERE id = {oid}'''.format(table_name = si_table_name, prop = sfmt, oid = object['id']), *valueList)

    async def all(self, cur_user = None):
        si_table_name = self.table_name
        res = await self.db.query('''SELECT * FROM {table_name}'''.format(table_name = si_table_name))
        if(cur_user):
            rtn = []
            for item in res:
                rtn.append(await self.objectFilter('read', item, cur_user))
            return rtn
        else:
            return res

    async def getObjectOne(self, **kw):
        return (await self.getObject(**kw))[0]

    async def getObject(self, cur_user = None, **kw):
        si_table_name = self.table_name
        # print_debug('getobject: ', kw)
        kw = self.filterKeys(kw)
        # print_debug('getobject after filter: ', kw)
        plst = []
        valuelist = []
        for key, value in kw.items():
            plst.append(str(key) + ' = %s')
            valuelist.append(value)
        slst = ' AND '.join(plst)
        print_debug("slst = ", slst)
        res = await self.db.query('''SELECT * FROM {table_name} WHERE {conditions}'''.format(table_name = si_table_name, conditions = slst), *valuelist)
        return res
        # if(cur_user):
        #     rtn = []
        #     for item in res:
        #         rtn.append(await self.objectFilter('read', item, cur_user))
        #     return rtn
        # else:
        #     return res


    async def deleteObject(self, **kw):
        si_table_name = self.table_name
        plst = []
        valuelist = []
        for key, value in kw.items():
            plst.append(str(key) + ' = %s')
            valuelist.append(value)
        slst = ' AND '.join(plst)
        print_debug("slst = ", slst)
        return await self.db.execute('''DELETE FROM {table_name} WHERE {conditions}'''.format(table_name = si_table_name, conditions = slst), *valuelist)


    async def createObject(self, **kw):
        si_table_name = self.table_name
        # print_debug('createObject: kw = ', kw)
        kw = self.filterKeys(kw)
        propfmt = ['%s'] * len(kw)
        spropfmt = ','.join(propfmt)
        # propfmt = []
        propkeys = []
        propvalues = []
        for key, value in kw.items():
            propkeys.append(str(key))
            propvalues.append(value)

        str_fmt = '''INSERT INTO {table_name} ({property_keys})\n VALUES ({property_fmt}) RETURNING *;'''.format(table_name = si_table_name, property_keys = ','.join(propkeys), property_fmt = spropfmt)
        # print_debug('fmt = ', str_fmt, propvalues)
        return await self.db.queryone(str_fmt, *propvalues)

    async def objectFilter(self, method, dic, user):
        return dic
        # user = await self.get_current_user_object()
        # table_name = self.table_name
        # per_owner = 0
        # per_role = 0
        # try:
        #     if (table_name == 'users' and 'id' in dic.keys()):
        #         if (dic['id'] == user['id']):
        #             per_owner = 1
        #     per_role = user['role']
        # except:
        #     print_debug('object filter: user not loged in')
        # print_debug('permission: ', per_role, per_owner)
        # return self.jsonFilter(method, dic, per_role, per_owner)

    async def querylr(self, l , r, **kw):
        si_table_name = self.table_name
        plst = []
        valuelist = []
        kw = self.filterKeys(kw)
        for key, value in kw.items():
            plst.append(str(key) + ' = %s')
            valuelist.append(value)
        if (plst):
            slst = 'WHERE ' + ' AND '.join(plst)
        else:
            slst = ''
        print_debug("slst = ", slst)
        # slst = ''

        stmt = 'SELECT * FROM {table_name} {conditions} LIMIT {n} OFFSET {s}'.format(
            n = r - l + 1,
            s = l - 1,
            table_name = si_table_name,
            conditions = slst
        )

        print_debug('querylr: ', stmt, *valuelist)
        res = await self.db.query(stmt, *valuelist)
        for x in res:
            for key, value in x.items():
                # print_debug(key, isinstance(value, datetime.datetime))
                if (isinstance(value, datetime.datetime)):
                    x[key] = int(time.mktime(value.timetuple()))
        print_debug(res)


        rtn = {}
        rtn['count'] = (await self.db.query('SELECT COUNT(*) FROM {table_name} {conditions}'.format(
            table_name=si_table_name,
            conditions=slst
        ), *valuelist))[0]['count']
        rtn['list'] = res

        return rtn
    def jsonFilter(self, method, dic, per_role, per_owner):
        # table_name = self.table_name
        # rtn = {}
        # # permissionList = permissions[table_name][method]
        # permissionList = self.permissions[method]
        # print_debug('jsonFilter: ', dic)
        # for key, value in dic.items():
        #     if(key in permissionList.keys()):
        #         permission = permissionList[key]
        #         # print_debug(permission)
        #         if(permission[0] <= per_role and permission[1] <= per_owner):
        #             rtn[key] = value
        # return rtn
        return dic

    def filterKeys(self, kw):
        si_table_name = self.table_name
        # print_debug('filterKeys: ', kw)
        rtn = {}
        keyslist = self.database_keys
        for key, value in kw.items():
            if (key in keyslist):
                rtn[key] = value
        return rtn
        # return kw

class Users(BaseTable):
    pass

class Courses(BaseTable):
    pass

class Homeworks(BaseTable):
    pass

class Problems(BaseTable):
    async def query_contain(self, column_name, keyword):
        return await self.db.query('''SELECT * FROM {table_name} WHERE {column_name} LIKE \'%%{keyword}%%\''''.format(
            table_name = self.table_name, column_name = column_name, keyword = keyword
        ))

    async def search_by_title(self, keyword_list):
        id_set = set()
        rtn = []
        for keyword in keyword_list:
            res_list = await self.query_contain('title', keyword)
            for res in res_list:
                if(res['id'] not in id_set):
                    rtn.append(res)
                    id_set.add(res['id'])
        return rtn

class Records(BaseTable):
    pass

class Notices(BaseTable):
    pass

class Judgestates(BaseTable):
    pass

class Ratios(BaseTable):
    pass

class Global(BaseTable):
    pass