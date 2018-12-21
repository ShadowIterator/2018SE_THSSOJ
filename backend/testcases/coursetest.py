# from basetestcase.basetestcase import BaseTestCase, async_aquire_db
import unittest
import tornado.testing
import datetime
from basetestcase.basetestcase import BaseTestCase, async_aquire_db
from apis.base import print_test, print_debug, Roles

class CourseTestCase(BaseTestCase):
    async def prepare(self):
        self.url = '/api/course'
        self.course_non_published = await self.db.createObject('courses',
                                                            name = 'hfz de 课程',
                                                            description = 'laidfjleisd',
                                                            course_spell = '12ddijlaf',
                                                            start_time = datetime.datetime.fromtimestamp(123242),
                                                            end_time = datetime.datetime.fromtimestamp(12232443))

        self.course_published = await self.db.createObject('courses',
                                                            name='hfz de anothoer 课程',
                                                            description='laidfjladfeisd',
                                                            course_spell='13ijlaf',
                                                            status = 1,
                                                            start_time=datetime.datetime.fromtimestamp(123242),
                                                            end_time=datetime.datetime.fromtimestamp(12232443))

        self.user_hfz = await self.db.createObject('users', username = 'hfz', password = '4321', email = 'hfz@hfz.com', role = 0, secret = '1314')
        self.user_st1 = await self.db.createObject('users', username = 'student1', password = 'student', email = 'hfz@hfz.com', role = Roles.STUDENT, secret = '1343', student_courses = [self.course_non_published['id'], self.course_published['id']])
        self.user_st2 = await self.db.createObject('users', username = 'student2', password = 'student', email = 'hfz@hfz.com', role = Roles.STUDENT, secret = '1343', student_courses = [self.course_non_published['id'], self.course_published['id']])
        self.user_st3 = await self.db.createObject('users', username = 'student3', password = 'student', email = 'hfz@hfz.com', role = Roles.STUDENT, secret = '1343', )
        self.user_ta1 = await self.db.createObject('users', username = 'ta1', password = 'ta', email = 'hfz@hfz.com', role = Roles.TA, secret = '1343', ta_courses = [self.course_non_published['id'], self.course_published['id']])
        self.user_ta2 = await self.db.createObject('users', username = 'ta2', password = 'ta', email = 'hfz@hfz.com', role = Roles.TA, secret = '1343', ta_courses = [self.course_non_published['id'], self.course_published['id']])
        self.user_ta3 = await self.db.createObject('users', username = 'ta3', password = 'ta', email = 'hfz@hfz.com', role = Roles.TA, secret = '1343')

        self.courseTable = self.db.getTable('courses')
        self.userTable = self.db.getTable('users')


        problem1 = await self.db.createObject('problems', title = 'daf', user_id = self.user_ta1['id'], time_limit = 1234, memory_limit = 1234, openness = 1)
        homework1 = await self.db.createObject('homeworks', name = 'hfz de homework', description = 'adfe', deadline = datetime.datetime.fromtimestamp(12232443), problems = [problem1['id']], course_id = self.course_published['id'])

        self.course_non_published['students'] = [self.user_st1['id'], self.user_st2['id']]
        self.course_non_published['tas'] = [self.user_ta1['id'], self.user_ta2['id']]
        self.course_published['students'] = [self.user_st1['id'], self.user_st2['id']]
        self.course_published['tas'] = [self.user_ta1['id'], self.user_ta2['id']]
        await self.db.saveObject('courses', self.course_published)
        await self.db.saveObject('courses', self.course_non_published)

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
            'tas': [self.user_ta1['id'], self.user_ta2['id']],
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
        self.assertEqual(len(self.user_st1['student_courses']), len(user_st1_after_request['student_courses']))

        # login: student
        await self.login_object(self.user_st3)
        response = await self.post_request_return_object(uri, **request_param)
        self.assertEqual(1, response['code'])
        course_after_request = await self.db.getObject('courses', name = request_param['name'])
        self.assertEqual(0, len(course_after_request))
        user_st1_after_request = await self.db.getObjectOne('users', id = self.user_st1['id'])
        self.assertEqual(len(self.user_st1['student_courses']), len(user_st1_after_request['student_courses']))

        #login: ta
        await self.login_object(self.user_ta1)
        response = await self.post_request_return_object(uri, **request_param)
        self.assertEqual(0, response['code'])
        course_after_request = await self.db.getObject('courses', name=request_param['name'])
        self.assertEqual(1, len(course_after_request))
        course_after_request = course_after_request[0]
        user_st1_after_request = await self.db.getObjectOne('users', id = self.user_st1['id'])
        user_st2_after_request = await self.db.getObjectOne('users', id = self.user_st2['id'])
        user_st3_after_request = await self.db.getObjectOne('users', id = self.user_st3['id'])
        user_ta1_after_request = await self.db.getObjectOne('users', id=self.user_ta1['id'])
        user_ta2_after_request = await self.db.getObjectOne('users', id=self.user_ta2['id'])
        user_ta3_after_request = await self.db.getObjectOne('users', id=self.user_ta3['id'])

        self.assertIn(user_st1_after_request['id'], course_after_request['students'])
        self.assertIn(user_st2_after_request['id'], course_after_request['students'])
        self.assertNotIn(user_st3_after_request['id'], course_after_request['students'])
        self.assertIn(user_st2_after_request['id'], course_after_request['students'])
        self.assertIn(user_ta1_after_request['id'], course_after_request['tas'])
        self.assertIn(user_ta2_after_request['id'], course_after_request['tas'])
        self.assertNotIn(user_ta3_after_request['id'], course_after_request['tas'])

        self.assertIn(course_after_request['id'], user_st1_after_request['student_courses'])
        self.assertIn(course_after_request['id'], user_st2_after_request['student_courses'])
        self.assertNotIn(course_after_request['id'], user_st3_after_request['student_courses'])
        self.assertIn(course_after_request['id'], user_ta1_after_request['ta_courses'])
        self.assertIn(course_after_request['id'], user_ta2_after_request['ta_courses'])
        self.assertNotIn(course_after_request['id'], user_ta3_after_request['ta_courses'])
        self.assertEqual(0, course_after_request['status'])
        self.assertNotEqual(None, course_after_request['course_spell'])
        self.assertNotEqual(0, len(course_after_request['course_spell']))

    @async_aquire_db
    async def test_delete(self):
        uri = self.url + '/delete'
        #fail: st delete publi
        await self.login_object(self.user_st1)
        response = await self.post_request_return_object(uri, id = self.course_non_published['id'])
        self.assertEqual(1, response['code'])
        course_after_post = await self.courseTable.getObject(id=self.course_non_published['id'])
        self.assertNotEqual(0, len(course_after_post))

        # fail: ta delete other's course
        await self.login_object(self.user_ta3)
        response = await self.post_request_return_object(uri, id = self.course_non_published['id'])
        self.assertEqual(1, response['code'])
        course_after_post = await self.courseTable.getObject(id = self.course_non_published['id'])
        self.assertNotEqual(0, len(course_after_post))

        # fail: ta delete published
        await self.login_object(self.user_ta1)
        response = await self.post_request_return_object(uri, id = self.course_published['id'])
        self.assertEqual(1, response['code'])
        course_after_post = await self.courseTable.getObject(id = self.course_published['id'])
        self.assertNotEqual(0, len(course_after_post))

        # success: ta delete non published
        await self.login_object(self.user_ta2)
        response = await self.post_request_return_object(uri, id = self.course_non_published['id'])
        self.assertEqual(0, response['code'])
        course_after_post = await self.courseTable.getObject(id = self.course_non_published['id'])
        self.assertEqual(0, len(course_after_post))
        ta1_after_post = await self.userTable.getObjectOne(id = self.user_ta1['id'])
        st1_after_post = await self.userTable.getObjectOne(id = self.user_st1['id'])
        self.assertNotIn(self.course_non_published['id'], ta1_after_post['ta_courses'])
        self.assertNotIn(self.course_non_published['id'], st1_after_post['student_courses'])

        # success: admin delete published
        await self.login_object(self.user_admin)
        response = await self.post_request_return_object(uri, id = self.course_published['id'])
        self.assertEqual(0, response['code'])
        course_after_post = await self.courseTable.getObject(id=self.course_published['id'])
        self.assertEqual(0, len(course_after_post))
        ta1_after_post = await self.userTable.getObjectOne(id=self.user_ta1['id'])
        st1_after_post = await self.userTable.getObjectOne(id=self.user_st1['id'])
        self.assertNotIn(self.course_published['id'], ta1_after_post['ta_courses'])
        self.assertNotIn(self.course_published['id'], st1_after_post['student_courses'])

