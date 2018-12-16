import unittest
import tornado.testing
from basetestcase.basetestcase import BaseTestCase, async_aquire_db

class RatioTest(BaseTestCase):
    async def prepare(self):
        self.url = '/api/ratio'
        self.user1 = await self.db.createObject('users', username = 'hfz', password = 'hfz', email = 'hfz@hfz.com', role = 1)
        self.user2 = await self.db.createObject('users', username = 'hfz1', password = 'hfz', email = 'hfz@hfz.com', role = 1)
        await self.db.createObject('ratios', homework_id = 1, problem_id = 1, user_id = self.user1['id'], ratio_one_used = 10, ratio_two_used = 100, ratio_three_used = 1000)
        await self.db.createObject('ratios', homework_id = 1, problem_id = 1, user_id = self.user2['id'], ratio_one_used = 10, ratio_two_used = 100, ratio_three_used = 1000)
    @async_aquire_db
    async def test_query_ratio(self):
        response = self.getbodyObject(await self.post_request('/api/user/login',
            username = 'hfz',
            password = 'hfz'))
        self.assertEqual(response['code'], 0)
        ratio_response = self.getbodyObject(await self.post_request(self.url+'/query', 
            homework_id = 1, problem_id = 1, user_id = self.user1['id']))
        print(ratio_response)
        self.assertEqual(len(ratio_response), 1)
        self.assertEqual(ratio_response[0]['ratio_one_used'], 10)
