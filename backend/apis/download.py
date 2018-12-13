import base64
import os
import time
import datetime
import requests
import uuid
from . import base
from .base import *


class APIDownloadHandler(base.BaseHandler):
    def __init__(self, *args, **kw):
        super(BaseHandler, self).__init__(*args, **kw)
        self.db = self.application.db_instance
        # self.getargs()
        self.set_header("Access-Control-Allow-Origin", "http://localhost:3000")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with, Content-type, X-Requested-With")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.set_header("Access-Control-Allow-Credentials", 'true')

        self.root_dir='root/'
        # self.dir =  'tmp/'
        # self.user = None
        # print(self.request.body)

    async def get(self, type): #detail
        print('get: ', type)
        await self._call_method('''_{action_name}_get'''.format(action_name = type))

    async def _example_get(self):
        problem_id  = self.get_argument('id', None)
        print('example download id=: ', problem_id)
        if(not problem_id):
            raise tornado.web.HTTPError(403)


        filename = 'servefiles/test.txt'
        self.set_header('Content-Type', 'application/octet-stream')
        self.set_header('Content-Disposition', 'attachment; filename=%s' % filename)
        with open(self.root_dir + filename, 'rb') as fd:
            data = fd.read()
            self.write(data)
