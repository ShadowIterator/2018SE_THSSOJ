-- Copyright 2009 FriendFeed
--
-- Licensed under the Apache License, Version 2.0 (the "License"); you may
-- not use this file except in compliance with the License. You may obtain
-- a copy of the License at
--
--     http://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
-- WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
-- License for the specific language governing permissions and limitations
-- under the License.

-- To create the database:
--   CREATE DATABASE blog;
--   CREATE USER blog WITH PASSWORD 'blog';
--   GRANT ALL ON DATABASE blog TO blog;
--
-- To reload the tables:
--   psql -U blog -d blog < schema.sql

-- (x, y)
-- x:
    -- 0 : normal 
    -- 1 : student
    -- 2 : ta
    -- 3 : admin
-- y:
    -- 0 : avalibal for every one
    -- 1 : avalibal for oneself and admin

DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,          --
    username VARCHAR(32) UNIQUE,    --
    password VARCHAR(512),          --
    status INTEGER,                 --
    email VARCHAR(512),             --
    realname VARCHAR(32),           --
    student_id VARCHAR(32),         --
    validate_time TIMESTAMP ,          --
    create_time TIMESTAMP,          --
    role INTEGER,                   --
    validate_code INTEGER,          --
    gender INTEGER,                 --
    student_courses INTEGER[],      --
    ta_courses INTEGER[]            --
);

DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128),
    description TEXT,
    tas INTEGER[],
    students INTEGER[],
    status INTEGER,
    homeworks INTEGER[],
    notices INTEGER[]
);

DROP TABLE IF EXISTS homeworks;
CREATE TABLE homeworks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128),
    description TEXT,
    deadline TIMESTAMP,
    problems INTEGER[],
    records INTEGER[]
);

DROP TABLE IF EXISTS problems;
CREATE TABLE problems (
    id SERIAL PRIMARY KEY,
    title VARCHAR(128),
--    description_path VARCHAR(256),
    time_limit INTEGER, -- MS
    memory_limit INTEGER,  -- KB
    judge_method INTEGER,
    records INTEGER[],
    openness INTEGER
);

DROP TABLE IF EXISTS records;
CREATE TABLE records (
    id SERIAL PRIMARY KEY,
    description TEXT,
    submit_time TIMESTAMP,
    user_id INTEGER,
    problem_id INTEGER,
    homework_id INTEGER,
    result INTEGER,
    score INTEGER,
    submit_status INTEGER,
    consume_time INTEGER, --ms
    consume_memory INTEGER, --KB
    src_size INTEGER --Byte
--    src_path, VARCHAR(512),
);

DROP TABLE IF EXISTS notices;
CREATE TABLE notices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    course_id INTEGER,
    title VARCHAR(128),
    content TEXT
);

-- create items
INSERT INTO users (username, password, email, role) VALUES ('sherlock','1234','1747310410@qq.com', 1);
INSERT INTO users (username, password, email, role, student_courses) VALUES ('st','1234','siro@163.com', 1, '{1}');
INSERT INTO users (username, password, email, role, student_courses) VALUES ('lrj','1234','lrj@163.com', 1, '{1}');
INSERT INTO users (username, password, email, role, TA_courses, student_courses) VALUES ('ta','1234','zyw@wzy.com', 2, '{1}', '{}');

INSERT INTO notices (user_id, course_id, title, content) VALUES (2, 1, 'This is notice 1.', 'This is notice 1 content.');
INSERT INTO notices (user_id, course_id, title, content) VALUES (2, 1, 'This is notice 2.', 'This is notice 2 content.');
INSERT INTO notices (user_id, course_id, title, content) VALUES (2, 1, 'This is notice 3.', 'This is notice 3 content.');

INSERT INTO homeworks (name, description, deadline, problems, records) VALUES ('homework1', 'homework1_desc', TIMESTAMP '2011-05-16 15:36:38', '{1}', '{1}');
INSERT INTO courses (name, description, TAs, students, status, homeworks, notices) VALUES ('software', 'xxxxxxxxxxxx', '{4}', '{2, 3}', 1, '{1}', '{1,2,3}');
INSERT INTO problems (title, time_limit, memory_limit, judge_method, records, openness) VALUES ('A+B', 1000, 1024, 1, '{1}', 1);
INSERT INTO problems (title, time_limit, memory_limit, judge_method, records, openness) VALUES ('ip_sort', 1000, 262144, 2, '{}', 1);
-- INSERT INTO records (user_id, problem_id, homework_id, submit_time, result, consume_time, consume_memory, src_size) VALUES (2, 1, 1, TIMESTAMP '2011-05-16 15:36:38', 0, 211, 10, 5);
