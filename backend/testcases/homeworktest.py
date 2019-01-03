import unittest
import tornado.testing
import datetime
import time
from basetestcase.basetestcase import BaseTestCase, async_aquire_db
from apis.base import print_test, print_debug
from apis.base import Roles

class HomeworkTestCase(BaseTestCase):
    async def prepare(self):
        self.url = '/api/homework'
        self.student1_hfz = await self.createUser('users', username='hfz', password='4321', email='hfz@hfz.com', role=Roles.STUDENT)
        self.student2_nx = await self.createUser('users', username='nx', password='myq', role=Roles.STUDENT)
        self.ta1_zjl = await self.createUser('users', username='zjl', password='ibtfy', email='sh@sina.com', role=Roles.TA, ta_courses=[1])
        self.ta2_wzh = await self.createUser('users', username='wzy', password='9897', role=Roles.TA)
        # await self.db.createObject('users', username='admin', password='1234', email='hfz@hfz.com', role=Roles.ADMIN)

        await self.db.createObject('courses', name='泽学', tas=[self.ta1_zjl['id']], students=[self.student1_hfz['id']], status=1)
        await self.db.createObject('courses', name='母猪的产后护理', tas=[self.ta2_wzh['id']], students=[self.student1_hfz['id']], status=1)

        await self.db.createObject('problems', title='hfz111', openness=1, user_id=self.ta1_zjl['id'])
        await self.db.createObject('problems', title='hfzHTML', openness=0, user_id=self.ta1_zjl['id'])
        await self.db.createObject('problems', title='zsdjt', openness=1, user_id=self.ta2_wzh['id'])
        await self.db.createObject('problems', title='zsxjt', openness=0, user_id=self.ta2_wzh['id'])

    @async_aquire_db
    async def test_create(self):
        uri = self.url+'/create'

        # pass
        ta = self.ta1_zjl #await self.db.getObjectOne('users', username='zjl')
        await self.login(username='zjl', password='ibtfy')
        response = self.getbodyObject(await self.post_request(uri,
                                                             name='hello world',
                                                             description='not necessary',
                                                             deadline=10000,
                                                             problems=[1],
                                                             course_id=1))
        self.assertEqual(response['code'], 0)
        homework = await self.db.getObjectOne('homeworks', name='hello world')
        course = await self.db.getObjectOne('courses', id=1)
        self.assertIn(homework['id'], course['homeworks'])
        await self.logout_object(ta)
        # fail -- student create homework
        student = self.student1_hfz #await self.db.getObjectOne('users', username='hfz')
        await self.login_object(student)
        response = self.getbodyObject(await self.post_request(uri,
                                                             name='pretend',
                                                             description='not necessary',
                                                             deadline=20000,
                                                             problems=[1],
                                                             course_id=1))
        self.assertEqual(response['code'], 1)
        await self.logout_object(student)

    @async_aquire_db
    async def test_delete(self):
        uri = self.url+'/delete'
        # ta = await self.db.getObjectOne('users', username='zjl')
        # student = await self.db.getObjectOne('users', username='hfz')
        ta = self.ta1_zjl
        student = self.student1_hfz
        course = await self.db.getObjectOne('courses', name='泽学')
        homework = await self.db.createObject('homeworks',
                                              name='hello world',
                                              description='not necessary',
                                              deadline=datetime.datetime.fromtimestamp(10000),
                                              problems=[1],
                                              course_id=course['id'])
        course['homeworks'].append(homework['id'])
        await self.db.saveObject('courses', object=course)

        # fail -student delete homwork
        await self.login_object(student)
        response = self.getbodyObject(await self.post_request(uri, id=homework['id']))
        self.assertEqual(response['code'], 1)
        self.logout_object(student)

        # pass
        print_test('zjl_role', ta['role'])
        await self.login_object(ta)
        response = self.getbodyObject(await self.post_request(uri, id=homework['id']))
        self.assertEqual(response['code'], 0)
        course = await self.db.getObjectOne('courses', name='泽学')
        self.assertNotIn(homework['id'], course['homeworks'])

    @async_aquire_db
    async def test_update(self):
        uri = self.url + '/update'
        ta = await self.db.getObjectOne('users', username='zjl')
        student = await self.db.getObjectOne('users', username='hfz')
        course = await self.db.getObjectOne('courses', name='泽学')
        homework = await self.db.createObject('homeworks',
                                              name='hello world',
                                              description='not necessary',
                                              deadline=datetime.datetime.fromtimestamp(10000),
                                              problems=[1],
                                              course_id=course['id'])

        # fail student change homework
        await self.login_object(student)
        response = self.getbodyObject(await self.post_request(uri,
                                                              id=homework['id'],
                                                              deadline=20000))
        self.assertEqual(1, response['code'])
        await self.login_object(student)
        # pass
        await self.login_object(ta)
        response = self.getbodyObject(await self.post_request(uri,
                                                              id=homework['id'],
                                                              deadline=5000,
                                                              problems=[1,2,3]))
        homework = await self.db.getObjectOne('homeworks', id=homework['id'])
        self.assertEqual(0, response['code'])
        self.assertEqual(5000, int(time.mktime(homework['deadline'].timetuple())))
        self.assertEqual([1,2,3], homework['problems'])

    @async_aquire_db
    async def test_query(self):
        uri = self.url + '/query'
        ta = await self.db.getObjectOne('users', username='zjl')
        student_hfz = await self.db.getObjectOne('users', username='hfz')
        # student_nx = await self.db.getObjectOne('users', username='nx')
        course1 = await self.db.getObjectOne('courses', name='泽学')
        course2 = await self.db.getObjectOne('courses', name='母猪的产后护理')
        homework = await self.db.createObject('homeworks',
                                              name='hello world',
                                              description='not necessary',
                                              deadline=datetime.datetime.fromtimestamp(10000),
                                              problems=[1],
                                              course_id=course1['id'])
        homework2 = await self.db.createObject('homeworks',
                                              name='vet',
                                              description='not necessary',
                                              deadline=datetime.datetime.fromtimestamp(20000),
                                              problems=[1],
                                              course_id=course2['id']
                                              )

        # fail 1 student check homework in other course
        await self.login_object(student_hfz)
        response = self.getbodyObject(await self.post_request(uri, name='vet'))
        self.assertEqual(1, response['code'])
        # pass student check homework
        response = self.getbodyObject(await self.post_request(uri, name='hello world'))
        self.assertIsInstance(response, list)
        id_list = [work['id'] for work in response]
        self.assertIn(homework['id'], id_list)
        await self.logout_object(student_hfz)
        # fail 2 ta check homework in other course
        await self.login_object(ta)
        response = self.getbodyObject(await self.post_request(uri, name='vet'))
        self.assertEqual(1, response['code'])
        # pass ta check homework
        response = self.getbodyObject(await self.post_request(uri, name='hello world'))
        self.assertIsInstance(response, list)
        id_list = [work['id'] for work in response]
        self.assertIn(homework['id'], id_list)
        await self.logout_object(ta)

    @async_aquire_db
    async def test_submitable(self):
        uri = self.url + '/submitable'
        ta = await self.db.getObjectOne('users', username='zjl')
        student_hfz = await self.db.getObjectOne('users', username='hfz')
        course1 = await self.db.getObjectOne('courses', name='泽学')
        homework = await self.db.createObject('homeworks',
                                              name='hello world',
                                              description='not necessary',
                                              deadline=datetime.datetime.fromtimestamp(10000),
                                              problems=[1],
                                              course_id=course1['id'])
        # fail 1 student change homework
        await self.login_object(student_hfz)
        response = self.getbodyObject(await self.post_request(uri,
                                                              homework_id=homework['id'],
                                                              submitable=0))
        self.assertEqual(1, response['code'])
        await self.logout_object(student_hfz)
        # pass
        await self.login_object(ta)
        response = self.getbodyObject(await self.post_request(uri,
                                                              homework_id=homework['id'],
                                                              submitable=0))
        homework = await self.db.getObjectOne('homeworks', id=homework['id'])
        self.assertEqual(0, response['code'])
        self.assertEqual(0, homework['submitable'])

    @async_aquire_db
    async def test_openness(self):
        uri = self.url+'/scoreOpenness'
        ta = await self.db.getObjectOne('users', username='zjl')
        student_hfz = await self.db.getObjectOne('users', username='hfz')
        course1 = await self.db.getObjectOne('courses', name='泽学')
        homework = await self.db.createObject('homeworks',
                                              name='hello world',
                                              description='not necessary',
                                              deadline=datetime.datetime.fromtimestamp(10000),
                                              problems=[1],
                                              course_id=course1['id'])
        # fail 1 student change homework
        await self.login_object(student_hfz)
        response = self.getbodyObject(await self.post_request(uri,
                                                              homework_id=homework['id'],
                                                              score_openness=0))
        self.assertEqual(1, response['code'])
        await self.logout_object(student_hfz)
        # pass
        await self.login_object(ta)
        response = self.getbodyObject(await self.post_request(uri,
                                                              homework_id=homework['id'],
                                                              score_openness=0))
        homework = await self.db.getObjectOne('homeworks', id=homework['id'])
        self.assertEqual(0, response['code'])
        self.assertEqual(0, homework['score_openness'])
