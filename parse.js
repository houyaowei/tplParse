'use strict'
var _PARSE_ = (function(){

    //regular syntax
    const regMap = [
        //start with is
        {
            reg : /^if\s+(.+)/i,
            val : (all,condition) => {
                return `if(${condition}){`;
            } 
        },
        //start width elseif 
        {
            reg : /^elseif\s+(.+)/i,
            val : (all,condition) => {
                return `}else if(${conditon}){`
            } 
        },
        //start with else
        {
            reg : /^else/i,
            val : '} else {'
        },
        //end with if
        {
            reg : /^\/\s*if/i,
            val : '}'
        },
        //start with list
        {
            reg: /^list\s+([\S]+)\s+as\s+([\S]+)/i, 
            val: (all, arr, item) => {
                return `for(var __INDEX__=0;__INDEX__<${arr}.length;__INDEX__++) {var ${item}=${arr}[__INDEX__];var ${item}_index=__INDEX__;`;
            }
        },
        //end with list
        {
            reg : /^\/\s*list/i,
            val : '}'
        },
        //start with var variable
        {
            reg : /^var\s+(.+)/i,
            val : (all,expresstion) => {
                return `var ${expresstion};`;
            }
        }
    ];
    //default filter
    const defaultFilter = {
        escape :(str) => {
            var escapeMap = {
                '<' : '&lt;',
                '>' : '&gt;',
                '&' : '&amp;',
                ' ' : '&nbsp;',
                '"' : '&quot;',
                "'" : '&#39;',
                '\n' : '<br/>',
                '\r' : ''
            };
            return str.replace(/\<|\>|\&|\r|\n|\s|\'|\"/g,(oneChar) => {
                escapeMap[oneChar];
            })
        }

    };
    //transform template
    let transTPL = function(tplJs){
        //extend a trim method
        tplJs = tplJs.trim();
        for(let item of regMap) {
            if(item.reg.test(tplJs)) {
                return (typeof item.val === 'function') ? tplJs.replace(item.reg, item.val) : item.val;
            }
        }
    }
    //parse template
    let doParseTemplate = function(content,data,filter){
        content = content.replace(/\t/g,"  ").replace(/\n/g,'\\n').replace(/\r/g,'\\r');

         // initial the tpl engine structure
        let out = [];
        let struct = [
            'try { var OUT = [];',
            '', 
            'return OUT.join(\'\'); } catch(e) { throw e; }'
        ];

        // initial the tpl variables
        let vars = [];
        Object.keys(data).forEach((name) => {
            vars.push(`var ${name} = DATA['${name}'];`);
        });
        out.push(vars.join(''));

        // initial filters
        let filters = ['var FILTERS = {};'];
        Object.keys(filter).forEach((name) => {
        if(typeof filter[name] === 'function') {
            filters.push(`FILTERS['${name}'] = FILTER['${name}'];`);
        }
        });
        out.push(filters.join(''));
         // parse the content
        let beg = 0; // parse the segment begin
        let stmbeg = 0;  // expresstion begin
        let stmend = 0; // expresstion end
        let len = content.length;
        let preCode = ''; // code before expresstion
        let endCode = ''; // last segment code
        let stmJs = ''; // expresstion
        while(beg < len) {
            /* start character*/
            stmbeg = content.indexOf('{', beg);
            while(content.charAt(stmbeg - 1) === '\\') {
                // if escape character
                stmbeg = content.indexOf('{', stmbeg + 1);
            }
            if(stmbeg === -1) {
                endCode = content.substr(beg);
                out.push('OUT.push(\'' + endCode + '\');');
                break;
            }
            /* end character*/
            stmend = content.indexOf('}', stmbeg);
            while(content.charAt(stmend - 1) === '\\') {
                // if escape character
                stmend = content.indexOf('}', stmend + 1);
            }
            if(stmend === -1) {
                break;
            }

            // code before start character 
            preCode = content.substring(beg, stmbeg);

            if(content.charAt(stmbeg - 1) === '$') {
                // get value of variable
                out.push(`OUT.push(\'${preCode.substr(0, preCode.length-1)}\');`);
                stmJs = content.substring(stmbeg + 1, stmend);

                // 处理过滤器
                let tmp = '';
                stmJs.split('|').forEach((item, index) => {
                    if(index === 0) {
                        // 变量，强制转码
                        tmp = item;
                    } else {
                        // 过滤器
                        let farr = item.split(':');
                        tmp = `FILTERS['${farr[0]}'](${tmp}`;

                        if(farr[1]) {
                            // 带变量的过滤器
                            farr[1].split(',').forEach((fitem) => {
                                tmp = `${tmp}, ${fitem}`;
                            }); 
                        }

                        tmp = `${tmp})`; // 追加结尾
                    }
                });

                out.push(`OUT.push((${tmp}).toString());`);
            } else {
                // 针对js语句
                out.push(`OUT.push(\'${preCode}\');`);
                stmJs = content.substring(stmbeg + 1, stmend);
                out.push(transTPL(stmJs));
            }
            beg = stmend + 1;
        }

        // 合并内容
        struct[1] = out.join('');
        return new Function('DATA', 'FILTER', struct.join(''));
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