<template>
  <div class="multi-brand-analysis">
    <div class="section-one">
      <el-row class="select-list">
        <el-col
          class="select-item"
          :span="6"
          v-for="item in selectList"
          :key="item.value"
        >
          <el-text class="select-item-label" size="large">{{ item.label }}：</el-text>
          <el-select
            class="no-border"
            v-model="selectValueList[item.key]"
            size="large"
            placeholder="请选择"
            :filterable="item.key == 'modelType' ? true : false"
            :clearable="false"
          >
            <el-option
              v-for="i in item.options"
              :key="i.value"
              :label="i.label"
              :value="i.value"
            />
          </el-select>
        </el-col>
      </el-row>
      <div class="summarize">
        <div class="summarize-title">结论：</div>
        <div class="summarize-content">{{ summarize ? summarize : "--" }}</div>
      </div>
      <div class="chart-list">
        <div class="chart-list-col chart-list-left" :span="12">
          <div class="chart-list-col-title-wrap">
            <div class="chart-list-col-title">
              <el-text class="chart-list-col-title-text" size="large">品牌：</el-text>
              <el-text class="chart-list-col-title-text" size="large">{{
                leftBrand.brand
              }}</el-text>
              <el-text class="chart-list-col-title-text" size="large">型号：</el-text>
              <el-text class="chart-list-col-title-text" size="large">{{
                leftBrand.model
              }}</el-text>
            </div>
            <div class="chart-list-col-score">
              <el-text class="chart-list-col-title-text" size="large">总评分：</el-text>
              <el-rate
                v-model="leftBrand.totalScore"
                disabled
                disabled-void-color="rgba(148, 160, 175, 0.4)"
              ></el-rate>
              <el-text class="chart-list-col-title-text" size="large">{{
                leftBrand.totalScore
              }}</el-text>
              <el-text class="chart-list-col-title-text" size="large">星</el-text>
            </div>
            <img
              class="chart-list-col-divider"
              src="../../assets/img/title-divider.png"
            />
          </div>
          <div
            class="chart-item"
            v-for="(item, index) in chartList"
            :key="`left-${item.key}`"
          >
            <div class="sub-title">
              <el-text class="sub-title-label" size="large"
                >{{
                  item.key == "top10Questions"
                    ? rightBrand.brand
                      ? rightBrand.brand + rightBrand.productType + " - "
                      : ""
                    : ""
                }}{{ item.name }}</el-text
              >
            </div>
            <div
              :class="
                item.type == 'pie'
                  ? `chart-wrap pie-chart-wrap chart-wrap-${item.key}`
                  : `chart-wrap bar-chart-wrap chart-wrap-${item.key}`
              "
            >
              <div class="chart-item-dom" :id="`chart_left_${item.key}`"></div>
            </div>
          </div>
        </div>
        <div class="chart-list-col chart-list-right" :span="12">
          <div class="chart-list-col-title-wrap">
            <div class="chart-list-col-title">
              <el-text class="chart-list-col-title-text" size="large">品牌：</el-text>
              <el-text class="chart-list-col-title-text" size="large">{{
                rightBrand.brand
              }}</el-text>
              <el-text class="chart-list-col-title-text" size="large">型号：</el-text>
              <el-text class="chart-list-col-title-text" size="large">{{
                rightBrand.model
              }}</el-text>
            </div>
            <div class="chart-list-col-score">
              <el-text class="chart-list-col-title-text" size="large">总评分：</el-text>
              <el-rate
                v-model="rightBrand.totalScore"
                disabled
                disabled-void-color="rgba(148, 160, 175, 0.4)"
              ></el-rate>
              <el-text class="chart-list-col-title-text" size="large">{{
                rightBrand.totalScore
              }}</el-text>
              <el-text class="chart-list-col-title-text" size="large">星</el-text>
            </div>
            <img
              class="chart-list-col-divider"
              src="../../assets/img/title-divider.png"
            />
          </div>
          <div
            class="chart-item"
            v-for="(item, index) in chartList"
            :key="`right-${item.key}`"
          >
            <div class="sub-title">
              <el-text class="sub-title-label" size="large"
                >{{
                  item.key == "top10Questions"
                    ? rightBrand.brand
                      ? rightBrand.brand + rightBrand.productType + " - "
                      : ""
                    : ""
                }}{{ item.name }}</el-text
              >
            </div>
            <div
              :class="
                item.type == 'pie'
                  ? `chart-wrap pie-chart-wrap chart-wrap-${item.key}`
                  : `chart-wrap bar-chart-wrap chart-wrap-${item.key}`
              "
            >
              <div class="chart-item-dom" :id="`chart_right_${item.key}`"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  ref,
  watch,
  toRef,
  toRefs,
  computed,
  nextTick,
} from "vue";
import * as echarts from "echarts";
import { chartPie, chartBar, chartPie_ratingLevelProportion } from "../../util/chart.js";
import { selectAllChannel, multipleModel } from "../../http/api.ts";
import { useMessageStore } from "../../store/modules/message";

let chartObj = {
  left: {
    ratingLevelProportion: undefined, // 好中差评占比
    positiveReview: undefined, // 好评统计
    negativeReview: undefined, // 中差评统计
    top10Questions: undefined, // Top10问题
  },
  right: {
    ratingLevelProportion: undefined, // 好中差评占比
    positiveReview: undefined, // 好评统计
    negativeReview: undefined, // 中差评统计
    top10Questions: undefined, // Top10问题
  },
};
export default defineComponent({
  setup(props) {
    const messageStore = useMessageStore();
    let current_fileId = "";
    watch(
      () => messageStore.selectedFile,
      () => {
        // 是否开启分析
        current_fileId = messageStore.selectedFile;
        nextTick(() => {
          handleSelectAllChannel(current_fileId);
        });
      },
      { immediate: true }
    );
    const selectList = reactive([
      {
        key: "channel",
        label: "渠道",
        options: [],
      },
    ]);
    const selectValueList = reactive({
      channel: "",
    });
    // 结论
    let summarize = ref("");
    let leftBrand = ref({});
    let rightBrand = ref({});
    const chartList = ref([
      {
        name: "好/中/差评占比",
        key: "ratingLevelProportion",
        type: "pie",
      },
      {
        name: "好评统计",
        key: "positiveReview",
        type: "pie",
      },
      {
        name: "中/差评统计",
        key: "negativeReview",
        type: "pie",
      },
      {
        name: "Top10问题",
        key: "top10Questions",
        type: "bar",
      },
    ]);

    //监听 渠道 下拉选择框
    watch(
      () => [selectValueList.channel],
      (newVal) => {
        nextTick(() => {
          if (newVal[0]) {
            handleMultipleModel(current_fileId, newVal[0]);
          }
        });
      },
      { immediate: true }
    );

    // 监听结论，结论有数据后，初始化所有图表
    watch(
      summarize,
      (newVal) => {
        if (newVal) {
          nextTick(() => {
            setChartList();
          });
        } else {
          nextTick(() => {
            clearChartList();
          });
        }
      },
      { immediate: true }
    );

    // 根据文件id获取渠道列表
    const handleSelectAllChannel = (fileId) => {
      selectAllChannel(fileId).then((data) => {
        selectList[0].options = data.map((item) => {
          return {
            value: item,
            label: item,
          };
        });
        selectValueList.channel = data[0];
      });
    };

    // 根据文件id和渠道，获取多型号对比
    const handleMultipleModel = (fileId, channel) => {
      multipleModel(fileId, channel).then((data) => {
        summarize.value = data.summarize;
        leftBrand.value = data.single[0];
        rightBrand.value = data.single[1];
      });
    };

    // 设置所有图表
    const setChartList = () => {
      chartList.value.forEach((item) => {
        let color_list = ["#fac858", "#93beff", "#507afc"];
        let option_grid = {};
        if (item.key == "top10Questions") {
          color_list = ["#3185f5"];
          option_grid = {
            left: 8,
            right: 8,
            top: 42,
            bottom: 10,
          };
        }
        chartObj.left[item.key] = setChart(
          chartObj.left[item.key],
          `chart_left_${item.key}`,
          item.type,
          leftBrand.value[item.key].list,
          color_list,
          option_grid
        );
        chartObj.right[item.key] = setChart(
          chartObj.right[item.key],
          `chart_right_${item.key}`,
          item.type,
          rightBrand.value[item.key].list,
          color_list,
          option_grid
        );
      });
    };

    // 清除所有图表
    const clearChartList = () => {};

    // 设置图表数据（单个）
    const setChart = (chart, chart_id, type, list, color_list, option_grid) => {
      if (!list) {
        return;
      }
      let option_data = {
        xAxis_data: list.map((i) => i.label),
        series_data: list.map((i) => i.value),
        color_list: color_list,
      };
      if (!chart) {
        chart = echarts.init(document.getElementById(chart_id));
      }
      let option = chartPie(option_data);
      if (type == "pie") {
        if (chart_id.indexOf("ratingLevelProportion") > -1) {
          option = chartPie_ratingLevelProportion(option_data);
        } else {
          option = chartPie(option_data);
        }
      } else if (type == "bar") {
        option = chartBar(option_data, {}, option_grid);
      } else {
        throw new Error("不支持的图表类型");
      }
      chart.setOption(option);
      return chart;
    };

    return {
      selectList,
      selectValueList,
      summarize,
      leftBrand,
      rightBrand,
      chartList,
      handleSelectAllChannel,
      setChartList,
      setChart,
    };
  },
  mounted() {},
  beforeUnmount() {},
});
</script>

<style scoped lang="scss">
.multi-brand-analysis {
  width: 912px;
  height: 100%;
  position: relative;
  padding: 24px 40px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  box-sizing: border-box;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;

  .section-one {
    height: 100%;
    position: relative;
    border-radius: 8px;
    border: 1px solid #c2c2c2;
    box-sizing: border-box;
    overflow-y: auto;
  }
  .section-one {
    .select-list {
      width: 100%;
      height: 56px;
      position: relative;
      justify-content: center;
      border-bottom: 1px solid #c2c2c2;

      .select-item {
        height: 100%;
        position: relative;
        display: flex;
        align-items: center;
        padding: 0 12px;
        justify-content: center;
        .select-item-label {
          word-break: keep-all;
          color: #94a0af;
        }
      }
    }

    .summarize {
      box-sizing: border-box;
      padding: 10px 12px;
      min-height: 100px;
      height: auto;
      border-bottom: 1px solid #c2c2c2;
      .summarize-title {
        font-size: 18px;
        font-weight: normal;
        color: #94a0af;
      }
      .summarize-content {
        font-size: 16px;
        font-weight: normal;
        color: #3d3d3d;
        line-height: 1.4;
        margin-top: 6px;
      }
    }

    .chart-list {
      padding: 0;
      width: 100%;
      min-height: calc(100% - 100px - 56px);
      position: relative;
      box-sizing: border-box;
      display: flex;
      flex-wrap: nowrap;
      .chart-list-col {
        padding: 10px 14px;
        width: 50%;
      }
      .chart-list-left {
        border-right: 1px solid #c2c2c2;
      }

      .chart-list-col-title-wrap {
        .chart-list-col-title {
          font-size: 18px;
          font-weight: bold;
          color: #3d3d3d;
          display: flex;
          align-items: center;
          justify-content: center;
          .chart-list-col-title-text:nth-child(2) {
            margin-right: 28px;
          }
        }
        .chart-list-col-score {
          margin-top: 6px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: normal;
          color: #3d3d3d;
          .chart-list-col-title-text:nth-last-child(2) {
            margin-left: 16px;
          }
          .el-rate {
            ::v-deep {
              .el-rate__item .el-icon {
                font-size: 24px;
                margin-right: 2px;
              }
            }
          }
        }
        .chart-list-col-divider {
          width: 100%;
        }
      }

      .chart-item {
        position: relative;
        box-sizing: border-box;

        .sub-title {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 28px;
          margin: 24px 0 0;

          .sub-title-label {
            font-family: Source Han Sans CN;
            font-size: 18px;
            line-height: 18px;
            font-weight: bold;
            line-height: normal;
            letter-spacing: 0px;
            color: #017efa;
          }
        }

        .chart-wrap {
          position: relative;
          box-sizing: border-box;
          height: 356px;
          &.pie-chart-wrap {
            height: 356px;
            &.chart-wrap-ratingLevelProportion {
              height: 320px;
            }
          }
          &.bar-chart-wrap {
            height: 240px;
          }
          .chart-item-dom {
            height: 100%;
            width: 100%;
          }
        }
      }
    }
  }
}

.el-select.no-border {
  ::v-deep {
    .select-trigger .el-input .el-input__wrapper {
      background: transparent;
      box-shadow: none !important;

      .el-input__inner {
        color: #3d3d3d;
        font-size: 16px;
      }
    }
  }
}
</style>
