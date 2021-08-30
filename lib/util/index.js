/*
 * @Author: czhmisaka
 * @Date: 2021-08-27 23:23:50
 * @LastEditTime: 2021-08-30 10:59:20
 * @LastEditors: Please set LastEditors
 * @Description: 主要js工具
 * @FilePath: /configForPage/lib/util/index.js
 */

const lodash = require("lodash");
let {
    upperFirst,
    camelCase
} = lodash;
const XLSX = require('xlsx');
// dev 模式可以输出提示 work默认没有输出
let mode = 'dev'


/**
 * @Author: czh
 * @name: searchCellByLabel
 * @Description: 按照label的标签搜索工具类
 * @Date: 2021-08-27 23:25:41
 * @param {*}
 * @return {*}
 */
class searchCellByLabel {
    constructor(storage) {
        this.storage = storage
    }
    getByLabel(label) {
        let back = {}
        this.storage.forEach(it => {
            if (label != '' && it.label == label) back = it
        })
        if (!back.label) {
            return {
                label: `-${label}-`,
                prop: Math.random()
            }
        }
        return back
    }
}

/**
 * @Author: czh
 * @name: tableColumnCellMarker
 * @Description: 组装器
 * @Date: 2021-08-27 23:28:49
 * @param {*} prop
 * @param {*} label
 * @param {*} template
 * @param {*} option
 * @return {*}
 */
function tableColumnCellMarker(prop, label, template = null, option = {}) {
    return {
        key: prop,
        value: prop,
        prop,
        label,
        template,
        ...option
    }
}

/**
 * @Author: czh
 * @name: routerCellMaker
 * @Description: 单体路由单元构建类
 * @Date: 2021-08-27 23:27:41
 * @param {*}
 * @return {*}
 */
class routerCellMaker {
    constructor(baseName, cell) {
        this.baseName = baseName
        this.cell = cell
    }
    maker(componentName, otherPath = "", name = "", meta = {}) {
        return {
            path: '/' + this.baseRouter + '/' + (otherPath ? otherPath : name ? name : componentName),
            name: name ? name : componentName,
            component: this.cell[componentName],
            meta: {
                userType: 'BD',
                name,
                ...meta
            },
        }
    }
}


/**
 * @Author: czh
 * @Description: commonDataDealForNormalList 通用数据处理 - replace方案
 * @Date: 2021-08-27 10:10:23
 * @param {*}
 * @return {*}
 */
const commonDataDealForNormalList = (data, replace, that) => {
    for (let xx in replace) {
        let rep = replace[xx]
        if (rep.type == 'func') {
            data[xx] = rep.return(data, that)
        }
        if (rep.type == 'date') {
            data[xx] = that.$DateFormat(data[xx])
        }
        if (rep.type == 'key') {
            data[xx] = data[rep.key]
        }
        if (rep.type == 'SearchByKeyInQueryItemConfig_list') {
            that.queryItemConfig[rep.searchData].map(it_search => {
                if (it_search[rep.key] == data[rep.key]) {
                    data[xx] = it_search[rep.searchKey]
                }
            })
        }
        if (rep.type == 'SearchByKeyInListTemplate') {
            data[xx] = rep.searchData[data[rep.key]] ? rep.searchData[data[rep.key]].label : ''
        }
        if (rep.type == 'SearchByKeyInMapTemplate') {
            data[xx] = rep.searchData[data[rep.key]] ? rep.searchData[data[rep.key]] : ''
        }
        if (rep.type == 'CountryCityAreaDataSearchByAreaIdInAreaOption') {
            rep.target.forEach((it, index) => {
                data[it] = that.queryItemConfig[rep.searchData][data[rep.searchKey]][index]
            })
        }
    }
    return data
}

// loadConfigList 函数
// 调用方式：let that = this;return await that.$utils.loadConfigList(that);
// from 陈之罕 czh
// 需要依赖的参数列表如下
// 可以查看listpage组件或者和detailPage组件
/*
// 页面需求使用时依赖的data
data(){
  config:moduleTemplateConfig, //可选，默认存放配置 find '@/src/configs/pageConfigForNormalList/pudoPositionsList/pudoPositionsListTemplate.js'
  queryItemConfig:{}, // 用于存放处理后的数据 // 一般可以和 queryItemOptions & queryOption 参数联动使用(详情查看listPage组件)
}
*/
const loadConfigList = async (that, queryItemApiConfig = null, baseRoot = null) => {
    try {
        let root = baseRoot || that.config.apiConfig.root
        let Api = queryItemApiConfig || that.config.apiConfig.queryItemApiConfig
        for (let x in Api) {
            let setList = []
            let res = Api[x].localData ? {
                data: Api[x].localData
            } : Api[x].data ? await await that.$axios.post(that.$api[Api[x].root || root][Api[x].api], Api[x]
                .data(that)) : await that.$axios.get(that.$api[Api[x].root || root][Api[x].api])
            if (JSON.stringify(res).split('stackTrace').length > 1) {
                that.$msg('【' + Api[x].root + '.' + Api[x].api + '】请求报错')
            } else {
                if (Api[x].replace.type) {
                    let rep = Api[x].replace
                    if (rep.type == 'keyMap') {
                        for (let xx in res.data) {
                            setList.push({
                                value: xx,
                                label: res.data[xx]
                            })
                        }
                    } else if (rep.type == 'func') {
                        that.queryItemConfig = {
                            ...that.queryItemConfig,
                            ...rep.return(res, that)
                        }
                        continue;
                    } else if (rep.type == 'area') {
                        let resData = JSON.parse(JSON.stringify(res.data))
                        that.queryItemConfig[rep.idToName] = {}
                        resData.forEach(it => {
                            it.children.forEach(item => {
                                item.children.forEach(its => {
                                    that.queryItemConfig[rep.idToName][its.id] = [it.nameEn, item.nameEn, its.nameEn]
                                    its.children = null
                                })
                            })
                        })
                        that.queryItemConfig[rep.areaOption] = resData
                    }
                } else {
                    res.data = typeof res.data == 'array' ? res.data : res.data.data ? res.data.data : res.data
                    res.data.forEach(item => {
                        for (let xx in Api[x].replace) {
                            let rep = Api[x].replace[xx]
                            if (rep.type == 'key' || typeof rep == 'string') {
                                item[xx] = item[rep.key || rep]
                            }
                        }
                        setList.push(item)
                    })
                }
                that.queryItemConfig[x] = setList
            }
        }
        return that.queryItemConfig
    } catch (e) {
        that.$msg('配置环境函数执行失败')
    }
}

/**
 * @Author: czh
 * @name: getJsonFromLSBykey
 * @Description: 从localStorage中取出json
 * @Date: 2021-08-27 23:29:19
 * @param {*} key
 * @return {*}
 */
function getJsonFromLSBykey(key) {
    if (!key) return null
    let data = null
    data = localStorage.getItem(key)
    if (!data) return null
    return JSON.parse(data)
}

// 
/**
 * @Author: czh
 * @name: setJsonAsStrToJsonByKey
 * @Description: 把Json作为string 保存到LocalStorage里
 * @Date: 2021-08-27 23:29:39
 * @param {*} key
 * @param {*} data
 * @return {*}
 */
function setJsonAsStrToJsonByKey(key, data = {}) {
    if (!key) return null
    localStorage.setItem(key, JSON.stringify(data))
}

/**
 * @Author: czh
 * @name: requireComponent
 * @Description: 自动注册组件路径设置,接下来的全量注册函数依赖这个路径去查找组件
 * @Date: 2021-08-27 23:35:28
 * @param {*}
 * @return {*}
 */
const requireComponent = require.context(
    // 其组件目录的相对路径
    '../components/normalListAction/',
    // 是否查询其子目录
    true,
    // 匹配基础组件文件名的正则表达式
    /.*\.vue/
)


/**
 * @Author: czh
 * @name: initList
 * @Description: 全量注册函数（listPage用）
 * @Date: 2021-08-27 23:33:08
 * @param {*} app
 * @return {*}
 */
function initList(app) {
    if (!app) return console.log('组件注册失败,未能获取到Vue对象')
    requireComponent.keys().forEach(fileName => {
        const componentConfig = requireComponent(fileName)
        // 获取组件的 PascalCase 命名
        const componentName = upperFirst(
            camelCase(
                fileName
                .split('/')
                .pop()
                .replace(/\.\w+$/, '')
            )
        )
        // 全局注册组件
        app.component(
            componentName,
            componentConfig.default || componentConfig
        )
    })
}
// 全量js对象获取函数



// 表格导出函数
function openDownloadDialog(url, saveName) {
    if (typeof url == 'object' && url instanceof Blob) {
        url = URL.createObjectURL(url);
    }
    var aLink = document.createElement('a');
    aLink.href = url;
    aLink.download = saveName || '';
    aLink.type = 'download'
    var event;
    if (window.MouseEvent) event = new MouseEvent('click');
    else {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    aLink.dispatchEvent(event);
}

// txt文件下载函数
const downloadUrlFile = (url, fileNmae) => {
    window.location.href = url
}

// 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
function sheet2blob(sheet, sheetName) {
    sheetName = sheetName || 'sheet1';
    var workbook = {
        SheetNames: [sheetName],
        Sheets: {}
    };
    workbook.Sheets[sheetName] = sheet;
    var wopts = {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary'
    };
    var wbout = XLSX.write(workbook, wopts);
    var blob = new Blob([s2ab(wbout)], {
        type: "application/octet-stream"
    });

    function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }
    return blob;
}

function tableToExcelAndDownload(table, fileName) {
    var sheet = XLSX.utils.table_to_sheet(table, {
        raw: true
    });
    openDownloadDialog(sheet2blob(sheet), fileName + '.xlsx');
}

function init(app, srcList = []) {
    // 全量注册normalListPage所需要的组件
    initList(app)
}



module.exports = {
    commonDataDealForNormalList,
    routerCellMaker,
    loadConfigList,
    tableToExcelAndDownload,
    init,
    logError,
    tableColumnCellMarker,
    searchCellByLabel,
    getJsonFromLSBykey,
    setJsonAsStrToJsonByKey,
    openDownloadDialog,
    downloadUrlFile
}