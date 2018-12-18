
import datetime
import time
import uuid
from . import base
from .base import *

class APIJudgestateHandler(base.BaseHandler):

    async def _query_post(self):
        return await self.db.getObject('judgestates', **self.args)