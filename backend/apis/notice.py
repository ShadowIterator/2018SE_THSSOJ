
import json
import hashlib
import smtplib
import random
from email.mime.text import MIMEText
from email.header import Header
from . import base
from .base import *

# TODO: to return code in every request


class APINoticeHandler(base.BaseHandler):

    @tornado.web.authenticated
    async def _query_post(self):
        print('query = ', self.args)
        res = await self.db.getObject('notices', cur_user=self.get_current_user_object(), **self.args)
        return res
        # self.write(json.dumps(res).encode())

    # @tornado.web.authenticated
    async def _update_post(self):
        print('update')
        rtn = {
            'code': 1
        }
        await self.db.saveObject('notices', cur_user=self.get_current_user_object(), object=self.args)
        rtn['code'] = 0
        return rtn
        # try:
        #     await self.db.saveObject('notices', secure = 1, object = self.args)
        #     rtn['code'] = 0
        # except:
        #     print('update failed')
        # print('update: ', rtn)
        # self.write(json.dumps(rtn).encode())

    # @tornado.web.authenticated
    async def _delete_post(self):
        # for condition in self.args:
        res_dict = {}
        await self.db.deleteObject('notices', **self.args)
        self.set_res_dict(res_dict, code=0, msg='notice deleted')
        return res_dict

    async def _list_post(self):
        return await self.querylr('notices', self.args['start'], self.args['end'])

    # @tornado.web.authenticated
    async def _create_post(self):
        res_dict = {}
        course_id = self.args['course_id']
        await self.db.createObject('notices', **self.args)
        course = await self.db.getObject('courses',cur_user=self.get_current_user_object(), id = course_id)
        notice = (await self.db.getObject('notices',cur_user=self.get_current_user_object(), **self.args))[0]
        course['notices'].append(notice.id)
        course['notices'] = list(set(course['notices']))
        self.set_res_dict(res_dict, code=0, msg='notice created')
        return res_dict
        # self.write(json.dumps({'code': 0}).encode())

    # async def get(self, type): #detail
    #     # self.getargs()
    #     print('get: ', type)
    #     await self._call_method('''_{action_name}_get'''.format(action_name = type))
    #
    # async def post(self, type):
    #     print('post: ', type)
    #     await self._call_method('''_{action_name}_post'''.format(action_name = type))
