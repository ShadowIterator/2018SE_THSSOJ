
import json
import hashlib
import smtplib
import random
import datetime
from email.mime.text import MIMEText
from email.header import Header
from . import base
from .base import *

# TODO: to return code in every request


class APIRecordHandler(base.BaseHandler):
    def getargs(self):
        self.args = json.loads(self.request.body.decode() or '{}')
        if 'submit_time' in self.args.keys():
            self.args['submit_time'] = datetime.datetime.fromtimestamp(self.args['submit_time'])

    @tornado.web.authenticated
    async def _query_post(self):
        print('query = ', self.args)
        res = await self.getObject('records', secure = 1, **self.args)
        for js in res:
            timepoint = int(js['submit_time'].timestamp())
            js['submit_time'] = timepoint
        self.write(json.dumps(res).encode())

    async def _srcCode_post(self):
        raise Exception('implement srcCode')

    async def _delete_post(self):
        # for condition in self.args:
        await self.deleteObject('records', **self.args)

    async def _create_post(self):
        await self.createObject('records', **self.args)
        self.write(json.dumps({'code': 0}).encode())

    async def get(self, type): #detail
        # self.getargs()
        print('get: ', type)
        await self._call_method('''_{action_name}_get'''.format(action_name = type))

    async def post(self, type):
        print('post: ', type)
        await self._call_method('''_{action_name}_post'''.format(action_name = type))
