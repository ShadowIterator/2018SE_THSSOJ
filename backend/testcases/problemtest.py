import unittest
import tornado.testing
from basetestcase.basetestcase import BaseTestCase, async_aquire_db
from apis.base import print_test, print_debug
from apis.base import Roles

class ProblemTestCase(BaseTestCase):
    async def prepare(self):
        self.url = '/api/problem'
        await self.db.createObject('users', username='hfz', password='4321', email='hfz@hfz.com', role=0)
        await self.db.createObject('users', username='admin', password='1234', email='hfz@hfz.com', role=Roles.ADMIN)

    @async_aquire_db
    async def test_search(self):
        uri = self.url + '/search'
        await self.db.createObject('problems', title = 'hfz111', openness = 1)
        await self.db.createObject('problems', title = 'HTML1', openness = 1)
        await self.db.createObject('problems', title = 'hfzHTML', openness = 1)
        await self.db.createObject('problems', title = 'HTMHFLZ', openness = 1)
        await self.db.createObject('problems', title = 'HTML_HFZ', openness = 0)
        await self.db.createObject('problems', title = '中文题目', openness = 1)
        await self.db.createObject('problems', title = '日本語の問題', openness = 1)

        await self.login(username = 'hfz', password = '4321')

        response = self.getbodyObject(await self.post_request(uri,
                                                              keywords = '  hfz HTML 题目 の '))
        self.assertEqual(5, len(response))
        for res in response:
            # print_test(res)
            self.assertEqual(res['openness'], 1)
            self.assertIn(res['id'], [1, 2, 3, 6, 7])

