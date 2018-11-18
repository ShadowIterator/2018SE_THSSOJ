from . import base
from .base import *

class APICourseHandler(base.BaseHandler):

    @tornado.web.authenticated
    async def _create_post(self):
        res_dict={}
        try:
            possible_course = await self.getObject('courses', name=self.args['name'])
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

    @tornado.web.authenticated
    async def _delete_post(self):
        res_dict = {}
        try:
            self.deleteObject('courses', id = self.args['id'])
            self.set_res_dict(res_dict, code=0, msg='course deleted')
        except:
            self.set_res_dict(res_dict, code=1, msg='course delete failed')

        self.return_json(res_dict)

    @tornado.web.authenticated
    async def _update_post(self):
        res_dict = {}
        try:
            target_course = await self.getObject('courses', id=self.args['id'])[0]
            try:
                for key in self.args.keys():
                    if key=='id':
                        continue
                    target_course[key]=self.args[key]
                self.saveObject('courses', target_course)
                self.set_res_dict(res_dict, code=0, msg='course updated')
            except:
                self.set_res_dict(res_dict, code=2, msg='update failed')
                self.return_json(res_dict)
                return
        except:
            self.set_res_dict(res_dict, code=1, msg='course does not exist')
        self.return_json(res_dict)

    @tornado.web.authenticated
    async def _query_post(self):
        # print('query = ', self.args)
        res = await self.getObject('courses', **self.args)
        self.return_json(res)
