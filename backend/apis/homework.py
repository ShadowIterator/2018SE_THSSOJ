
import datetime
import time
from . import base
from .base import *

class APIHomeworkHandler(base.BaseHandler):
    def __init__(self, *args, **kw):
        super().__init__(*args, **kw)
        self.root_dir = self.root_dir+'/homeworks'

    def getargs(self):
        self.args = json.loads(self.request.body.decode() or '{}')
        if 'deadline' in self.args.keys():
            self.args['deadline'] = datetime.datetime.fromtimestamp(self.args['deadline'])

    # @tornado.web.authenticated
    async def _create_post(self):
        res_dict={}
        try:
            await self.createObject('homeworks', **self.args)
            # await self.createObject('homeworks',
            #                         name=self.args['name'],
            #                         description=self.args['description'],
            #                         deadline=datetime.datetime.fromtimestamp(self.args['deadline']),
            #                         problems=self.args['problems'])
            self.set_res_dict(res_dict, code=0, msg='homework created')
        except:
            self.set_res_dict(res_dict, code=1, msg='fail to create homework')
        self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _delete_post(self):
        res_dict={}
        try:
            await self.deleteObject('homeworks', **self.args)
            self.set_res_dict(res_dict, code=0, msg='homework deleted')
        except:
            self.set_res_dict(res_dict, code=1, msg='fail to delete any homework')
        self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _update_post(self):
        res_dict = {}
        try:
            target_homework = (await self.getObject('homeworks', secure=1, id=self.args['id']))[0]
            try:
                for key in self.args.keys():
                    if key == 'id':
                        continue
                    target_homework[key] = self.args[key]
                await self.saveObject('homeworks',secure=1, object=target_homework)
                self.set_res_dict(res_dict, code=0, msg='homework updated')
            except:
                self.set_res_dict(res_dict, code=2, msg='update failed')
                self.return_json(res_dict)
                return
        except:
            self.set_res_dict(res_dict, code=1, msg='homework does not exist')
        self.return_json(res_dict)

    # @tornado.web.authenticated
    async def _query_post(self):
        res_list = await self.getObject('homeworks', secure=1, **self.args)
        for each_res in res_list:
            each_res['deadline'] = int(time.mktime(each_res['deadline'].timetuple()))
        self.return_json(res_list)