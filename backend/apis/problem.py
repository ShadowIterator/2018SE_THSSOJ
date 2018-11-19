import base64
import os
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
            problem_in_db=await self.getObject('problems', secure=1, **self.args)[0]
            target_path = self.root_dir+'/'+str(problem_in_db['id'])
            os.makedirs(target_path)
            description_file = open(target_path+'/'+str(problem_in_db[0])+'.md', mode='wb')
            description_file.write(description)
            description_file.close()
            self.set_res_dict(res_dict, code=0, msg='problem created')
        except:
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
            target_homework = await self.getObject('homeworks', secure=1, id=self.args['id'])[0]
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