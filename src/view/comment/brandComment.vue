<template>
  <div class="wrapper flex-column flex--justify--between">
    <div class="table">
      <el-row>
        <el-col :span="6" class="flex-row flex--align--center">
          <span class="title">渠道：</span>
          <el-select v-model="selecteObject.channel" no-data-text="暂无数据">
            <el-option v-for="(item,index) in channelList" :key="index" :label="item.name" :value="item.id">
              <div class="option_container">
                <div class="select_file_label">{{ item.name }}</div>
              </div>
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="9" class="flex-row flex--align--center">
          <span class="title">店铺：</span>
          <el-select v-model="selecteObject.shop" no-data-text="暂无数据">
            <el-option v-for="(item,index) in shopList" :key="index" :label="item.name" :value="item.id">
              <div class="option_container">
                <div class="select_file_label">{{ item.name }}</div>
              </div>
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="9" class="flex-row flex--align--center">
          <span class="title">型号：</span>
          <el-select v-model="selecteObject.version" no-data-text="暂无数据">
            <el-option v-for="(item,index) in versionList" :key="index" :label="item.name" :value="item.id">
              <div class="option_container">
                <div class="select_file_label">{{ item.name }}</div>
              </div>
            </el-option>
          </el-select>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24" class="flex-column">
          <span class="title">结论：</span>
          <div class="finalComment">

          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="flex-row flex--align--center">
          <span class="title">总评分：</span>
          <el-rate v-model="dataRenter.totalScore" disabled disabled-void-color="#ffffff" :max="5" size="large" score-template="{dataRenter.totalScore} 星"/>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="flex-row flex--align--center">
          <div class="flex-column pieChart">
            <div class="pieChartTitle">好中</div>
            <div class="pieChartContent" ref="allData">

            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="chartBar flex-column flex--grow">
      <div class="barTitle flex-row flex--align--center">
        <span>海尔空调</span>
      </div>
      <div class="barContent flex--grow">
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {onMounted, reactive, ref, computed, nextTick} from "vue";
import { useMessageStore } from "../../store/modules/message";
import { useCommentStore} from "../../store/modules/comment";
import {getCommentData, requestFormData} from "../../http/api";
import * as echarts from "echarts";
import {chartBar, chartPie} from "../../util/chart";
import ChatChart from "../../components/chatChart.vue";
//数据结构体
let dataRenter = reactive({
  brand:"",
  model:"",
  summarize:"",
  totalScore:3,
  top10Questions:"",
  positiveReview:"",//好评统计
  negativeReview:"",//中差评统计
})



const commentStore = useCommentStore();

let allData = ref()
nextTick(()=>{
  let chartList:any = [{
    label:"aa",
    value:100
  },
    {
      label:"bb",
      value:98
    }
  ,
    {
      label:"cc",
      value:88
    }];
  let allChart = echarts.init(allData.value)
  let option_data = {
    xAxis_data: chartList.map((i:any) => i.label),
    series_data:chartList.map((i:any) => i.value),
    color_list: [
      "#9652c2",
      "#ee534f",
      "#006bb9",
      "#2d8d79",
      "#ff9899",
      "#eba91d",
      "#929c3b",
      "#e16bba",
      "#0567a6",
      "#915a3c",
    ],
    // title: "单位个",
  };
  let option = chartPie(option_data);
  allChart.setOption(option);
})
let selecteObject = reactive({
  //渠道
  channel:1,
  //店铺
  shop:0,
  //型号
  version:0
})
let channelList = [
  {name:"京东",id:1}
]
let shopList = [
  {name:"全部",id:0},
  {name:"青岛",id:1},
]
let versionList = [
  {name:"全部",id:0},
  {name:"D12-456789",id:1},
]

//获取图表信息
const getChartData = (params:any)=>{
  if(!params.fileId){
    return false
  }
  getCommentData(params).then((res)=>{
    console.log("getCommentData",res)
  })
}
//参数结构体
let commentDataObject = reactive({
  // fileId:commentStore.selectedFile,
  fileId:"398301727941988352",
  channel:"",
  store:"",
  model:""
})
onMounted(()=>{
  getChartData(commentDataObject)
})

</script>

<style lang="scss" scoped>
@mixin fontBase{
  font-family: 思源黑体;
  font-size: 16px;
  font-weight: normal;
  line-height: 16px;
  letter-spacing: 0em;
  font-feature-settings: "kern" on;
}
.wrapper {
  width: 912px;
  height: 100%;
  box-sizing: border-box;
  opacity: 1;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  padding: 12px 40px;
  .table {
    width: 100%;
    border-left: 1px solid #94a0af;
    border-top: 1px solid #94a0af;
    .el-col {
      border-right: 1px solid #94a0af;
      border-bottom: 1px solid #94a0af;
      padding: 12px 12px;
    }
    .detail {
      font-size: 18px;
      line-height: 1.5 !important;
    }
    .problems {
      //min-height: 350px;
      min-height: fit-content;
      border-right: 1px solid #94a0af;
      border-bottom: 1px solid #94a0af;
    }
    .summary {
      height: 130px;
      border-right: 1px solid #94a0af;
      border-bottom: 1px solid #94a0af;
    }
    .row {
      padding: 10px 12px;
      font-family: 思源黑体;
      font-size: 18px;
      font-weight: normal;
      line-height: 18px;
      letter-spacing: 0em;
      font-feature-settings: "kern" on;
      color: #3d3d3d;
      z-index: 0;
    }
    .title {
      @include fontBase();
      color: #94A0AF;
      width: fit-content;
      white-space: nowrap;
    }
    .finalComment{
      height: 50px;
    }
    .pieChart{
      width: 30%;
      .pieChartTitle{
        font-family: Source Han Sans CN;
        font-size: 18px;
        font-weight: bold;
        line-height: 18px;
        letter-spacing: 0px;
        color: #017EFA;
      }
      .pieChartContent{
        height: 300px;
      }
    }

  }
  .bottom {
    width: 100%;
    height: 60px;
    margin-top: 8px;
    .icon {
      margin-right: 4px;
      img{
        height: 20px;
        width: 20px;
      }
    }
    .operator-name {
      opacity: 1;
      font-family: 思源黑体;
      font-size: 16px;
      font-weight: normal;
      line-height: normal;
      letter-spacing: 0em;
      font-feature-settings: "kern" on;
      color: #3d3d3d;
    }
  }
}
//:deep(.el-input){
//  width: 100px;
//}
:deep(.el-input__wrapper){
  box-shadow: none;
  background-color: rgba(255,255,255,0);
}
:deep(.el-input__inner) {
  @include fontBase();
  color: #3D3D3D;
}
:deep(.el-select__caret) {
  @include fontBase();
  color: #3D3D3D;
}
:deep(.el-select-dropdown__item .selected) {
  background: rgba(1, 126, 250, 0.1) !important;
  border-radius: 4px;
}

.chartBar{
  border: 1px #94a0af solid;
  border-radius: 8px;
  margin-top: 16px;
  .barTitle{
    padding-left: 12px;
    height: 56px;
    border-bottom: 1px #94a0af solid;
    font-family: Source Han Sans CN;
    font-size: 18px;
    font-weight: bold;
    line-height: 100%;
    letter-spacing: 0px;
    color: #017EFA;
  }
  .barContent{
    padding-right: 12px;
  }
}

</style>
