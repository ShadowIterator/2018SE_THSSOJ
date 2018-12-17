
import json
import hashlib
import smtplib
import random
import time
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
        cur_user = await self.get_current_user_object()
        ret_list = []
        for notice in res:
            if 'create_time' in notice.keys() and notice['create_time'] is not None:
                notice['create_time'] = int(time.mktime(notice['create_time'].timetuple()))

            # authority check
            if cur_user['role'] < 3:
                course = (await self.db.getObject('notices', id=notice['course_id']))[0]
                if course['id'] not in cur_user['student_courses'] and course['id'] not in cur_user['ta_courses']:
                    pass
                else:
                    ret_list.append(notice)
            else:
                ret_list.append(notice)
            # ---------------------------------------------------------------------
        return res
        # self.write(json.dumps(res).encode())

    # @tornado.web.authenticated
    async def _update_post(self):
        print('update')
        res_dict = {}
        # authority check
        cur_user = await self.get_current_user_object()
        if cur_user['role'] < 3:
            self.set_res_dict(res_dict, code=1, msg='not authorized')
            return res_dict
        # ---------------------------------------------------------------------
        await self.db.saveObject('notices', cur_user=self.get_current_user_object(), object=self.args)
        res_dict['code'] = 0
        return res_dict
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
        # authority check
        role = (await self.get_current_user_object())['role']
        if role < 3:
            self.set_res_dict(res_dict, code=1, msg='you are not allowed')
            return res_dict

        await self.db.deleteObject('notices', **self.args)
        self.set_res_dict(res_dict, code=0, msg='notice deleted')
        return res_dict

    async def _list_post(self):
        return await self.db.querylr('notices', self.args['start'], self.args['end'], **self.args)

    # @tornado.web.authenticated
    async def _create_post(self):
        res_dict = {}
        course_id = self.args['course_id']
        course = (await self.db.getObject('courses', cur_user=self.get_current_user_object(), id=course_id))[0]
        # authority check
        cur_user = await self.get_current_user_object()
        if cur_user['role'] < 2 or (cur_user['role'] == 2 and cur_user['id'] not in course['tas']):
            self.set_res_dict(res_dict, code=1, msg='you are not allowed')
            return res_dict

        await self.db.createObject('notices', **self.args)
        notice = (await self.db.getObject('notices',cur_user=self.get_current_user_object(), **self.args))[0]
        print('notice_create: ', notice)
        course['notices'].append(notice['id'])
        course['notices'] = list(set(course['notices']))
        self.set_res_dict(res_dict, code=0, msg='notice created')
        await self.db.saveObject('courses', course)
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
