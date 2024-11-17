<template>
  <div class="custom_pie_comp" :style="calcCahrtStyle">
    <div class="header">
      <img class="icon" :src="imgSrc" v-if="imgSrc" />
      <el-text class="title">{{ title }}</el-text>
    </div>
    <div class="chart_wrap">
      <div class="chart" id="chartDom"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { defineProps, computed, watch } from "vue";
import { chartBar, chartPie } from "../util/chart";
let props = defineProps({
  /** 标题是否剧中 */
  isCenterTitle: {
    type: Boolean,
    default: false,
  },
  /** 图表类型：pie 或 bar */
  type: {
    type: String,
    default: "pie",
  },
  /** 图表顶部标题 */
  title: {
    type: String,
    default: "",
  },
  /** 标题前的Icon, 需要用绝对路径, eg: /src/assets/img/icons/like.png */
  imgSrc: {
    type: String,
    default: "",
  },
  /** 图表数据 */
  data: {
    type: Object,
    default: () => ({}),
  },
});

let chart: echarts.ECharts | null = null;
let calcCahrtStyle = computed(() => {
  return {
    alignItems: props.isCenterTitle ? "center" : "flex-start",
  };
});
function updateCahrt() {
  if (!chart) {
    chart = echarts.init(document.getElementById("chartDom"));
  }
  if (!props.data) {
    return;
  }
  let option = {};
  switch (props.type) {
    case "pie":
      option = chartPie(props.data);
      break;
    case "bar":
      option = chartBar(props.data);
      break;

    default:
      break;
  }
  chart.setOption(option);
}
watch(
  () => props.data,
  () => {
    updateCahrt();
  }
);
</script>

<style scoped>
.custom_pie_comp {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .header {
    display: flex;
    align-items: center;
    height: 28px;
    .icon {
      width: 18px;
      height: 18px;
      margin-right: 4px;
    }
    .title {
      font-family: Source Han Sans CN;
      font-size: 18px;
      line-height: 18px;
      font-weight: bold;
      color: #017efa;
    }
  }
  .chart_wrap {
    width: 100%;
    height: calc(100% - 28px);

    .chart {
      height: 100%;
      width: 100%;
    }
  }
}
</style>
