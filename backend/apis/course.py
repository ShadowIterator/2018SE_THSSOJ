from . import base
from .base import *

class APICourseHandler(base.BaseHandler):

    async def _create_post(self):
        res_dict={}
        try:
            await self.createObject('courses',
                                    name = self.args['name'],
                                    description = self.args['description'],
                                    students = self.args['students'],
                                    TAs = self.args['TAs'])
            self.set_res_dict(res_dict, code=0, msg='courses creation succeed')
        except:
            self.set_res_dict(res_dict, code=1, msg='course creation failed')


    def return_json(self, res_dict):
        self.write(tornado.escape.json_encode(res_dict))

    def set_res_dict(self, res_dict, **contents):
        for key in contents.keys():
            res_dict[key] = contents[key]

