# from basetestcase.basetestcase import BaseTestCase, async_aquire_db
import unittest
from tornado import gen
import tornado.testing
from basetestcase.basetestcase import BaseTestCase, async_aquire_db
from tornado.locks import Condition

condition = Condition()

class ExampleTestCase(BaseTestCase):

    async def worker1(self):
        pass

    async def worker2(self):
        pass

    async def try_to_dosth_in_db1(self):
        print('try to do 1')
        # await self.db.acquire_lock('users', 1)
        await condition.wait()
        print('try to do 1-ac')
        await self.db.createObject('users', username='hfzzz', password='pwd', email='xx@xx.com')
        print('try to do 1 done')
        condition.notify()
        # await self.db.release_lock('users', 1)

    async def try_to_dosth_in_db2(self):
        print('try to do 2')
        # await self.db.acquire_lock('users', 1)
        await condition.wait()
        print('try to do 2-ac')
        await self.db.createObject('users', username='hfzzz1', password='pwd', email='xx@xx.com')
        condition.notify()
        print('try to do 2 done')


    @async_aquire_db
    async def test_example(self):
        print('example_test')

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
