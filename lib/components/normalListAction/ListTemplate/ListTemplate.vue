<!--
 * @Author: czh
 * @Date: 2021-09-30 17:01:47
-->

<template>
    <div v-loading.fullscreen.lock="fullScreenLoading">
        <el-table ref="tableController" :data="infoDataList" border stripe v-loading="loading" style="cursor:default"
            height="100%" :row-style="{'min-height':'30px','min-width':'100px'}" :fit='true' :span-method="spanMethod"
            @row-dblclick="rouDblClick">
            <div v-for="(item) in tableColumnList" v-bind:key="item.label+''+Math.random(1)">
                <el-table-column v-if="item.sortable" :width="item.width||200" :label="item.label" :prop="item.prop"
                    :sortable="item.sortable" :filters="filtersList[item.prop]" :filter-method="filterByProp">
                    <template slot-scope="scope">
                        <div v-if="item.template" :style="';display:inline-block;overflow:hidden'">
                            <span v-for="(it,ind) in item.template" v-bind:key="ind+''">
                                <span v-if="!it.element"
                                    :style="item.style">{{it.key?(scope.row[it.key]?scope.row[it.key]:it.value):it.value}}</span>
                                <span v-if="it.element=='tag'" :style="item.style">
                                    <el-tag :type="it.elementType?it.elementType(scope.row):'primary'" dark
                                        v-if="it.return?it.return(scope.row):it.value?it.value:scope.row[it.key]">
                                        {{it.return?it.return(scope.row):it.value?it.value:scope.row[it.key]}}</el-tag>
                                </span>
                                <span v-if="it.element == 'func'" :style="item.style">
                                    {{it.return(scope.row,queryItemConfig)}}
                                </span>
                                <div v-if="it.element == 'funcTag'" :style="item.style">
                                    <span v-if="it.return(scope.row,queryItemConfig).length">
                                        <span v-for="(itTag,indTag) in it.return(scope.row,queryItemConfig)"
                                            :key="indTag+'asd'">
                                            <el-tag :type="itTag['type']" style="margin:0px 0px 5px 5px;">
                                                {{itTag['data']}}
                                            </el-tag>
                                        </span>
                                    </span>
                                    <span v-else :style="it.click?'cursor:pointer;':''">
                                        <el-tag :type="it.return(scope.row,queryItemConfig)['type']">
                                            {{it.return(scope.row,queryItemConfig)['data']}}</el-tag>
                                    </span>
                                </div>
                            </span>
                        </div>
                        <span v-else>
                            <el-popover placement="top-start" :title="item.label" width="200" trigger="hover"
                                :content="typeof scope.row[item.prop] == 'object'? JSON.stringify(scope.row[item.prop]):(scope.row[item.prop]+'')">
                                <div slot="reference"
                                    :style="'max-width:90%;max-height:1.5em;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'+item.style">
                                    {{typeof scope.row[item.prop] == 'object'? JSON.stringify(scope.row[item.prop]):(scope.row[item.prop]+'')}}
                                </div>
                            </el-popover>
                        </span>
                    </template>
                </el-table-column>
                <el-table-column v-else :width="item.width||200" :label="item.label" :prop="item.prop"
                    :sortable="item.sortable">
                    <template slot-scope="scope">
                        <div v-if="item.template" :style="';display:inline-block;overflow:hidden'">
                            <span v-for="(it,ind) in item.template" v-bind:key="ind+''">
                                <span v-if="!it.element"
                                    :style="item.style">{{it.key?(scope.row[it.key]?scope.row[it.key]:it.value):it.value}}</span>
                                <span v-if="it.element=='tag'" :style="item.style">
                                    <el-tag :type="it.elementType?it.elementType(scope.row):'primary'" dark
                                        v-if="it.return?it.return(scope.row):it.value?it.value:scope.row[it.key]">
                                        {{it.return?it.return(scope.row):it.value?it.value:scope.row[it.key]}}</el-tag>
                                </span>
                                <span v-if="it.element == 'func'" :style="item.style">
                                    {{it.return(scope.row,queryItemConfig)}}
                                </span>
                                <div v-if="it.element == 'funcTag'" :style="item.style">
                                    <span v-if="it.return(scope.row,queryItemConfig).length">
                                        <span v-for="(itTag,indTag) in it.return(scope.row,queryItemConfig)"
                                            :key="indTag+'asd'">
                                            <el-tag :type="itTag['type']" style="margin:0px 0px 5px 5px;">
                                                {{itTag['data']}}
                                            </el-tag>
                                        </span>
                                    </span>
                                    <span v-else :style="it.click?'cursor:pointer;':''">
                                        <el-tag :type="it.return(scope.row,queryItemConfig)['type']">
                                            {{it.return(scope.row,queryItemConfig)['data']}}</el-tag>
                                    </span>
                                </div>
                            </span>
                        </div>
                        <span v-else>
                            <el-popover placement="top-start" :title="item.label" width="200" trigger="hover"
                                :content="typeof scope.row[item.prop] == 'object'? JSON.stringify(scope.row[item.prop]):(scope.row[item.prop]+'')">
                                <div slot="reference"
                                    :style="'max-width:90%;max-height:1.5em;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;'+item.style">
                                    {{typeof scope.row[item.prop] == 'object'? JSON.stringify(scope.row[item.prop]):(scope.row[item.prop]+'')}}
                                </div>
                            </el-popover>
                        </span>
                    </template>
                </el-table-column>
            </div>
            <el-table-column fixed="right" label="操作" v-if="dealTool&&dealTool.length>0"
                :width="dealTool_width||'80px'">
                <template slot-scope="scope"
                    style="margin-right:10px;display:inline-block;display:inline-block;width:auto;">
                    <div v-for="(it,ind) in dealTool" :key="it.name+ind" :style="it.style">
                        <el-button size="mini"
                            :style="'display:inline-block;'+(dealTool.length>1&&ind<dealTool.length-1?'margin-bottom:10px':'')"
                            :disabled="it.disable?it.disable(scope.row):false"
                            :type="it.typeFunc?it.typeFunc(scope.row):it.type"
                            @click="(e)=>{dealTool_apiButton(scope,it,ind)}">
                            {{it.nameFunc?it.nameFunc(scope.row):it.name}}
                        </el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>

        <!-- 侧边栏目显示 -->
        <el-drawer title="详情" :visible.sync="infoDetailShow" :direction="'rtl'" :append-to-body="true" size="50%">
            <el-card v-if="queryOption&&selectedList[0]" style="width:calc(100% - 20px);margin:10px">
                <InfoBlockByTemplate :infoDataTemplate="tableColumnList" :sourceData="selectedList[0]"
                    :queryItemConfig="queryItemConfig" :labelPosition="labelPosition" />
            </el-card>
        </el-drawer>
        <!-- 侧边栏目显示 -->

        <!-- dealElement 组件 -->
        <DealElement ref="DEALELEMENT" :config="config" :actionButtonCell="actionButtonCell"
            :selectedLists="selectedList" :parentComponentQueryOption="{...queryOption,dataList:infoDataList}"
            @onChange="setDataList">
        </DealElement>
        <!-- dealElement 组件 -->
    </div>
</template>

<script>
    export default {
        name: 'ListBlockByTemplate',
        props: {
            queryItemConfig: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            tableColumnList: {
                type: Array,
                default: () => {
                    return []
                }
            },
            dataList: {
                type: Array,
                default: () => {
                    return []
                }
            },
            loading: {
                type: Boolean,
                default: false
            },
            dealTool: {
                type: Array,
                default: () => {
                    return []
                }
            },
            dealTool_width: {
                type: String,
                default: ''
            },
            listKey: {
                type: String,
                default: ''
            },
            parentQueryOption: {
                type: Object,
                default: () => {
                    return {}
                }
            }
        },
        data() {
            return {
                ea: false,
                config: {},
                filtersList: {},
                actionButtonCell: {},
                selectedList: [],
                queryOption: {},
                spanMethod: null,
                fullScreenLoading: false,
                infoDataList: [],
                // 侧边栏详情展示
                infoDetailShow: false,
                labelPosition: 'top'
            }
        },
        watch: {
            dataList: {
                handler: function (val) {
                    let filtersList = {}
                    for (let x in this.queryItemConfig) {
                        filtersList[x] = this.queryItemConfig[x].map(c => {
                            return {
                                ...c,
                                text: c.label
                            }
                        })
                    }
                    this.$set(this, 'filtersList', filtersList)
                    this.setDataList(val)
                },
                immediate: true,
                deep: true,
            },
            infoDataList: function (val) {
                this.ChangeParent(val)
            }
        },
        async mounted() {},
        methods: {
            // 一些骚操作
            async clickActionButton(action) {
                this.actionButtonCell = {}
                switch (action.actionType) {
                    case 'downloadByUrl':
                        window.location.href = action.url
                        break;
                    case 'func':
                        let that = this
                        return action.return(that)
                        break;
                    default:
                        this.$set(this, 'actionButtonCell', action)
                        await this.$nextTick()
                        if (action.actionType)
                            this.$refs[action.actionType.toUpperCase()].open()
                        break;
                }
            },

            async rouDblClick(row, column, event) {
                this.selectedList = [row]
                this.infoDetailShow = true
            },

            async ChangeParent(e) {
                let data = {}
                if (this.listKey) {
                    data[this.listKey] = e
                    this.$emit('onChange', {
                        ...data
                    })
                } else {
                    this.$emit('onChange', e)
                }
            },

            // 修改 DataList
            setDataList(e) {
                this.$set(this, 'infoDataList', e)
                this.$emit('onChange', '')
            },

            // 表格表内筛选用函数
            filterByProp(value, row, column) {
                const property = column['property'];
                return row[property] === value;
            },


            // 特殊处理事件
            async dealTool_apiButton(scope, it, index) {
                // this.loading = true
                let data = {}
                let that = this
                let row = scope.row
                for (let x in it.data) {
                    data[x] = scope.row[it.data[x]]
                }
                for (let x in it.optionData) {
                    data[x] = it.optionData[x]
                }
                if (it['return']) {
                    await it.return(that, row)
                }
                if (it['dataDealFunc']) {
                    row = await it.dataDealFunc(that, row)
                }
                if (it.root && this.$refs[it.root.toUpperCase()]) {
                    this.$set(this, 'actionButtonCell', it)
                    this.$set(this, 'selectedList', [row])
                    await this.$nextTick()
                    this.$refs[it.root.toUpperCase()].open()
                    this.loading = false
                } else if (it.root && it.api) {
                    let res = await this.$axios.post(this.$api[it.root][it.api], {
                        data
                    });
                    let msg = it.returnFunc(res)
                    if (msg.box) {
                        this.$msgBox(msg.content, msg.title, msg.option)
                    } else {
                        this.$msg(msg.msg, msg.type, 4)
                    }
                    this.needRefresh()
                }
            },
        }
    }
</script>