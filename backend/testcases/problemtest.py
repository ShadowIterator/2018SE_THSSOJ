import unittest
import tornado.testing
from basetestcase.basetestcase import BaseTestCase, async_aquire_db
from apis.base import print_test, print_debug
from apis.base import Roles
import subprocess
import uuid
import shutil
import os
from tornado.options import options, define
define('judgerSecret', default='no_secret', help='secret', type=str)

class Languages:
    C = 1
    CPP = 2
    JAVASCRIPT = 3
    PYTHON = 4

class RecordTypes:
    PUBLIC = 0
    TEST = 1
    SUBMIT = 2
    STD = 3
    HTML = 4

class ProblemTestCase(BaseTestCase):

    async def prepare(self):
        self.url = '/api/problem'
        self.user_hfz = await self.db.createObject('users', username='hfz', password='4321', email='hfz@hfz.com',
                                                   role=0, secret='1314')
        self.user_st1 = await self.db.createObject('users', username='student1', password='student',
                                                   email='hfz@hfz.com', role=Roles.STUDENT, secret='1343',
                                                   student_courses=[])
        self.user_st2 = await self.db.createObject('users', username='student2', password='student',
                                                   email='hfz@hfz.com', role=Roles.STUDENT, secret='1343',
                                                   student_courses=[])
        self.user_st3 = await self.db.createObject('users', username='student3', password='student',
                                                   email='hfz@hfz.com', role=Roles.STUDENT, secret='1343', )
        self.user_ta1 = await self.db.createObject('users', username='ta1', password='ta', email='hfz@hfz.com',
                                                   role=Roles.TA, secret='1343',
                                                   ta_courses=[])
        self.user_ta2 = await self.db.createObject('users', username='ta2', password='ta', email='hfz@hfz.com',
                                                   role=Roles.TA, secret='1343',
                                                   ta_courses=[])
        self.user_ta3 = await self.db.createObject('users', username='ta3', password='ta', email='hfz@hfz.com',
                                                   role=Roles.TA, secret='1343')
        try:
            self.user_admin = await self.db.getObjectOne('users', username = 'admin')
        except:
            self.user_admin = await self.db.createObject('users', username = 'admin', password = '1234', email = 'hfz@hfz.com', role = Roles.ADMIN, secret = '1343')

        self.tmp_dir = '''{root_dir}tmp/'''.format(root_dir = self.root_dir)
        self.problem_dir = '''{root_dir}problems/'''.format(root_dir = self.root_dir)

        self.problem0_io = {
            'dir': self.root_dir + 'problem_test_files/' + 'test_create_0/',
            'std_correct': 'std_correct.c',
            'std_wrong': 'std_wrong.c',
            'data_zip': 'data.zip',
        }
        if not os.path.exists(self.tmp_dir):
            os.makedirs(self.tmp_dir)
        if not os.path.exists(self.problem_dir):
            os.makedirs((self.problem_dir))

        self.problemTable = self.db.getTable('problems')
        self.homeworkTable = self.db.getTable('homeworks')
        self.courseTable = self.db.getTable('courses')
        self.recordTable = self.db.getTable('records')


    async def done(self):
     # if os.path.exists(self.tmp_dir):
     #     shutil.rmtree(self.tmp_dir)
     # if os.path.exists(self.problem_dir):
     #     shutil.rmtree(self.problem_dir)
        pass

    @async_aquire_db
    async def test_search(self):
        uri = self.url + '/search'
        await self.db.createObject('problems', title = 'hfz111', openness = 1)
        await self.db.createObject('problems', title = 'HTML1', openness = 1)
        await self.db.createObject('problems', title = 'hfzHTML', openness = 1)
        await self.db.createObject('problems', title = 'HTMHFLZ', openness = 1)
        await self.db.createObject('problems', title = 'HTML_HFZ', openness = 0)
        await self.db.createObject('problems', title = '中文题目', openness = 1)
        await self.db.createObject('problems', title = '日本語の問題', openness = 1)

        await self.login(username = 'hfz', password = '4321')

        response = self.getbodyObject(await self.post_request(uri,
                                                              keywords = '  hfz  の HTML 题目'))
        self.assertEqual(5, len(response))
        for res in response:
            # print_test(res)
            self.assertEqual(res['openness'], 1)
            self.assertIn(res['id'], [1, 2, 3, 6, 7])


    @async_aquire_db
    async def test_create_0(self):
        """
        test: create normal io problem
        :return:
        """
        uri = self.url + '/create'
        cur_user = self.user_ta1
        await self.login_object(cur_user)
        # copy std_correct to
        path_src = '''{dir}{file_name}'''.format(dir = self.problem0_io['dir'], file_name = self.problem0_io['std_correct'])
        std_correct_filename = str(uuid.uuid1())+'.code'
        path_tar = '''{dir}{file_name}'''.format(dir = self.tmp_dir, file_name = std_correct_filename)
        shutil.copyfile(path_src, path_tar)
        # copy data to
        path_src = '''{dir}{file_name}'''.format(dir = self.problem0_io['dir'], file_name = self.problem0_io['data_zip'])
        data_filename = str(uuid.uuid1())+'.zip'
        path_tar = '''{dir}{file_name}'''.format(dir = self.tmp_dir, file_name = data_filename)
        shutil.copyfile(path_src, path_tar)
        request_param = {
            'title': 'hfz导论',
            'description': 'dlaifjleiajlfew',
            'time_limit': 1000,
            'memory_limit': 123456,
            'judge_method': 0,
            'language': [Languages.CPP],
            'openness': 1,
            'user_id': cur_user['id'],
            'code_uri': 'tmp/' + std_correct_filename,
            'case_uri': 'tmp/' + data_filename,
            'test_language': Languages.CPP,
            'ratio_one': 20,
            'ratio_one_limit': 10,
            'ratio_two': 50,
            'ratio_two_limit': 5,
            'ratio_three': 80,
            'ratio_three_limit': 2,
        }
        response = await self.post_request_return_object(uri, **request_param)
        self.assertEqual(0, response['code'])
        problem_after_post = await self.problemTable.getObject(title = request_param['title'])
        self.assertIsInstance(problem_after_post, list)
        self.assertEqual(1, len(problem_after_post))
        problem_after_post = problem_after_post[0]
        self.assertEqual(0, problem_after_post['status'])
        record_after_post = await self.recordTable.getObject(problem_id = problem_after_post['id'], record_type = RecordTypes.STD)
        self.assertIsInstance(record_after_post, list)
        self.assertEqual(1, len(record_after_post))
        record_after_post = record_after_post[0]
        response = await self.post_request_return_object('/api/record/returnresult',
                                                         id = record_after_post['id'],
                                                         res = {
                                                             'Result': 'Accept',
                                                             'time': 12,
                                                             'memory': 123,
                                                             'Info': 'ok',
                                                         },
                                                         secret = options.judgerSecret)
        self.assertEqual(0, response['code'])
        problem_after_judge = await self.problemTable.getObject(id = problem_after_post['id'])
        self.assertEqual(1, len(problem_after_judge))
        problem_after_judge = problem_after_judge[0]
        self.assertEqual(1, problem_after_judge['status'])