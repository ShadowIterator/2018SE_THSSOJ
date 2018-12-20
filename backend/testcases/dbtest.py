import unittest
from tornado import gen
import tornado.testing
from basetestcase.basetestcase import BaseTestCase, async_aquire_db
from apis.base import print_test, print_debug


class DBLockTestCase(BaseTestCase):

    async def use_judgestates(self, db, id):
        print_test('use_judgestates: ', id)
        async with db.get_lock_object('judgestates', id):
            obj = await db.getObjectOne('judgestates', id=id)
            obj['judged'] += 1
            print_test('use_judgestates get : ', id, obj)
            await db.saveObject('judgestates', obj)
        print_test('use_judgestates done: ', id)

    async def prepare(self):
        await self.db.createObject('users', username = 'hfzzz', password = 'hfz', email = 'hfz@hfz.com')
        await self.db.createObject('users', username = 'hfzzz1', password = 'pwd', email = 'hfz@hfz.com', role = 1)
        await self.db.createObject('judgestates', homework_id = 1, problem_id = 1, user_id = 1)
        await self.db.createObject('judgestates', homework_id = 1, problem_id = 1, user_id = 2)

    @async_aquire_db
    async def test_lock1(self):
        await gen.multi([self.use_judgestates(self.db, 1), self.use_judgestates(self.db, 1)])
        obj = await self.db.getObjectOne('judgestates', id = 1)
        print_test('after op: ', obj)
        self.assertEqual(obj['judged'], 2)

    @async_aquire_db
    async def test_lock2(self):
        await gen.multi([self.use_judgestates(self.db, 1), self.use_judgestates(self.db, 2)])
        obj = await self.db.getObjectOne('judgestates', id = 1)
        print_test('after op: ', obj)
        self.assertEqual(obj['judged'], 1)

class DBAppendArrayElementTestCase(BaseTestCase):

    async def prepare(self):
        self.user = await self.db.createObject('users',
                                               username = 'hfz',
                                               password = 'fzh',
                                               email = 'xxx',
                                               student_courses = [1, 2, 1, 3])

    async def multi_access_db_append(self, k):
        obj = await self.db.getObjectOne('users', id = self.user['id'])
        obj['ta_courses'].append(k)
        await self.db.saveObject('users', obj)

    async def multi_access_db_append_atom(self, k):
        await self.db.insert_element_in_array('users', column_name = 'ta_courses', value = k, id = self.user['id'])

    async def multi_access_db_append_atom_unique(self, k):
        await self.db.insert_element_in_array_unique('users', column_name = 'ta_courses', value = k, id = self.user['id'])


    @async_aquire_db
    async def test_append_none_atom(self):
        await gen.multi([self.multi_access_db_append(2), self.multi_access_db_append(3)])
        obj = await self.db.getObjectOne('users', id = self.user['id'])
        self.assertEqual(1, len(obj['ta_courses']))

    @async_aquire_db
    async def test_append_atom(self):
        await gen.multi([self.multi_access_db_append_atom(3),
                         self.multi_access_db_append_atom(2),
                         self.multi_access_db_append_atom(3)])
        obj = await self.db.getObjectOne('users', id = self.user['id'])
        self.assertIn(2, obj['ta_courses'])
        self.assertIn(3, obj['ta_courses'])
        self.assertEqual(2, obj['ta_courses'].count(3))

    @async_aquire_db
    async def test_append_atom_unique(self):
        await gen.multi([self.multi_access_db_append_atom_unique(3),
                         self.multi_access_db_append_atom_unique(2),
                         self.multi_access_db_append_atom_unique(3)])
        obj = await self.db.getObjectOne('users', id = self.user['id'])
        self.assertIn(2, obj['ta_courses'])
        self.assertIn(3, obj['ta_courses'])
        self.assertEqual(1, obj['ta_courses'].count(3))

    async def multi_access_db_remove_atom(self, k):
        await self.db.remove_element_in_array('users', column_name = 'student_courses', value = k, id = self.user['id'])

    @async_aquire_db
    async def test_remove_atom(self):
        await gen.multi([self.multi_access_db_remove_atom(2),
                         self.multi_access_db_remove_atom(3),
                         self.multi_access_db_remove_atom(2)])
        obj = await self.db.getObjectOne('users', id=self.user['id'])
        student_courses = obj['student_courses']
        self.assertNotIn(2, student_courses)
        self.assertNotIn(3, student_courses)



if __name__ == '__main__':
    tornado.testing.main()
