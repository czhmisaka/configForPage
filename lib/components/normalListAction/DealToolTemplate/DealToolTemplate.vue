<template>
  <div v-loading.fullscreen.lock="loading||fullScreenLoading" element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
    <el-dialog :visible="dialogShow" width="60%" :before-close="close" :append-to-body="true"
      :close-on-click-modal="actionButtonCell?actionButtonCell.stopCloseByModalClick&&actionButtonCell.stopCloseByModalClick=='true'?false:true:false"
      :title="actionButtonCell?actionButtonCell.name:''">
      <el-card v-if="queryOption&&dataInfoOption">
        <InfoBlockByTemplate :infoDataTemplate="dataInfoOption" :sourceData="queryOption"
          :queryItemConfig="queryItemConfig" :labelPosition="labelPosition" />
      </el-card>
      <hr style="width:80%;margin-bottom:30px" v-if="dataInfoOption&&queryDataListTemplate" />
      <span v-for="(itemList ,index ) in queryDataListTemplate" :key="index+'asd'">
        <el-card>
          <div v-if="itemList.name" style="margin-bottom:10px;">
            <b>{{itemList.name}}</b>
          </div>
          <ListBlockByTemplate
            :style="'max-height:calc(70vh - 100px);'+('height:'+(((queryOption[itemList.listKey]||[1,2]).length)*6+10)+'em')"
            :tableColumnList="itemList['tableColumn']" :listKey="itemList.listKey" :parentQueryOption="queryOption"
            :dataList="queryOption[itemList.listKey]" :loading="loading" :queryItemConfig="queryItemConfig"
            :dealTool="itemList['dealTool']?itemList['dealTool']['dealTool']:[]" @onChange="setQueryOption"
            :dealTool_width="itemList['dealTool']?itemList['dealTool']['dealTool_width']:''" />
        </el-card>
        <br v-if="index<queryDataListTemplate.length-1" />
      </span>
      <el-card>
        <InputFormByTemplate ref="InputFormByTemplate" :queryItemOptions="queryItemOptions"
          v-if="queryItemConfig&&queryItemOptions" :queryItemConfigParent="queryItemConfig" :queryOption="queryOption"
          @clearQueryOption="clearQueryOption" @onChange="setQueryOption" />
      </el-card>
      <div slot="footer" class="dialog-footer" v-if="!ApiConfig['noButton']">
        <el-button type="primary" @click="mainDealFunc">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'DealElement',
    props: {
      selectedLists: {
        type: Array,
        default: () => {
          return []
        }
      },
      config: {
        type: Object,
        default: () => {
          return {}
        }
      },
      actionButtonCell: {
        type: Object,
        default: () => {
          return {}
        }
      },
      parentComponentQueryOption: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data() {
      return {
        loading: false,
        fullScreenLoading: false,
        dialogShow: false,
        resultDialogShow: false,
        ApiConfig: {}, // ApiConfig
        queryItemOptions: [], // 输入框架
        dataInfoOption: [], // 信息展示框架
        queryItemConfig: {}, // 输入框架所需要使用的参数
        queryDataListTemplate: [], // 列表展示框架
        queryOption: {},
        resultData: {},
        labelPosition: 'left'
      }
    },
    methods: {
      // 清空筛选项
      clearQueryOption() {
        this.queryOption = {}
        if (this.$refs['InputFormByTemplate'])
          this.$refs['InputFormByTemplate'].clearQueryOptionByHandle()
      },


      // 修改 queryOption
      async setQueryOption(e, clearData = false) {
        if (clearData) {
          this.$set(this, 'queryOption', {})
          await this.$nextTick()
        }
        for (let x in e) {
          this.$set(this.queryOption, x, e[x])
        }
      },


      async ChangeParent(e) {
        this.$emit('onChange', e)
      },

      // 开启组件
      async open() {
        let that = this
        this.$set(this, 'queryOption', {})
        this.loading = true
        if (this.actionButtonCell.ApiConfig.preCheck && await this.actionButtonCell.ApiConfig.preCheck(that)) {
          this.loading = false;
          return false
        }
        await this.dealConfigAndTemplate(this.actionButtonCell)
        if (this.ApiConfig.mainApi && this.ApiConfig.mainApi['beforeOpen'])
          if (await this.ApiConfig.mainApi.beforeOpen(that)) return;
        await this.$forceUpdate()
        this.loading = false
        this.dialogShow = true
      },

      // 主要操作处理
      async mainDealFunc(e) {
        let main = this.ApiConfig.mainApi
        let that = this
        let data = null
        if (main['dataDealFunc']) {
          data = main.dataDealFunc(this.queryOption, that)
        } else {
          data = {
            data: this.queryOption
          }
        }
        let res = null
        if (data == false) {} else if (main.root && main.api) {
          this.loading = true
          res = await this.$axios.post(this.$api[main.root][main.api], data)
        }
        if (main['afterFunc']) {
          main.afterFunc(res, that)
        };
        this.loading = false
      },

      // 关闭组件
      close() {
        this.loading = false
        this.dialogShow = false
        this.resultDialogShow = false
        this.clearQueryOption()
        this.$emit('needRefresh')
      },

      // 处理config环境和数据模板
      async dealConfigAndTemplate(config) {
        this.ApiConfig = config.ApiConfig
        this.queryItemOptions = config.queryDataInputTemplate
        this.dataInfoOption = config.queryDataInfoTemplate
        this.queryDataListTemplate = config.queryDataListTemplate
        return await this.loadConfigList()
      },

      // 加载组件所需要使用的参数 queryItemConfig
      async loadConfigList() {
        let that = this
        if (that.ApiConfig.queryItemApiConfig) {
          if (that.ApiConfig.mainApi && that.ApiConfig.mainApi.root) {
            return await that.$utils.loadConfigList(that, that.ApiConfig.queryItemApiConfig, that.ApiConfig.mainApi
              .root);
          } else
            return await that.$utils.loadConfigList(that, that.ApiConfig.queryItemApiConfig);
        }
      },

      // 地区选择函数 // 暂不支持自定义
      areaHandleChange(e) {
        let areaId = []
        if (typeof e[0] == 'array') {
          e.forEach(x => {
            areaId.push(x[2])
          })
        } else {
          areaId = e[2]
        }
        this.$set(this.queryOption, 'areaIds', areaId)
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
      },
    }
  }

</script>

<style scoped>

</style>
