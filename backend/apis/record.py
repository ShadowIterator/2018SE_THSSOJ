import json
import hashlib
import smtplib
import random
from email.mime.text import MIMEText
from email.header import Header
from . import base
from .base import *

# TODO: to return code in every request


class APIRecordHandler(base.BaseHandler):

    @tornado.web.authenticated
    async def _query_post(self):
        print('query = ', self.args)
        res = await self.getObject('records', secure = 1, **self.args)
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
