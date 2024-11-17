<template>
  <div class="chartContainer" ref="chartRef"></div>
</template>

<script lang="ts">
import {chartBar} from "../util/chart.js";
import * as echarts from "echarts";
import {ref, nextTick} from "vue";
export default {
  name: "ChatChart",
  props: {
    list: [],
  },
  setup(props:any){
    let chartList = props.list || [];
    let chartRef = ref(null);
    nextTick(()=>{
      let chartInit = echarts.init(chartRef.value)
      let option_data = {
        xAxis_data: chartList.map((i:any) => i.item),
        series_data:chartList.map((i:any) => i.value),
        color_list: ["#3185F5"],
        // title: "单位个",
      };
      let option = chartBar(option_data,{rotate: 50});
      chartInit.setOption(option);
    })
    return{
      chartRef,
    }
  },
  components:{
  }
}

</script>

<style lang="scss" scoped>
.chartContainer{
  width: 100%;
}
</style>
