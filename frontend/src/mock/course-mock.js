import {URL, api_list} from "../ajax-utils/api-manager";
import Mock from 'mockjs';
import {users} from "./auth-mock";

let courses = [{
    id: 0,
    name: "course no.1",
    description: "this is course no.1",
    tas: [0],
    students: [1],
    homeworks: [0, 1],
    status: 1,
    notices: [0, 1]
},{
    id: 1,
    name: "course no.2",
    description: "this is course no.2",
    tas: [0],
    students: [],
    homeworks: [],
    status: 0,
    notices: [],
}];

let course_count = 2;

Mock.mock(URL+api_list['create_course'], function(options) {
    const data = JSON.parse(options.body);
    const new_course = {
        id: course_count,
        name: data.name,
        description: data.description,
        tas: data.tas,
        students: data.students,
        homeworks: [],
        status: 0,
        notices: []
    };
    course_count += 1;
    courses.push(new_course);

    for (let index in users){
        const user = users[index];
        if (user.role === 1) {
            const val = (user, new_course)=>{
                for (let idx in new_course.students)
                    if (new_course.students[idx] === user.id)
                        return true;
                    return false;
            }
            if (val){
                user.student_courses.push(new_course.id);
            }
        } else
        if (user.role === 2){
            const val = (user, new_course)=>{
                for (let idx in new_course.tas)
                    if (new_course.tas[idx] === user.id)
                        return true;
                return false;
            }
            if (val){
                user.ta_courses.push(new_course.id);
            }
        }
    }

    // console.log('courses:');
    // console.log(courses);
    console.log('users');
    console.log(users);
    return {code:0};
});

Mock.mock(URL+api_list['delete_course'], function(options) {
    const data = JSON.parse(options.body);
    const id = data.id;
    for(let index in courses) {
        const course = courses[index];
        if(course.id === id) {
            courses.splice(index, 1);
            return {code:0};
        }
    }
    return {code:1};
});

Mock.mock(URL+api_list['update_course'], function(options) {
   const data = JSON.parse(options.body);
   const id = data.id;
   for(let index in courses) {
       const course = courses[index];
       if(course.id === id ) {
           for(let key in data) {
               course[key] = data[key];
           }
           return {code:0};
       }
   }
   return {code:1};
});

Mock.mock(URL+api_list['query_course'], function(options) {
    const data = JSON.parse(options.body);
    const id = data.id;
    console.log(typeof id);
    for(let index in courses) {
        const course = courses[index];
        if (course.id === id) {
            return [course];
        }
    }
    return [];
});

Mock.mock(URL+api_list['addStudent_course'], function(options) {
    const data = JSON.parse(options.body);
    const course_id = data.course_id;
    const stu_id = data.stu_id;
    for (let index in courses) {
        const course = courses[index];
        if (course.id === course_id){
            courses[index].students.push(stu_id);
            return {code:0};
        }
    }
    return {code:1};
});

Mock.mock(URL+api_list['addTA_course'], function(options) {
    const data = JSON.parse(options.body);
    const course_id = data.course_id;
    const ta_id = data.ta_id;
    for (let index in courses) {
        const course = courses[index];
        if (course.id === course_id){
            courses[index].tas.push(ta_id);
            return {code:0};
        }
    }
    return {code:1};
});

Mock.mock(URL+api_list['deleteStudent_course'], function(options) {
    const data = JSON.parse(options.body);
    const course_id = data.course_id;
    const stu_id = data.stu_id;
    for (let index in courses) {
        const course = courses[index];
        if (course.id === course_id){
            for (let idx in course.students)
                if (course.students[idx] === stu_id){
                    courses[index].students.splice(idx, 1);
                    return {code:0};
                }
        }
    }
    return {code:1};
});

Mock.mock(URL+api_list['deleteTA_course'], function(options) {
    const data = JSON.parse(options.body);
    const course_id = data.course_id;
    const ta_id = data.ta_id;
    for (let index in courses) {
        const course = courses[index];
        if (course.id === course_id){
            for (let idx in course.tas)
                if (course.tas[idx] === ta_id){
                    courses[index].tas.splice(idx, 1);
                    return {code:0};
                }
        }
    }
    return {code:1};
});

export {courses}