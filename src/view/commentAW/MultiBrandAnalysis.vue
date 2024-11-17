<template>
  <div
    class="multi-brand-analysis"
    v-loading="loadingStatus"
    element-loading-text="分析中··· ···"
    element-loading-background="rgba(0, 0, 0, 0.7)"
  >
    <div class="section-one">
      <el-row class="select-list">
        <el-col
          class="select-item"
          :span="8"
          v-for="item in selectList"
          :key="item.value"
        >
          <el-text class="select-item-label" size="large">{{ item.label }}：</el-text>
          <el-select
            class="no-border"
            v-model="selectValueList[item.key]"
            size="large"
            :filterable="item.key == 'modelType' ? true : false"
            :clearable="false"
            :disabled="item.disabled"
            :placeholder="item.disabled ? '--' : '请选择'"
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
      <!-- <div class="summarize">
        <div class="summarize-title">结论：</div>
        <div class="summarize-content">{{ summarize ? summarize : "--" }}</div>
      </div> -->
      <div class="chart-list">
        <!-- <div class="chart-list-title-wrap">
          <div class="chart-list-score">
            <el-text class="chart-list-title-text" size="large">总评分：</el-text>
            <el-rate
              v-model="totalScore"
              disabled
              disabled-void-color="rgba(148, 160, 175, 0.4)"
            ></el-rate>
            <el-text class="chart-list-title-text" size="large">{{ totalScore }}</el-text>
            <el-text class="chart-list-title-text" size="large">星</el-text>
          </div>
          <img class="chart-list-divider" src="../../assets/img/title-divider.png" />
        </div> -->
        <div class="chart-list-pie">
          <div
            class="chart-item"
            v-for="(item, index) in pieChartList"
            :key="`left-${item.key}`"
          >
            <div class="sub-title">
              <el-text class="sub-title-label" size="large" v-show="item.finish"
                >{{
                  item.key == "top10Questions"
                    ? selectValueList.brand
                      ? selectValueList.brand + selectValueList.productType + " - "
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
              <div class="chart-item-dom" :id="`chart_${item.key}`"></div>
            </div>
          </div>
        </div>
        <div class="chart-list-bar">
          <div
            class="chart-item"
            v-for="(item, index) in barChartList"
            :key="`left-${item.key}`"
          >
            <div class="sub-title">
              <el-text class="sub-title-label" size="large" v-show="item.finish"
                >{{
                  item.key == "top10Questions"
                    ? selectValueList.brand || selectValueList.productType
                      ? selectValueList.brand + selectValueList.productType + " - "
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
              <div class="chart-item-dom" :id="`chart_${item.key}`"></div>
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
import { chartPie, chartBar } from "../../util/chart.js";
import { selectAllProductType, statistics } from "../../http/api.ts";
import { useCommentAwStore } from "../../store/modules/commentAw";

let chartObj = {
  ratingLevelProportion: undefined, // 好中差评占比
  positiveReview: undefined, // 好评统计
  negativeReview: undefined, // 中差评统计
  top10Questions: undefined, // Top10问题
};
export default defineComponent({
  props: {
    selectFileIDAw: String,
  },
  setup(props) {
    const commentStore = useCommentAwStore();
    let current_fileId = ref("");
    let loadingStatus = ref(true);
    let isNeedGetProductType = ref(true);
    watch(
      () => props.selectFileIDAw,
      () => {
        current_fileId.value = props.selectFileIDAw;
        isNeedGetProductType.value = true;
        loadingStatus.value = true;
        nextTick(() => {
          reset();
          handleSelectAllProductType();
        });
      },
      { immediate: true }
    );
    const selectList = reactive([
      {
        key: "channel",
        label: "渠道",
        options: [],
        disabled: true,
      },
      {
        key: "brand",
        label: "品牌",
        options: [],
        disabled: true,
      },
      {
        key: "productType",
        label: "产品类型",
        options: [],
        disabled: false,
      },
    ]);
    const selectValueList = reactive({
      channel: "",
      brand: "",
      productType: "",
    });
    // 结论
    let summarize = ref("");
    let totalScore = ref(0);
    const pieChartList = ref([
      {
        name: "好/差评占比",
        key: "ratingLevelProportion",
        type: "pie",
        list: [],
        finish: false,
      },
      {
        name: "好评统计",
        key: "positiveReview",
        type: "pie",
        list: [],
        finish: false,
      },
      {
        name: "差评统计",
        key: "negativeReview",
        type: "pie",
        list: [],
        finish: false,
      },
    ]);
    const barChartList = ref([
      {
        name: "差评Top10问题",
        key: "top10Questions",
        type: "bar",
        list: [],
        finish: false,
      },
    ]);

    // //1、监听 渠道 下拉选择框
    // watch(
    //   () => [selectValueList.channel],
    //   (newVal) => {
    //     nextTick(() => {
    //       if (newVal[0]) {
    //         getBrandOptionList(newVal[0]);
    //       } else {
    //         clearBrandOptionList();
    //         clearProductTypeOptionList();
    //       }
    //     });
    //   },
    //   { immediate: true }
    // );

    // // 2、监听 品牌 下拉选择框
    // watch(
    //   () => [selectValueList.brand],
    //   (newVal) => {
    //     nextTick(() => {
    //       if (newVal[0]) {
    //         getProductTypeOptionList(newVal[0]);
    //       } else {
    //         clearProductTypeOptionList();
    //       }
    //     });
    //   },
    //   { immediate: true }
    // );

    // 3、监听 产品类型 下拉选择框
    watch(
      () => selectValueList.productType,
      (newVal) => {
        nextTick(() => {
          if (newVal) {
            loadingStatus.value = true;
            if (isNeedGetProductType.value) {
              handleQueryResult(newVal);
              isNeedGetProductType.value = false;
            } else {
              let timer = setTimeout(() => {
                handleQueryResult(newVal);
                clearTimeout(timer);
                timer = null;
              }, 2000);
            }
          } else {
            clearChartList();
          }
        });
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
      });
    };
    // 根据渠道id获取品牌列表
    const handleSelectAllBrand = (channelId) => {
      selectAllBrand(channelId).then((data) => {
        selectList[1].options = data.map((item) => {
          return {
            value: item,
            label: item,
          };
        });
      });
    };
    // 获取产品类型列表
    const handleSelectAllProductType = () => {
      selectAllProductType().then((data) => {
        selectList[2].options = data.map((item) => {
          return {
            value: item,
            label: item,
          };
        });
        if (isNeedGetProductType.value) {
          let timer = setTimeout(() => {
            selectValueList.productType = data[0];
            clearTimeout(timer);
            timer = null;
          }, 2000);
        } else {
          selectValueList.productType = data[0];
        }
      });
    };
    // 清空渠道选项列表
    const clearChannelOptionList = () => {
      selectList[0].options = [];
      selectValueList.channel = "";
    };

    // 清空品牌选项列表
    const clearBrandOptionList = () => {
      selectList[1].options = [];
      selectValueList.brand = "";
    };
    // 清空产品类型选项列表
    const clearProductTypeOptionList = () => {
      selectList[2].options = [];
      selectValueList.productType = "";
    };

    // 根据文件id、渠道、品牌、产品类型，请求获取结果数据
    const handleQueryResult = (productType) => {
      statistics(current_fileId.value, productType)
        .then((data) => {
          if (data) {
            barChartList.value[0].list = data.top10Questions.list;
            pieChartList.value[0].list = data.ratingLevelProportion.list;
            pieChartList.value[1].list = data.positiveReview.list;
            pieChartList.value[2].list = data.negativeReview.list;
            setChartList();
          }
        })
        .finally(() => {
          loadingStatus.value = false;
          barChartList.value[0].finish = true;
          pieChartList.value[0].finish = true;
          pieChartList.value[1].finish = true;
          pieChartList.value[2].finish = true;
        });
    };

    // 设置所有图表
    const setChartList = () => {
      pieChartList.value.forEach((item, index) => {
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
        chartObj[item.key] = setChart(
          chartObj[item.key],
          `chart_${item.key}`,
          item.type,
          item.list,
          color_list,
          option_grid
        );
      });
      barChartList.value.forEach((item, index) => {
        let color_list = ["#fac858", "#93beff", "#507afc"];
        let option_grid = {};
        let option_rotate = {};
        if (item.key == "top10Questions") {
          color_list = ["#3185f5"];
          option_grid = {
            left: 32,
            right: 32,
            top: 42,
            bottom: 10,
          };
          option_rotate = {
            rotate: 50,
          };
        }
        chartObj[item.key] = setChart(
          chartObj[item.key],
          `chart_${item.key}`,
          item.type,
          item.list,
          color_list,
          option_rotate,
          option_grid
        );
      });
    };

    // 重置数据 和图表
    const reset = () => {
      // 清空数据
      clearChannelOptionList();
      clearBrandOptionList();
      clearProductTypeOptionList();
      // 清空图表
      clearChartList();
    };

    // 清除所有图表
    const clearChartList = () => {
      for (let key in chartObj) {
        if (chartObj[key]) {
          chartObj[key].clear();
          chartObj[key] = undefined;
        }
      }
      barChartList.value.forEach((item) => {
        item.list = [];
        item.finish = false;
      });
      pieChartList.value.forEach((item) => {
        item.list = [];
        item.finish = false;
      });
    };

    // 设置图表数据（单个）
    const setChart = (
      chart,
      chart_id,
      type,
      list,
      color_list,
      option_rotate,
      option_grid
    ) => {
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
      let option;
      if (type == "pie") {
        option_data.series_outer_center = ["50%", "32%"];
        option_data.series_inside_center = ["50%", "32%"];

        if (chart_id.indexOf("ratingLevelProportion") > -1) {
          option_data.series_outer_radius = [0, "40%"];
        } else {
          option_data.series_outer_radius = [0, "36%"];
        }
        option_data.series_inside_radius = [0, "55%"];
        option = chartPie(option_data);
      } else if (type == "bar") {
        option = chartBar(option_data, option_rotate, option_grid);
      } else {
        throw new Error("不支持的图表类型");
      }
      chart.setOption(option);
      return chart;
    };

    return {
      loadingStatus,
      selectList,
      selectValueList,
      summarize,
      pieChartList,
      barChartList,
      handleSelectAllChannel,
      setChartList,
      setChart,
      reset,
    };
  },
  mounted() {},
  beforeUnmount() {},
});
</script>

<style scoped lang="scss">
.multi-brand-analysis {
  width: 776px;
  height: 100%;
  position: relative;
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

      .select-item {
        height: 100%;
        position: relative;
        display: flex;
        align-items: center;
        padding: 0 12px;
        border-right: 1px solid #c2c2c2;
        border-bottom: 1px solid #c2c2c2;

        &:last-child {
          border-right: none;
        }
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

      .chart-list-title-wrap {
        .chart-list-title {
          font-size: 18px;
          font-weight: bold;
          color: #3d3d3d;
          display: flex;
          align-items: center;
          justify-content: center;
          .chart-list-title-text:nth-child(2) {
            margin-right: 28px;
          }
        }
        .chart-list-score {
          margin-top: 6px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: normal;
          color: #3d3d3d;
          .chart-list-title-text:nth-last-child(2) {
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
        .chart-list-divider {
          width: 100%;
        }
      }

      .chart-list-pie {
        box-sizing: border-box;
        width: 100%;
        padding: 0 12px;
        padding-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: nowrap;
        flex-basis: 30%;
        border-bottom: 1px solid #c2c2c2;
      }

      .chart-list-bar {
        flex-basis: 100%;
        .chart-item {
          width: 100%;
        }
      }

      .chart-item {
        position: relative;
        box-sizing: border-box;
        width: 33%;

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
          height: 326px;
          &.bar-chart-wrap {
            height: 320px;
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
