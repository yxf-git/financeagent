<template>
  <div class="detail_div">
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
              <div class="dialogue_bubble bubble_right">{{ item.question || "" }}</div>
            </div>
            <div class="dialogue_item_left">
              <div
                class="dialogue_bubble bubble_left"
                v-html="item.answer ? item.answer : ''"
              ></div>
            </div>
          </div>
          <div class="dialogue_item" :id="'chat' + messageStore.dialogueList.length">
            <div class="dialogue_item_right" v-if="messageStore.currentDialogue.question">
              <div class="dialogue_bubble bubble_right">{{ messageStore.currentDialogue.question }}</div>
            </div>
            <div class="dialogue_item_left" v-if="messageStore.currentDialogue.answer">
              <div
                class="dialogue_bubble bubble_left"
                v-html="messageStore.currentDialogue.answer"
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
          ></el-button>
        </div>
      </div>
    </div>
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
  onUnmounted
} from "vue";
import { useMessageStore } from "../../../store/modules/message";
import { FILETYPE, CONTENTTYPE, sparkAppData } from "../../../util/defineData";
import { getAssetsFiles } from "../../../util/common";
import { questionList, infoExample } from "../../../util/defineData";
import { generateUUID } from "../../../util/common";
import { useRoute } from "vue-router";
import router from "../../../router";
const route = useRoute();
const messageStore = useMessageStore();
const detailInfo = ref();

const exampleList = ref();

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
  assistantCode: ""
});
const sessionId = ref("");
exampleList.value = infoExample;

const goPage = (url: string, category?: any) => {
  if (url) {
    let _route = {
      path: url,
      query: category
    };
    if (category?.sparkAppId) {
      _route.query = {
        sparkAppId: category.sparkAppId
      };
    }
    router.push(_route);
  }
};
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
  query => {
    detailInfo.value = query;
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

const calcInputStyle = computed(() => {
  return {
    background: isInputDisabled.value ? "#e4e7ed" : "#ffffff"
  };
});
const calcSendBtnStyle = computed(() => {
  return {
    color: isInputDisabled.value ? "#a8abb2" : "#017efa",
    background: isInputDisabled.value
      ? "rgba(255, 255, 255, 0.5)"
      : "rgba(1, 126, 250, 0.1)"
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
    answer: ""
  };
  isInputDisabled.value = true;
  messageStore
    .getSparkAnswer({
      traceId: generateUUID(),
      assistantCode: currentApp.value.assistantCode,
      appId: currentApp.value.appId,
      sessionId: sessionId.value,
      message: inputStr.value
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
  
  <style scoped lang="scss" >
.detail_div {
  width: 100%;
  height: calc(92%);
  display: flex;
  flex-direction: column;
  .tips {
    margin-top: 18px;
    margin-bottom: 30px;
    .title {
      font-family: Source Han Sans;
      font-size: 24px;
      font-weight: normal;
      color: #017efa;
    }
    .title_tips {
      font-family: 思源黑体;
      font-size: 16px;
      color: #767676;
      margin-top: 10px;
    }
  }

  .example {
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(5px);
    padding: 15px 14px 17px 26px;
    margin-top: 16px;
    .example_title {
      font-family: Source Han Sans;
      font-size: 16px;
      color: #94a0af;
      margin-bottom: 12px;
    }
    .example_div {
      display: flex;
      justify-content: flex-start;
    }
    .example_content {
      border-radius: 4px;
      background: rgba(1, 126, 250, 0.1);
      font-family: 思源黑体;
      font-size: 14px;
      color: #94a0af;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 7px 8px;
      &:not(:first-child) {
        margin-left: 16px;
      }
      .example_img {
        width: 9.75px;
        height: 9.75px;
        margin-right: 7.5px;
      }
      p {
        font-family: 思源黑体;
        font-size: 14px;
        color: #94a0af;

        z-index: 2;
      }
    }
  }
  .left {
    flex: 1;
    display: flex;
    flex-direction: column;
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
}
</style>
  
  