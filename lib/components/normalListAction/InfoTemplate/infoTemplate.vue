<!--
 * @Author: your name
 * @Date: 2021-08-27 23:37:38
 * @LastEditTime: 2021-09-03 16:09:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /configForPage/components/normalListAction/InfoTemplate.vue/infoTemplate.vue
-->
<template>
  <!--
  此尚未开发完成，请谨慎引用
-->
  <el-form @submit.native.prevent :inline="inline" :model="inputQueryOption" label-suffix=":" label-width="150px"
    :label-position="labelPosition" class="demo-form-inline" size="mini">
    <el-form-item v-for="(item,index) in queryItemOptions" :key="item.prop+index" :label="item.label">
      <el-select clearable v-model="inputQueryOption[item.prop]" v-if="item.type==='select'" @change="onChange()"
        :placeholder="$i18n.get({id:'cngppoc.src.components.applicationBasicInfo.Select',dm:'请选择'})+item.label">
        <el-option v-for="(it,ind) in queryItemConfig[item.prop]" :key="ind" :label="it.label" :value="it.value">
        </el-option>
      </el-select>
      <el-select clearable v-model="inputQueryOption[item.prop]" v-if="item.type==='selects'"
        :placeholder="$i18n.get({id:'cngppoc.src.components.applicationBasicInfo.Select',dm:'请选择'})+item.label" multiple
        collapse-tags @change="onChange()">
        <el-option v-for="(it,ind) in queryItemConfig[item.prop]" :key="ind" :label="it.label" :value="it.value">
        </el-option>
      </el-select>
      <el-select style="width:auto" v-if="item.type==='inputList'" v-model="inputQueryOption[item.prop]" multiple
        clearable filterable allow-create default-first-option collapse-tags :placeholder="item.label"
        @change="batchInput('inputQueryOption',item.prop)">
        <el-option v-for="item in inputQueryOption[item.prop]" :key="item" :label="item" :value="item">
        </el-option>
      </el-select>
      <el-input v-model="inputQueryOption[item.prop]" v-if="item.type==='input'" :placeholder="item.label"
        @change="onChange()">
      </el-input>
      <el-cascader v-if="item.type==='areaCascader'" :options="queryItemConfig[item.prop]"
        :props="{ expandTrigger: 'hover' ,value:'id',label:'nameEn',multiple: !item['noMultiple'] }" style="width:485px"
        :placeholder="$i18n.get({id:'cngppoc.src.components.applicationBasicInfo.Select',dm:'请选择'})+item.label"
        collapse-tags clearable @change="(e)=>{areaHandleChange(e,item)}" filterable>
        <template slot-scope="{ node, data }">
          <span>{{ data.nameEn }}</span>
          <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
        </template>
      </el-cascader>
      <el-date-picker v-if="item.type=='datePicker'" v-model="inputQueryOption[item.prop]" @change="onChange()"
        :type="item.component&&item.component.Type?item.component.Type:'datetime'" :picker-options="{}"
        range-separator="-" start-placeholder="StartTime" end-placeholder="EndTime" align="right"
        :value-format="item.component.valueFormat">
      </el-date-picker>
      <span v-if="item.type=='radioGroup'">
        <el-checkbox-group v-model="inputQueryOption[item.prop]">
          <el-checkbox v-for="(its,ind) in queryItemConfig[item.prop]" :key="'qwe3'+ind" :label="its.value+''">
            {{its.label}}
          </el-checkbox>
        </el-checkbox-group>
      </span>
      <span v-if="item.type=='radio'">
        <el-checkbox-group v-model="inputQueryOption[item.prop]">
          <el-checkbox v-for="(its,ind) in queryItemConfig[item.prop]" :key="'qwe1'+ind" :label="its.value+''">
            {{its.label}}
          </el-checkbox>
        </el-checkbox-group>
      </span>
    </el-form-item>
    <el-form-item style="float:right" v-if="needAction||needClear">
      <el-button type="primary" @click="onSearch" v-if="needAction">
        {{$i18n.get({id:"cngppoc.views.position.PositionList.Query",dm:"查询"})}}</el-button>
      <el-button type="primary" @click="clearQueryOption" v-if="needClear">
        {{$i18n.get({id:'cngppoc.views.position.PositionList.clearQueryOption',dm:'重置'})}}</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
  export default {
    name: 'InputFormByTemplate',
    props: {
      // 搜索按钮显示
      needAction: {
        type: Boolean,
        default: false,
      },

      // 清空按钮显示
      needClear: {
        type: Boolean,
        default: false
      },

      // 筛选数据保存参数
      queryItemConfig: {
        type: Object,
        default: () => {
          return {}
        }
      },

      // 输入数据模板，生成格式参考： cityMapsTemplate.js
      queryItemOptions: {
        type: Array,
        default: () => {
          return []
        }
      },

      // 配套模板的数据源
      queryOption: {
        type: Object,
        default: () => {
          return {}
        }
      },

      // labelPosition
      labelPosition: {
        type: String,
        default: "right"
      },

      // inline
      inline: {
        type: Boolean,
        default: true
      },
    },
    data() {
      return {
        inputQueryOption: {},
        infoData: {},
      }
    },
    mounted() {
      this.init()
    },
    watch: {
      queryItemConfig: function (val) {
        this.init();
      },
      queryOption: function (val) {
        this.init()
        for (let x in val) {
          if (val[x]) {
            this.inputQueryOption[x] = val[x]
            this.$set(this.inputQueryOption, x, val[x])
          }
        }
      }
    },
    methods: {
      // 初始化
      init() {
        this.$setData({
          queryItemConfig: this.queryItemConfig
        })
        this.queryItemOptions.forEach(x => {
          if (['selects', 'inputList', 'radioGroup', 'radio'].indexOf(x.type) != '-1') {
            this.$set(this.inputQueryOption, x.prop, [])
          } else if (['input', 'select'].indexOf(x.type))
            this.$set(this.inputQueryOption, x.prop, '')
        })
        this.$forceUpdate()
      },

      // 返回数据修改事件
      onChange(val = this.inputQueryOption) {
        let back = {}
        for (let x in val) {
          if (val[x])
            back[x] = val[x]
        }
        this.$emit('onChange', back)
      },


      // 地区选择函数 // 暂不支持自定义
      areaHandleChange(e, action) {
        let areaId = []
        e.forEach(x => {
          areaId.push(x[2])
        })
        this.$set(this.inputQueryOption, 'areaIds', areaId)
        if (action.return) {
          let that = this
          action.return(e, that)
        }
        this.onChange()
      },

      // input-list 组件批量输入
      batchInput(className, propName) {
        let data = JSON.parse(JSON.stringify(this[className][propName]))
        let backData = []
        data.forEach(x => {
          if (x.split(' ').length > 0) {
            x.split(' ').map(c => {
              backData.push(c)
            })
          } else {
            backData.push(x)
          }
        })
        this[className][propName] = backData
        this.onChange()
      },

      // 触发搜索事件回调
      onSearch() {
        this.$emit('onSearch', this.inputQueryOption)
      },

      // 清空搜索项
      clearQueryOption() {
        this.$emit('clearQueryOption')
      },

    }

  }
</script>

<style lang="scss" scoped>
  .infoBox {
    width: 100%;
  }

  .infoBlock {
    min-width: 20%;
    max-width: 280px;
    margin: 10px 0px 0px 0px;
    padding: 0px 10px 0px 10px;
    color: #909399;
  }

  .info {
    color: #303133;
  }

  .flex {
    display: flex;
  }

  .flex-column {
    display: flex;
    flex-direction: column;
  }
</style>