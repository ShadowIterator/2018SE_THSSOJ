import base64
import os
import time
import datetime
import requests
import uuid
import shutil
import zipfile
import json
from . import base
from .base import *
from tornado.options import define, options

judger_url = 'http://judger:12345'

class APIProblemHandler(base.BaseHandler):
    def __init__(self, *args, **kw):
        super().__init__(*args, **kw)
        self.root_dir = self.root_dir+'/problems'
        # ****************************************************
        # ****************************************************
        # ****************************************************
        # super(BaseHandler, self).__init__(*args, **kw)
        # self.db = self.application.db_instance
        # self.getargs()
        # self.set_header("Access-Control-Allow-Origin", "http://localhost:3000")
        # self.set_header("Access-Control-Allow-Headers", "x-requested-with, Content-type, X-Requested-With")
        # self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        # self.set_header("Access-Control-Allow-Credentials", 'true')
        #
        # self.root_dir='root'
        # self.user = None
        # print(self.request.body)


    async def _list_post(self):
        return await self.db.querylr('problems', self.args['start'], self.args['end'], **self.args)

    # @tornado.web.authenticated
    async def _create_post(self):
        res_dict={}
        # authority check
        role = (await self.get_current_user_object())['role']
        if role < 2:
            self.set_res_dict(res_dict, code=1, msg='you are not allowed')
            return res_dict

        description=bytearray()
        if not self.check_input('title', 'description', 'time_limit', 'memory_limit',
                                'judge_method', 'openness', 'code_uri', 'test_language'):
            self.set_res_dict(res_dict, code=1, msg='lack parameters')
            # self.return_json(res_dict)
            return res_dict

        judge_method = self.args['judge_method']
        test_language = self.args['test_language']

        if judge_method == 0:
            zip_path = self.root_dir.replace('/problems', '')+'/'+self.args['case_uri']
            del self.args['case_uri']
        else:
            zip_path = self.root_dir.replace('/problems', '')+'/'+self.args['script_uri']
            del self.args['script_uri']

        code_path = self.root_dir.replace('/problems', '')+'/'+self.args['code_uri']
        src_size = os.path.getsize(code_path)
        file_zip = zipfile.ZipFile(zip_path)
        del self.args['code_uri']

        byte_content = bytearray()
        self.str_to_bytes(self.args['description'], byte_content)
        # description = base64.b64decode(byte_content)
        del self.args['description']
        await self.db.createObject('problems', **self.args)
        problem_in_db = (await self.db.getObject('problems', cur_user = self.get_current_user_object(), **self.args))[0]
        target_path = self.root_dir + '/' + str(problem_in_db['id'])
        if not os.path.exists(target_path):
            os.makedirs(target_path)
        description_file = open(target_path + '/' + str(problem_in_db['id']) + '.md', mode='wb')
        description_file.write(byte_content)
        description_file.close()

        target_code_path = target_path+'/code'
        if judge_method == 0:
            target_zip_path = target_path+'/case'
        else:
            target_zip_path = target_path+'/script'
        if not os.path.exists(target_code_path):
            os.makedirs(target_code_path)
        if not os.path.exists(target_zip_path):
            os.makedirs(target_zip_path)
        problem_id = problem_in_db['id']
        # print("target_code_path ", target_code_path)
        # code_file_name = code_path.split('/')[-1]
        shutil.copyfile(code_path, target_code_path+'/'+str(problem_id)+'.code')
        shutil.cpoyfile(zip_path, target_zip_path + '/' + str(problem_id) + '.zip')
        file_zip.extractall(target_zip_path)
        # shutil.move(case_path, target_case_path)
        config_file = open(target_zip_path+'/config.json', mode='r', encoding='utf8')
        config_info = json.load(config_file)

        record_info = {
            'user_id':self.args['user_id'],
            'problem_id':problem_in_db['id'],
            'record_type':3,
            'result_type':problem_in_db['judge_method'],
            'test_ratio':100,
            'src_language':test_language,
            'src_size':src_size
        }
        await self.db.createObject('records', **record_info)
        record_created = (await self.db.getObject('records', cur_user=self.get_current_user_object(), **record_info))[0]
        str_id = str(record_created['id'])
        record_dir = self.root_dir.replace('problems', 'records') + '/' + str_id
        print("record_dir ", record_dir)
        shutil.copyfile(code_path, record_dir+'/'+str_id+'.code')

        if test_language==1 or test_language==2 or test_language==4:
            judge_req = {}
            judge_req['id'] = record_created['id']
            judge_req['TIME_LIMIT'] = self.args['time_limit']
            judge_req['MEMORY_LIMIT'] = self.args['memory_limit']
            judge_req['OUTPUT_LIMIT'] = 64
            judge_req['INPRE'] = config_info['INPRE']
            judge_req['INSUF'] = config_info['INSUF']
            judge_req['OUTPRE'] = config_info['OUTPRE']
            judge_req['OUTSUF'] = config_info['OUTSUF']
            if test_language == 1:
                judge_req['Language'] = 'C'
            elif test_language == 2:
                judge_req['Language'] = 'C++'
            elif test_language == 4:
                judge_req['Language'] = 'Python'
            judge_req['DATA_DIR'] = os.getcwd() + '/' + target_zip_path
            judge_req['CHECKER_DIR'] = os.getcwd().replace('backend', 'judger') + '/checkers'
            judge_req['CHECKER'] = 'ncmp'
            judge_req['NTESTS'] = config_info['NTESTS']
            judge_req['SOURCE_FILE'] = str_id
            judge_req['SOURCE_DIR'] = os.getcwd() + '/' + record_dir
            requests.post('http://localhost:12345/traditionaljudger', data=json.dumps(judge_req))
            # requests.post(options.traditionalJudgerAddr, data=json.dumps(judge_req))
        elif test_language==3:
            judge_req = {}
            judge_req['id'] = record_created['id']
            judge_req['TIME_LIMIT'] = self.args['time_limit']
            judge_req['MEMORY_LIMIT'] = self.args['memory_limit']
            judge_req['OUTPUT_LIMIT'] = 64
            judge_req['WORK_PATH'] = os.getcwd() + '/' + target_zip_path
            judge_req['SOURCE_PATH'] = os.getcwd() + '/' + record_dir
            judge_req['SOURCE'] = str_id
            judge_req['OTHERS'] = './judge.sh -r 100'
            requests.post('http://localhost:12345/scriptjudger', data=json.dumps(judge_req))
            # requests.post(options.scriptJudgerAddr, data=json.dumps(judge_req))

        os.remove(code_path)
        os.remove(zip_path)

        self.set_res_dict(res_dict, code=0, msg='problem created')
        return res_dict
        # try:
        #     byte_content = bytearray()
        #     self.str_to_bytes(self.args['description'], byte_content)
        #     description = base64.b64decode(byte_content)
        #     del self.args['description']
        #     await self.createObject('problems', **self.args)
        #     problem_in_db= (await self.getObject('problems', secure=1, **self.args))[0]
        #     target_path = self.root_dir+'/'+str(problem_in_db['id'])
        #     if not os.path.exists(target_path):
        #         os.makedirs(target_path)
        #     description_file = open(target_path+'/'+str(problem_in_db['id'])+'.md', mode='wb')
        #     description_file.write(description)
        #     description_file.close()
        #     self.set_res_dict(res_dict, code=0, msg='problem created')
        # except:
        #     print(traceback.print_exc())
        #     self.set_res_dict(res_dict, code=1, msg='fail to create problem')
        # self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _delete_post(self):
        res_dict={}
        problem_id = self.args['id']
        # authority check
        cur_user = await self.get_current_user_object()
        problem = (await self.db.getObject('problems', id=problem_id))[0]
        if cur_user['role']<3 and problem['user_id']!=cur_user['id']:
            self.set_res_dict(res_dict, code=1, msg='you are not allowed')
            return res_dict

        target_path = self.root_dir + '/' + str(problem_id)
        os.remove(target_path + '/' + str(problem_id) + '.md')
        os.removedirs(target_path)
        await self.db.deleteObject('problems', **self.args)
        self.set_res_dict(res_dict, code=0, msg='problem deleted')
        return res_dict
        # try:
        #     problem_id = self.args['id']
        #     target_path = self.root_dir + '/' + str(problem_id)
        #     os.remove(target_path+'/'+str(problem_id)+'.md')
        #     os.removedirs(target_path)
        #     await self.db.deleteObject('problems', **self.args)
        #     self.set_res_dict(res_dict, code=0, msg='problem deleted')
        # except:
        #     self.set_res_dict(res_dict, code=1, msg='fail to delete any problem')
        # self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _update_post(self):
        res_dict = {}
        problem_id = self.args['id']
        target_path = self.root_dir + '/' + str(problem_id) + '/' + str(problem_id) + '.md'
        target_problem = (await self.db.getObject('problems', cur_user = self.get_current_user_object(), id=self.args['id']))[0]

        # authority check
        cur_user = self.get_current_user_object()
        if target_problem['user_id'] != cur_user['id'] or 'status' in self.args.keys():
            self.set_res_dict(res_dict, code=1, msg='not authorized')
            return res_dict
        # ---------------------------------------------------------------------

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
            target_problem[key] = self.args[key]
        await self.db.saveObject('problems', cur_user = self.get_current_user_object(), object=target_problem)
        self.set_res_dict(res_dict, code=0, msg='problem updated')
        return res_dict

        # try:
        #     problem_id = self.args['id']
        #     target_path = self.root_dir + '/' + str(problem_id) + '/' + str(problem_id) + '.md'
        #     target_homework = (await self.getObject('problems', secure=1, id=self.args['id']))[0]
        #     try:
        #         if 'description' in self.args.keys():
        #             description = bytearray()
        #             byte_content = bytearray()
        #             self.str_to_bytes(self.args['description'], byte_content)
        #             description = base64.b64decode(byte_content)
        #             description_file = open(target_path, mode='wb')
        #             description_file.write(description)
        #             description_file.close()
        #             del self.args['description']
        #         for key in self.args.keys():
        #             if key == 'id':
        #                 continue
        #             target_homework[key] = self.args[key]
        #         await self.saveObject('problems', secure=1, object= target_homework)
        #         self.set_res_dict(res_dict, code=0, msg='problem updated')
        #     except:
        #         self.set_res_dict(res_dict, code=2, msg='update failed')
        #         self.return_json(res_dict)
        #         return
        # except:
        #     self.set_res_dict(res_dict, code=1, msg='problem does not exist')
        # self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _query_post(self):
        res_dict={}
        if 'description' in self.args.keys():
            del self.args['description']

        res = await self.db.getObject('problems', cur_user=self.get_current_user_object(), **self.args)
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
        return res

        # try:
        #     res = await self.db.getObject('problems', secure=1, **self.args)
        #     for problem in res:
        #         problem_id = problem['id']
        #         target_path = self.root_dir + '/' + str(problem_id) + '/' + str(problem_id) + '.md'
        #         description_file = open(target_path, mode='rb')
        #         description = description_file.read()
        #         description_file.close()
        #         # encoded_content = base64.b64encode(description)
        #         encoded_content = description
        #         # des_str = self.bytes_to_str(encoded_content)
        #         des_str = encoded_content.decode(encoding='utf-8')
        #         problem['description'] = des_str
        #         print('query_problem_loop', problem)
        #         print('path', target_path)
        #         print('description', description)
        #     self.return_json(res)
        # except Exception as e:
        #     print(e)
        #     self.set_res_dict(res_dict, code=1, msg='query failed')
        #     self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _submit_post(self):
        res_dict={}
        if not self.check_input('user_id', 'problem_id', 'src_code', 'record_type'):
            print(self.args)
            self.set_res_dict(res_dict, code=1, msg='submit post not enough params')
            # self.return_json(res_dict)
            return res_dict

        # authority check
        record_type = self.args['record_type']
        if record_type == 1 or record_type == 2 or record_type == 4:
            cur_user = await self.get_current_user_object()
            # problem = (await self.db.getObject('problems', id=self.args['problem_id']))[0]
            homework = (await self.db.getObject('homeworks', id=self.args['homework_id']))[0]
            course = (await self.db.getObject('courses', id=homework['course_id']))[0]
            if cur_user['id'] not in course['students']:
                self.set_res_dict(res_dict, code=1, msg='you are not allowed')
                return res_dict
        # -----------------------------------

        current_time = datetime.datetime.now()
        cur_timestamp = int(time.mktime(current_time.timetuple()))

        self.args['submit_time'] = datetime.datetime.fromtimestamp(cur_timestamp)
        self.args['status'] = 0
        await self.db.createObject('records', **self.args)
                                # user_id=self.args['user_id'],
                                # problem_id=self.args['problem_id'],
                                # homework_id=self.args['homework_id'],
                                # submit_time=datetime.datetime.fromtimestamp(cur_timestamp))

        record_created = (await self.db.getObject('records', cur_user=self.get_current_user_object(),
                                                user_id=self.args['user_id'],
                                                submit_time=datetime.datetime.fromtimestamp(cur_timestamp)
                                               ))[0]

        problem_of_code = (await self.db.getObject('problems', cur_user=self.get_current_user_object(), id=self.args['problem_id']))[0]
        problem_of_code['records'].append(record_created['id'])
        await self.db.saveObject('problems', object=problem_of_code, cur_user=self.get_current_user_object())
        if 'homework_id' in self.args:
            matched_homework = (await self.db.getObject('homeworks', cur_user=self.get_current_user_object(), id=self.args['homework_id']))[0]
            matched_homework['records'].append(record_created['id'])
            await self.db.saveObject('homeworks', object=matched_homework, cur_user=self.get_current_user_object())
        str_id = str(record_created['id'])
        record_dir = self.root_dir.replace('problems', 'records') + '/' + str_id
        if not os.path.exists(record_dir):
            os.makedirs(record_dir)
        src_file_path = record_dir + '/' + str_id + '.code'
        # byte_content = bytearray()
        # self.str_to_bytes(self.args['src_code'], byte_content)
        # src_code = base64.b64decode(byte_content)
        src_file = open(src_file_path, mode='wb')
        src_file.write(self.args['src_code'].encode(encoding='utf-8'))
        src_file.close()

        record_created['src_size'] = os.path.getsize(src_file_path)
        if self.args['src_language'] == 1 or self.args['src_language'] == 2 or self.args['src_language'] == 4:
            record_created['result_type'] = 0
        elif self.args['src_language'] == 3:
            record_created['result_type'] = 1
        await self.db.saveObject('records', object=record_created, cur_user=self.get_current_user_object())
        if self.args['record_type']==2:
            self.set_res_dict(res_dict, code=0, msg='code successfully uploaded')
            return res_dict

        if self.args['src_language'] == 1 or self.args['src_language'] == 2 or self.args['src_language'] == 4:
            if not os.path.exists('test'):
                os.makedirs('test')
            # problem_testing = (await self.getObject('problems', id=self.args['problem_id']))[0]
            judge_req = {}
            judge_req['id'] = record_created['id']
            judge_req['TIME_LIMIT'] = problem_of_code['time_limit']
            judge_req['MEMORY_LIMIT'] = problem_of_code['memory_limit']
            judge_req['OUTPUT_LIMIT'] = 64
            judge_req['INPRE'] = 'test'
            judge_req['INSUF'] = 'in'
            judge_req['OUTPRE'] = 'test'
            judge_req['OUTSUF'] = 'out'
            if self.args['src_language'] == 1:
                judge_req['Language'] = 'C'
            elif self.args['src_language'] == 2:
                judge_req['Language'] = 'C++'
            elif self.args['src_language'] == 4:
                judge_req['Language'] = 'Python'
            judge_req['DATA_DIR'] = os.getcwd() + '/test'
            judge_req['CHECKER_DIR'] = os.getcwd().replace('backend', 'judger') + '/checkers'
            judge_req['CHECKER'] = 'ncmp'
            judge_req['NTESTS'] = 2
            judge_req['SOURCE_FILE'] = str_id
            judge_req['SOURCE_DIR'] = os.getcwd() + '/' + record_dir

            # requests.post('http://localhost:12345/traditionaljudger', data=json.dumps(judge_req))
            requests.post(options.traditionalJudgerAddr, data=json.dumps(judge_req))
        elif self.args['src_language'] == 3:
            if not os.path.exists('judge_script'):
                os.makedirs('judge_script')
            judge_req = {}
            judge_req['id'] = record_created['id']
            judge_req['TIME_LIMIT'] = problem_of_code['time_limit']
            judge_req['MEMORY_LIMIT'] = problem_of_code['memory_limit']
            judge_req['OUTPUT_LIMIT'] = 64
            judge_req['WORK_PATH'] = os.getcwd() + '/judge_script'
            judge_req['SOURCE_PATH'] = os.getcwd() + '/' + record_dir
            judge_req['SOURCE'] = str_id
            judge_req['OTHERS'] = os.getcwd() + 'judge_script/fake-node/fake-node-linux ' + 'test.js ' + str_id + '.code'

            # requests.post('http://localhost:12345/scriptjudger', data=json.dumps(judge_req))
            requests.post(options.scriptJudgerAddr, data=json.dumps(judge_req))

        self.set_res_dict(res_dict, code=0, msg='code successfully submitted')
        return res_dict


    # @tornado.web.authenticated
    async def _uploadCode_post(self):
        # print('uploadCode_post: ', self.request.files['code'][0]['filename'], self.request.files['code'][0]['body'] )

        res_dict = {}
        # upload_path = os.path.join(os.path.dirname(__file__), 'files')
        code_meta = self.request.files['code']
        temp_dir = self.root_dir+'/tmp'
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)
        file_name = code_meta['filename']
        file_path = temp_dir+'/'+file_name
        if os.path.exists(file_path):
            new_filename = str(uuid.uuid1())
            file_path = file_path.replace(file_name, new_filename)
        target_file = open(file_path, mode='wb')
        target_file.write(code_meta['body'])
        target_file.close()
        self.set_res_dict(res_dict, code=0, url=os.getcwd()+'/'+file_path)
        return res_dict

    # @tornado.web.authenticated
    async def _uploadCases_post(self):
        pass

    # @tornado.web.authenticated
    async def _uploadScript_post(self):
        pass

    # @tornado.web.authenticated
    async def _search_post(self):
        all_problems = await self.db.all('problems', cur_user=self.get_current_user_object())
        search_res=[]
        key_word = self.args['keyword']

        for each_problem in all_problems:
            if key_word in each_problem:
                search_res.append(each_problem['id'])
