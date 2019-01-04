# from basetestcase.basetestcase import BaseTestCase, async_aquire_db
import unittest
import tornado.testing
from basetestcase.basetestcase import BaseTestCase, async_aquire_db, get_md5
from apis.base import print_test, print_debug, Roles

class UserTest(BaseTestCase):

    async def prepare(self):
        self.url = '/api/user'
        await self.createUser('users', username = 'hfz', password = '4321', email = 'hfz@hfz.com', role = 0, secret = '1343')
        self.user_st = await self.createUser('users', username = 'student', password = 'student', email = 'hfz@hfz.com', role = Roles.STUDENT, secret = '1343')
        self.user_ta = await self.createUser('users', username = 'ta', password = 'ta', email = 'hfz@hfz.com', role = Roles.TA, secret = '1343')
        try:
            self.user_admin = await self.db.getObjectOne('users', username = 'admin')
            self.user_admin['password'] = self.admin_pass
        except:
            self.user_admin = await self.createUser('users', username = 'admin', password = '1234', email = 'hfz@hfz.com', role = Roles.ADMIN, secret = '1343')


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
        # self.assertEqual(dbobj.password, '123')
        self.assertEqual(dbobj.email, 'hfz@123.com')


        # fail: absent of password
        response = self.getbodyObject(await self.post_request(uri,
                                           username = 'hfz'))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 1)

        # pass with additional field
        response = self.getbodyObject(await
        self.post_request(uri,
                          username='hfz22zz',
                          password='123',
                          email='hfz@123.com',
                          role = 3))
        self.assertIsInstance(response, dict)
        self.assertEqual(response['code'], 0)
        dbobj = (await self.db.getObject('users', username = 'hfz22zz'))[0]
        self.assertEqual(dbobj.username, 'hfz22zz')
        # self.assertEqual(dbobj.password, '123')
        self.assertEqual(dbobj.email, 'hfz@123.com')
        self.assertEqual(dbobj.role, 1)

    @async_aquire_db
    async def test_login(self):
        print_test('test: login. ')
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
        print_test('test: logout. ')
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

        # student query ta
        response = await self.post_request_return_object(uri, id = self.user_ta['id'])
        self.assertIsInstance(response, list)
        private_keys = ['student_courses', 'ta_courses']
        nonavalibal_keys = ['validate_time', 'validate_code', 'secret', 'password']
        for res in response:
            print_debug('test-query: ', res)
            for keyword in private_keys + nonavalibal_keys:
                self.assertNotIn(keyword, res.keys())

            self.assertListEqual([res['id'], res['username'], res['email']],
                                 [self.user_ta['id'], self.user_ta['username'], self.user_ta['email']])

        # student query st
        response = await self.post_request_return_object(uri, id = student_2['id'])
        self.assertIsInstance(response, list)
        self.assertEqual(0, len(response))

        # student query self
        response = await self.post_request_return_object(uri, id = self.user_st['id'])
        self.assertIsInstance(response, list)
        for res in response:
            # print_debug('test')
            for keyword in nonavalibal_keys:
                self.assertNotIn(keyword, res.keys())

        #ta querys
        await self.login_object(self.user_ta)
        response = await self.post_request_return_object(uri, id = self.user_st['id'])
        self.assertIsInstance(response, list)
        self.assertEqual(1, len(response))
        for keyword in nonavalibal_keys:
            self.assertNotIn(keyword, response[0].keys())

    @async_aquire_db
    async def test_update(self):
        uri = self.url + '/update'
        response = await self.post_request_return_object(uri, id = self.user_st['id'], username = '32esdad')
        self.assertEqual(1, response['code'])

        await self.login_object(self.user_st)
        # update it self
        update_option = {'username': 'hongfz16', 'gender': 2}
        response = await self.post_request_return_object(uri, id = self.user_st['id'], **update_option)
        self.assertEqual(0, response['code'])
        updated = await self.db.getObjectOne('users', id = self.user_st['id'])
        self.assertListEqual([updated['username'], updated['gender']],
                             [update_option['username'], update_option['gender']])
        # update others
        await self.login_object(self.user_ta)
        response = await self.post_request_return_object(uri, id = self.user_st['id'], username = 'laifadie')
        self.assertEqual(1, response['code'])
        updated = await self.db.getObjectOne('users', id = self.user_st['id'])
        self.assertEqual(update_option['username'], updated['username'])

        # update sensitive colums
        user_ta_obj = await self.db.getObjectOne('users', id = self.user_ta['id'])
        update_option = {
            'ta_courses': [1, 3, 4],
            'student_courses': [1, 3, 9],
            'password': 'hfztttttql',
            'validate_time': 12432343,
            'validate_code': '123',
            'role': 3,
            'create_time': 23243,
            'secret': 'lifasdlfeifaf'
        }
        response = await self.post_request_return_object(uri, id = self.user_ta['id'], **update_option)
        user_ta_obj_upd = await self.db.getObjectOne('users', id = self.user_ta['id'])
        for key in update_option.keys():
            self.assertEqual(user_ta_obj[key], user_ta_obj_upd[key])

        # update by admin
        await self.login_object(self.user_admin)
        user_ta_obj = await self.db.getObjectOne('users', id=self.user_ta['id'])
        update_option = {
            'ta_courses': [1, 3, 4],
            'student_courses': [1, 3, 9],
            'password': 'hfztttttql',
            'validate_time': 12432343,
            'validate_code': 123,
            'role': 3,
            'create_time': 23243,
            'secret': 'lifasdlfeifaf'
        }
        response = await self.post_request_return_object(uri, id=self.user_ta['id'], **update_option)
        user_ta_obj_upd = await self.db.getObjectOne('users', id=self.user_ta['id'])
        self.assertEqual(0, response['code'])
        for key in update_option.keys():
            if(key != 'validate_time' and key != 'create_time'):
                self.assertEqual(update_option[key], user_ta_obj_upd[key])

    @async_aquire_db
    async def test_modifypwd(self):
        # response = await self.post_request_return_object('/api/ratio/list', start = 1, end =  2)
        # print('test list: ', response)
        print_test('test_modifypwd')
        uri = self.url + '/modifypwd'
        # not log in
        response = await self.post_request_return_object(uri, id = self.user_st['id'], old_pwd = self.user_st['password'], new_pwd = 'hfztttql')
        self.assertEqual(1, response['code'])

        # modify success
        await self.login_object(self.user_ta)
        modify_options = {
            'old_pwd': self.user_ta['password'],
            'new_pwd': 'hfzttttql'
        }
        response = await self.post_request_return_object(uri, id = self.user_ta['id'], **modify_options)
        self.assertEqual(0, response['code'])
        modified = await self.db.getObjectOne('users', id = self.user_ta['id'])
        self.assertEqual(modified['password'], get_md5(modify_options['new_pwd']))

        # modify failed
        modify_options = {
            'old_pwd': 'wrongpass',
            'new_pwd': 'failed'
        }
        response = await self.post_request_return_object(uri, id = self.user_ta['id'], **modify_options)
        self.assertEqual(1, response['code'])
        modified_2 = await self.db.getObjectOne('users', id=self.user_ta['id'])
        self.assertNotEqual(modified['password'], get_md5(modified_2['password']))

        #modify other
        modify_options = {
            'old_pwd': self.user_st['password'],
            'new_pwd': 'failed'
        }
        response = await self.post_request_return_object(uri, id = self.user_st['id'], **modify_options)
        modified_3 = await self.db.getObjectOne('users', id = self.user_st['id'])
        self.assertEqual(1, response['code'])
        self.assertNotEqual(self.user_st['password'], get_md5(modified_3['password']))

    @async_aquire_db
    async def test_delete(self):
        print_test('test: delete. ')
        uri = self.url + '/delete'
        # no permission
        await self.login_object(self.user_ta)
        respons = await self.post_request_return_object(uri, id = self.user_st['id'])
        self.assertEqual(1, respons['code'])
        user_st_query_result = await self.db.getObject('users', id = self.user_st['id'])
        self.assertIsInstance(user_st_query_result, list)
        self.assertEqual(1, len(user_st_query_result))
        # success
        await self.login_object(self.user_admin)
        respons = await self.post_request_return_object(uri, id = self.user_st['id'])
        self.assertEqual(0, respons['code'])
        user_st_query_result = await self.db.getObject('users', id = self.user_st['id'])
        self.assertEqual(0, len(user_st_query_result))

if __name__ == '__main__':
    tornado.testing.main()
