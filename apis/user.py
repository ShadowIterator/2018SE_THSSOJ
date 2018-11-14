import json
from . import base


class APIUserHandler(base.BaseHandler):

    async def get(self, type): #detail
        # self.getargs()
        print(self.args)
        if(type == 'query'):
            print('get query')
            # s_ids = '(' + ','.join(map(str, self.args['idList'])) + ')'
            # res = await self.query('SELECT * FROM users;')
            # await self.saveObject('users', res[0])
            res = await self.getObject('users', name = 'zjl')
            self.write(json.dumps(res).encode())
        elif(type == 'create'):
            await self.execute(
                "INSERT INTO users (username,encodepass,name,studentid)"
                "VALUES (%s,%s,%s,%s)",
                'hongfz16', 'hfztql', 'hfz', '12345678')
            await self.createObject('users', username = 'wzsxzjl', encodepass = 'tqlzjl', name = 'zjl', studentid = '124567')
        elif(type == 'delete'):
            print('get delete')
            # await self.execute("DROP TABLE users")
            await self.dropTable('siusers')
        elif(type == 'newtable'):
            print('newtable')
            # await self.execute("CREATE TABLE users ( id SERIAL PRIMARY KEY, username VARCHAR(186) UNIQUE, encodepass VARCHAR(180), name VARCHAR(181), studentid VARCHAR(181));", None)
            await self.createTable('siusers',
                                   id = 'SERIAL PRIMARY KEY',
                                   username = 'VARCHAR(1244) UNIQUE',
                                   encodepass = 'VARCHAR(180)',
                                   name = 'VARCHAR(181)',
                                   studentid = 'VARCHAR(181)')
        elif(type == 'modify'):
            print('get modify')



    def post(self, type):

        if(type == 'create'):
            print('post create')
        elif(type == 'delete'):
            print('post delete')
        elif(type == 'modify'):
            print('post modify')


