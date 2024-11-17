<template>
  <div class="spark_app">
    <!-- 左侧区域 -->
    <div class="left">
      <!-- 对话区域 -->
      <div class="dialogue_container" ref="scrollWrap">
        <div v-show="messageStore.showDialogue">
          <div
            class="dialogue_item"
            v-for="(item, index) in messageStore.dialogueList"
            :key="index"
          >
            <div class="dialogue_item_right">
              <div class="dialogue_bubble bubble_right">
                {{ item.question || "" }}
              </div>
            </div>
            <div class="dialogue_item_left">
              <div
                class="dialogue_bubble bubble_left_charts"
                v-if="checkChartOrNormal(item.answer)"
              >
                <div class="chartTitle">
                  {{ getChartData(item.answer, "title") }}
                </div>
                <ChatChart
                  :list="getChartData(item.answer, 'data')"
                  class="chartInfo"
                ></ChatChart>
              </div>
              <div
                class="dialogue_bubble bubble_left"
                v-html="item.answer ? item.answer : ''"
                v-if="!checkChartOrNormal(item.answer)"
              ></div>
            </div>
          </div>
          <div
            class="dialogue_item"
            :id="'chat' + messageStore.dialogueList.length"
          >
            <div
              class="dialogue_item_right"
              v-if="messageStore.currentDialogue.question"
            >
              <div class="dialogue_bubble bubble_right">
                {{ messageStore.currentDialogue.question }}
              </div>
            </div>
            <div
              class="dialogue_item_left"
              v-if="messageStore.currentDialogue.answer"
            >
              <div
                class="dialogue_bubble bubble_left_charts"
                v-if="checkCharCurrent"
              >
                <div class="chartTitle">
                  {{
                    getChartData(messageStore.currentDialogue.answer, "title")
                  }}
                </div>
                <ChatChart
                  :list="
                    getChartData(messageStore.currentDialogue.answer, 'data')
                  "
                  class="chartInfo"
                ></ChatChart>
              </div>
              <div
                class="dialogue_bubble bubble_left"
                v-html="messageStore.currentDialogue.answer"
                v-if="!checkCharCurrent"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="flex-column">
        <div
          class="questionList flex-row flex-wrap"
          v-if="!isInputDisabled && !inputStr && inputStatus"
        >
          <div
            class="questionInfo"
            @mousedown="choseQuestion(item)"
            v-for="(item, index) in questionList"
          >
            <div class="infoText">{{ index + 1 + "、" + item }}</div>
          </div>
        </div>
        <div class="bottom_input" :style="calcInputStyle">
          <el-input
            v-model="inputStr"
            :autosize="{ minRows: 1, maxRows: 4 }"
            class="input_textarea"
            type="textarea"
            :disabled="isInputDisabled"
            @focus="inputFocus"
          />
          <el-button
            plain
            @click="send"
            class="send_btn"
            :style="calcSendBtnStyle"
            :disabled="isInputDisabled"
            :icon="Promotion"
          >
          </el-button>
        </div>
      </div>
    </div>
    <!-- 右侧区域 -->
    <div class="right_content">
      <sparkAppDesc :appId="sparkAppId" />
    </div>
    <!-- 弹出层 -->
    <el-dialog
      v-model="fileUploadDialog"
      append-to-body
      :show-close="false"
      width="438"
      class="upload_dialog"
    >
      <template #header="{ close, titleId, titleClass }">
        <div class="upload_dialog_header">
          <span :id="titleId" class="title">文件导入中</span>
          <el-icon class="icon" @click="close">
            <Close />
          </el-icon>
        </div>
      </template>
      <div class="upload_dialog_content">
        <img src="../../assets/img/excel.png" class="dialog_content_img" />
        <div class="right_wrapper">
          <div class="content_file_name">单次</div>
          <el-progress :percentage="percentage" color="#017EFA" />
        </div>
      </div>
    </el-dialog>
    <el-dialog
      v-model="fileAnalysisDialog"
      append-to-body
      :show-close="false"
      width="454"
      class="analysis_dialog"
    >
      <div class="analysis_dialog_content">
        <div v-loading="true" class="dialog_content_img"></div>
        <div class="right_wrapper">
          <div class="content_title">等待分析</div>
          <el-progress :percentage="percentage" color="#017EFA" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Promotion, Close } from "@element-plus/icons-vue";
import {
  ref,
  watch,
  computed,
  reactive,
  nextTick,
  onMounted,
  onUnmounted,
} from "vue";
import { useMessageStore } from "../../store/modules/message";
import { FILETYPE, CONTENTTYPE, sparkAppData } from "../../util/defineData";
import ChatChart from "../../components/chatChart.vue";
import sparkAppDesc from "../../components/sparkAppDesc.vue";
import { questionList } from "../../util/defineData";
import { generateUUID } from "../../util/common";
import { valueEquals } from "element-plus";
import { useRoute } from "vue-router";
const route = useRoute();
const messageStore = useMessageStore();

const scrollWrap = ref();
let isInputDisabled = ref(false);
let percentage = ref(20);
let inputStr = ref("");
let fileUploadDialog = ref(false);
let fileAnalysisDialog = ref(false);
let inputStatus = ref(false);
let sparkAppId = ref("");
let currentApp = ref({
  appId: "",
  assistantCode: "",
});
const sessionId = ref("");

// 流式自动滚动
watch(
  () => [messageStore.currentDialogue, messageStore.dialogueList],
  () => {
    nextTick(() => {
      if (
        scrollWrap.value &&
        scrollWrap.value.scrollTop < scrollWrap.value.scrollHeight
      ) {
        scrollWrap.value.scrollTop = scrollWrap.value.scrollHeight;
      }
    });
  },
  { deep: true }
);

watch(
  () => route.query,
  (query) => {
    if (query.sparkAppId) {
      const { sparkAppId: _sparkAppId } = query as any;
      sparkAppId.value = _sparkAppId;
      let _app = sparkAppData[_sparkAppId];
      Object.assign(currentApp.value, _app);
    }
  },
  { immediate: true }
);

watch(
  () => inputStr,
  () => {
    if (inputStr.value != "") {
      inputStatus.value = false;
    }
  },
  { deep: true }
);
onMounted(() => {
  window.addEventListener("keydown", handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyPress);
  resetAll();
});

const resetAll = () => {
  // console.log("重置页面数据")
  sessionId.value = "";
  messageStore.resetDialogue();
};

const choseQuestion = (data: any) => {
  console.log("111111111", data);
  inputStr.value = data;
};
const inputFocus = () => {
  nextTick(() => {
    // inputStatus.value = true;
  });
};
const inputBlur = () => {
  inputStatus.value = false;
};

const handleKeyPress = (e: any) => {
  if (e.keyCode == 13 && !isInputDisabled.value) {
    send();
  }
};

const checkChartOrNormal = computed(() => {
  return function (data: any) {
    return /^[\s]*\{[\s\S]*\}[\s]*$/.test(data);
  };
});

const checkCharCurrent = computed(() => {
  return /^[\s]*\{[\s\S]*\}[\s]*$/.test(messageStore.currentDialogue.answer);
});

const getChartData = computed(() => {
  return (data: any, item: any) => {
    if (!data) {
      return false;
    }
    let res = JSON.parse(data);
    return res[item];
  };
});

const calcInputStyle = computed(() => {
  return {
    background: isInputDisabled.value ? "#e4e7ed" : "#ffffff",
  };
});
const calcSendBtnStyle = computed(() => {
  return {
    color: isInputDisabled.value ? "#a8abb2" : "#017efa",
    background: isInputDisabled.value
      ? "rgba(255, 255, 255, 0.5)"
      : "rgba(1, 126, 250, 0.1)",
  };
});

async function send() {
  if (!inputStr.value) {
    return;
  }
  if (messageStore.currentDialogue.question) {
    messageStore.dialogueList.push(messageStore.currentDialogue);
  }
  messageStore.currentDialogue = {
    question: inputStr.value,
    answer: "",
  };
  isInputDisabled.value = true;
  messageStore
    .getSparkAnswer({
      traceId: generateUUID(),
      assistantCode: currentApp.value.assistantCode,
      appId: currentApp.value.appId,
      sessionId: sessionId.value,
      message: inputStr.value,
    })
    .then((_sessionId: any) => {
      if (_sessionId) {
        sessionId.value = _sessionId;
      } else {
        sessionId.value = "";
      }
      isInputDisabled.value = false;
    });
  inputStr.value = "";
}
</script>

<style scoped>
.spark_app {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 16px 0 10px 24px;
  box-sizing: border-box;

  .left {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    margin-right: 16px;

    .dialogue_container {
      flex: 1;
      padding: 0 20px;
      margin: 24px 0 10px 0;
      font-size: 18px;
      overflow: auto;
      font-family: "Source Han Sans", sans-serif;

      .avatar {
        width: 36px;
        height: 36px;
      }

      .dialogue_bubble {
        padding: 10px 20px;
        max-width: 545px;
        background-color: #ffffff;
        border-radius: 8px;
        word-wrap: break-word;
      }

      .dialogue_item_left {
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }

      .dialogue_item_right {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin: 32px 0;
      }

      .dialogue_item:first-of-type .dialogue_item_right {
        margin: 0 0 32px 0;
      }

      .bubble_right {
        background: #017efa;
        border-bottom-right-radius: 0px;
        color: #ffffff;
      }

      .bubble_left {
        border-bottom-left-radius: 0px;
        min-width: fit-content;
        color: #3d3d3d;
      }

      .bubble_left_charts {
        border-bottom-left-radius: 0px;
        min-width: 600px;
        color: #3d3d3d;
      }

      .chartTitle {
        margin-top: 10px;
        font-family: 思源黑体;
        font-size: 18px;
        font-weight: normal;
        line-height: 18px;
        letter-spacing: 0em;
        font-feature-settings: "kern" on;
        color: #3d3d3d;
      }
    }

    .questionList {
      position: relative;
      padding: 10px 15px;
      height: fit-content;
      background-color: rgba(148, 160, 175, 0.1);
      letter-spacing: 0em;

      .questionInfo {
        cursor: pointer;
        margin-right: 10px;
        margin-bottom: 5px;
        font-family: Source Han Sans;
        font-size: 16px;
        font-weight: bold;
        height: 34px;
        line-height: 24px;
        letter-spacing: 0em;
        font-feature-settings: "kern" on;
        background-color: #017efa;
        color: #ffffff;
        border-radius: 8px;

        .infoText {
          display: inline-block;
          margin: 5px 10px;
        }
      }
    }

    .bottom_input {
      position: relative;
      min-height: 56px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 8px 12px;
      border-radius: 8px;
      box-sizing: border-box;

      .input_textarea {
        margin-right: 12px;
      }

      .send_btn {
        width: 40px;
        height: 40px;
        font-size: 20px;
        border-radius: 8px;
      }

      :deep(.el-textarea__inner) {
        background-color: transparent;
        line-height: 25px;
        font-size: 16px;
        border: none;
        box-shadow: none;
      }
    }
  }

  .right_content {
    height: 100%;
    background: rgba(255, 255, 255, 0);
    backdrop-filter: blur(5px);
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;

    .comp_content {
      height: 100%;
    }

    .no_data {
      width: 912px;
      background-color: white;
      height: 100%;
      display: flex;
      border-radius: 8px;
      justify-content: center;
      align-items: center;

      img {
        width: 300px;
      }
    }
  }
}

.upload_dialog_header {
  display: flex;
  justify-content: space-between;
  font-family: Source Han Sans;
  font-size: 16px;
  color: #3d3d3d;

  .icon {
    cursor: pointer;
  }
}

.upload_dialog_content {
  display: flex;

  .dialog_content_img {
    width: 40px;
    margin-right: 8px;
  }

  .content_file_name {
    font-size: 14px;
    color: rgba(51, 51, 51, 0.5);
  }

  .right_wrapper {
    width: 100%;
  }
}

.analysis_dialog_content {
  display: flex;

  .dialog_content_img {
    width: 40px;
    margin-right: 12px;
  }

  :deep(.el-loading-spinner) {
    top: 0;
  }

  .content_title {
    font-size: 14px;
    color: #333;
  }

  .right_wrapper {
    width: 100%;
  }
}
</style>
<style>
.analysis_dialog {
  .el-dialog__body {
    padding-top: 0;
  }
}

.upload_dialog {
  .el-dialog__body {
    padding-top: 20;
  }
}

.chartInfo {
  width: 600px;
  height: 300px;
}
</style>
