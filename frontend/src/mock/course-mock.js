import {URL, api_list} from "../ajax-utils/api-manager";
import Mock from 'mockjs';

let courses = [{
    id: 0,
    name: "course no.1",
    description: "this is course no.1",
    TAs: [0],
    students: [1],
    homeworks: [],
    status: 1,
    notices: []
},{
    id: 1,
    name: "course no.2",
    description: "this is course no.2",
    TAs: [0],
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
        description: window.atob(data.description),
        TAs: data.TAs,
        students: data.students
    };
    course_count += 1;
    courses.push(new_course);
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
            courses[index].TAs.push(ta_id);
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
            for (let idx in course.TAs)
                if (course.TAs[idx] === ta_id){
                    courses[index].TAs.splice(idx, 1);
                    return {code:0};
                }
        }
    }
    return {code:1};
});