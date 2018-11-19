import json
import hashlib
import smtplib
import random
from email.mime.text import MIMEText
from email.header import Header
from . import base
from .base import *

# TODO: to return code in every request


class APIUserHandler(base.BaseHandler):

    @tornado.web.authenticated
    async def _query_post(self):
        print('query = ', self.args)
        res = await self.getObject('users', secure = 1, **self.args)
        self.write(json.dumps(res).encode())


    async def _delete_post(self):
        # for condition in self.args:
        await self.deleteObject('users', **self.args)

    async def _update_post(self):
        print('update')
        rtn = {
            'code': 1
        }
        try:
            await self.saveObject('users', secure = 1, object = self.args)
            rtn['code'] = 0
        except:
            print('update failed')
        print('update: ', rtn)
        self.write(json.dumps(rtn).encode())


    async def _create_post(self):
        await self.createObject('users', **self.args)
        self.write(json.dumps({'code': 0}).encode())

    async def _login_post(self):
        res_dict = {}
        username = self.args['username']
        password = self.args['password']
        try:
            users_list = await self.getObject('users', **{'username': username, 'password': password})
        except:
            res_dict['code'] = 1
            res_dict['msg'] = 'no such user'
            self.write(tornado.escape.json_encode(res_dict))
            return 
        if len(users_list) == 1:
            userObj = users_list[0]
            print(userObj)
            self.set_secure_cookie('user_id', str(userObj.id))
            res_dict['code'] = 0
            res_dict['role'] = userObj.role
            res_dict['id'] = userObj.id

        else:
            res_dict['code'] = 1
            res_dict['msg'] = 'login error'
        self.write(tornado.escape.json_encode(res_dict))

    @tornado.web.authenticated
    async def _logout_post(self):
        res_dict = {}
        try:
            self.clear_cookie('user_id')
            res_dict['code'] = 0
        except:
            res_dict['code'] = 1

        self.write(tornado.escape.json_encode(res_dict))

    async def _validate_post(self):
        id = self.args['id']
        res_dict={}
        try:
            user_qualified = await self.getObject('users', id=id)[0]
            email = user_qualified['email']
            sender = '1747310410@qq.com'
            receivers = [email,]
            activate_code = random.randint(0,99999)
            message = MIMEText(str(activate_code), 'plain', 'utf-8')
            message['From'] = Header("thssoj", 'utf-8')
            message['To'] = Header(username, 'utf-8')
            message['Subject'] = Header('用户激活', 'utf-8')
            try:
                smtpObj = smtplib.SMTP('smtp.qq.com')
                smtpObj.login(sender, 'vwwiwzsdkzvbbcdb')
                smtpObj.sendmail(sender, receivers, message.as_string())
                print("邮件发送成功")
                user_qualified['validate_code']=activate_code
                await self.saveObject('users', user_qualified)
                res_dict['code']=0
            except:res_dict['code']=1
        except:
            res_dict['code']=1
        self.write(tornado.escape.json_encode(res_dict))

    async def _activate_post(self):
        res_dict = {}
        try:
            id = self.args['id']
            validate_code = self.args['validate_code']
            user_qualified = await self.getObject('users', id=id)[0]
            if user_qualified['validate_code'] == validate_code:
                user_qualified.status = 1
                await self.saveObject('users', user_qualified)
                res_dict['code'] = 0
            else:
                res_dict['code'] = 1
        except:
            res_dict['code'] = 1
        self.write(tornado.escape.json_encode(res_dict))

    async def _update_post(self):
        res_dict = {}
        try:
            username = self.args['username']
            password = self.args['password']
            user_qualified = await self.getObject('users', {'username':username, 'password':password})[0]
            for key in self.args.keys():
                if key!=username and key != password:
                    if key in user_qualified:
                        user_qualified[key]=self.args[key]
            await self.saveObject('users', user_qualified)
            res_dict['code']=0
        except:
            res_dict['code']=1
        self.write(tornado.escape.json_encode(res_dict))

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
        # md = hashlib.md5()
        # md.update(password.encode('utf8'))
        # encrypted = md.hexdigest()
        users_qualified = self.getObject('users', {'username':username, 'encodepass':password})
        if len(users_qualified)==1:
            self.set_secure_cookie('username', username)
        else:
            #raise error
            pass

class UserLogoutHandler(base.BaseHandler):
    @tornado.web.authenticated
    def post(self):
        self.clear_cookie('username')
