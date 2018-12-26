import unittest
import tornado.testing
import datetime
import time
from basetestcase.basetestcase import BaseTestCase, async_aquire_db
from apis.base import print_test, print_debug
from apis.base import Roles
class NoticeTestCase(BaseTestCase):
    async def prepare(self):
        self.url = '/api/notice'
        student1 = await self.db.createObject('users', username='hfz', password='4321', email='hfz@hfz.com', role=Roles.STUDENT, student_courses=[1])
        student2 = await self.db.createObject('users', username='nx', password='myq', role=Roles.STUDENT, student_courses=[2])
        ta1 = await self.db.createObject('users', username='zjl', password='ibtfy', email='sh@sina.com', role=Roles.TA, ta_courses=[1])
        ta2 = await self.db.createObject('users', username='wzy', password='9897', role=Roles.TA)
        await self.db.createObject('courses', name='泽学', tas=[ta1['id']], students=[student1['id']], status=1)
        await self.db.createObject('courses', name='母猪的产后护理', tas=[ta2['id']], students=[student2['id']], status=1)

    @async_aquire_db
    async def test_create(self):
        uri = self.url+'/create'
        student1 = await self.db.getObjectOne('users', username='hfz')
        ta1 = await self.db.getObjectOne('users', username='zjl')
        ta2 = await self.db.getObjectOne('users', username='wzy')
        course = await self.db.getObjectOne('courses', name='泽学')
        # fail student create notice using ta id
        await self.login_object(student1)
        response = self.getbodyObject(await self.post_request(uri,
                                                              title='welcome',
                                                              content='welcome',
                                                              course_id=course['id'],
                                                              user_id=ta1['id']))
        notices = await self.db.getObject('notices', title='welcome')
        self.assertEqual(1, response['code'])
        self.assertEqual(0, len(notices))
        await self.logout_object(student1)
        # fail ta create notice in other course
        await self.login_object(ta2)
        response = self.getbodyObject(await self.post_request(uri,
                                                              title='welcome',
                                                              content='welcome',
                                                              course_id=course['id'],
                                                              user_id=ta1['id']))
        notices = await self.db.getObject('notices', title='welcome')
        self.assertEqual(1, response['code'])
        self.assertEqual(0, len(notices))
        await self.logout_object(ta2)
        # pass right ta create notice
        await self.login_object(ta1)
        response = self.getbodyObject(await self.post_request(uri,
                                                              title='welcome',
                                                              content='welcome',
                                                              course_id=course['id'],
                                                              user_id=ta1['id']))
        notices = await self.db.getObject('notices', title='welcome')
        self.assertEqual(0, response['code'])
        self.assertEqual(1, len(notices))

    @async_aquire_db
    async def test_delete(self):
        uri = self.url+'/delete'
        ta1 = await self.db.getObjectOne('users', username='zjl')
        admin = await self.db.getObjectOne('users', username='admin')
        course = await self.db.getObjectOne('courses', name='泽学')
        notice = await self.db.createObject('notices',
                                            title='welcome',
                                            content='welcome',
                                            course_id=course['id'],
                                            user_id=ta1['id'])
        # fail ta delete notice
        await self.login_object(ta1)
        response = self.getbodyObject(await self.post_request(uri, id=notice['id']))
        possible_notices = await self.db.getObject('notices', title='welcome')
        self.assertEqual(1, response['code'])
        self.assertEqual(1, len(possible_notices))
        await self.login_object(ta1)
        # pass
        await self.login_object(admin)
        response = self.getbodyObject(await self.post_request(uri, id=notice['id']))
        possible_notices = await self.db.getObject('notices', title='welcome')
        self.assertEqual(0, response['code'])
        self.assertEqual(0, len(possible_notices))

    @async_aquire_db
    async def test_update(self):
        uri = self.url + '/update'
        ta1 = await self.db.getObjectOne('users', username='zjl')
        admin = await self.db.getObjectOne('users', username='admin')
        course = await self.db.getObjectOne('courses', name='泽学')
        notice = await self.db.createObject('notices',
                                            title='welcome',
                                            content='welcome',
                                            course_id=course['id'],
                                            user_id=ta1['id'])
        # fail ta delete notice
        await self.login_object(ta1)
        response = self.getbodyObject(await self.post_request(uri,
                                                              id=notice['id'],
                                                              title='goodbye'))
        possible_notice = await self.db.getObjectOne('notices', user_id=ta1['id'])
        self.assertEqual(1, response['code'])
        self.assertEqual('welcome', possible_notice['title'])
        await self.login_object(ta1)
        # pass
        await self.login_object(admin)
        response = self.getbodyObject(await self.post_request(uri,
                                                              id=notice['id'],
                                                              title='goodbye'))
        possible_notice = await self.db.getObjectOne('notices', user_id=ta1['id'])
        self.assertEqual(0, response['code'])
        self.assertEqual('goodbye', possible_notice['title'])

    @async_aquire_db
    async def test_query(self):
        uri=self.url+'/query'
        ta1 = await self.db.getObjectOne('users', username='zjl')
        ta2 = await self.db.getObjectOne('users', username='wzy')
        student1 = await self.db.getObjectOne('users', username='hfz')
        admin = await self.db.getObjectOne('users', username='admin')
        course1 = await self.db.getObjectOne('courses', name='泽学')
        course2 = await self.db.getObjectOne('courses', name='母猪的产后护理')
        notice1 = await self.db.createObject('notices',
                                            title='welcome',
                                            content='welcome',
                                            course_id=course1['id'],
                                            user_id=ta1['id'])
        notice2 = await self.db.createObject('notices',
                                             title='welcome',
                                             content='welcome',
                                             course_id=course2['id'],
                                             user_id=ta2['id'])

        # pass student check notice
        await self.login_object(student1)
        response = self.getbodyObject(await self.post_request(uri,
                                                              title='welcome'))
        self.assertIsInstance(response, list)
        self.assertEqual(1, len(response))
        await self.login_object(student1)
        # pass ta check notice
        await self.login_object(ta1)
        response = self.getbodyObject(await self.post_request(uri,
                                                             title='welcome'))
        self.assertIsInstance(response, list)
        self.assertEqual(1, len(response))
        await self.login_object(ta1)
        # pass admin check notice
        await self.login_object(admin)
        response = self.getbodyObject(await self.post_request(uri,
                                                             title='welcome'))
        self.assertIsInstance(response, list)
        self.assertEqual(2, len(response))