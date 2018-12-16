import base64
import os
import time
import datetime
import requests
import uuid
import shutil
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

    async def _data_get(self):
        problem_id = self.get_argument('id', None)
        logged_user = self.get_current_user_object()
        matched_problem = (await self.db.getObject('problems', cur_user=logged_user, id=problem_id))[0]

        if logged_user['role'] != 3 and logged_user['id'] != matched_problem['user_id']:
            raise tornado.web.HTTPError(403)
        if matched_problem['judge_method']==0:
            src_path = self.root_dir+'problem/'+str(problem_id)+'/case/'+str(problem_id)+'.zip'
        else:
            raise tornado.web.HTTPError(403)

        if os.path.exists(self.root_dir+'serverfiles'):
            os.makedirs(self.root_dir+'serverfiles')
        target_path = self.root_dir+'servefiles/'+str(problem_id)+'.zip'
        shutil.copyfile(src_path, target_path)
        self.set_header('Content-Type', 'application/octet-stream')
        self.set_header('Content-Disposition', 'attachment; filename=%s' % target_path)
        transfer_file = open(target_path, 'rb')
        data = transfer_file.read()
        transfer_file.close()
        os.remove(target_path)
        self.write(data)

    async def _code_get(self):
        problem_id = self.get_argument('id', None)
        logged_user = self.get_current_user_object()
        matched_problem = (await self.db.getObject('problems', cur_user=logged_user, id=problem_id))[0]
        if logged_user['role'] != 3 and logged_user['id'] != matched_problem['user_id']:
            raise tornado.web.HTTPError(403)
        src_path = self.root_dir+'problem/'+str(problem_id)+'/code/'+str(problem_id)+'.code'
        if os.path.exists(self.root_dir+'serverfiles'):
            os.makedirs(self.root_dir+'serverfiles')
        target_path = self.root_dir+'servefiles/'+str(problem_id)+'.code'
        shutil.copyfile(src_path, target_path)
        self.set_header('Content-Type', 'application/octet-stream')
        self.set_header('Content-Disposition', 'attachment; filename=%s' % target_path)
        transfer_file = open(target_path, 'rb')
        data = transfer_file.read()
        transfer_file.close()
        os.remove(target_path)
        self.write(data)

    async def _script_get(self):
        problem_id = self.get_argument('id', None)
        logged_user = self.get_current_user_object()
        matched_problem = (await self.db.getObject('problems', cur_user=logged_user, id=problem_id))[0]

        if logged_user['role'] != 3 and logged_user['id'] != matched_problem['user_id']:
            raise tornado.web.HTTPError(403)
        src_path=''
        if matched_problem['judge_method'] == 1:
            src_path = self.root_dir + 'problem/' + str(problem_id) + '/script/' + str(problem_id) + '.zip'
        else:
            raise tornado.web.HTTPError(403)

        if os.path.exists(self.root_dir + 'serverfiles'):
            os.makedirs(self.root_dir + 'serverfiles')
        target_path = self.root_dir + 'servefiles/' + str(problem_id) + '.zip'
        shutil.copyfile(src_path, target_path)
        self.set_header('Content-Type', 'application/octet-stream')
        self.set_header('Content-Disposition', 'attachment; filename=%s' % target_path)
        transfer_file = open(target_path, 'rb')
        data = transfer_file.read()
        transfer_file.close()
        os.remove(target_path)
        self.write(data)
