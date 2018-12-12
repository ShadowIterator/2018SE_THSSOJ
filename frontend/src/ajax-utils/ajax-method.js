import axios from 'axios';
import {URL} from './api-manager';
import {message} from 'antd';


function ajax_post(url,data,that,callback){
    axios({
        method:"POST",
        headers:{'Content-type':'application/json'},
        url:URL+url,
        data:data,
        withCredentials:true
    }).then(function(res){
        console.log('Post请求到:\t'+url);
        console.log(res);
        callback(that,res);
    }).catch(function(error){
        // alert('post失败');
        message.error("post方法失败");
        console.log(error);
        console.log(URL+url);
        console.log(data);
    });
}
function ajax_get(url,data,that,callback){
    axios({
        method:"GET",
        headers:{'Content-type':'application/json',},
        url:URL+url,
        withCredentials:true
    }).then(function(res){
        console.log('Get请求到:\t'+url);
        console.log(res);
        callback(that,res);
    }).catch(function(error){
        // alert('get下载失败');
        message.error("get方法失败");
        console.log(error);
    });
}

export {ajax_get, ajax_post}