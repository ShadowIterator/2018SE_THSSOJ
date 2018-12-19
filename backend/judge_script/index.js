'use strict';

function ip_sort(ip_addresses) {
	// TODO:
    ip_addresses.sort(function (a, b) {
    let a_ = a.split(".");
    let b_ = b.split(".");
    for (let i = 0; i < a_.length && i < b_.length; i++){
        if (parseInt(a_[i]) !== parseInt(b_[i])) return parseInt(a_[i])-parseInt(b_[i]);
    }
    return 0;
})
return ip_addresses;
}