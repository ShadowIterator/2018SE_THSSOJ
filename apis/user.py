import json
import hashlib
from . import base
from .base import *



class APIUserHandler(base.BaseHandler):

    async def _query_get(self):
        # res = await self.getObject('users', name = 'zjl')
        rtn = []
        for query in self.args:
            print('query = ', query)
            res = await self.getObject('users', **query)
            rtn.append(res)
        self.write(json.dumps(rtn).encode())


    async def _delete_post(self):
        for condition in self.args:
            await self.deleteObject('users', **condition)

    async def _update_post(self):
        pass

    async def _create_post(self):
        # pass
        # await self.createObject('users', username = 'wzsxzjl', encodepass = 'tqlzjl', name = 'zjl', studentid = '124567')
        for row in self.args:
            await self.createObject('users', **row)

    async def get(self, type): #detail
        # self.getargs()
        print('get: ', type)
        await self._call_method('''_{action_name}_get'''.format(action_name = type))
        #
        # print(self.args)
        # if(type == 'query'):
        #     print('get query')
        #     # s_ids = '(' + ','.join(map(str, self.args['idList'])) + ')'
        #     # res = await self.query('SELECT * FROM users;')
        #     # await self.saveObject('users', res[0])
        #     res = await self.getObject('users', name = 'zjl')
        #     self.write(json.dumps(res).encode())
        # elif(type == 'create'):
        #     await self.execute(
        #         "INSERT INTO users (username,encodepass,name,studentid)"
        #         "VALUES (%s,%s,%s,%s)",
        #         'hongfz16', 'hfztql', 'hfz', '12345678')
        #     await self.createObject('users', username = 'wzsxzjl', encodepass = 'tqlzjl', name = 'zjl', studentid = '124567')
        # elif(type == 'delete'):
        #     print('get delete')
        #     # await self.execute("DROP TABLE users")
        #     await self.dropTable('siusers')
        # elif(type == 'newtable'):
        #     print('newtable')
        #     # await self.execute("CREATE TABLE users ( id SERIAL PRIMARY KEY, username VARCHAR(186) UNIQUE, encodepass VARCHAR(180), name VARCHAR(181), studentid VARCHAR(181));", None)
        #     await self.createTable('siusers',
        #                            id = 'SERIAL PRIMARY KEY',
        #                            username = 'VARCHAR(1244) UNIQUE',
        #                            encodepass = 'VARCHAR(180)',
        #                            name = 'VARCHAR(181)',
        #                            studentid = 'VARCHAR(181)')
        # elif(type == 'modify'):
        #     print('get modify')



    async def post(self, type):
        print('post: ', type)
        await self._call_method('''_{action_name}_post'''.format(action_name = type))
        #
        # if(type == 'create'):
        #     print('post create')
        # elif(type == 'delete'):
        #     print('post delete')
        # elif(type == 'modify'):
        #     print('post modify')

class UserLoginHandler(base.BaseHandler):
    async def post(self):
        username = self.args['username']
        password = self.args['password']
        md = hashlib.md5()
        md.update(password.encode('utf8'))
        encrypted = md.hexdigest()
        users_qualified = self.getObject('users', {'username':username, 'encodepass':encrypted})
        if len(users_qualified)==1:
            self.set_secure_cookie('username', username)
        else:
            #raise error
            pass

class UserLogoutHandler(base.BaseHandler):
    @tornado.web.authenticated
    def post(self):
        self.clear_cookie('username')