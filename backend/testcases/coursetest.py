# from basetestcase.basetestcase import BaseTestCase, async_aquire_db
import unittest
import tornado.testing
from basetestcase.basetestcase import BaseTestCase, async_aquire_db
from apis.base import print_test, print_debug, Roles

class CourseTestCase(BaseTestCase):
    async def prepare(self):
        self.url = '/api/course'
        self.user_hfz = await self.db.createObject('users', username = 'hfz', password = '4321', email = 'hfz@hfz.com', role = 0, secret = '1343')
        self.user_st1 = await self.db.createObject('users', username = 'student1', password = 'student', email = 'hfz@hfz.com', role = Roles.STUDENT, secret = '1343')
        self.user_st2 = await self.db.createObject('users', username = 'student2', password = 'student', email = 'hfz@hfz.com', role = Roles.STUDENT, secret = '1343')
        self.user_st3 = await self.db.createObject('users', username = 'student3', password = 'student', email = 'hfz@hfz.com', role = Roles.STUDENT, secret = '1343')
        self.user_ta = await self.db.createObject('users', username = 'ta', password = 'ta', email = 'hfz@hfz.com', role = Roles.TA, secret = '1343')
        try:
            self.user_admin = await self.db.getObjectOne('users', username = 'admin')
        except:
            self.user_admin = await self.db.createObject('users', username = 'admin', password = '1234', email = 'hfz@hfz.com', role = Roles.ADMIN, secret = '1343')


    @async_aquire_db
    async def test_create(self):
        uri = self.url + '/create'
        request_param = {
            'name': 'hongfz\'s courses',
            'description': '这是一个课程',
            'tas': [self.user_ta['id']],
            'students': [self.user_st1['id'], self.user_st2['id']],
            'start_time': 1234321,
            'end_time': 2234321,
        }

        # not logged in
        response = await self.post_request_return_object(uri, **request_param)
        self.assertEqual(1, response['code'])
        course_after_request = await self.db.getObject('courses', name = request_param['name'])
        self.assertEqual(0, len(course_after_request))
        user_st1_after_request = await self.db.getObjectOne('users', id = self.user_st1['id'])
        self.assertEqual(0, len(user_st1_after_request['student_courses']))
        # login: student
        await self.login_object(self.user_st3)
        response = await self.post_request_return_object(uri, **request_param)
        self.assertEqual(1, response['code'])
        course_after_request = await self.db.getObject('courses', name = request_param['name'])
        self.assertEqual(0, len(course_after_request))
        user_st1_after_request = await self.db.getObjectOne('users', id = self.user_st1['id'])
        self.assertEqual(0, len(user_st1_after_request['student_courses']))
