from . import base
from .base import *

class APIHomeworkHandler(base.BaseHandler):
    def __init__(self, *args, **kw):
        super().__init__(*args, **kw)
        self.root_dir = self.root_dir+'/homeworks'

    @tornado.web.authenticated
    async def _create_post(self):
        res_dict={}
        try:
            await self.createObject('homeworks', **self.args)
            self.set_res_dict(res_dict, code=0, msg='homework created')
        except:
            self.set_res_dict(res_dict, code=1, msg='fail to create homework')
        self.return_json(res_dict)

    @tornado.web.authenticated
    async def _delete_post(self):
        res_dict={}
        try:
            await self.deleteObject('homeworks', **self.args)
            self.set_res_dict(res_dict, code=0, msg='homework deleted')
        except:
            self.set_res_dict(res_dict, code=1, msg='fail to delete any homework')
        self.return_json(res_dict)

    @tornado.web.authenticated
    async def _update_post(self):
        res_dict = {}
        try:
            target_homework = await self.getObject('homeworks', id=self.args['id'])[0]
            try:
                for key in self.args.keys():
                    if key == 'id':
                        continue
                    target_homework[key] = self.args[key]
                self.saveObject('homeworks', target_homework)
                self.set_res_dict(res_dict, code=0, msg='homework updated')
            except:
                self.set_res_dict(res_dict, code=2, msg='update failed')
                self.return_json(res_dict)
                return
        except:
            self.set_res_dict(res_dict, code=1, msg='homework does not exist')
        self.return_json(res_dict)

    @tornado.web.authenticated
    async def _query_post(self):
        res = await self.getObject('homeworks', **self.args)
        self.return_json(res)