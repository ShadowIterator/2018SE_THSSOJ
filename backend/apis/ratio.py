from . import base
from .base import *

class APIRatioHandler(base.BaseHandler):
    # @tornado.web.authenticated
    async def _query_post(self):
        result = await self.db.getObject('ratios', **self.args)
        cur_user = await self.get_current_user_object()
        return_result = []
        for re in result:
            if re['user_id'] == cur_user['id']:
                return_result.append(re)
        if len(result) == 0:
            new_ratio = await self.db.createObject('ratios', **self.args)
            return_result.append(new_ratio)
        return return_result

    async def _list_post(self):
        cur_user = await self.get_current_user_object()
        assert (cur_user['role'] == Roles.ADMIN)
        return await self.db.querylr('ratios', self.args['start'], self.args['end'], **self.args)

