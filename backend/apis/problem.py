
import base64
import os
import time
import datetime
import requests
from . import base
from .base import *

judger_url = 'http://judger:12345'

class APIProblemHandler(base.BaseHandler):
    def __init__(self, *args, **kw):
        super().__init__(*args, **kw)
        self.root_dir = self.root_dir+'/problems'

    async def _list_post(self):
        self.return_json(await self.querylr('problems', self.args['start'], self.args['end']))

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
            await self.deleteObject('problems', **self.args)
            self.set_res_dict(res_dict, code=0, msg='problem deleted')
        except:
            self.set_res_dict(res_dict, code=1, msg='fail to delete any problem')
        self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _update_post(self):
        res_dict = {}
        try:
            problem_id = self.args['id']
            target_path = self.root_dir + '/' + str(problem_id) + '/' + str(problem_id) + '.md'
            target_homework = (await self.getObject('problems', secure=1, id=self.args['id']))[0]
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
                await self.saveObject('problems', secure=1, object= target_homework)
                self.set_res_dict(res_dict, code=0, msg='problem updated')
            except:
                self.set_res_dict(res_dict, code=2, msg='update failed')
                self.return_json(res_dict)
                return
        except:
            self.set_res_dict(res_dict, code=1, msg='problem does not exist')
        self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _query_post(self):
        res_dict={}
        if 'description' in self.args.keys():
            del self.args['description']
        try:
            res = await self.getObject('problems', secure=1, **self.args)

            for problem in res:
                problem_id = problem['id']
                target_path = self.root_dir + '/' + str(problem_id) + '/' + str(problem_id) + '.md'
                description_file = open(target_path, mode='rb')
                description = description_file.read()
                description_file.close()
                # encoded_content = base64.b64encode(description)
                encoded_content = description
                # des_str = self.bytes_to_str(encoded_content)
                des_str = encoded_content.decode(encoding='utf-8')
                problem['description'] = des_str
                print('query_problem_loop', problem)
                print('path', target_path)
                print('description', description)
            self.return_json(res)
        except Exception as e:
            print(e)
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

            await self.createObject('records',
                                    user_id=self.args['user_id'],
                                    problem_id=self.args['problem_id'],
                                    homework_id=self.args['homework_id'],
                                    submit_time = datetime.datetime.fromtimestamp(cur_timestamp))


            record_created = (await self.getObject('records',
                                                   secure=1,
                                                   user_id=self.args['user_id'],
                                                   problem_id=self.args['problem_id'],
                                                   homework_id=self.args['homework_id'],
                                                   submit_time=datetime.datetime.fromtimestamp(cur_timestamp)
                                                   ))[0]
            problem_of_code = (await self.getObject('problems', id=self.args['problem_id']))[0]
            problem_of_code['records'].append(record_created['id'])
            await self.saveObject('problems', problem_of_code)
            str_id = str(record_created['id'])
            record_dir = self.root_dir.replace('problems', 'records')+'/'+str_id
            if not os.path.exists(record_dir):
                os.makedirs(record_dir)
            src_file_path = record_dir+'/'+str_id+'.code'
            # byte_content = bytearray()
            # self.str_to_bytes(self.args['src_code'], byte_content)
            # src_code = base64.b64decode(byte_content)
            src_file = open(src_file_path, mode='wb')
            src_file.write(self.args['src_code'].encode(encoding='utf-8'))

            src_file.close()

            language_dict={1:'C',2:'C++',3:'JavaScript',4:'Python'}

            if self.args['src_language']==1 or self.args['src_language']==2 or self.args['src_language']==4:
                if not os.path.exists('test'):
                    os.makedirs('test')
                # problem_testing = (await self.getObject('problems', id=self.args['problem_id']))[0]
                judge_req = {}
                judge_req['TIME_LIMIT'] = problem_of_code['time_limit']
                judge_req['MEMORY_LIMIT'] = problem_of_code['memory_limit']
                judge_req['OUTPUT_LIMIT'] = 64
                judge_req['INPRE'] = 'test'
                judge_req['INSUF'] = 'in'
                judge_req['OUTPRE'] = 'test'
                judge_req['OUTSUF'] = 'out'
                judge_req['Language'] = language_dict[self.args['src_language']]
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

                judge_result = json.loads(requests.post(judger_url+'/traditionaljudger', data=json.dumps(judge_req)).text)

                # response = requests.post('http://localhost:12345/traditionaljudger', data=json.dumps(judge_req))
                # print(response.text)
                # judge_result = json.loads(response.text)
                record_created['src_size']=os.path.getsize(src_file_path)
                record_created['consume_time']=judge_result['time']
                record_created['consume_memory']=judge_result['memory']
                record_created['result']=result_dict[judge_result['Result']]
                record_created['score'] = None
                await self.saveObject('records', record_created)
            elif self.args['src_language']==3:
                if not os.path.exists('judge_script'):
                    os.makedirs('judge_script')
                judge_req = {}
                judge_req['TIME_LIMIT'] = problem_of_code['time_limit']
                judge_req['MEMORY_LIMIT'] = problem_of_code['memory_limit']
                judge_req['OUTPUT_LIMIT'] = 64
                judge_req['WORK_PATH'] = os.getcwd()+'/judge_script'
                judge_req['SOURCE_PATH'] = os.getcwd()+'/'+record_dir
                judge_req['SOURCE'] = str_id
                judge_req['OTHERS'] = os.getcwd()+'/judge_script/fake-node/fake-node-linux '+'test.js '+'index.js'

                judge_result = json.loads(
                    requests.post(judger_url+'/scriptjudger', data=json.dumps(judge_req)).text)
                record_created['src_size'] = os.path.getsize(src_file_path)
                # print('judge_result ', judge_result)
                record_created['score'] = judge_result['Score']
                record_created['result'] = None
                record_created['consume_time'] = judge_result['time']
                record_created['consume_memory'] = judge_result['memory']
                print('record_created ', record_created)
                await self.saveObject('records', record_created, secure=1)

            self.set_res_dict(res_dict, code=0, msg='code successfully submitted')
        except Exception as e:
            print(e)
            self.set_res_dict(res_dict, code=1, msg='fail to submit')

        self.return_json(res_dict)
