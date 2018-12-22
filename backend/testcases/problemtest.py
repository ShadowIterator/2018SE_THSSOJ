import unittest
import tornado.testing
from basetestcase.basetestcase import BaseTestCase, async_aquire_db
from apis.base import print_test, print_debug
from apis.base import Roles
import subprocess

class ProblemTestCase(BaseTestCase):

    async def prepare(self):
        self.url = '/api/problem'
        self.user_hfz = await self.db.createObject('users', username='hfz', password='4321', email='hfz@hfz.com',
                                                   role=0, secret='1314')
        self.user_st1 = await self.db.createObject('users', username='student1', password='student',
                                                   email='hfz@hfz.com', role=Roles.STUDENT, secret='1343',
                                                   student_courses=[])
        self.user_st2 = await self.db.createObject('users', username='student2', password='student',
                                                   email='hfz@hfz.com', role=Roles.STUDENT, secret='1343',
                                                   student_courses=[])
        self.user_st3 = await self.db.createObject('users', username='student3', password='student',
                                                   email='hfz@hfz.com', role=Roles.STUDENT, secret='1343', )
        self.user_ta1 = await self.db.createObject('users', username='ta1', password='ta', email='hfz@hfz.com',
                                                   role=Roles.TA, secret='1343',
                                                   ta_courses=[])
        self.user_ta2 = await self.db.createObject('users', username='ta2', password='ta', email='hfz@hfz.com',
                                                   role=Roles.TA, secret='1343',
                                                   ta_courses=[])
        self.user_ta3 = await self.db.createObject('users', username='ta3', password='ta', email='hfz@hfz.com',
                                                   role=Roles.TA, secret='1343')
        try:
            self.user_admin = await self.db.getObjectOne('users', username = 'admin')
        except:
            self.user_admin = await self.db.createObject('users', username = 'admin', password = '1234', email = 'hfz@hfz.com', role = Roles.ADMIN, secret = '1343')

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
                                                              keywords = '  hfz  の HTML 题目'))
        self.assertEqual(5, len(response))
        for res in response:
            # print_test(res)
            self.assertEqual(res['openness'], 1)
            self.assertIn(res['id'], [1, 2, 3, 6, 7])


    @async_aquire_db
    async def test_create_0(self):
        # create normal io problem
        pass