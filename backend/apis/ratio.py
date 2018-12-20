from . import base
from .base import *

class APIRatioHandler(base.BaseHandler):
    # @tornado.web.authenticated
    async def _query_post(self):
        result = await self.db.getObject('ratios', **self.args)
        cur_user = await self.get_current_user_object()
        return_result = []
        for ratio in result:
            if ratio['user_id'] == cur_user['id']:
                return_result.append(ratio)
        return return_result
