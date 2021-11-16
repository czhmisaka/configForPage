/*
 * @Author: czh
 * @Date: 2021-08-30 15:40:13
 * Api注入和管理
 */


const fs = require('fs');

/**
 * @Author: czh
 * @name: _getPathInfo
 * @Description: Do not show any view
 * @Date: 2021-11-11 16:23:37
 * @param {src:String,needDeep:Boolean,endTag:String}
 * @type {needDeep为是否进行深度搜索,endTag为文件后缀名}
 * @return {*}
 */
const _getPathInfo = (src, needDeep = false, endTag = '.js', pathList = []) => {
    let needSearchList = []
    fs.readdirSync(src, {
        withFileTypes: true
    }).map(x => {
        if (x.isDirectory()) needSearchList.push(src + x.name + '/')
        else pathList.push(src + x.name)
    })
    if (!needDeep) return pathList;
    needSearchList.map(x => [
        pathList = _getPathInfo(x, needDeep, endTag, pathList)
    ])
    return pathList;
}

/**
 * @Author: czh
 * @name: searchApiFromJS
 * @Description: 从指定路径中搜索Api进行注入
 * @Date: 2021-10-14 11:15:11
 * @param {pathList<Object>}
 * @type {{pathlist参数示例:[{[.src,needDeep,endTag]}]}}
 * @return {*}
 * 等待到适配vue3的时候进行ts化
 */
const searchApiFromJS = (pathList = []) => {
    if (!pathList || pathList.length == 0) return console.error('Api加载错误：【searchApiFromJS】', pathList);
    modules = [];
    pathList.map(x => {
        _getPathInfo(x.src, x.needDeep || false, x.endTag || '.js').map((y) => {
            modules.push(require(y))
        })
    })
    return modules;
}



/**
 * @Author: czh
 * @name: searchFileByPath
 * @Description: 搜索模块
 * @Date: 2021-10-14 11:18:18
 * @param {*}
 * @return {*}
 */
const searchModulesByPath = (path = null) => {

}




const test = [{
    src: './',
    needDeep: false
}]
console.log(searchApiFromJS(test))

module.exports = {
    searchApiFromJS,
    searchModulesByPath
}