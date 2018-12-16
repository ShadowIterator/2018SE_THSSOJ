
import datetime
import time
import requests
from . import base
from .base import *

class APIHomeworkHandler(base.BaseHandler):
    def __init__(self, *args, **kw):
        super().__init__(*args, **kw)
        self.root_dir = self.root_dir+'/homeworks'

    async def _list_post(self):
        return await self.db.querylr('homeworks', self.args['start'], self.args['end'], **self.args)

    def getargs(self):
        self.args = json.loads(self.request.body.decode() or '{}')
        if 'deadline' in self.args.keys():
            self.args['deadline'] = datetime.datetime.fromtimestamp(self.args['deadline'])

    # @tornado.web.authenticated
    async def _create_post(self):
        res_dict={}
        # authority check
        role = (await self.get_current_user_object())['role']
        if role < 2:
            self.set_res_dict(res_dict, code=1, msg='you are not allowed to use this')
            return res_dict

        await self.db.createObject('homeworks', **self.args)
        self.set_res_dict(res_dict, code=0, msg='homework created')
        return res_dict
        # try:
        #     await self.createObject('homeworks', **self.args)
        #     self.set_res_dict(res_dict, code=0, msg='homework created')
        # except:
        #     self.set_res_dict(res_dict, code=1, msg='fail to create homework')
        # self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _delete_post(self):
        res_dict={}

        # authority check
        cur_user = await self.get_current_user_object()
        homework = (await self.db.getObject('homeworks', id=self.args['id']))[0]
        course_id = homework['course_id']
        if cur_user['role']<2 or (cur_user['role']==2 and course_id not in cur_user['ta_courses']):
            self.set_res_dict(res_dict, code=1, msg='you are not allowed')
            return res_dict

        await self.db.deleteObject('homeworks', **self.args)
        self.set_res_dict(res_dict, code=0, msg='homework deleted')
        return res_dict
        # try:
        #     await self.deleteObject('homeworks', **self.args)
        #     self.set_res_dict(res_dict, code=0, msg='homework deleted')
        # except:
        #     self.set_res_dict(res_dict, code=1, msg='fail to delete any homework')
        # self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _update_post(self):
        res_dict = {}
        target_homework = (await self.db.getObject('homeworks', cur_user = self.get_current_user_object(), id=self.args['id']))[0]
        # authority check
        cur_user = await self.get_current_user_object()
        if cur_user['role']<3 and target_homework['course_id'] not in cur_user['ta_courses']:
            self.set_res_dict(res_dict, code=1, msg='not authorized')
            return res_dict
        # ---------------------------------------------------------------------
        for key in self.args.keys():
            if key == 'id':
                continue
            target_homework[key] = self.args[key]
        await self.db.saveObject('homeworks', cur_user = self.get_current_user_object(), object=target_homework)
        self.set_res_dict(res_dict, code=0, msg='homework updated')
        return res_dict

        # try:
        #     target_homework = (await self.getObject('homeworks', secure=1, id=self.args['id']))[0]
        #     try:
        #         for key in self.args.keys():
        #             if key == 'id':
        #                 continue
        #             target_homework[key] = self.args[key]
        #         await self.saveObject('homeworks',secure=1, object=target_homework)
        #         self.set_res_dict(res_dict, code=0, msg='homework updated')
        #     except:
        #         self.set_res_dict(res_dict, code=2, msg='update failed')
        #         self.return_json(res_dict)
        #         return
        # except:
        #     self.set_res_dict(res_dict, code=1, msg='homework does not exist')
        # self.return_json(res_dict)

    @tornado.web.authenticated
    async def _query_post(self):
        res_dict={}
        res_list = await self.db.getObject('homeworks', cur_user = self.get_current_user_object(), **self.args)
        cur_user = await self.get_current_user_object()
        for each_res in res_list:
            # authority check
            course = (await self.db.getObject('courses', id=each_res['course_id']))[0]
            if cur_user['role']<3 and cur_user['id'] not in course['tas'] and cur_user['id'] not in course['students']:
                self.set_res_dict(res_dict, code=1, msg='not authorized')
                return res_dict
            # ---------------------------------------------------------------------

            each_res['deadline'] = int(time.mktime(each_res['deadline'].timetuple()))
            if each_res['status'] == 1:
                final_records = self.db.getObject('records',
                                                  cur_user=self.get_current_user_object(),
                                                  homework_id=each_res['id'],
                                                  record_type=2
                                                  )
                all_judged = True
                for each_record in final_records:
                    if each_record['status'] == 0:
                        all_judged = False
                        break
                if all_judged:
                    each_res['status'] = 2
                    await self.db.saveObject('homeworks', object=each_res, cur_user=self.get_current_user_object())
        return res_list

    # @tornado.web.authenticated
    async def _judgeAll_post(self):
        res_dict={}
        homework_to_judge = (await self.db.getObject('homeworks', cur_user=self.get_current_user_object(), **self.args))[0]
        homework_to_judge['status'] = 1
        await self.db.saveObject('homeworks', object=homework_to_judge, cur_user=self.get_current_user_object())
        homework_id = self.args['id']
        final_records = await self.db.getObject('records', cur_user=self.get_current_user_object(), homework_id=homework_id)
        for each_record in final_records:
            problem_of_code = (await self.db.getObject('problems',
                                                       cur_user=self.get_current_user_object(),
                                                       id=each_record['problem_id']))[0]
            str_id = str(each_record['id'])
            record_dir = self.root_dir.replace('homeworks', 'records') + '/' + str_id
            src_language = each_record['src_language']
            if src_language == 1 or src_language == 2 or src_language == 4:
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
                judge_req['Language'] = 'C++'
                judge_req['DATA_DIR'] = os.getcwd() + '/test'
                judge_req['CHECKER_DIR'] = os.getcwd().replace('backend', 'judger') + '/checkers'
                judge_req['CHECKER'] = 'ncmp'
                judge_req['NTESTS'] = 2
                judge_req['SOURCE_FILE'] = str_id
                judge_req['SOURCE_DIR'] = os.getcwd() + '/' + record_dir

                requests.post('http://localhost:12345/traditionaljudger', data=json.dumps(judge_req))
            elif src_language == 3:
                if not os.path.exists('judge_script'):
                    os.makedirs('judge_script')
                judge_req = {}
                judge_req['TIME_LIMIT'] = problem_of_code['time_limit']
                judge_req['MEMORY_LIMIT'] = problem_of_code['memory_limit']
                judge_req['OUTPUT_LIMIT'] = 64
                judge_req['WORK_PATH'] = os.getcwd() + '/judge_script'
                judge_req['SOURCE_PATH'] = os.getcwd() + '/' + record_dir
                judge_req['SOURCE'] = str_id
                judge_req['OTHERS'] = os.getcwd() + 'judge_script/fake-node/fake-node-linux ' + 'test.js ' + str_id + '.code'

                requests.post('http://localhost:12345/scriptjudger', data=json.dumps(judge_req))

        self.set_res_dict(res_dict, code=0, msg='homework judging')
        return res_dict

    # @tornado.web.authenticated
    async def _submitable_post(self):
        res_dict = {}
        cur_user = await self.get_current_user_object()
        target_homework = (await self.db.getObject('homeworks', id=self.args['homework_id']))[0]
        # authority check
        if target_homework['course_id'] not in cur_user['ta_courses'] and cur_user['role']<3:
            self.set_res_dict(res_dict, code=1, msg='you are not authorized')
            return res_dict
        # ---------------------------------------------------------------------
        target_homework['submitable']=self.args['submitable']
        self.db.saveObject('homeworks', object=target_homework)
        self.set_res_dict(res_dict, code=0, msg='submitable changed')

    # @tornado.web.authenticated
    async def _scoreOpenness_post(self):
        res_dict = {}
        cur_user = await self.get_current_user_object()
        target_homework = (await self.db.getObject('homeworks', id=self.args['homework_id']))[0]
        # authority check
        if target_homework['course_id'] not in cur_user['ta_courses'] and cur_user['role'] < 3:
            self.set_res_dict(res_dict, code=1, msg='you are not authorized')
            return res_dict
        # ---------------------------------------------------------------------
        target_homework['score_openness'] = self.args['score_openness']
        self.db.saveObject('homeworks', object=target_homework)
        self.set_res_dict(res_dict, code=0, msg='score_openness changed')

