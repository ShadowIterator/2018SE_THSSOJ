from .base import *
from . import base

class APIJudgestatesHandler(base.BaseHandler):
	def __init__(self, *args, **kw):
		super().__init__(*args, **kw)

	async def _create_post(self):
		await self.db.createObject('judgestates', **self.args)

	async def _query_post(self):
		res = (await self.db.getObject('judgestates', **self.args))
		return res