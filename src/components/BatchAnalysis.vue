<template>
  <div class="batch-analysis">
    <div class="section-one">
      <div class="legend-wrap">
        <div class="sub-title">
          <img class="sub-title-icon" src="../assets/img/icons/dimension.png" />
          <el-text class="sub-title-label" size="large">维度：</el-text>
        </div>
        <el-radio-group class="radio-wrap" v-model="legend">
          <el-radio label="大区" size="large">大区</el-radio>
          <el-radio label="年代" size="large">人群</el-radio>
          <el-radio label="型号" size="large">型号</el-radio>
          <el-radio label="产品档次" size="large">产品档次</el-radio>
          <el-radio label="调研月份" size="large" disabled>调研月份</el-radio>
        </el-radio-group>
      </div>
      <div class="bar-chart-wrap">
        <div class="chart-item" id="chart_nps"></div>
        <div class="chart-info-wrap">
          <span>净推荐值总得分：</span>
          <span style="font-weight: bold">{{ nps_value }}%</span>
        </div>
      </div>
    </div>
    <div class="section-two">
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
            clearable
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
      <el-row class="pie-chart-list" :gutter="12">
        <el-col class="pie-chart-item pie-chart-one" :span="12">
          <div class="sub-title">
            <img class="sub-title-icon" src="../assets/img/icons/dislike.png" />
            <el-text class="sub-title-label" size="large">不推荐理由：</el-text>
          </div>
          <div class="chart-wrap">
            <div class="chart-item" id="chart_dislike"></div>
          </div>
        </el-col>
        <el-col class="pie-chart-item pie-chart-two" :span="12">
          <div class="sub-title">
            <img class="sub-title-icon" src="../assets/img/icons/like.png" />
            <el-text class="sub-title-label" size="large">推荐理由：</el-text>
          </div>
          <div class="chart-wrap">
            <div class="chart-item" id="chart_like"></div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, ref, watch, toRef, toRefs, computed } from "vue";
import * as echarts from "echarts";
import { chartPie, chartBar } from "../util/chart.js";
import { selectByProductGrade, nps, customerAttitudeType } from "../http/api.ts";
import { storeToRefs } from "pinia";
import { useMessageStore } from "../store/modules/message";

let chart_dislike, chart_like, chart_nps;
export default defineComponent({
  setup(props) {
    const messageStore = useMessageStore();
    let current_fileId = "";
    watch(
      () => messageStore.selectedFile,
      () => {
        // 是否开启分析
        current_fileId = messageStore.selectedFile;
      },
      { immediate: true }
    );
    const selectList = reactive([
      {
        key: "region",
        label: "大区",
        options: [
          {
            label: "华东",
            value: "华东",
          },
          {
            label: "东北",
            value: "东北",
          },
          {
            label: "华北",
            value: "华北",
          },
          {
            label: "华南",
            value: "华南",
          },
          {
            label: "山东",
            value: "山东",
          },
          {
            label: "华中",
            value: "华中",
          },
          {
            label: "西南",
            value: "西南",
          },
          {
            label: "西北",
            value: "西北",
          },
        ],
      },
      {
        key: "birthDecade",
        label: "人群",
        options: [
          {
            label: "90年代",
            value: "90年代",
          },
          {
            label: "80年代",
            value: "80年代",
          },
          {
            label: "70年代",
            value: "70年代",
          },
          {
            label: "60年代",
            value: "60年代",
          },
          {
            label: "50年代",
            value: "50年代",
          },
          {
            label: "其他",
            value: "其他",
          },
        ],
      },
      {
        key: "productGrade",
        label: "产品档次",
        options: [
          {
            label: "高端",
            value: "高端",
          },
          {
            label: "中端",
            value: "中端",
          },
          {
            label: "低端",
            value: "低端",
          },
        ],
      },
      {
        key: "modelType",
        label: "型号",
        options: [],
      },
    ]);
    const selectValueList = reactive({
      region: "",
      birthDecade: "",
      productGrade: "",
      modelType: "",
    });
    const legend = ref("");
    const nps_value = ref(0);

    // 监听legend
    watch(legend, (newVal, oldVal) => {
      setChartData_nps(newVal);
    });

    //监听 产品档次 下拉选择框
    watch(
      () => selectValueList.productGrade,
      (newVal, oldVal) => {
        if (newVal) {
          selectList[3].options = [];
          selectValueList.modelType = "";
          handleSelectByProductGrade(newVal);
        } else {
          selectList[3].options = [];
          selectValueList.modelType = "";
        }
      }
    );
    //监听 所有下拉选择框
    watch(
      () => [
        selectValueList.region,
        selectValueList.birthDecade,
        selectValueList.productGrade,
        selectValueList.modelType,
      ],
      (newVal, oldVal) => {
        setChartData_pie(newVal[0], newVal[1], newVal[2], newVal[3]);
      }
    );

    // 根据产品档次动态获取产品列表
    const handleSelectByProductGrade = (productGrade) => {
      if (!current_fileId) {
        console.error(
          "程序异常：无法获取fileId，接口位置：/follow-up/selectByProductGrade"
        );
        return;
      }
      selectByProductGrade(current_fileId, productGrade).then((data) => {
        selectList[3].options = data.map((item) => {
          return {
            value: item,
            label: item,
          };
        });
      });
    };
    // 1、不推荐理由图表 饼状图
    const initChart_dislike = (list) => {
      if (!list) {
        return;
      }
      let option_data = {
        xAxis_data: list.map((i) => i.label),
        series_data: list.map((i) => i.value),
        color_list: [
          "#f4d35e",
          "#7bc5c1",
          "#9a9cea",
          "#0ab68b",
          "#fd7d96",
          "#ff9201",
          "#4c7972",
          "#d47751",
          "#30a0e0",
          "#c2528b",
        ],
      };
      if (!chart_dislike) {
        chart_dislike = echarts.init(document.getElementById("chart_dislike"));
      }
      let option = chartPie(option_data);
      chart_dislike.setOption(option);
    };
    // 2、推荐理由图表 饼状图
    const initChart_like = (list) => {
      if (!list) {
        return;
      }
      let option_data = {
        xAxis_data: list.map((i) => i.label),
        series_data: list.map((i) => i.value),
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
      };

      if (!chart_like) {
        chart_like = echarts.init(document.getElementById("chart_like"));
      }
      let option = chartPie(option_data);
      chart_like.setOption(option);
    };
    // 3、维度图表 柱形图
    const initChart_nps = (list) => {
      if (!list) {
        return;
      }
      let option_data = {
        xAxis_data: list.map((i) => i.label),
        series_data: list.map((i) => i.value),
        color_list: ["#3185F5"],
        title: "分维度分析（单位：%）",
      };
      if (!chart_nps) {
        chart_nps = echarts.init(document.getElementById("chart_nps"));
      }
      let option = chartBar(option_data);
      chart_nps.setOption(option);
    };

    // 更新图表数据
    const update_chart = (type, list) => {
      if (type == "bar") {
        initChart_nps(list);
      } else if (type == "pie_dislike") {
        initChart_dislike(list);
      } else if (type == "pie_like") {
        initChart_like(list);
      }
    };

    // 设置柱形图
    const setChartData_nps = (legend) => {
      if (!current_fileId) {
        console.error("程序异常：无法获取fileId，接口位置：/follow-up/nps");
        return;
      }
      nps(current_fileId, legend).then((data) => {
        nps_value.value = data.total;
        if (chart_nps) {
          const type = "bar";
          update_chart(type, data.list);
        } else {
          initChart_nps(data.list);
        }
      });
    };

    // 设置饼状图
    const setChartData_pie = (region, birthDecade, productGrade, modelType) => {
      if (!current_fileId) {
        console.error(
          "程序异常：无法获取fileId，接口位置：/follow-up/customerAttitudeType"
        );
        return;
      }
      // type 0 贬低  1 推荐
      let params_dislike = {
        fileId: current_fileId,
        region: region,
        birthDecade: birthDecade,
        productGrade: productGrade,
        modelType: modelType,
        type: "0",
      };
      customerAttitudeType(params_dislike).then((data) => {
        if (chart_dislike) {
          const type = "pie_dislike";
          update_chart(type, data.list);
        } else {
          initChart_dislike(data.list);
        }
      });

      let params_like = {
        fileId: current_fileId,
        region: region,
        birthDecade: birthDecade,
        productGrade: productGrade,
        modelType: modelType,
        type: "1",
      };
      customerAttitudeType(params_like).then((data) => {
        if (chart_like) {
          const type = "pie_like";
          update_chart(type, data.list);
        } else {
          initChart_like(data.list);
        }
      });
    };

    return {
      selectList,
      selectValueList,
      legend,
      nps_value,
      initChart_dislike,
      initChart_like,
      initChart_nps,
      update_chart,
      setChartData_nps,
      setChartData_pie,
      handleSelectByProductGrade,
    };
  },
  mounted() {
    this.legend = "大区";
    this.setChartData_pie();
  },
  beforeUnmount() {
    this.legend = "";
    if (chart_dislike) {
      chart_dislike.dispose();
      chart_dislike = null;
    }
    if (chart_like) {
      chart_like.dispose();
      chart_like = null;
    }
    if (chart_nps) {
      chart_nps.dispose();
      chart_nps = null;
    }
  },
});
</script>

<style scoped lang="scss">
.batch-analysis {
  width: 850px;
  height: 100%;
  position: relative;
  padding: 24px 40px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  box-sizing: border-box;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;

  .section-one,
  .section-two {
    height: calc(50% - 8px);
    position: relative;
    border-radius: 8px;
    border: 1px solid #c2c2c2;
    box-sizing: border-box;
  }

  .section-one {
    margin-bottom: 16px;

    .legend-wrap {
      height: 56px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      border-bottom: 1px solid #c2c2c2;

      .sub-title {
        margin-right: 2px;
      }

      .radio-wrap {
        .el-radio {
          &.is-checked {
            ::v-deep {
              .el-radio__input {
                .el-radio__inner {
                  border-color: #017efa;
                  border-width: 4.5px;

                  &::after {
                    width: 6px;
                    height: 6px;
                  }
                }
              }

              .el-radio__label {
                color: #3d3d3d;
              }
            }
          }
          &.is-disabled {
            ::v-deep {
              .el-radio__input {
                .el-radio__inner {
                  border-color: #d0d0d0;
                  background-color: #efefef;
                }
              }

              .el-radio__label {
                color: #d0d0d0;
              }
            }
          }

          ::v-deep {
            .el-radio__input {
              .el-radio__inner {
                border-color: rgba(1, 126, 250, 0.3);
                border-width: 2px;
              }
            }

            .el-radio__label {
              font-family: Source Han Sans CN;
              font-size: 16px;
              font-weight: normal;
              line-height: normal;
              letter-spacing: 0px;
              color: #94a0af;
            }
          }
        }
      }
    }

    .bar-chart-wrap {
      width: 100%;
      height: calc(100% - 56px);
      position: relative;
      box-sizing: border-box;
      padding: 10px 10px;

      .chart-info-wrap {
        position: absolute;
        top: 12px;
        right: 70px;
        background: rgba(1, 126, 250, 0.08);
        padding: 4px 8px;
        height: 32px;
        border-radius: 4px;
        font-weight: normal;
        line-height: normal;
        color: #6e7079;
        font-size: 16px;
        line-height: 32px;
      }
    }
  }

  .section-two {
    .select-list {
      width: 100%;
      height: 56px;
      position: relative;

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

    .pie-chart-list {
      padding: 10px 20px 8px;
      box-sizing: border-box;
      height: calc(100% - 56px);
      position: relative;
      box-sizing: border-box;

      .pie-chart-item {
        height: 100%;
        position: relative;
        box-sizing: border-box;

        .chart-wrap {
          height: calc(100% - 28px);
          position: relative;
          box-sizing: border-box;
          // padding-top: 25px;
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

.sub-title {
  display: flex;
  align-items: center;
  height: 28px;

  .sub-title-icon {
    width: 18px;
    height: 18px;
    margin-right: 4px;
  }

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

.chart-item {
  height: 100%;
  width: 100%;
  position: relative;
}
</style>
