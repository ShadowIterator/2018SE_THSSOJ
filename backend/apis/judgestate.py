
import datetime
import time
import uuid
from . import base
from .base import *

class APIJudgestateHandler(base.BaseHandler):

    async def _query_post(self):
        return await self.db.getObject('judgestates', **self.args)

    async def _list_post(self):
        return await self.db.querylr('judgestates', self.args['start'], self.args['end'], **self.args)
