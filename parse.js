'use strict'
var _PARSE_ = (function(){

    //default filter
    const defaultFilter = {

    };
    //parse template
    let doParseTemplate = function(content,data,filter){

    };
    return function(content, data, filter){
        try {
            data = data || {};
            filter = Object.assign({}, defaultFilter,filter);
            let f = doParseTemplate(content, data, filter);
            return f(data, filter);
        } catch (error) {
            return error.stack;
        }
    }
})();

if(typeof module !== "undefined" && typeof exports === 'object'){
    module.exports = _PARSE_;
} else {
    window.parse = _PARSE_;
}