
import json
import hashlib
import smtplib
import random
import datetime
import os
from email.mime.text import MIMEText
from email.header import Header
from . import base
from .base import *
from tornado.options import define, options

# TODO: to return code in every request


class APIRecordHandler(base.BaseHandler):
    def __init__(self, *args, **kw):
        super().__init__(*args, **kw)
        self.root_dir = self.root_dir+'/records'

    def getargs(self):
        self.args = json.loads(self.request.body.decode() or '{}')
        if 'submit_time' in self.args.keys():
            self.args['submit_time'] = datetime.datetime.fromtimestamp(self.args['submit_time'])

    async def _list_post(self):
        return await self.db.querylr('records', self.args['start'], self.args['end'], **self.args)

    @tornado.web.authenticated
    async def _query_post(self):
        print('query = ', self.args)
        res = await self.db.getObject('records', cur_user=self.get_current_user_object(), **self.args)
        cur_user = await self.get_current_user_object()
        if('homework_id' in self.args.keys()):
            hw = (await self.db.getObject('homeworks',  id = self.args['homework_id']))
        else:
            hw = []
        if(len(hw)):
            hw = hw[0]
        else:
            hw = {'score_openness': 0, 'homework_id': 0}

        for js in res:
            timepoint = int(js['submit_time'].timestamp())
            js['submit_time'] = timepoint
            js['score_openness'] = hw['score_openness']
            # authority check
            if cur_user['role'] == 1:
                if not js['user_id']==cur_user['id']:
                    res.remove(js)
                elif (js['record_type'] == 2 or js['record_type'] == 4) and js['score_openness'] == 0:
                    self.property_filter(js, None, ['score', 'result', 'consume_time', 'consume_memory', 'status'])
            elif cur_user['role'] == 2:
                if js['record_type'] == 0 and js['user_id'] != cur_user['id']:
                    res.remove(js)
                elif js['record_type'] == 1 or js['record_type'] == 2 or js['record_type'] == 4:
                    course = (await self.db.getObject('courses', id=self.args['course_id']))[0]
                    if not course['id'] in cur_user['ta_courses']:
                        res.remove(js)
                elif js['record_type'] == 3:
                    problem = (await self.db.getObject('problems', id=self.args['problem_id']))[0]
                    if not problem['user_id'] == cur_user['id']:
                        res.remove(js)
            elif cur_user['role'] == 3:
                pass
            else:
                res.remove(js)
            # ---------------------------------------------------------------------

        return res

    # @tornado.web.authenticated
    async def _srcCode_post(self):
        # raise Exception('implement srcCode')
        res_dict={}
        record_id = str(self.args['id'])
        record_dir = self.root_dir+'/'+record_id
        if not os.path.exists(record_dir):
            self.set_res_dict(res_dict, code=1, msg='no such record')
            return res_dict
        src_file_path = record_dir + '/' + record_id + '.code'
        content = open(src_file_path, mode='rb').read().decode()
        self.set_res_dict(res_dict, code=0, src_code=content)
        return res_dict

    # @tornado.web.authenticated
    async def _delete_post(self):
        # for condition in self.args:
        res_dict = {}
        # authority check
        role = (await self.get_current_user_object())['role']
        if role < 3:
            self.set_res_dict(res_dict, code=1, msg='you are not allowed')
            return res_dict

        await self.db.deleteObject('records', **self.args)
        self.set_res_dict(res_dict, code=0, msg='record deleted')
        return res_dict

    # @tornado.web.authenticated
    async def _create_post(self):
        res_dict = {}
        # authority check
        role = (await self.get_current_user_object())['role']
        if role < 3:
            self.set_res_dict(res_dict, code=1, msg='you are not allowed to use this')
            return res_dict

        await self.db.createObject('records', **self.args)
        self.set_res_dict(res_dict, code=0, msg='record created')
        return res_dict

    # @tornado.web.authenticated
    async def _returnresult_post(self):
        # if 'secret' in self.args.keys() and \
        #     self.args['secret'] != options.judgerSecret:
        #     return {'code': }
        assert(options.judgerSecret == self.args['secret'])
        match_record = (await self.db.getObject('records', cur_user=self.get_current_user_object(), id=int(self.args['id'])))[0]
        result_dict = {'Accept': 0,
                       'Wrong Answer': 1,
                       'Runtime Error': 2,
                       'Time Limit Exceed': 3,
                       'Memory Limit Exceed': 4,
                       'Output Limit Exceed': 5,
                       'Dangerous System Call': 6,
                       'Judgement Failed': 7,
                       'Compile Error': 8,
                       'unknown': 9,
                       }
        print('returnresult: ', match_record)
        judge_result = self.args['res']
        if match_record['src_language'] == 1 or match_record['src_language'] == 2 or match_record['src_language'] == 4:
            match_record['consume_time'] = judge_result['time']
            match_record['consume_memory'] = judge_result['memory']
            match_record['result'] = result_dict[judge_result['Result']]
            if match_record['record_type']==3 and match_record['result']==0:
                matched_problem = (await self.db.getObject('problems', cur_user=self.get_current_user_object(), id=match_record['problem_id']))[0]
                matched_problem['status'] = 1
                await self.db.saveObject('problems', cur_user=self.get_current_user_object(), object=matched_problem)

        elif match_record['src_language'] == 3:
            match_record['consume_time'] = judge_result['time']
            match_record['consume_memory'] = judge_result['memory']
            match_record['score'] = judge_result['Score']
            if match_record['record_type']==3 and match_record['score']==100:
                matched_problem = (await self.db.getObject('problems', cur_user=self.get_current_user_object(), id=match_record['problem_id']))[0]
                matched_problem['status'] = 1
                await self.db.saveObject('problems', cur_user=self.get_current_user_object(), object=matched_problem)

        match_record['status'] = 1
        await self.db.saveObject('records', object=match_record, cur_user=self.get_current_user_object())

    # async def get(self, type): #detail
    #     # self.getargs()
    #     print('get: ', type)
    #     await self._call_method('''_{action_name}_get'''.format(action_name = type))
    #
    # async def post(self, type):
    #     print('post: ', type)
    #     await self._call_method('''_{action_name}_post'''.format(action_name = type))
