import base64
import os
import time
import datetime
import requests
import uuid
import shutil
import csv
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
        # print_debug(self.request.body)

    async def get(self, type): #detail
        print_debug('get: ', type)
        await self._call_method('''_{action_name}_get'''.format(action_name = type))

    async def _example_get(self):
        problem_id  = self.get_argument('id', None)
        print_debug('example download id=: ', problem_id)
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
        print_debug('download-code: problem-id = ', problem_id)
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
        record_id=self.get_argument('record_id', None)
        record = await self.db.getObjectOne('records', id=record_id)

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

    async def _score_get(self):
        csv_list=[]
        homework_id = self.get_argument('homework_id', None)
        problem_id = self.get_argument('problem_id', None)

        homework = await self.db.getObjectOne('homeworks', id=homework_id)
        problem = await self.db.getObjectOne('problems', id=problem_id)
        # authority check
        cur_user = await self.get_current_user_object()
        if cur_user['role'] < 2 :
            raise tornado.web.HTTPError(403)
        elif cur_user['role'] == 2:
            if homework['course_id'] not in cur_user['ta_courses']:
                raise tornado.web.HTTPError(403)
        # -----------------------------------------------------------------

        course = await self.db.getObjectOne('courses', id=homework['course_id'])
        if problem['judge_method'] == 0 or problem['judge_method'] == 1:
            record_type = 2
        elif problem['judge_method'] == 2:
            record_type = 4

        title_list = ['用户名',
                      '姓名',
                      '学号',
                      '是否提交',
                      '提交时间',
                      '是否迟交(0否，1是)',
                      '迟交时间(单位:s)',
                      '成绩']
        csv_list.append(title_list)

        for stu_id in course['students']:
            student = await self.db.getObjectOne('users', id=stu_id)
            single_record_info = []
            possible_records = await self.db.getObject('records',
                                                       record_type=record_type,
                                                       user_id=stu_id,
                                                       homework_id=homework_id,
                                                       problem_id=problem_id)
            if len(possible_records) == 0:
                self.make_record_info(single_record_info, student, homework)
            else:
                record = possible_records[0]
                self.make_record_info(single_record_info, student, homework, record)
            csv_list.append(single_record_info)

        if os.path.exists(self.root_dir+'serverfiles'):
            os.makedirs(self.root_dir+'serverfiles')
        target_path = self.root_dir+'serverfiles/'+'homework{h_id}_problem{p_id}.csv'.format(h_id=homework_id, p_id=problem_id)
        write_csv = open(target_path, 'w', newline='')
        writer = csv.writer(write_csv)
        for each_row in csv_list:
            writer.writerow(each_row)
        write_csv.close()

        self.set_header('Content-Type', 'application/octet-stream')
        self.set_header('Content-Disposition', 'attachment; filename=%s' % target_path)
        read_csv = open(target_path, 'rb')
        data = read_csv.read()
        read_csv.close()
        os.remove(target_path)
        self.write(data)


    def make_record_info(self, info_list, user, homework, record=None):

        info_list.append(user['username'])
        info_list.append(user['realname'])
        info_list.append(user['student_id'])

        if record == None:
            info_list.append(0)
            for i in range(4):
                info_list.append('')
        else:
            info_list.append(1)
            info_list.append(str(record['submit_time']))
            if record['submit_time'] <= homework['deadline']:
                info_list.append(1)
                info_list.append(0)
            else:
                info_list.append(0)
                info_list.append(int(time.mktime(record['submit_time'].timetuple())) -int(time.mktime(homework['deadline'].timetuple())))

            if record['result_type'] == 0:
                result_list = ['Accept',
                               'Wrong Answer',
                               'Runtime Error',
                               'Time Limit Exceed',
                               'Memory Limit Exceed',
                               'Output Limit Exceed',
                               'Dangerous System Call',
                               'Judgement Failed',
                               'Compile Error',
                               'unknown'
                               ]
                info_list.append(result_list[record['result']])
            elif record['result_type'] == 1:
                info_list.append(record['score'])
