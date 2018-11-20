import base64
import os
import time
import datetime
import requests
from . import base
from .base import *

class APIProblemHandler(base.BaseHandler):
    def __init__(self, *args, **kw):
        super().__init__(*args, **kw)
        self.root_dir = self.root_dir+'/problems'

    # @tornado.web.authenticated
    async def _create_post(self):
        res_dict={}
        description=bytearray()

        if not self.check_input('title', 'description', 'time_limit', 'memory_limit',
                                'judge_method','records', 'openness'):
            self.set_res_dict(res_dict, code=1, msg='lack parameters')
            self.return_json(res_dict)
            return
        try:
            byte_content = bytearray()
            self.str_to_bytes(self.args['description'], byte_content)
            description = base64.b64decode(byte_content)
            del self.args['description']
            await self.createObject('problems', **self.args)
            problem_in_db= (await self.getObject('problems', secure=1, **self.args))[0]
            target_path = self.root_dir+'/'+str(problem_in_db['id'])
            if not os.path.exists(target_path):
                os.makedirs(target_path)
            description_file = open(target_path+'/'+str(problem_in_db['id'])+'.md', mode='wb')
            description_file.write(description)
            description_file.close()
            self.set_res_dict(res_dict, code=0, msg='problem created')
        except:
            print(traceback.print_exc())
            self.set_res_dict(res_dict, code=1, msg='fail to create problem')

        self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _delete_post(self):
        res_dict={}
        try:
            problem_id = self.args['id']
            target_path = self.root_dir + '/' + str(problem_id)
            os.remove(target_path+'/'+str(problem_id)+'.md')
            os.removedirs(target_path)
            await self.deleteObject('homeworks', **self.args)
            self.set_res_dict(res_dict, code=0, msg='homework deleted')
        except:
            self.set_res_dict(res_dict, code=1, msg='fail to delete any homework')
        self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _update_post(self):
        res_dict = {}
        try:
            problem_id = self.args['id']
            target_path = self.root_dir + '/' + str(problem_id) + '/' + str(problem_id) + '.md'
            target_homework = (await self.getObject('homeworks', secure=1, id=self.args['id']))[0]
            try:
                if 'description' in self.args.keys():
                    description = bytearray()
                    byte_content = bytearray()
                    self.str_to_bytes(self.args['description'], byte_content)
                    description = base64.b64decode(byte_content)
                    description_file = open(target_path, mode='wb')
                    description_file.write(description)
                    description_file.close()
                    del self.args['description']
                for key in self.args.keys():
                    if key == 'id':
                        continue
                    target_homework[key] = self.args[key]
                self.saveObject('homeworks', secure=1, object= target_homework)
                self.set_res_dict(res_dict, code=0, msg='homework updated')
            except:
                self.set_res_dict(res_dict, code=2, msg='update failed')
                self.return_json(res_dict)
                return
        except:
            self.set_res_dict(res_dict, code=1, msg='homework does not exist')
        self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _query_post(self):
        res_dict={}
        if 'description' in self.args.keys():
            del self.args['description']
        try:
            res = await self.getObject('homeworks', secure=1, **self.args)

            for problem in res:
                problem_id = problem['id']
                target_path = self.root_dir + '/' + str(problem_id) + '/' + str(problem_id) + '.md'
                description_file = open(target_path, mode='rb')
                description = description_file.read()
                description_file.close()
                encoded_content = base64.b64decode(description)
                des_str = str()
                self.bytes_to_str(encoded_content, des_str)
                res['description'] = des_str
            self.return_json(res)
        except:
            self.set_res_dict(res_dict, code=1, msg='query failed')
            self.return_json(res_dict)

    async def _submit_post(self):
        res_dict={}
        if not self.check_input('user_id', 'problem_id', 'homework_id', 'src_code'):
            self.set_res_dict(res_dict, code=1, msg='not enough params')
            self.return_json(res_dict)
            return
        try:
            current_time = datetime.datetime.now()
            cur_timestamp = int(time.mktime(current_time.timetuple()))

            # await self.createObject('records',
            #                         user_id=self.args['user_id'],
            #                         problem_id=self.args['problem_id'],
            #                         homework_id=self.args['homework_id'],
            #                         submit_time = cur_timestamp)

            # {
            #     "user_id":2,
            #     "problem_id":1,
            #     "homework_id":1,
            #     "src_code":"I2luY2x1ZGUgPGlvc3RyZWFtPgp1c2luZyBuYW1lc3BhY2Ugc3RkOwppbnQgbWFpbigpCnsKICAgIGludCBhPTA7CiAgICBpbnQgYj0wOwogICAgY2luPj5hPj5iOwogICAgY291dDw8YStiOwogICAgcmV0dXJuIDA7Cn0="
            # }
            record_created = (await self.getObject('records',
                                                   secure=1,
                                                   user_id=self.args['user_id'],
                                                   problem_id=self.args['problem_id'],
                                                   homework_id=self.args['homework_id'],
                                                   # submit_time=cur_timestamp
                                                   submit_time=datetime.datetime.fromtimestamp(10000)
                                                   ))[0]
            str_id = str(record_created['id'])
            record_dir = self.root_dir.replace('problems', 'records')+'/'+str_id
            if not os.path.exists(record_dir):
                os.makedirs(record_dir)
            src_file_path = record_dir+'/'+str_id+'.code'
            # byte_content = bytearray()
            # self.str_to_bytes(self.args['src_code'], byte_content)
            # src_code = base64.b64decode(byte_content)
            src_file = open(src_file_path, mode='wb')
            src_file.write(self.args['src_code'])
            src_file.close()
            #创建临时的测评文件夹，需要删除
            if not os.path.exists('test'):
                os.makedirs('test')
            # if not os.path.exists('checkers'):
            #     os.makedirs('checkers')

            problem_testing = (await self.getObject('problems', id=self.args['problem_id']))[0]
            judge_req = dict()
            judge_req['TIME_LIMIT'] = problem_testing['time_limit']
            judge_req['MEMORY_LIMIT'] = problem_testing['memory_limit']
            judge_req['OUTPUT_LIMIT'] = 64
            judge_req['INPRE'] = 'test'
            judge_req['INSUF'] = 'in'
            judge_req['OUTPRE'] = 'test'
            judge_req['OUTSUF'] = 'out'
            judge_req['Language'] = 'C++'
            judge_req['DATA_DIR'] = os.getcwd()+'/test'
            judge_req['CHECKER_DIR'] = os.getcwd().replace('backend', 'judger') + '/checkers'
            judge_req['CHECKER'] = 'ncmp'
            judge_req['NTESTS'] = 2
            judge_req['SOURCE_FILE'] = str_id
            judge_req['SOURCE_DIR'] = os.getcwd()+'/'+record_dir

            result_dict={'Accept':0,
                         'Wrong Answer':1,
                         'Runtime Error':2,
                         'Time Limit Exceed':3,
                         'Memory Limit Exceed':4,
                         'Output Limit Exceed':5,
                         'Danger System Call':6,
                         'Judgement Failed':7,
                         'Compile Error':8,
                         'unknown':9,
                         }

            judge_result = json.loads(requests.post('http://localhost:12345/traditionaljudger', data=json.dumps(judge_req)))
            record_created['src_size']=os.path.getsize(src_file_path)
            record_created['consume_time']=judge_result['time']
            record_created['consume_memory']=judge_result['memory']
            record_created['result']=result_dict[judge_result['Result']]
            self.saveObject('records', record_created)

            self.set_res_dict(res_dict, code=0, msg='code successfully submitted')
        except:
            self.set_res_dict(res_dict, code=1, msg='fail to submit')

        self.return_json(res_dict)
