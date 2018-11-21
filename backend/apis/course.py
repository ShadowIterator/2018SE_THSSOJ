
from . import base
from .base import *

class APICourseHandler(base.BaseHandler):
    def __init__(self, *args, **kw):
        super().__init__(*args, **kw)
        self.root_dir = self.root_dir+'/courses'

    # @tornado.web.authenticated
    async def _create_post(self):
        res_dict={}
        try:
            # possible_course = await self.getObject('courses', secure=1, name=self.args['name'])
            # if len(possible_course)!=0:
            #     self.set_res_dict(code=2, msg='course already exists')
            #     self.return_json(res_dict)
            #     return
            await self.createObject('courses',**self.args)
                                    # name = self.args['name'],
                                    # description = self.args['description'],
                                    # students = self.args['students'],
                                    # TAs = self.args['TAs'])
            course_created = (await self.getObject('courses', **self.args))[0]
            course_id = course_created['id']
            try:
                for stu_id in self.args['students']:
                    student=(await self.getObject('users', id=stu_id))[0]
                    student['student_courses'].append(course_id)
                    await self.saveObject('users', student)

                for TA_id in self.args['tas']:
                    TA = (await self.getObject('users', id=TA_id))[0]
                    TA['ta_courses'].append(course_id)
                    await self.saveObject('users', TA)
                self.set_res_dict(res_dict, code=0, msg='courses creation succeed')
            except Exception as e:
                print("create course err: ", e)
                self.set_res_dict(res_dict, code=1, msg='can not add students and TAs to course')
                self.return_json(res_dict)
                return
        except:
            self.set_res_dict(res_dict, code=1, msg='course creation failed')
        self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _delete_post(self):
        res_dict = {}
        try:
            await self.deleteObject('courses', id = self.args['id'])
            self.set_res_dict(res_dict, code=0, msg='course deleted')
        except:
            self.set_res_dict(res_dict, code=1, msg='course delete failed')

        self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _update_post(self):
        res_dict = {}
        try:
            target_course = (await self.getObject('courses', secure=1, id=self.args['id']))[0]

            course_id = target_course['id']
            try:
                for key in self.args.keys():
                    if key=='id':
                        continue
                    elif key=='tas':
                        TA_added = set(self.args['tas'])-set(target_course['tas'])
                        TA_exiled = set(target_course['tas'])-set(self.args['tas'])
                        for TA_id in TA_added:
                            invited_TA = (await self.getObject('users', secure=1, id=TA_id))[0]
                            invited_TA['ta_courses'].append(course_id)
                            await self.saveObject('users', invited_TA)
                            target_course['tas'].append(TA_id)
                        for TA_id in TA_exiled:
                            deleted_TA = (await self.getObject('users', secure=1, id=TA_id))[0]
                            deleted_TA['ta_courses'].remove(course_id)
                            await self.saveObject('users', deleted_TA)
                            target_course['tas'].remove(TA_id)
                    elif key=='students':
                        stu_added = set(self.args['students']) - set(target_course['students'])
                        stu_exiled = set(target_course['students']) - set(self.args['students'])
                        for stu_id in stu_added:
                            invited_stu = (await self.getObject('users', secure=1, id=stu_id))[0]
                            invited_stu['student_courses'].append(course_id)
                            await self.saveObject('users', invited_stu)
                            target_course['students'].append(stu_id)
                        for stu_id in stu_exiled:
                            deleted_stu = (await self.getObject('users', secure=1, id=stu_id))[0]
                            deleted_stu['student_courses'].remove(course_id)
                            await self.saveObject('users', deleted_stu)
                            target_course['students'].remove(stu_id)
                    else:
                        target_course[key]=self.args[key]
                await self.saveObject('courses', secure=1, object=target_course)
                self.set_res_dict(res_dict, code=0, msg='course updated')
            except:
                self.set_res_dict(res_dict, code=2, msg='update failed')
                self.return_json(res_dict)
                return
        except:
            self.set_res_dict(res_dict, code=1, msg='course does not exist')
        self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _query_post(self):
        # print('query = ', self.args)
        res = await self.getObject('courses', secure=1 ,**self.args)
        self.return_json(res)

    # @tornado.web.authenticated
    async def _addStudent_post(self):
        res_dict = {}
        if not self.check_input('course_id', 'stu_id'):
            self.set_res_dict(res_dict, code=1, msg='unexpected parameters')
            self.return_json(res_dict)
            return
        course_id = int(self.args['course_id'])
        stu_id = int(self.args['stu_id'])
        try:
            course = (await self.getObject('courses', secure=1, id=course_id))[0]
            if stu_id not in course['students']:
                course['students'].append(stu_id)
                await self.saveObject('courses', course)
                student_invited = (await self.getObject('users', secure=1, id=stu_id))[0]
                student_invited['student_courses'].append(course_id)
                await self.saveObject('users', student_invited)
            self.set_res_dict(res_dict, code=0, msg='add student succeed')
        except:
            self.set_res_dict(res_dict, code=1, msg='add student failed')
        self.return_json(res_dict)

    async def _addTA_post(self):
        res_dict = {}
        if not self.check_input('course_id', 'ta_id'):
            self.set_res_dict(res_dict, code=1, msg='unexpected parameters')
            self.return_json(res_dict)
            return
        course_id = int(self.args['course_id'])
        ta_id = int(self.args['ta_id'])
        try:
            course = (await self.getObject('courses', secure=1, id=course_id))[0]
            if ta_id not in course['tas']:
                course['tas'].append(ta_id)
                await self.saveObject('courses', course)
                TA_invited = (await self.getObject('users', secure=1, id=ta_id))[0]
                TA_invited['ta_courses'].append(course_id)
                await self.saveObject('users', TA_invited)
            self.set_res_dict(res_dict, code=0, msg='add TA succeed')
        except:
            self.set_res_dict(res_dict, code=1, msg='add TA failed')
        self.return_json(res_dict)

    async def _deleteStudent_post(self):
        res_dict = {}
        if not self.check_input('course_id', 'stu_id'):
            self.set_res_dict(res_dict, code=1, msg='unexpected parameters')
            self.return_json(res_dict)
            return
        course_id = int(self.args['course_id'])
        stu_id = int(self.args['stu_id'])
        try:
            course = (await self.getObject('courses', secure=1, id=course_id))[0]
            if stu_id in course['students']:
                course['students'].remove(stu_id)
                await self.saveObject('courses', course)
                student_exiled = (await self.getObject('users', secure=1, id=stu_id))[0]
                student_exiled['student_courses'].remove(course_id)
                await self.saveObject('users', student_exiled)
            self.set_res_dict(res_dict, code=0, msg='delete student succeed')
        except:
            self.set_res_dict(res_dict, code=1, msg='delete student failed')
        self.return_json(res_dict)

    async def _deleteTA_post(self):
        res_dict = {}
        if not self.check_input('course_id', 'ta_id'):
            self.set_res_dict(res_dict, code=1, msg='unexpected parameters')
            self.return_json(res_dict)
            return
        course_id = int(self.args['course_id'])
        ta_id = int(self.args['ta_id'])
        try:
            course = (await self.getObject('courses', secure=1, id=course_id))[0]
            if ta_id in course['tas']:
                course['tas'].remove(ta_id)
                await self.saveObject('courses', course)
                TA_exiled = (await self.getObject('users', secure=1, id=ta_id))[0]
                TA_exiled['ta_courses'].remove(course_id)
                await self.saveObject('users', TA_exiled)
            self.set_res_dict(res_dict, code=0, msg='delete TA succeed')
        except:
            self.set_res_dict(res_dict, code=1, msg='delete TA failed')
        self.return_json(res_dict)