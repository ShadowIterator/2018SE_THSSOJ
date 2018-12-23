import unittest
import tornado.testing
from basetestcase.basetestcase import BaseTestCase, async_aquire_db
from apis.base import print_test, print_debug
from apis.base import Roles
import subprocess
import uuid
import shutil
import os
import datetime
import zipfile
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

    def setUp(self):
        super().setUp()
        self.fakejudge = subprocess.Popen(['./venv/bin/python', 'fake_judger.py'])

    def tearDown(self):
        super().tearDown()
        self.fakejudge.kill()


    async def create_problem_0(self):
        # path_src = '''{dir}{file_name}'''.format(dir = self.problem0_io['dir'], file_name = self.problem0_io['std_correct'])
        # std_correct_filename = str(uuid.uuid1())+'.code'
        # path_tar = '''{dir}{file_name}'''.format(dir = self.tmp_dir, file_name = std_correct_filename)
        # shutil.copyfile(path_src, path_tar)
        # # copy data to
        # path_src = '''{dir}{file_name}'''.format(dir = self.problem0_io['dir'], file_name = self.problem0_io['data_zip'])
        # data_filename = str(uuid.uuid1())+'.zip'
        # path_tar = '''{dir}{file_name}'''.format(dir = self.tmp_dir, file_name = data_filename)
        # shutil.copyfile(path_src, path_tar)

        problem_param = {
            'title': 'hfz导论xhz',
            'description': 'prepare_0',
            'time_limit': 1000,
            'memory_limit': 123456,
            'judge_method': 0,
            'language': [Languages.CPP],
            'openness': 1,
            'user_id': self.user_ta1['id'],
            'test_language': Languages.CPP,
            'ratio_one': 20,
            'ratio_one_limit': 10,
            'ratio_two': 50,
            'ratio_two_limit': 5,
            'ratio_three': 80,
            'ratio_three_limit': 2,
            'status': 1,
        }
        self.problem_0_ta1 = await self.problemTable.createObject(**problem_param)
        problem_dir = '''{dir}{problem_id}/'''.format(dir = self.problem_dir, problem_id = self.problem_0_ta1['id'])
        # case-zip
        path_src = '''{dir}{file_name}'''.format(dir = self.problem0_io['dir'], file_name = self.problem0_io['data_zip'])
        path_tar = '''{dir}case/{file_name}.zip'''.format(dir = problem_dir, file_name = self.problem_0_ta1['id'])
        dir_tar = '''{dir}case/'''.format(dir = problem_dir, dir_name = self.problem_0_ta1['id'])
        if not os.path.exists(dir_tar):
            os.makedirs(dir_tar)
        file_zip = zipfile.ZipFile(path_src)
        file_zip.extractall(dir_tar)
        shutil.copyfile(path_src, path_tar)
        # code
        path_src = '''{dir}{file_name}'''.format(dir=self.problem0_io['dir'], file_name=self.problem0_io['std_correct'])
        path_tar = '''{dir}code/{file_name}.code'''.format(dir=problem_dir, file_name=self.problem_0_ta1['id'])
        dir_tar = '''{dir}code/'''.format(dir=problem_dir, dir_name=self.problem_0_ta1['id'])
        if not os.path.exists(dir_tar):
            os.makedirs(dir_tar)
        shutil.copyfile(path_src, path_tar)
        # handle description
        path_tar = '''{dir}/{file_name}.code'''.format(dir=problem_dir, file_name=self.problem_0_ta1['id'])
        with open(path_tar, 'w') as fd:
            fd.write(problem_param['description'])

        record_param = {
            'user_id': self.problem_0_ta1['user_id'],
            'problem_id': self.problem_0_ta1['id'],
            'record_type': RecordTypes.STD,
            'result_type': self.problem_0_ta1['judge_method'],
            'test_ratio':100,
            'src_language': self.problem_0_ta1['language'][0],
            'src_size': 100
        }
        record_created = await self.recordTable.createObject(**record_param)


        path_src = '''{dir}{file_name}'''.format(dir=self.problem0_io['dir'], file_name=self.problem0_io['std_correct'])
        dir_tar = '''{root_dir}records/{dir_name}/'''.format(root_dir = self.root_dir, dir_name=self.problem_0_ta1['id'])
        path_tar = '''{dir}{file_name}.code'''.format(dir=dir_tar, file_name=self.problem_0_ta1['id'])

        if not os.path.exists(dir_tar):
            os.makedirs(dir_tar)
        shutil.copyfile(path_src, path_tar)

        response = await self.post_request_return_object(self.returnresult_url,
                                                         id=record_created['id'],
                                                         res={
                                                             'Result': 'Accept',
                                                             'time': 12,
                                                             'memory': 123,
                                                             'Info': 'ok',
                                                         },
                                                         secret=options.judgerSecret)
        self.assertEqual(0, response['code'])




    async def prepare(self):
        self.url = '/api/problem'
        self.returnresult_url = '/api/record/returnresult'

        self.course_published = await self.db.createObject('courses',
                                                            name='hfz de anothoer 课程',
                                                            description='laidfjladfeisd',
                                                            course_spell='13ijlaf',
                                                            status = 1,
                                                            start_time = datetime.datetime.fromtimestamp(123242),
                                                            end_time = datetime.datetime.fromtimestamp(12232443))



        self.user_hfz = await self.db.createObject('users', username='hfz', password='4321', email='hfz@hfz.com',
                                                   role=0, secret='1314')
        self.user_st1 = await self.db.createObject('users', username='student1', password='student',
                                                   email='hfz@hfz.com', role=Roles.STUDENT, secret='1343',
                                                   student_courses=[self.course_published['id']])
        self.user_st2 = await self.db.createObject('users', username='student2', password='student',
                                                   email='hfz@hfz.com', role=Roles.STUDENT, secret='1343',
                                                   student_courses=[self.course_published['id']])
        self.user_st3 = await self.db.createObject('users', username='student3', password='student',
                                                   email='hfz@hfz.com', role=Roles.STUDENT, secret='1343', )
        self.user_ta1 = await self.db.createObject('users', username='ta1', password='ta', email='hfz@hfz.com',
                                                   role=Roles.TA, secret='1343',
                                                   ta_courses=[self.course_published['id']])
        self.user_ta2 = await self.db.createObject('users', username='ta2', password='ta', email='hfz@hfz.com',
                                                   role=Roles.TA, secret='1343',
                                                   ta_courses=[self.course_published['id']])
        self.user_ta3 = await self.db.createObject('users', username='ta3', password='ta', email='hfz@hfz.com',
                                                   role=Roles.TA, secret='1343')
        try:
            self.user_admin = await self.db.getObjectOne('users', username = 'admin', role = Roles.ADMIN)
        except:
            self.user_admin = await self.db.createObject('users', username = 'admin', password = '1234', email = 'hfz@hfz.com', role = Roles.ADMIN, secret = '1343')

        self.course_published['students'] = [self.user_st1['id'], self.user_st2['id']]
        self.course_published['tas'] = [self.user_ta1['id'], self.user_ta2['id']]

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
        await self.create_problem_0()

    async def done(self):
     # if os.path.exists(self.tmp_dir):
     #     shutil.rmtree(self.tmp_dir)
     # if os.path.exists(self.problem_dir):
     #     shutil.rmtree(self.problem_dir)
        pass
    @async_aquire_db
    async def test_prepare(self):
        pass

    @async_aquire_db
    async def test_search(self):
        uri = self.url + '/search'
        p1 = await self.db.createObject('problems', title = 'xhfz111', openness = 1)
        p2 =await self.db.createObject('problems', title = 'HTML1', openness = 1)
        p3 =await self.db.createObject('problems', title = 'xhfzHTML', openness = 1)
        p4 =await self.db.createObject('problems', title = 'HTMHXFLZ', openness = 1)
        p5 =await self.db.createObject('problems', title = 'HTML_XHFZ', openness = 0)
        p6 =await self.db.createObject('problems', title = '中文题目', openness = 1)
        p7 =await self.db.createObject('problems', title = '日本語の問題', openness = 1)

        await self.login(username = 'hfz', password = '4321')

        response = self.getbodyObject(await self.post_request(uri,
                                                              keywords = '  xhfz  の HTML 题目'))
        self.assertEqual(5, len(response))
        for res in response:
            # print_test(res)
            self.assertEqual(res['openness'], 1)
            self.assertIn(res['id'], [p1['id'], p2['id'], p3['id'], p6['id'], p7['id']])


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
            'title': str(uuid.uuid1()),
            'description': 'test_create_0',
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
        response = await self.post_request_return_object(self.returnresult_url,
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

    @async_aquire_db
    async def test_update_0(self):
        """
        test: update: no case_uri or code_uri, success
        :return:
        """

        uri = self.url + '/update'
        await self.login_object(self.user_ta1)
        tar_problem = self.problem_0_ta1
        modify_param = {
            'id': tar_problem['id'],
            'title': str(uuid.uuid1()),
            'description': 'dlaifjleiajl23431324few',
            'time_limit': 1108,
            'memory_limit': 123456,
        }
        response = await self.post_request_return_object(uri, **modify_param)
        self.assertEqual(0, response['code'])
        problem_after_post = await self.problemTable.getObject(id = tar_problem['id'])
        self.assertIsInstance(problem_after_post, list)
        self.assertEqual(1, len(problem_after_post))
        problem_after_post = problem_after_post[0]
        self.assertEqual(modify_param['time_limit'], problem_after_post['time_limit'])
        self.assertEqual(modify_param['title'], problem_after_post['title'])


    @async_aquire_db
    async def test_update_1(self):
        """
        test: no case_uri or code_uri, failed: permission
        :return:
        """

        uri = self.url + '/update'
        await self.login_object(self.user_ta2)
        tar_problem = self.problem_0_ta1
        modify_param = {
            'id': tar_problem['id'],
            'title': str(uuid.uuid1()),
            'description': 'dlaifjleiajl23431324few',
            'time_limit': 1108,
            'memory_limit': 123456,
        }

        response = await self.post_request_return_object(uri, **modify_param)
        self.assertEqual(1, response['code'])
        problem_after_post = await self.problemTable.getObject(id = tar_problem['id'])
        self.assertIsInstance(problem_after_post, list)
        self.assertEqual(1, len(problem_after_post))
        problem_after_post = problem_after_post[0]
        self.assertNotEqual(modify_param['time_limit'], problem_after_post['time_limit'])
        self.assertNotEqual(modify_param['title'], problem_after_post['title'])

    @async_aquire_db
    async def test_update_2(self):
        """
        test: post with case_uri, should rejudge, update problem_status
        :return:
        """
        print_test('test_update_2')
        uri = self.url + '/update'
        await self.login_object(self.user_ta1)
        tar_problem = self.problem_0_ta1

        # copy std_correct to
        path_src = '''{dir}{file_name}'''.format(dir = self.problem0_io['dir'], file_name = self.problem0_io['std_wrong'])
        std_wrong_filename = str(uuid.uuid1())+'.code'
        path_tar = '''{dir}{file_name}'''.format(dir = self.tmp_dir, file_name = std_wrong_filename)
        shutil.copyfile(path_src, path_tar)
        # copy data to
        path_src = '''{dir}{file_name}'''.format(dir = self.problem0_io['dir'], file_name = self.problem0_io['data_zip'])
        data_filename = str(uuid.uuid1())+'.zip'
        path_tar = '''{dir}{file_name}'''.format(dir = self.tmp_dir, file_name = data_filename)
        shutil.copyfile(path_src, path_tar)

        modify_param = {
            'id': tar_problem['id'],
            'title': str(uuid.uuid1()),
            'description': 'dl3431324few',
            'time_limit': 1108,
            'memory_limit': 123456,
            'case_uri': 'tmp/' + data_filename,
        }
        response = await self.post_request_return_object(uri, **modify_param)
        self.assertEqual(0, response['code'])
        problem_after_post = await self.problemTable.getObject(id=tar_problem['id'])
        self.assertIsInstance(problem_after_post, list)
        self.assertEqual(1, len(problem_after_post))
        problem_after_post = problem_after_post[0]
        self.assertEqual(modify_param['time_limit'], problem_after_post['time_limit'])
        self.assertEqual(modify_param['title'], problem_after_post['title'])

        tar_record = await self.recordTable.getObject(problem_id = tar_problem['id'], record_type = RecordTypes.STD)
        self.assertIsInstance(tar_record, list)
        self.assertEqual(1, len(tar_record))
        tar_record = tar_record[0]

        response = await self.post_request_return_object(self.returnresult_url,
                                                         id=tar_record['id'],
                                                         res={
                                                             'Result': 'Wrong Answer',
                                                             'time': 12,
                                                             'memory': 123,
                                                             'Info': 'ok',
                                                         },
                                                         secret=options.judgerSecret)
        problem_after_judge = await self.problemTable.getObject(id = tar_problem['id'])
        self.assertIsInstance(problem_after_judge, list)
        self.assertEqual(1, len(problem_after_judge))
        problem_after_judge = problem_after_judge[0]
        self.assertEqual(0, problem_after_judge['status'])

    @async_aquire_db
    async def test_update_3(self):
        """
        test: post with code_uri, should rejudge, update problem_status
        :return:
        """
        print_test('test_update_3')
        uri = self.url + '/update'
        await self.login_object(self.user_ta1)
        tar_problem = self.problem_0_ta1

        # copy std_correct to
        path_src = '''{dir}{file_name}'''.format(dir = self.problem0_io['dir'], file_name = self.problem0_io['std_wrong'])
        std_wrong_filename = str(uuid.uuid1())+'.code'
        path_tar = '''{dir}{file_name}'''.format(dir = self.tmp_dir, file_name = std_wrong_filename)
        shutil.copyfile(path_src, path_tar)
        # copy data to
        path_src = '''{dir}{file_name}'''.format(dir = self.problem0_io['dir'], file_name = self.problem0_io['data_zip'])
        data_filename = str(uuid.uuid1())+'.zip'
        path_tar = '''{dir}{file_name}'''.format(dir = self.tmp_dir, file_name = data_filename)
        shutil.copyfile(path_src, path_tar)

        modify_param = {
            'id': tar_problem['id'],
            'title': str(uuid.uuid1()),
            'description': 'dl3431324few',
            'time_limit': 1108,
            'memory_limit': 123456,
            'code_uri': 'tmp/' + std_wrong_filename,
        }
        response = await self.post_request_return_object(uri, **modify_param)
        self.assertEqual(0, response['code'])
        problem_after_post = await self.problemTable.getObject(id=tar_problem['id'])
        self.assertIsInstance(problem_after_post, list)
        self.assertEqual(1, len(problem_after_post))
        problem_after_post = problem_after_post[0]
        self.assertEqual(modify_param['time_limit'], problem_after_post['time_limit'])
        self.assertEqual(modify_param['title'], problem_after_post['title'])

        tar_record = await self.recordTable.getObject(problem_id = tar_problem['id'], record_type = RecordTypes.STD)
        self.assertIsInstance(tar_record, list)
        self.assertEqual(1, len(tar_record))
        tar_record = tar_record[0]

        response = await self.post_request_return_object(self.returnresult_url,
                                                         id=tar_record['id'],
                                                         res={
                                                             'Result': 'Wrong Answer',
                                                             'time': 12,
                                                             'memory': 123,
                                                             'Info': 'ok',
                                                         },
                                                         secret=options.judgerSecret)
        problem_after_judge = await self.problemTable.getObject(id = tar_problem['id'])
        self.assertIsInstance(problem_after_judge, list)
        self.assertEqual(1, len(problem_after_judge))
        problem_after_judge = problem_after_judge[0]
        self.assertEqual(0, problem_after_judge['status'])

    @async_aquire_db
    async def test_submit_0(self):
        print_test('test_submit_0:')
        uri = self.url + '/submit'
        cur_user = self.user_st1
        tar_problem = self.problem_0_ta1
        await self.login_object(cur_user)
        request_param = {
            'user_id': cur_user['id'],
            'problem_id': tar_problem['id'],
            'record_type': RecordTypes.PUBLIC,
            'src_code': 'hello,world',
            'src_language': Languages.CPP,
            'test_ratio': 3,
        }
        response = await self.post_request_return_object(uri, **request_param)
        self.assertEqual(0, response['code'])
        record_after_post = await self.recordTable.getObject(**request_param)
        self.assertIsInstance(record_after_post, list)
        self.assertEqual(1, len(record_after_post))
        record_after_post = record_after_post[0]
        response = await self.post_request_return_object(self.returnresult_url,
                                                         id = record_after_post['id'],
                                                         res = {
                                                             'Result': 'Accept',
                                                             'time': 12,
                                                             'memory': 123,
                                                             'Info': 'ok',
                                                         },
                                                         secret = options.judgerSecret)
        record_after_judge = await self.recordTable.getObjectOne(id = record_after_post['id'])
        print_test('record after judge: ', record_after_judge)
        print_test('len ratio table:', len(await self.db.all('ratios')))
