
import datetime
import time
import uuid
from . import base
from .base import *

class APICourseHandler(base.BaseHandler):
    def __init__(self, *args, **kw):
        super().__init__(*args, **kw)
        self.root_dir = self.root_dir+'/courses'
        
    def getargs(self):
        self.args = json.loads(self.request.body.decode() or '{}')
        if 'start_time' in self.args.keys():
            self.args['start_time'] = datetime.datetime.fromtimestamp(self.args['start_time'])
        if 'end_time' in self.args.keys():
            self.args['end_time'] = datetime.datetime.fromtimestamp(self.args['end_time'])

    # @tornado.web.authenticated
    async def _create_post(self):
        res_dict={}
        await self.db.createObject('courses', **self.args)
        course_created = (await self.db.getObject('courses', **self.args))[0]
        course_id = course_created['id']
        for stu_id in self.args['students']:
            student = (await self.db.getObject('users', cur_user = self.get_current_user_object(), id=stu_id))[0]
            student['student_courses'].append(course_id)
            await self.db.saveObject('users', object=student, cur_user = self.get_current_user_object())
        for TA_id in self.args['tas']:
            TA = (await self.db.getObject('users', cur_user = self.get_current_user_object(), id=TA_id))[0]
            TA['ta_courses'].append(course_id)
            await self.db.saveObject('users', object=TA, cur_user = self.get_current_user_object())
        spell = str(uuid.uuid1())
        course_created['course_spell'] = spell
        self.db.saveObject('courses', object=course_created, cur_user=self.get_current_user_object())
        self.set_res_dict(res_dict, code=0, msg='courses creation succeed')
        return res_dict
        # try:
        #     await self.createObject('courses',**self.args)
        #
        #     course_created = (await self.getObject('courses', **self.args))[0]
        #     course_id = course_created['id']
        #     try:
        #         for stu_id in self.args['students']:
        #             student=(await self.getObject('users', id=stu_id))[0]
        #             student['student_courses'].append(course_id)
        #             await self.saveObject('users', student)
        #
        #         for TA_id in self.args['tas']:
        #             TA = (await self.getObject('users', id=TA_id))[0]
        #             TA['ta_courses'].append(course_id)
        #             await self.saveObject('users', TA)
        #         self.set_res_dict(res_dict, code=0, msg='courses creation succeed')
        #     except Exception as e:
        #         print("create course err: ", e)
        #         self.set_res_dict(res_dict, code=1, msg='can not add students and TAs to course')
        #         self.return_json(res_dict)
        #         return
        # except:
        #     self.set_res_dict(res_dict, code=1, msg='course creation failed')
        # self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _delete_post(self):
        res_dict = {}
        await self.db.deleteObject('courses', id=self.args['id'])
        self.set_res_dict(res_dict, code=0, msg='course deleted')
        return res_dict
        # try:
        #     await self.deleteObject('courses', id = self.args['id'])
        #     self.set_res_dict(res_dict, code=0, msg='course deleted')
        # except:
        #     self.set_res_dict(res_dict, code=1, msg='course delete failed')
        #
        # self.return_json(res_dict)

    # @tornado.web.authenticated
    @catch_exception_write
    async def _update_post(self):
        res_dict = {}

        target_course = (await self.db.getObject('courses', cur_user = self.get_current_user_object(), id=self.args['id']))[0]
        for key in self.args.keys():
            if key == 'id':
                continue
            target_course[key] = self.args[key]
        await self.db.saveObject('courses', cur_user = self.get_current_user_object(), object=target_course)
        self.set_res_dict(res_dict, code=0, msg='course updated')
        return res_dict

        # try:
        #     target_course = (await self.getObject('courses', secure=1, id=self.args['id']))[0]
        #     try:
        #         for key in self.args.keys():
        #             if key=='id':
        #                 continue
        #             target_course[key]=self.args[key]
        #         await self.saveObject('courses', secure=1, object=target_course)
        #
        #         self.set_res_dict(res_dict, code=0, msg='course updated')
        #     except:
        #         self.set_res_dict(res_dict, code=2, msg='update failed')
        #         self.return_json(res_dict)
        #         return
        # except:
        #     self.set_res_dict(res_dict, code=1, msg='course does not exist')
        # self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _query_post(self):
        # print('query = ', self.args)
        res = await self.db.getObject('courses', cur_user = self.get_current_user_object(), **self.args)
        for course in res:
            if 'start_time' in course.keys() and course['start_time'] is not None:
                course['start_time'] = int(time.mktime(course['start_time'].timetuple()))
            if 'end_time' in course.keys() and course['end_time'] is not None:
                course['end_time'] = int(time.mktime(course['end_time'].timetuple()))
        return res
        # self.return_json(res)

    # @tornado.web.authenticated
    async def _addStudent_post(self):
        res_dict = {}
        if not self.check_input('course_id', 'stu_id'):
            self.set_res_dict(res_dict, code=1, msg='unexpected parameters')
            return res_dict

        course_id = int(self.args['course_id'])
        stu_id = int(self.args['stu_id'])
        course = (await self.db.getObject('courses', cur_user = self.get_current_user_object(), id=course_id))[0]
        if stu_id not in course['students']:
            course['students'].append(stu_id)
            await self.db.saveObject('courses', object=course, cur_user = self.get_current_user_object())
            student_invited = (await self.db.getObject('users', cur_user = self.get_current_user_object(), id=stu_id))[0]
            student_invited['student_courses'].append(course_id)
            await self.db.saveObject('users',object = student_invited, cur_user = self.get_current_user_object())
        self.set_res_dict(res_dict, code=0, msg='add student succeed')
        return res_dict

        # try:
        #     course = (await self.getObject('courses', secure=1, id=course_id))[0]
        #     if stu_id not in course['students']:
        #         course['students'].append(stu_id)
        #         await self.saveObject('courses', course)
        #         student_invited = (await self.getObject('users', secure=1, id=stu_id))[0]
        #         student_invited['student_courses'].append(course_id)
        #         await self.saveObject('users', student_invited)
        #     self.set_res_dict(res_dict, code=0, msg='add student succeed')
        # except:
        #     self.set_res_dict(res_dict, code=1, msg='add student failed')
        # self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _addTA_post(self):
        res_dict = {}
        if not self.check_input('course_id', 'ta_id'):
            self.set_res_dict(res_dict, code=1, msg='unexpected parameters')
            # self.return_json(res_dict)
            return res_dict
        course_id = int(self.args['course_id'])
        ta_id = int(self.args['ta_id'])

        course = (await self.db.getObject('courses', cur_user = self.get_current_user_object(), id=course_id))[0]
        if ta_id not in course['tas']:
            course['tas'].append(ta_id)
            await self.db.saveObject('courses',object = course, cur_user = self.get_current_user_object())
            TA_invited = (await self.db.getObject('users', cur_user = self.get_current_user_object(), id=ta_id))[0]
            TA_invited['ta_courses'].append(course_id)
            await self.db.saveObject('users',object = TA_invited, cur_user = self.get_current_user_object())
        self.set_res_dict(res_dict, code=0, msg='add TA succeed')
        return res_dict
        # try:
        #     course = (await self.getObject('courses', secure=1, id=course_id))[0]
        #     if ta_id not in course['tas']:
        #         course['tas'].append(ta_id)
        #         await self.saveObject('courses', course)
        #         TA_invited = (await self.getObject('users', secure=1, id=ta_id))[0]
        #         TA_invited['ta_courses'].append(course_id)
        #         await self.saveObject('users', TA_invited)
        #     self.set_res_dict(res_dict, code=0, msg='add TA succeed')
        # except:
        #     self.set_res_dict(res_dict, code=1, msg='add TA failed')
        # self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _deleteStudent_post(self):
        res_dict = {}
        if not self.check_input('course_id', 'stu_id'):
            self.set_res_dict(res_dict, code=1, msg='unexpected parameters')
            # self.return_json(res_dict)
            return res_dict
        course_id = int(self.args['course_id'])
        stu_id = int(self.args['stu_id'])

        course = (await self.db.getObject('courses', cur_user = self.get_current_user_object(), id=course_id))[0]
        if stu_id in course['students']:
            course['students'].remove(stu_id)
            await self.db.saveObject('courses',object = course, cur_user = self.get_current_user_object())
            student_exiled = (await self.db.getObject('users', cur_user = self.get_current_user_object(), id=stu_id))[0]
            student_exiled['student_courses'].remove(course_id)
            await self.db.saveObject('users', object = student_exiled, cur_user = self.get_current_user_object())
        self.set_res_dict(res_dict, code=0, msg='delete student succeed')
        return res_dict

        # try:
        #     course = (await self.getObject('courses', secure=1, id=course_id))[0]
        #     if stu_id in course['students']:
        #         course['students'].remove(stu_id)
        #         await self.saveObject('courses', course)
        #         student_exiled = (await self.getObject('users', secure=1, id=stu_id))[0]
        #         student_exiled['student_courses'].remove(course_id)
        #         await self.saveObject('users', student_exiled)
        #     self.set_res_dict(res_dict, code=0, msg='delete student succeed')
        # except:
        #     self.set_res_dict(res_dict, code=1, msg='delete student failed')
        # self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _deleteTA_post(self):
        res_dict = {}
        if not self.check_input('course_id', 'ta_id'):
            self.set_res_dict(res_dict, code=1, msg='unexpected parameters')
            # self.return_json(res_dict)
            return res_dict
        course_id = int(self.args['course_id'])
        ta_id = int(self.args['ta_id'])

        course = (await self.db.getObject('courses', cur_user = self.get_current_user_object(), id=course_id))[0]
        if ta_id in course['tas']:
            course['tas'].remove(ta_id)
            await self.db.saveObject('courses', course)
            TA_exiled = (await self.db.getObject('users', cur_user = self.get_current_user_object(), id=ta_id))[0]
            TA_exiled['ta_courses'].remove(course_id)
            await self.db.saveObject('users',object = TA_exiled, cur_user = self.get_current_user_object())
        self.set_res_dict(res_dict, code=0, msg='delete TA succeed')
        return res_dict

        # try:
        #     course = (await self.getObject('courses', secure=1, id=course_id))[0]
        #     if ta_id in course['tas']:
        #         course['tas'].remove(ta_id)
        #         await self.saveObject('courses', course)
        #         TA_exiled = (await self.getObject('users', secure=1, id=ta_id))[0]
        #         TA_exiled['ta_courses'].remove(course_id)
        #         await self.saveObject('users', TA_exiled)
        #     self.set_res_dict(res_dict, code=0, msg='delete TA succeed')
        # except:
        #     self.set_res_dict(res_dict, code=1, msg='delete TA failed')
        # self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _addCourse_post(self):
        res_dict = {}
        if not self.check_input('user_id', 'course_code'):
            self.set_res_dict(res_dict, code=1, msg='invalid input params')
            return res_dict
        student = (await self.db.getObject('users', cur_user=self.get_current_user_object(), id=self.args['user_id']))[0]
        course = (await self.db.getObject('courses', cur_user=self.get_current_user_object(), id=self.args['course_code']))[0]
        student['student_courses'].append(self.args['course_code'])
        course['students'].append(self.args['user_id'])
        await self.db.saveObject('users', cur_user=self.get_current_user_object(),object=student)
        await self.db.saveObject('courses', cur_user=self.get_current_user_object(), object=course)
        self.set_res_dict(res_dict, code=0, msg='student added into courses')
        return res_dict