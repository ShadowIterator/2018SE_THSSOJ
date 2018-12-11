# from basetestcase.basetestcase import BaseTestCase, async_aquire_db
import unittest
import tornado.testing
import os
from ..basetestcase.basetestcase import BaseTestCase, async_aquire_db

class ExampleTestCase(BaseTestCase):

    @async_aquire_db
    async def test_example(self):
        print('example_test')
    # operating db
        await self.db.createObject('users', username='hfzzz', password='pwd', email='xx@xx.com')
        await self.db.createObject('users', username='hfzzz1', password='pwd', email='xx@xx.com')
    # first request
        response = await self.get_response(
            '/api/user/query',
            method='POST',
            body='{ "username" : "st"}'
        )
        self.assertIn(b'st', response.body)
    # second request
        response = await self.post_request('/api/user/query', username = 'hfzzz1', password = 'pwd')
        self.assertIn(b'"username": "hfzzz1"', response.body)
    # third request
        response = await self.post_request('/api/user/query', username = 'hfzzz')
        response_object = self.getbodyObject(response)
        self.assertEqual(response_object[0]['username'], 'hfzzz')
    # query db
        print('getobj in db: ', await self.db.getObject('users', username='hfzzz'))

if __name__ == '__main__':
    tornado.testing.main()
