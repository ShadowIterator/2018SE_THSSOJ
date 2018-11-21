
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
            possible_course = await self.getObject('courses', secure=1, name=self.args['name'])
            if len(possible_course)!=0:
                self.set_res_dict(code=2, msg='course already exists')
                self.return_json(res_dict)
                return
            await self.createObject('courses',
                                    name = self.args['name'],
                                    description = self.args['description'],
                                    students = self.args['students'],
                                    TAs = self.args['TAs'])
            self.set_res_dict(res_dict, code=0, msg='courses creation succeed')
        except:
            self.set_res_dict(res_dict, code=1, msg='course creation failed')
        self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _delete_post(self):
        res_dict = {}
        try:
            self.deleteObject('courses', id = self.args['id'])
            self.set_res_dict(res_dict, code=0, msg='course deleted')
        except:
            self.set_res_dict(res_dict, code=1, msg='course delete failed')

        self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _update_post(self):
        res_dict = {}
        try:
            target_course = await self.getObject('courses', secure=1, id=self.args['id'])[0]
            try:
                for key in self.args.keys():
                    if key=='id':
                        continue
                    target_course[key]=self.args[key]
                self.saveObject('courses', secure=1, object=target_course)

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
            course = await self.getObject('courses', secure=1, id=course_id)[0]
            if stu_id not in course['students']:
                course['students'].append(stu_id)
            await self.saveObject('courses', course)
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
            course = await self.getObject('courses', secure=1, id=course_id)[0]
            if ta_id not in course['TAs']:
                course['TAs'].append(ta_id)
            await self.saveObject('courses', course)
            self.set_res_dict(res_dict, code=0, msg='add student succeed')
        except:
            self.set_res_dict(res_dict, code=1, msg='add student failed')
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
            course = await self.getObject('courses', secure=1, id=course_id)[0]
            if stu_id in course['students']:
                course['students'].remove(stu_id)
            await self.saveObject('courses', course)
            self.set_res_dict(res_dict, code=0, msg='add student succeed')
        except:
            self.set_res_dict(res_dict, code=1, msg='add student failed')
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
            course = await self.getObject('courses', secure=1, id=course_id)[0]
            if ta_id in course['TAs']:
                course['TAs'].remove(ta_id)
            await self.saveObject('courses', course)
            self.set_res_dict(res_dict, code=0, msg='add student succeed')
        except:
            self.set_res_dict(res_dict, code=1, msg='add student failed')
        self.return_json(res_dict)