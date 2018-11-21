
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
        res = await self.getObject('notices', secure = 1, **self.args)
        self.write(json.dumps(res).encode())

    async def _update_post(self):
        print('update')
        rtn = {
            'code': 1
        }
        try:
            await self.saveObject('notices', secure = 1, object = self.args)
            rtn['code'] = 0
        except:
            print('update failed')
        print('update: ', rtn)
        self.write(json.dumps(rtn).encode())

    async def _delete_post(self):
        # for condition in self.args:
        await self.deleteObject('notices', **self.args)

    async def _create_post(self):
        course_id = self.args['course_id']
        await self.createObject('notices', **self.args)
        course = await self.getObject('courses', id = course_id)
        notice = (await self.getObject('notices', **self.args))[0]
        course['notices'].append(notice.id)
        course['notices'] = list(set(course['notices']))
        self.write(json.dumps({'code': 0}).encode())

    async def get(self, type): #detail
        # self.getargs()
        print('get: ', type)
        await self._call_method('''_{action_name}_get'''.format(action_name = type))

    async def post(self, type):
        print('post: ', type)
        await self._call_method('''_{action_name}_post'''.format(action_name = type))
