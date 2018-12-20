# from basetestcase.basetestcase import BaseTestCase, async_aquire_db
import unittest
import tornado.testing
from basetestcase.basetestcase import BaseTestCase, async_aquire_db
from apis.base import print_test, print_debug, Roles

class UserTest(BaseTestCase):

    async def prepare(self):
        self.url = '/api/user'
        await self.db.createObject('users', username = 'hfz', password = '4321', email = 'hfz@hfz.com', role = 0, secret = '1343')
        self.user_st = await self.db.createObject('users', username = 'student', password = 'student', email = 'hfz@hfz.com', role = Roles.STUDENT, secret = '1343')
        self.user_ta = await self.db.createObject('users', username = 'ta', password = 'ta', email = 'hfz@hfz.com', role = Roles.TA, secret = '1343')
        self.user_admin = await self.db.createObject('users', username = 'admin', password = '1234', email = 'hfz@hfz.com', role = Roles.ADMIN, secret = '1343')
        # await self.db.createObject('users', username='admin', password='hfz', email='hfz@hfz.com', role = 4)

    @async_aquire_db
    async def test_create(self):
        uri = self.url + '/create'

        # fail: user already exist
        response = self.getbodyObject(await self.post_request(uri,
                                           username = 'hfz',
                                           password = '123',
                                           email = 'hfz@123.com'))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 1)

        # pass
        response = self.getbodyObject(await
        self.post_request(uri,
                          username='hfzz',
                          password='123',
                          email='hfz@123.com'))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 0)
        dbobj = (await self.db.getObject('users', username = 'hfzz'))[0]
        self.assertEqual(dbobj.username, 'hfzz')
        self.assertEqual(dbobj.password, '123')
        self.assertEqual(dbobj.email, 'hfz@123.com')


        # fail: absent of password
        response = self.getbodyObject(await self.post_request(uri,
                                           username = 'hfz'))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 1)

        # pass with additional field
        response = self.getbodyObject(await
        self.post_request(uri,
                          username='hfzzz',
                          password='123',
                          email='hfz@123.com',
                          role = 3))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 0)
        dbobj = (await self.db.getObject('users', username = 'hfzzz'))[0]
        self.assertEqual(dbobj.username, 'hfzzz')
        self.assertEqual(dbobj.password, '123')
        self.assertEqual(dbobj.email, 'hfz@123.com')
        self.assertEqual(dbobj.role, 1)

    @async_aquire_db
    async def test_login(self):
        uri = self.url + '/login'
        # fail: user do not exist
        response = self.getbodyObject(await self.post_request(uri,
                                           username = 'hfzz',
                                           password = '123'))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 1)

        # fail: incorrect password
        response = self.getbodyObject(await self.post_request(uri,
                                           username = 'hfz',
                                           password = '123'))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 1)

        # success
        response = self.getbodyObject(await self.post_request(uri,
                                                              username='hfz',
                                                              password='4321'))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 0)
        dbobj = (await self.db.getObject('users', username = 'hfz'))[0]
        self.assertEqual(response['id'], dbobj.id)
        self.assertEqual(response['role'], dbobj.role)

        # TODO: can one login in if he's already online?
        pass

    @async_aquire_db
    async def test_logout(self):
        uri = self.url + '/logout'
        # fail: user do not exist
        response = self.getbodyObject(await self.post_request(uri,
                                                              id = 100))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 1)
        # print_test('xxxx')

        # fail: absent of id field
        response = self.getbodyObject(await self.post_request(uri))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 1)

        # fail: not logged in
        hfzobj = (await self.db.getObject('users', username = 'hfz'))[0]
        response = self.getbodyObject(await self.post_request(uri,
                                                              id = hfzobj.id))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 1)

        # success
        #     login first
        response = self.getbodyObject(await self.post_request(self.url + '/login',
                                                              username='hfz',
                                                              password='4321'))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 0)
        user_id = response['id']
        response = self.getbodyObject(await self.post_request(uri,
                                                              id=response['id']))
        self.assertEqual(0, response['code'])
        response = self.getbodyObject(await self.post_request(uri,
                                                              id=user_id))
        self.assertEqual(1, response['code'])

    @async_aquire_db
    async def test_delete(self):
        pass

    @async_aquire_db
    async def test_createTA(self):
        uri = self.url + '/createTA'

        # no permission
        response = self.getbodyObject(await self.post_request(self.url + '/login',
                                                              username='hfz',
                                                              password='4321'))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 0)

        response = self.getbodyObject(await self.post_request(uri,
                                                              username='hfzTA',
                                                              password='TA234',
                                                              email = '123@hfz.com',
                                                              realname = 'hongfangzhou',
                                                              student_id = '2016013259'))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 1)

        # pass
        response = self.getbodyObject(await self.post_request(self.url + '/login',
                                                              username='admin',
                                                              password='1234'))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 0)

        response = self.getbodyObject(await self.post_request(uri,
                                                              username='hfzTA',
                                                              password='TA234',
                                                              email = '123@hfz.com',
                                                              realname = 'hongfangzhou',
                                                              student_id = '2016013259'))

        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 0)
        obj = await self.db.getObjectOne('users', username = 'hfzTA')
        self.assertEqual(obj['student_id'], '2016013259')
        self.assertEqual(obj['role'], Roles.TA )
        self.assertEqual(obj['status'], 1)

    @async_aquire_db
    async def test_query(self):
        uri = self.url + '/query'
        student_2 = await self.db.createObject('users', username = 'student_2', password = 'student_2', secret = '12423')
        response = await self.post_request_return_object(uri, id = self.user_st['id'])
        self.assertEqual(1, response['code'])
        # student
        await self.login_object(self.user_st)
        response = await self.post_request_return_object(uri, id = student_2['id'])

        print_debug('test_query:', response)
        self.assertEqual(0, len(response))
        response = await self.post_request_return_object(uri, id = self.user_ta['id'])
        # self.assertEqual(0, response['code'])
        self.assertIsInstance(response, list)
        private_keys = ['student_courses', 'ta_courses']
        nonavalibal_keys = ['validate_time', 'validate_code', 'secret']
        for res in response:
            print_debug('test-query: ', res)
            for keyword in private_keys + nonavalibal_keys:
                self.assertNotIn(keyword, res.keys())

            self.assertListEqual([res['id'], res['username'], res['email']],
                                 [self.user_ta['id'], self.user_ta['username'], self.user_ta['email']])


if __name__ == '__main__':
    tornado.testing.main()
