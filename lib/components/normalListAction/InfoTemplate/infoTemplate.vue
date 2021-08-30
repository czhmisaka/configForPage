<!--
 * @Author: your name
 * @Date: 2021-08-27 23:37:38
 * @LastEditTime: 2021-08-27 23:37:55
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /configForPage/components/normalListAction/InfoTemplate.vue/infoTemplate.vue
-->
<template>
  <div class="infoBox flex">
    <el-form label-suffix=":" @submit.native.prevent size='mini' class='infoBlock' v-for="(it,index) in dataTemplate"
      v-bind:key="index" :label-position="$isMobile()?'top':labelPosition||'left'"
      :style="index!=0?'border-left:0.5px #efefef solid;':''">
      <div v-for="(item,index) in it" v-bind:key="item.prop+index">
        <el-form-item class="info" :label="item.label"
          v-if="item.noValueNoKey?item.dataCheck?item.dataCheck(infoData):infoData[item.prop]:true">
          <b slot="label">{{item.label}}</b>
          <span v-if="item.template">
            <span v-for="(its,ind) in item.template" v-bind:key="(its.value+ind)||'asd'+ind">
              <span v-if="!its.element">{{its.value?its.value:infoData[its.key]?infoData[its.key]:its.error}}</span>
              <span v-if="its.element=='tag'" @click="itsClick(its,infoData)" :style="its.click?'cursor:pointer;':''">
                <el-tag :type="its.elementType">{{its.value?its.value:infoData[its.key]}}</el-tag>
              </span>
              <span v-if="its.element == 'func'" @click="itsClick(its,infoData)"
                :style="its.click?'cursor:pointer;':''">
                {{its.return(infoData,queryItemConfig)}}
              </span>
              <span v-if="its.element == 'funcTag'">
                <span v-if="its.return(infoData,queryItemConfig).length">
                  <span v-for="(itTag,indTag) in its.return(infoData,queryItemConfig)" :key="indTag+'asd'"
                    :style="itTag.click?'cursor:pointer;':''">
                    <el-tag :type="itTag['type']" @click="itsClick(itTag,infoData)" style="margin:0px 0px 5px 5px;">
                      {{itTag['data']}}
                    </el-tag>
                  </span>
                </span>
                <span v-else @click="itsClick(its,infoData)" :style="its.click?'cursor:pointer;':''">
                  <el-tag :type="its.return(infoData,queryItemConfig)['type']">
                    {{its.return(infoData,queryItemConfig)['data']}}</el-tag>
                </span>
              </span>
            </span>
          </span>
          <span
            v-if="!item.template">{{infoData[item.prop]!==0?infoData[item.prop]||$i18n.get({id:"cngppoc.src.components.applicationBasicInfo.infoDataItemPropNoData",dm:"暂无数据"}):infoData[item.prop]}}</span>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>
<script>
  export default {
    name: 'InfoBlockByTemplate',
    props: {
      // 预处理函数，目前还没啥用处
      preDeal: {
        type: Function,
        default: () => {
          return () => {}
        }
      },

      // 筛选数据保存参数
      queryItemConfig: {
        type: Object,
        default: () => {
          return {}
        }
      },

      //labelPosition
      labelPosition: String,

      // 数据模板，生成格式参考： positionTemplate.js
      infoDataTemplate: {
        type: Array,
        default: () => {
          return []
        }
      },
      // 配套模板的数据源
      sourceData: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data() {
      return {
        infoData: {},
        dataTemplate: []
      }
    },
    mounted() {
      this.setDataTemplate(this.infoDataTemplate)
      this.setData()
    },
    watch: {
      infoDataTemplate: function (val) {
        this.setDataTemplate(val)
      },
      sourceData: function (e) {
        this.setData()
      }
    },
    methods: {
      // 绑定数据
      setData() {
        this.infoData = this.sourceData
      },

      // 模板click事件
      itsClick(its, infoData) {
        let that = this
        if (its.click) {
          its.click(infoData, that)
        }
      },

      // 设置dataTemplate
      setDataTemplate(val) {
        this.dataTemplate = []
        if (typeof val == 'object' && val.length > 0) {
          if (typeof val[0] != 'object' || !val[0].length) {
            val.forEach((x, index) => {
              if (index % (Math.floor(val.length / 3)) == 0) {
                this.dataTemplate.push([])
              } else if (this.dataTemplate.length == 0) {
                this.dataTemplate.push([])
              }
              this.dataTemplate[this.dataTemplate.length - 1].push(x)
            })
          } else {
            this.dataTemplate = JSON.parse(JSON.stringify(val))
          }
        }
      }
    }

  }

</script>

<style lang="scss" scoped>
  .infoBox {
    width: 100%;
  }

  .infoBlock {
    min-width: 20%;
    max-width: 50%;
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
