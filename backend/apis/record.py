
import json
import hashlib
import smtplib
import random
import datetime
import os
import json
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
        cur_user = await self.get_current_user_object()
        assert (cur_user['role'] == Roles.ADMIN)
        return await self.db.querylr('records', self.args['start'], self.args['end'], **self.args)

    @tornado.web.authenticated
    async def _query_post(self):
        print_debug('query = ', self.args)
        res = await self.db.getObject('records', cur_user=self.get_current_user_object(), **self.args)

        cur_user = await self.get_current_user_object()

        ret_list = []
        for record in res:
            timepoint = int(record['submit_time'].timestamp())
            record['submit_time'] = timepoint
            if record['record_type'] == 1:
                problem = await self.db.getObjectOne('problems', id=record['problem_id'])
                if record['result_type'] == 0:
                    config_path = os.getcwd()+'/'+self.root_dir.replace('records', 'problems')+'/'+\
                                  str(problem['id'])+'/case/config.json'
                elif record['result_type'] == 1:
                    config_path = os.getcwd() + '/' + self.root_dir.replace('records', 'problems') + '/' + \
                                  str(problem['id']) + '/script/config.json'

                # config_file = open(config_path, mode='r', encoding='utf8')
                # config_info = json.load(config_file)
                # config_file.close()
                if record['test_ratio'] == 1:
                    record['test_ratio'] = problem['ratio_one']
                elif record['test_ratio'] == 2:
                    record['test_ratio'] = problem['ratio_two']
                elif record['test_ratio'] == 3:
                    record['test_ratio'] = problem['ratio_three']
            # authority check
            if record['record_type'] == 0:
                if cur_user['role'] < 3 and record['user_id'] != cur_user['id']:
                    pass
                else:
                    ret_list.append(record)
            elif record['record_type'] == 1:
                if cur_user['role'] < 2 and record['user_id'] != cur_user['id']:
                    pass
                elif cur_user['role'] == 2:
                    homework = await self.db.getObjectOne('homeworks', id=record['homework_id'])
                    if homework['course_id'] in cur_user['ta_courses']:
                        ret_list.append(record)
                else:
                    ret_list.append(record)
            elif record['record_type'] == 2:

                # course = (await self.db.getObject('courses', id=homework['course_id']))[0]
                if cur_user['role'] < 2:
                    homework = (await self.db.getObject('homeworks', id=self.args['homework_id']))[0]
                    if cur_user['id'] != record['user_id']:
                        continue
                    if homework['score_openness'] == 0:
                        record = self.property_filter(record, None, ['score', 'result', 'consume_time', 'consume_memory', 'status'])
                    ret_list.append(record)
                elif cur_user['role'] == 2:
                    homework = (await self.db.getObject('homeworks', id=self.args['homework_id']))[0]
                    if homework['course_id'] in cur_user['ta_courses']:
                        ret_list.append(record)
                elif cur_user['role'] == 3:
                    ret_list.append(record)
            elif record['record_type'] == 3:
                if cur_user['role'] == 2 and cur_user['id'] == record['user_id']:
                    ret_list.append(record)
                elif cur_user['role'] == 3:
                    ret_list.append(record)
            elif record['record_type'] == 4:
                # course = (await self.db.getObject('courses', id=homework['course_id']))[0]
                if cur_user['role'] < 2:
                    homework = (await self.db.getObject('homeworks', id=self.args['homework_id']))[0]
                    if cur_user['id'] != record['user_id']:
                        continue
                    if homework['score_openness'] == 0:
                        record = self.property_filter(record, None, ['score', 'result', 'consume_time', 'consume_memory', 'status'])
                    ret_list.append(record)
                elif cur_user['role'] == 2:
                    homework = (await self.db.getObject('homeworks', id=self.args['homework_id']))[0]
                    if homework['course_id'] in cur_user['ta_courses']:
                        ret_list.append(record)
                elif cur_user['role'] == 3:
                    ret_list.append(record)
            # ---------------------------------------------------------------------

        return ret_list

    # @tornado.web.authenticated
    async def _srcCode_post(self):
        # raise Exception('implement srcCode')
        res_dict={}
        # authority check
        cur_user = await self.get_current_user_object()
        record = (await self.db.getObject('records', id=self.args['id']))[0]
        if record['record_type'] == 0:
            if cur_user['role'] < 3 and cur_user['id'] != record['user_id']:
                self.set_res_dict(res_dict, code=1, msg='back off!')
                return res_dict
        elif record['record_type'] == 1 or record['record_type'] == 2:
            if cur_user['role'] < 2 and cur_user['id'] != record['user_id']:
                self.set_res_dict(res_dict, code=1, msg='back off!')
                return res_dict
            if cur_user['role'] == 2:
                homework = await self.db.getObjectOne('homeworks', id=record['homework_id'])
                if homework['course_id'] not in cur_user['ta_courses']:
                    self.set_res_dict(res_dict, code=1, msg='back off!')
                    return res_dict
        elif record['record_type'] == 3:
            if cur_user['role'] < 3 and cur_user['id'] != record['user_id']:
                self.set_res_dict(res_dict, code=1, msg='back off!')
                return res_dict
        # -----------------------------------------------------------
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
        print_debug('returnresult: ', match_record)
        # ******************************** update judgestates *********************************************
        if(match_record['record_type'] in [2, 4]):
            judge_state = await self.db.getObjectOne('judgestates', homework_id = match_record['homework_id'], problem_id = match_record['problem_id'])
            judge_state['judged'] += 1
            await self.db.saveObject('judgestates', judge_state)

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

        record_path = self.root_dir+'/'+str(match_record['id'])+'/'+str(match_record['id'])+'.json'
        record_file = open(record_path, mode='w')
        json.dump(judge_result, record_file)
        record_file.close()

        match_record['status'] = 1
        await self.db.saveObject('records', object=match_record, cur_user=self.get_current_user_object())
        return {'code': 0}

    # async def get(self, type): #detail
    #     # self.getargs()
    #     print_debug('get: ', type)
    #     await self._call_method('''_{action_name}_get'''.format(action_name = type))
    #
    # async def post(self, type):
    #     print_debug('post: ', type)
    #     await self._call_method('''_{action_name}_post'''.format(action_name = type))

    # @tornado.web.authenticated
    async def _judgerInfo_post(self):
        res_dict = {}
        record_id = self.args['record_id']
        record_path = self.root_dir+'/'+str(record_id)+'/'+str(record_id)+'.json'
        if not os.path.exists(record_path):
            self.set_res_dict(res_dict, code=1, msg='record does not exist')
            return res_dict

        # authority check
        cur_user = await self.get_current_user_object()
        record = await self.db.getObjectOne('records', id=record_id)
        if record['record_type'] == 0:
            if cur_user['role'] < 3 and cur_user['id'] != record['user_id']:
                self.set_res_dict(res_dict, code=1, msg='back off!')
                return res_dict
        elif record['record_type'] == 1 or record['record_type'] == 2:
            if cur_user['role'] < 2 :
                if cur_user['id'] != record['user_id']:
                    self.set_res_dict(res_dict, code=1, msg='back off!')
                    return res_dict
                homework = await self.db.getObjectOne('homeworks', id=record['homework_id'])
                if homework['score_openness'] == 0:
                    self.set_res_dict(res_dict, code=1, msg='info is not available')
                    return res_dict
            if cur_user['role'] == 2:
                homework = await self.db.getObjectOne('homeworks', id=record['homework_id'])
                if homework['course_id'] not in cur_user['ta_courses']:
                    self.set_res_dict(res_dict, code=1, msg='back off!')
                    return res_dict
        elif record['record_type'] == 3:
            if cur_user['role'] < 3 and cur_user['id'] != record['user_id']:
                self.set_res_dict(res_dict, code=1, msg='back off!')
                return res_dict
        # ----------------------------------------------

        record_file = open(record_path, mode='r')
        record_detail = json.load(record_file)
        record_file.close()
        self.set_res_dict(res_dict, code=0, info=record_detail['Info'])
        return res_dict
