import json
import hashlib
import smtplib
from email.mime.text import MIMEText
from email.header import Header
from . import base
from .base import *


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

class UserLoginHandler(base.BaseHandler):
    async def post(self):
        username = self.args['username']
        password = self.args['password']
        md = hashlib.md5()
        md.update(password.encode('utf8'))
        encrypted = md.hexdigest()
        users_qualified = self.getObject('users', username = username, encodepass = encrypted)
        if len(users_qualified)==1:
            self.set_secure_cookie('username', username)
        else:
            #raise error
            pass

class UserLogoutHandler(base.BaseHandler):
    @tornado.web.authenticated
    def post(self):
        self.clear_cookie('username')

class UserValidateHandler(base.BaseHandler):
    def post(self):
        username = self.args['username']
        email = self.args['email']
        users_qualified = self.getObject('users', username=username)
        if len(users_qualified) == 1:
            target_user = users_qualified[0]
            target_user['email'] = email
            self.saveObject('users', target_user)
        else:
            # raise error
            pass
        receiver = [email,]
        msg_content = '<p><a href="'+\
                      self.request.url.replace('validate', 'activate')+\
                      '/?username='+username +\
                      '">激活链接</p>'
        message = MIMEText(msg_content,'html', 'utf8')
        message['From'] = Header("THSSOJ", 'utf-8')
        message['To'] = Header("待激活用户", 'utf-8')
        message['Subject'] = Header('用户身份激活', 'utf-8')

        sender = '1747310410@qq.com'
        smtpObj = smtplib.SMTP('smtp.qq.com')
        smtpObj.login(sender, 'vwwiwzsdkzvbbcdb')
        smtpObj.sendmail(sender, receiver, message.as_string())
        print("邮件发送成功")

class UserActivateHandler(base.BaseHandler):
    def get(self):
        username = self.args['username']
        users_qualified = self.getObject('users', username = username)
        if len(users_qualified) == 1:
            target_user = users_qualified[0]
            target_user['status']='activated'
            self.saveObject('users', target_user)
        else:
            # raise error
            pass