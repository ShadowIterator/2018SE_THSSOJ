import json
import hashlib
import smtplib
import random
import datetime
import time
from email.mime.text import MIMEText
from email.header import Header
from . import base
from .base import *

# TODO: to return code in every request

class APIUserHandler(base.BaseHandler):
    def getargs(self):
        self.args = json.loads(self.request.body.decode() or '{}')
        if 'create_time' in self.args.keys():
            self.args['create_time'] = datetime.datetime.fromtimestamp(self.args['create_time'])
        if 'validate_time' in self.args.keys():
            self.args['validate_time'] = datetime.datetime.fromtimestamp(self.args['validate_time'])


    # @tornado.web.authenticated
    async def _query_post(self):
        print('query = ', self.args)
        res = await self.db.getObject('users', cur_user = self.get_current_user_object(), **self.args)
        print('query res = ', res)
        for user in res:
            if 'create_time' in user.keys() and user['create_time'] is not None:
                user['create_time'] = int(time.mktime(user['create_time'].timetuple()))
            if 'validate_time' in user.keys() and user['validate_time'] is not None:
                user['validate_time'] = int(time.mktime(user['validate_time'].timetuple()))
        # self.write(json.dumps(res).encode())
        return res

    @tornado.web.authenticated
    @check_password
    async def _delete_post(self):
        # for condition in self.args:
        await self.deleteObject('users', **self.args)
        return {'code': 0}

    @tornado.web.authenticated
    @check_password
    async def _update_post(self):
        print('si_update: ', self.args)
        await self.db.saveObject('users', cur_user = self.get_current_user_object(), object = self.args)
        # rtn['code'] = 0
        return {'code': 0}
        # rtn = {
        #     'code': 1
        # }
        # try:
        #     print('update: ', self.args)
        #     await self.saveObject('users', secure = 1, object = self.args)
        #     rtn['code'] = 0
        # except:
        #     print('update failed')
        # print('update: ', rtn)
        # # self.write(json.dumps(rtn).encode())
        # return rtn

    # @tornado.web.authenticated
    async def _create_post(self):
        current_time = datetime.datetime.now()
        # cur_timestamp = int(time.mktime(current_time.timetuple()))
        await self.db.createObject('users',
                                username=self.args['username'],
                                password=self.args['password'],
                                email=self.args['email'],
                                create_time=current_time)
        # await self.createObject('users', **self.args)
        # self.write(json.dumps({'code': 0}).encode())
        return {'code': 0}

    async def _login_post(self):
        res_dict = {}
        username = self.args['username']
        password = self.args['password']
        # try:
        users_list = await self.db.getObject('users', **{'username': username, 'password': password})
        print('login, userlist = ', users_list)

        res_dict['code'] = 1

        if len(users_list) == 1:
            userObj = users_list[0]
            print(userObj)
            self.set_secure_cookie('user_id', str(userObj.id), expires_days = None)
            self.set_cookie('id', str(userObj.id), expires_days = None)
            res_dict['code'] = 0
            res_dict['role'] = userObj.role
            res_dict['id'] = userObj.id

        else:
            res_dict['code'] = 1

        # self.write(tornado.escape.json_encode(res_dict))
        return res_dict


    @tornado.web.authenticated
    async def _logout_post(self):
        res_dict = {}
        try:
            self.clear_cookie('user_id')
            res_dict['code'] = 0
        except:
            res_dict['code'] = 1
        return res_dict
        # self.write(tornado.escape.json_encode(res_dict))

    @tornado.web.authenticated
    async def _validate_post(self):
        id = self.args['id']
        res_dict={}
        try:
            user_qualified = (await self.getObject('users', id=id))[0]
            email = user_qualified['email']
            username = user_qualified['username']
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
                print("邮件发送成功", activate_code)
                user_qualified['validate_code']=activate_code
                await self.db.saveObject('users', user_qualified)
                res_dict['code']=0
            except:
                res_dict['code']=1
        except:
            res_dict['code']=1
        # self.write(tornado.escape.json_encode(res_dict))
        return res_dict

    @tornado.web.authenticated
    async def _activate_post(self):
        res_dict = {}
        try:
            id = self.args['id']
            validate_code = self.args['validate_code']
            user_qualified = (await self.getObject('users', id=id))[0]
            if user_qualified['validate_code'] == validate_code:
                user_qualified.status = 1
                await self.db.saveObject('users', user_qualified)
                res_dict['code'] = 0
            else:
                res_dict['code'] = 1
                return res_dict
        except:
            res_dict['code'] = 1
        return res_dict

    # @catch_exception_write
    # async def get(self, type): #detail
    #     # self.getargs()
    #     print('get: ', type)
    #     res = await self._call_method('''_{action_name}_get'''.format(action_name = type))
    #     self.write(json.dumps(res).encode())
    #
    # @catch_exception_write
    # async def post(self, type):
    #     print('post: ', type)
    #     res = await self._call_method('''_{action_name}_post'''.format(action_name = type))
    #     print('return: ', res)
    #     self.write(json.dumps(res).encode())

        #
        # if(type == 'create'):
        #     print('post create')
        # elif(type == 'delete'):
        #     print('post delete')
        # elif(type == 'modify'):
        #     print('post modify')

# class UserLoginHandler(base.BaseHandler):
#     async def post(self):
#         username = self.args['username']
#         password = self.args['password']
#         # md = hashlib.md5()
#         # md.update(password.encode('utf8'))
#         # encrypted = md.hexdigest()
#         users_qualified = self.getObject('users', {'username':username, 'encodepass':password})
#         if len(users_qualified)==1:
#             self.set_secure_cookie('username', username)
#         else:
#             #raise error
#             pass
#
# class UserLogoutHandler(base.BaseHandler):
#     @tornado.web.authenticated
#     def post(self):
#         self.clear_cookie('username')
