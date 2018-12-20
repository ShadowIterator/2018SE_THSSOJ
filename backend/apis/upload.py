import base64
import os
import time
import datetime
import requests
import uuid
from . import base
from .base import *

class APIUploadHandler(base.BaseHandler):
    def __init__(self, *args, **kw):
        super(BaseHandler, self).__init__(*args, **kw)
        self.db = self.application.db_instance
        # self.getargs()
        self.set_header("Access-Control-Allow-Origin", "http://localhost:3000")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with, Content-type, X-Requested-With")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.set_header("Access-Control-Allow-Credentials", 'true')

        self.root_dir='root/'
        self.dir =  'tmp/'
        self.user = None
        # print_debug(self.request.body)

    async def _files_post(self):
        print_debug('in file post')
        filename = str(uuid.uuid1())
        suffix = self.request.files['file'][0]['filename'].split('.')[-1]
        data = self.request.files['file'][0]['body']
        # with open('''{dir}/{filename}.{suffix}'''.format(dir = self.dir, filename = filename, suffix = suffix), 'wb') as fd:
        path = '''{dir}{filename}.{suffix}'''.format(dir=self.dir, filename=filename, suffix=suffix)
        print_debug('path: ', path)
        # print_debug('data: ', data)
        print_debug("self.root_dir + path ", self.root_dir + path)
        with open(self.root_dir + path, 'wb') as fd:
            fd.write(data)
        return {'code': 0, 'uri': path}

