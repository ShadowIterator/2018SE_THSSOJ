import unittest
import tornado.testing
import datetime
import time
import os
import json
import shutil
from ..basetestcase.basetestcase import BaseTestCase, async_aquire_db
from ..apis.base import print_test, print_debug
from ..apis.base import Roles

class RecordTestCase(BaseTestCase):
    async def prepare(self):
        self.url = '/api/record'
        student1 = await self.db.createObject('users', username='hfz', password='4321', email='hfz@hfz.com', role=Roles.STUDENT)
        student2 = await self.db.createObject('users', username='nx', password='myq', role=Roles.STUDENT)
        ta1 = await self.db.createObject('users', username='zjl', password='ibtfy', email='sh@sina.com', role=Roles.TA, ta_courses=[1])
        ta2 = await self.db.createObject('users', username='wzy', password='9897', role=Roles.TA)
        # await self.db.createObject('users', username='admin', password='1234', email='hfz@hfz.com', role=Roles.ADMIN)

        await self.db.createObject('courses', name='泽学', tas=[ta1['id']], students=[student1['id'], student2['id']], status=1, homeworks=[1,2])
        await self.db.createObject('courses', name='母猪的产后护理', tas=[ta2['id']], students=[student2['id']], status=1, homeworks=[3])

        await self.db.createObject('problems',
                                   title='hfz111',
                                   openness=1,
                                   user_id=ta1['id'],
                                   ratio_one=20,
                                   ratio_two=30,
                                   ratio_three=50)
        await self.db.createObject('problems', title='hfzHTML', openness=0, user_id=ta1['id'])
        await self.db.createObject('problems', title='zsdjt', openness=1, user_id=ta2['id'])
        await self.db.createObject('problems', title='zsxjt', openness=0, user_id=ta2['id'])

        await self.db.createObject('homeworks',
                                   name='first',
                                   deadline=datetime.datetime.fromtimestamp(10000),
                                   problems=[1,2],
                                   course_id=1)
        await self.db.createObject('homeworks',
                                   name='second',
                                   deadline=datetime.datetime.fromtimestamp(10000),
                                   problems=[1, 2],
                                   course_id=1,
                                   score_openness=0
                                   )
        await self.db.createObject('homeworks',
                                   name='first',
                                   deadline=datetime.datetime.fromtimestamp(10000),
                                   problems=[1, 2],
                                   course_id=2,
                                   score_openness=0)

    @async_aquire_db
    async def test_create(self):
        uri = self.url+'/create'
        admin = await self.db.getObjectOne('users', username='admin')
        ta = await self.db.getObjectOne('users', username='zjl')
        # fail
        await self.login_object(ta)
        response = self.getbodyObject(await self.post_request(uri,
                                                              user_id=admin['id'],
                                                              problem_id=1))
        self.assertEqual(1, response['code'])
        await self.logout_object(ta)
        # pass
        await self.login_object(admin)
        response = self.getbodyObject(await self.post_request(uri,
                                                              user_id=admin['id'],
                                                              problem_id=1,
                                                              record_type=0))
        records = await self.db.getObject('records', user_id=admin['id'])
        self.assertEqual(0, response['code'])
        self.assertEqual(1, len(records))

    @async_aquire_db
    async def test_delete(self):
        uri = self.url + '/delete'
        admin = await self.db.getObjectOne('users', username='admin')
        ta = await self.db.getObjectOne('users', username='zjl')
        record = await self.db.createObject('records',
                                            record_type=0,
                                            user_id=ta['id'])
        # fail
        await self.login_object(ta)
        response = self.getbodyObject(await self.post_request(uri,
                                                              id=record['id']))
        left = await self.db.getObject('records',
                                       id=record['id'])
        self.assertEqual(1, len(left))
        self.assertEqual(1, response['code'])
        await self.logout_object(ta)
        # pass
        await self.login_object(admin)
        response = self.getbodyObject(await self.post_request(uri,
                                                              id=record['id']))
        left = await self.db.getObject('records',
                                       id=record['id'])
        self.assertEqual(0, response['code'])
        self.assertEqual(0, len(left))

    @async_aquire_db
    async def test_query(self):
        uri = self.url+'/query'
        admin = await self.db.getObjectOne('users', username='admin')
        ta = await self.db.getObjectOne('users', username='zjl')
        ta2 = await self.db.getObjectOne('users', username='wzy')
        problem1 = await self.db.getObjectOne('problems', title='hfz111')
        problem2 = await self.db.getObjectOne('problems', title='zsxjt')
        student = await self.db.getObjectOne('users', username='hfz')
        student2 = await self.db.getObjectOne('users', username='nx')


        record1 = await self.db.createObject('records',
                                             record_type=0,
                                             user_id=student['id'])

        record2 = await self.db.createObject('records',
                                             record_type=0,
                                             user_id=ta['id'])

        record3= await self.db.createObject('records',
                                            record_type=1,
                                            user_id=student['id'],
                                            homework_id=1,
                                            problem_id=1,
                                            test_ratio=2,
                                            result_type=0
                                            )

        record4 = await self.db.createObject('records',
                                             record_type=2,
                                             user_id=student['id'],
                                             problem_id=1,
                                             homework_id=1,
                                             score=100)

        record5 = await self.db.createObject('records',
                                             record_type=2,
                                             user_id=student['id'],
                                             problem_id=1,
                                             homework_id=2,
                                             time_consume=500,
                                             score=100,
                                             result=0)

        record6 = await self.db.createObject('records',
                                             record_type=3,
                                             user_id=ta['id'],
                                             problem_id=problem1['id'])

        record7 = await self.db.createObject('records',
                                             record_type=3,
                                             user_id=ta2['id'],
                                             problem_id=problem2['id'])

        record8 = await self.db.createObject('records',
                                             record_type=4,
                                             user_id=student2['id'],
                                             problem_id=2,
                                             homework_id=3,
                                             score=90)

        temp_config = {'NTESTS':10}
        target_path = os.getcwd()+'/root/problems/'+str(problem1['id'])+'/case'
        if not os.path.exists(target_path):
            os.makedirs(target_path)
        config_file = open(target_path+'/config.json', mode='w')
        json.dump(temp_config, config_file)
        config_file.close()

        # pass student check public records
        await self.login_object(student)
        response = self.getbodyObject(await self.post_request(uri,
                                                              record_type=0))
        user_id_list = [record['user_id'] for record in response]
        self.assertIsInstance(response, list)
        self.assertEqual(1, len(response))
        self.assertIn(student['id'], user_id_list)
        # pass student check normal course test record
        response = self.getbodyObject(await self.post_request(uri,
                                                              record_type=1))
        self.assertIsInstance(response, list)
        self.assertEqual(1, len(response))
        self.assertEqual(3, response[0]['test_ratio'])
        # pass student check official open record
        response = self.getbodyObject(await self.post_request(uri,
                                                              record_type=2,
                                                              homework_id=1))
        self.assertIsInstance(response, list)
        self.assertEqual(1, len(response))
        self.assertIn('score', response[0])
        # pass student check official concealed record
        response = self.getbodyObject(await self.post_request(uri,
                                                              record_type=2,
                                                              homework_id=2))
        self.assertIsInstance(response, list)
        self.assertEqual(1, len(response))
        self.assertNotIn('time_consume', response[0])
        self.assertNotIn('result', response[0])
        # pass student check standard record
        response = self.getbodyObject(await self.post_request(uri,
                                                              record_type=3))
        self.assertIsInstance(response, list)
        self.assertEqual(0, len(response))

        await self.logout_object(student)
        # pass student check html record
        await self.login_object(student2)
        response = self.getbodyObject(await self.post_request(uri,
                                                              record_type=4,
                                                              homework_id=3))
        self.assertIsInstance(response, list)
        self.assertEqual(1, len(response))
        await self.logout_object(student2)
        # pass ta check public record
        await self.login_object(ta)
        response = self.getbodyObject(await self.post_request(uri,
                                                              record_type=0))
        user_id_list = [record['user_id'] for record in response]
        self.assertIsInstance(response, list)
        self.assertEqual(1, len(response))
        self.assertIn(ta['id'], user_id_list)
        # pass ta check course records
        response = self.getbodyObject(await self.post_request(uri,
                                                              homework_id=1))
        self.assertIsInstance(response, list)
        self.assertEqual(2, len(response))
        # pass ta check concealed course record
        response = self.getbodyObject(await self.post_request(uri,
                                                              homework_id=2))
        self.assertIsInstance(response, list)
        self.assertIn('result', response[0])
        # pass ta check standard record
        response = self.getbodyObject(await self.post_request(uri,
                                                              record_type=3))
        self.assertIsInstance(response, list)
        self.assertEqual(1, len(response))

        await self.logout_object(ta)

        # pass admin check record
        await self.login_object(admin)
        response = self.getbodyObject(await self.post_request(uri,
                                                              user_id=student['id']))
        self.assertIsInstance(response, list)
        self.assertEqual(4, len(response))

        shutil.rmtree(target_path)

    @async_aquire_db
    async def test_srccode(self):
        uri=self.url+'/srcCode'
        srccode='include<stdio.h>'
        admin = await self.db.getObjectOne('users', username='admin')
        ta = await self.db.getObjectOne('users', username='zjl')
        student = await self.db.getObjectOne('users', username='hfz')
        student2 = await self.db.getObjectOne('users', username='nx')

        record1 = await self.db.createObject('records',
                                             record_type=1,
                                             user_id=student['id'],
                                             homework_id=1,
                                             problem_id=1,
                                             test_ratio=2,
                                             result_type=0
                                             )
        path = '{}/root/records/{}'.format(os.getcwd(), record1['id'])
        code_path = '{}/{}.code'.format(path, record1['id'])
        if not os.path.exists(path):
            os.makedirs(path)
        code_file = open(code_path, 'w')
        code_file.write(srccode)
        code_file.close()
        # fail student check other srccode
        await self.login_object(student2)
        response = self.getbodyObject(await self.post_request(uri,
                                                              id=record1['id']))
        self.assertEqual(1, response['code'])
        # pass student check
        await self.login_object(student)
        response = self.getbodyObject(await self.post_request(uri,
                                                              id=record1['id']))
        self.assertEqual(srccode, response['src_code'])
        # pass ta check
        await self.login_object(ta)
        response = self.getbodyObject(await self.post_request(uri,
                                                              id=record1['id']))
        self.assertEqual(srccode, response['src_code'])
        # pass admin check
        await self.login_object(admin)
        response = self.getbodyObject(await self.post_request(uri,
                                                              id=record1['id']))
        self.assertEqual(srccode, response['src_code'])

        shutil.rmtree(path)

        record2 = await self.db.createObject('records',
                                             record_type=1,
                                             user_id=student2['id'],
                                             homework_id=3,
                                             problem_id=1,
                                             test_ratio=2,
                                             result_type=0
                                             )
        path = '{}/root/records/{}'.format(os.getcwd(), record2['id'])
        code_path = '{}/{}.code'.format(path, record2['id'])
        if not os.path.exists(path):
            os.makedirs(path)
        code_file = open(code_path, 'w')
        code_file.write(srccode)
        code_file.close()

        # fail ta check srccode in other course
        await self.login_object(ta)
        response = self.getbodyObject(await self.post_request(uri,
                                                              id=record1['id']))
        self.assertEqual(1, response['code'])

        shutil.rmtree(path)
