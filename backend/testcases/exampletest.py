import unittest
from tornado import gen
import tornado.testing
from basetestcase.basetestcase import BaseTestCase, async_aquire_db
from apis.base import print_test, print_debug


class ExampleTestCase(BaseTestCase):

    @async_aquire_db
    async def test_example(self):
        print_test('example_test')

        # TODO: no way to test condition

        # await gen.multi([self.try_to_dosth_in_db1(), self.try_to_dosth_in_db2()])
    # operating db
    # first request
    #     self.io_loop.spawn_callback(self.try_to_dosth_in_db1)
    #     self.io_loop.spawn_callback(self.try_to_dosth_in_db2)
        # await self.i
        response = await self.get_response(
            '/api/user/query',
            method='POST',
            body='{ "username" : "hfzzz"}'
        )
        self.assertIn(b'hfzzz', response.body)
    # second request
        response = await self.post_request('/api/user/query', username = 'hfzzz1', password = 'pwd')
        self.assertIn(b'"username": "hfzzz1"', response.body)
    # third request
        response = await self.post_request('/api/user/query', username = 'hfzzz')
        response_object = self.getbodyObject(response)
        self.assertEqual(response_object[0]['username'], 'hfzzz')
    # query db
        print_test('getobj in db: ', await self.db.getObject('users', username='hfzzz'))

if __name__ == '__main__':
    tornado.testing.main()
