--UPDATE users SET student_courses = array_append(student_courses, 3) WHERE id = 1;
--UPDATE users SET student_courses = array_remove(student_courses, 2) WHERE id = 1;
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
    status INTEGER DEFAULT 0,                --
    email VARCHAR(512),             --
    realname VARCHAR(32) DEFAULT '',           --
    student_id VARCHAR(32) DEFAULT '',         --
    validate_time TIMESTAMP ,          --
    create_time TIMESTAMP DEFAULT current_timestamp,          --
    role INTEGER DEFAULT 1,                   --
    validate_code INTEGER,          --
    gender INTEGER DEFAULT 2,                 --
    student_courses INTEGER[] DEFAULT '{}',      --
    ta_courses INTEGER[] DEFAULT '{}',            --
    secret VARCHAR(64)
);

DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128),
    description TEXT,
    course_spell TEXT,
    tas INTEGER[] DEFAULT '{}',
    students INTEGER[] DEFAULT '{}',
    status INTEGER DEFAULT 0,
    homeworks INTEGER[] DEFAULT '{}',
    notices INTEGER[] DEFAULT '{}',
    start_time TIMESTAMP,
    end_time TIMESTAMP
);

DROP TABLE IF EXISTS homeworks;
CREATE TABLE homeworks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128),
    description TEXT,
    deadline TIMESTAMP,
--    status INTEGER DEFAULT 0,
    problems INTEGER[] DEFAULT '{}',
--    records INTEGER[] DEFAULT '{}',
-- TODO: 本来score_openness 应该默认0
    score_openness INTEGER DEFAULT 1,
    submitable INTEGER DEFAULT 1,
    course_id INTEGER

    -- TODO: 总最终提交数与评测完成数，没有开始评测为-1，开始评测置大于等于0
);

DROP TABLE IF EXISTS problems;
CREATE TABLE problems (
    id SERIAL PRIMARY KEY,
    title VARCHAR(128),
    user_id INTEGER,
--    description_path VARCHAR(256),
    time_limit INTEGER DEFAULT 1000, -- MS
    memory_limit INTEGER DEFAULT 256000,  -- KB
    judge_method INTEGER DEFAULT 1,
    language INTEGER[] DEFAULT '{}',
--    records INTEGER[] DEFAULT '{}',
    openness INTEGER DEFAULT 0,
    status INTEGER DEFAULT 0,
    test_language INTEGER,
    ratio_one INTEGER,
    ratio_one_limit INTEGER,
    ratio_two INTEGER,
    ratio_two_limit INTEGER,
    ratio_three INTEGER,
    ratio_three_limit INTEGER
);

DROP TABLE IF EXISTS records;
CREATE TABLE records (
    id SERIAL PRIMARY KEY,
    description TEXT,
    submit_time TIMESTAMP DEFAULT current_timestamp,
    user_id INTEGER,
    problem_id INTEGER,
    homework_id INTEGER,
    record_type INTEGER,
    result_type INTEGER,
    test_ratio INTEGER,
    src_language INTEGER,
    result INTEGER,
    score INTEGER,
    status INTEGER DEFAULT 0,
    consume_time INTEGER, --ms
    consume_memory INTEGER, --KB
    src_size INTEGER --Byte
--    src_path, VARCHAR(512),
	-- TODO: 把泽神返回的所有结果存起来，并且更新一下Wiki上的API返回值等信息
);



DROP TABLE IF EXISTS notices;
CREATE TABLE notices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    course_id INTEGER,
    title VARCHAR(128),
    content TEXT,
    create_time TIMESTAMP DEFAULT current_timestamp
);

DROP TABLE IF EXISTS judgestates;
CREATE TABLE judgestates (
    id SERIAL PRIMARY KEY,
    homework_id INTEGER,
    problem_id INTEGER,
    total INTEGER DEFAULT 0,
    judged INTEGER DEFAULT 0,
    total_waiting INTEGER DEFAULT 0
);

DROP TABLE IF EXISTS ratios;
CREATE TABLE ratios (
    id SERIAL PRIMARY KEY,
    homework_id INTEGER,
    problem_id INTEGER,
    user_id INTEGER,
    ratio_one_used INTEGER,
    ratio_two_used INTEGER,
    ratio_three_used INTEGER
);

-- TODO: 添加submission表，记录用户id，题目id，作业id，课程id，评测信息

-- create items
--INSERT INTO records (user_id, problem_id, homework_id, record_type) VALUES (1, 3, 1, 4);

INSERT INTO users (username, password, email, role, student_courses, secret) VALUES ('st','1234','siro@163.com', 1, '{2, 1, 3}', 'liadf92wlfisajfli39alsdifj3isd');
INSERT INTO users (username, password, email, role, student_courses, secret) VALUES ('st1','1234','siro@163.com', 1, '{2, 1, 3}', 'liadf92wlfisajfli39alsdifj3isd');
INSERT INTO users (username, password, email, role, student_courses, secret) VALUES ('123hfzt23','1234','siro@163.com', 1, '{2, 1, 3}', 'liadf92wlfisajfli39alsdifj3isd');
INSERT INTO users (username, password, email, role, student_courses, secret) VALUES ('hfz','1234','siro@163.com', 1, '{2, 1, 3}', 'liadf92wlfisajfli39alsdifj3isd');
INSERT INTO users (username, password, email, role, student_courses, secret) VALUES ('fzhe23','1234','siro@163.com', 1, '{2, 1, 3}', 'liadf92wlfisajfli39alsdifj3isd');
INSERT INTO users (username, password, email, role, student_courses, secret) VALUES ('zzz','1234','siro@163.com', 1, '{2, 1, 3}', 'liadf92wlfisajfli39alsdifj3isd');
INSERT INTO users (username, password, email, role, student_courses, secret) VALUES ('hfzzz','1234','siro@163.com', 1, '{2, 1, 3}', 'liadf92wlfisajfli39alsdifj3isd');


UPDATE users SET student_courses = (CASE WHEN '{3}' <@ student_courses THEN student_courses ELSE array_append(student_courses, 3) END) WHERE id = 1;
UPDATE users SET student_courses = array_append(student_courses, 3) WHERE id = 1;

UPDATE users SET student_courses = array_remove(student_courses, 2) WHERE id = 1;

INSERT INTO users (username, password, email, role, TA_courses, student_courses, create_time, secret) VALUES ('ta','1234','zyw@wzy.com', 2, '{}', '{}', TIMESTAMP '2011-05-16 15:36:38', 'faslidjf23453dsafads');
INSERT INTO users (username, password, email, role, TA_courses, student_courses, create_time, secret) VALUES ('admin','1234','zyw@wzy.com', 3, '{}', '{}', TIMESTAMP '2011-05-16 15:36:38', 'fa3ijfa3ffsa9324953');
--INSERT INTO users (username, password, email, role, TA_courses, student_courses, create_time) VALUES ('admin1','1234','zyw@wzy.com', 3, '{}', '{}', TIMESTAMP '2011-05-16 15:36:38');
--INSERT INTO users (username, password, email, role, TA_courses, student_courses, create_time) VALUES ('admin2','1234','zyw@wzy.com', 2, '{}', '{}', TIMESTAMP '2011-05-16 15:36:38');
--INSERT INTO users (username, password, email, role, TA_courses, student_courses, create_time) VALUES ('admin3','1234','zyw@wzy.com', 3, '{}', '{}', TIMESTAMP '2011-05-16 15:36:38');
--INSERT INTO users (username, password, email, role, TA_courses, student_courses, create_time) VALUES ('admin4','1234','zyw@wzy.com', 2, '{}', '{}', TIMESTAMP '2011-05-16 15:36:38');
--INSERT INTO users (username, password, email, role, TA_courses, student_courses, create_time) VALUES ('admin5','1234','zyw@wzy.com', 2, '{}', '{}', TIMESTAMP '2011-05-16 15:36:38');
--INSERT INTO users (username, password, email, role, TA_courses, student_courses, create_time) VALUES ('admin6','1234','zyw@wzy.com', 3, '{}', '{}', TIMESTAMP '2011-05-16 15:36:38');
--
--INSERT INTO notices (user_id, course_id, title, content) VALUES (2, 1, 'This is notice 1.', 'This is notice 1 content.');
--INSERT INTO notices (user_id, course_id, title, content) VALUES (2, 1, 'This is notice 2.', 'This is notice 2 content.');
--INSERT INTO notices (user_id, course_id, title, content) VALUES (2, 1, 'This is notice 3.', 'This is notice 3 content.');
--
--
INSERT INTO homeworks (name, description, deadline, problems, score_openness, submitable, course_id) VALUES ('homework1', 'homework1_desc', TIMESTAMP '2020-05-16 15:36:38', '{1,2,3}', 1, 1, 1);
--INSERT INTO homeworks (name, description, deadline, problems, records, score_openness, submitable) VALUES ('homework2', 'homework1_desc', TIMESTAMP '2011-05-16 15:36:38', '{1,2,3,4}', '{}', 0, 0);
--INSERT INTO homeworks (name, description, deadline, problems, records, score_openness, submitable) VALUES ('homework3', 'homework1_desc', TIMESTAMP '2021-05-16 15:36:38', '{1,2,5}', '{}', 0, 1);
--INSERT INTO homeworks (name, description, deadline, problems, records, score_openness, submitable) VALUES ('homework4', 'homework1_desc', TIMESTAMP '2011-05-16 15:36:38', '{1,2,6,7,8}', '{}', 1, 0);
--INSERT INTO homeworks (name, description, deadline, problems, records, score_openness, submitable) VALUES ('homework5', 'homework1_desc', TIMESTAMP '2011-05-16 15:36:38', '{1,2,3,5,7}', '{}', 1, 1);
--
-- *************************** DELETED ******************************
--INSERT INTO courses (name, description, TAs, students, status, homeworks, notices, start_time, end_time) VALUES ('software', 'xxxxxxxxxxxx', '{2}', '{1}', 1, '{1}', '{}', TIMESTAMP '2010-05-16 15:36:38', TIMESTAMP '2020-05-16 15:36:38');
--
INSERT INTO courses (name, description, TAs, students, status, homeworks, notices, start_time, end_time) VALUES ('software', 'xxxxxxxxxxxx', '{2}', '{1}', 1, '{1}', '{}', TIMESTAMP '2010-05-16 15:36:38', TIMESTAMP '2020-05-16 15:36:38');
--
INSERT INTO problems (title, time_limit, memory_limit, judge_method, openness, language, user_id, status) VALUES ('A+B', 1000, 1024, 0, 1, '{1, 2, 4}', 2, 1);
INSERT INTO problems (title, time_limit, memory_limit, judge_method, openness, language, user_id, status) VALUES ('ip_sort', 1000, 262144, 1, 1, '{3}', 2, 1);
INSERT INTO problems (title, time_limit, memory_limit, judge_method, openness, language, user_id, status) VALUES ('HTML', 1000, 1024, 2, 0, '{}', 2, 1);
---- INSERT INTO problems (title, judge_method, records, openness, user_id, status) VALUES ('html test', 2, '{1}', 1, 2, 1);
--
--INSERT INTO records (description, user_id, problem_id, homework_id, record_type, result_type, result, score) VALUES ('XX', 1, 2, 1, 2, 2, 0, 100);
--INSERT INTO records (description, user_id, problem_id, homework_id, record_type, result_type, result, score) VALUES ('XX', 1, 1, 1, 2, 1, 0, 100);
--INSERT INTO records (description, user_id, problem_id, homework_id, record_type, result_type, result, score) VALUES ('XX', 1, 2, 2, 2, 2, 0, 100);
--INSERT INTO records (description, user_id, problem_id, homework_id, record_type, result_type, result, score) VALUES ('XX', 1, 1, 2, 2, 1, 0, 100);
--INSERT INTO records (description, user_id, problem_id, homework_id, record_type, result_type, result, score) VALUES ('XX', 1, 2, 3, 2, 2, 0, 100);
--INSERT INTO records (description, user_id, problem_id, homework_id, record_type, result_type, result, score) VALUES ('XX', 1, 1, 3, 2, 1, 0, 100);
--INSERT INTO records (description, user_id, problem_id, homework_id, record_type, result_type, result, score) VALUES ('XX', 1, 2, 4, 2, 2, 0, 100);
--INSERT INTO records (description, user_id, problem_id, homework_id, record_type, result_type, result, score) VALUES ('XX', 1, 1, 4, 2, 1, 0, 100);
--INSERT INTO records (description, user_id, problem_id, homework_id, record_type, result_type, result, score) VALUES ('XX', 1, 1, 5, 2, 1, 0, 100);
--INSERT INTO records (description, user_id, problem_id, homework_id, record_type, result_type, result, score) VALUES ('XX', 1, 3, 5, 2, 1, 1, 100);
--INSERT INTO records (description, user_id, problem_id, homework_id, record_type, result_type, result, score) VALUES ('XX', 1, 5, 5, 2, 1, 2, 100);
--INSERT INTO records (description, user_id, problem_id, homework_id, record_type, result_type, result, score) VALUES ('XX', 1, 7, 5, 2, 1, 3, 100);
--INSERT INTO records (description, user_id, problem_id, homework_id, record_type, result_type, result, score) VALUES ('XX', 1, 2, 5, 2, 2, 0, 100);

-- INSERT INTO records (user_id, problem_id, homework_id, submit_time, score, result, consume_time, consume_memory, src_size) VALUES (2, 1, 1, TIMESTAMP '2011-05-16 15:36:38', 0, 211, 10, 5);
INSERT INTO judgestates (homework_id, problem_id, total, judged, total_waiting) VALUES (1, 1, 0, 0, 0);
INSERT INTO judgestates (homework_id, problem_id, total, judged, total_waiting) VALUES (1, 2, 0, 0, 0);
INSERT INTO judgestates (homework_id, problem_id, total, judged, total_waiting) VALUES (1, 3, 0, 0, 0);
