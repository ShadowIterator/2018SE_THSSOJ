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
        self.user = None

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
        logged_user = await self.get_current_user_object()
        matched_problem = (await self.db.getObject('problems', cur_user=logged_user, id=problem_id))[0]

        if logged_user['role'] != 3 and logged_user['id'] != matched_problem['user_id']:
            raise tornado.web.HTTPError(403)
        if matched_problem['judge_method']==0:
            src_path = self.root_dir+'problems/'+str(problem_id)+'/case/'+str(problem_id)+'.zip'
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
        print('download-code: problem-id = ', problem_id)
        logged_user = await self.get_current_user_object()
        matched_problem = (await self.db.getObject('problems', cur_user=logged_user, id=problem_id))[0]
        if logged_user['role'] != 3 and logged_user['id'] != matched_problem['user_id']:
            raise tornado.web.HTTPError(403)
        src_path = self.root_dir+'problems/'+str(problem_id)+'/code/'+str(problem_id)+'.code'
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
        logged_user = await self.get_current_user_object()
        matched_problem = (await self.db.getObject('problems', cur_user=logged_user, id=problem_id))[0]

        if logged_user['role'] != 3 and logged_user['id'] != matched_problem['user_id']:
            raise tornado.web.HTTPError(403)
        src_path=''
        if matched_problem['judge_method'] == 1:
            src_path = self.root_dir + 'problems/' + str(problem_id) + '/script/' + str(problem_id) + '.zip'
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

    async def _html_get(self):
        record = await self.db.getObjectOne('records', id=self.args['record_id'])
        if record['record_type'] != 4:
            # self.set_res_dict(res_dict, code=1, msg='wrong record type')
            # return res_dict
            raise tornado.web.HTTPError(403)
        # authority check
        cur_user = await self.get_current_user_object()
        if cur_user['role'] < 2 and record['user_id'] != cur_user['id']:
            # self.set_res_dict(res_dict, code=1, msg='you are not authorized')
            # return res_dict
            raise tornado.web.HTTPError(403)
        elif cur_user['role'] == 2:
            homework = await self.db.getObjectOne('homeworks', id=record['homework_id'])
            if homework['course_id'] not in cur_user['ta_courses']:
                # self.set_res_dict(res_dict, code=1, msg='you are not authorized')
                # return res_dict
                raise tornado.web.HTTPError(403)
        # -----------------------------------------------------------------
        str_record_id=str(record['id'])
        src_path = self.root_dir+'records/'+str_record_id+'/'+str_record_id+'.zip'
        if os.path.exists(self.root_dir+'serverfiles'):
            os.makedirs(self.root_dir+'serverfiles')
            target_path = self.root_dir+'serverfiles/'+str_record_id+'.zip'
        shutil.copyfile(src_path, target_path)
        self.set_header('Content-Type', 'application/octet-stream')
        self.set_header('Content-Disposition', 'attachment; filename=%s' % target_path)
        transfer_file = open(target_path, 'rb')
        data = transfer_file.read()
        transfer_file.close()
        os.remove(target_path)
        self.write(data)


