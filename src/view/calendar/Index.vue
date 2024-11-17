<template>
  <div class="production_interview_analysis">
    <!-- 左侧区域 -->
    <div class="left">
      <!-- 对话区域 -->
      <div class="dialogue_container" ref="scrollWrap">
        <div>
          <div class="dialogue_item" v-for="(item, index) in calendarStore.dialogueList" :key="index">
            <div class="dialogue_item_right">
              <div class="dialogue_bubble bubble_right">
                {{ item.question || "" }}
              </div>
            </div>
            <div class="dialogue_item_left">
              <div class="dialogue_bubble bubble_left" v-html="item.answer ? item.answer : '这个我还在学习中~'"></div>
            </div>
          </div>
          <div class="dialogue_item" :id="'chat' + calendarStore.dialogueList.length">
            <div class="dialogue_item_right" v-if="calendarStore.currentDialogue.question">
              <div class="dialogue_bubble bubble_right">
                {{ calendarStore.currentDialogue.question }}
              </div>
            </div>
            <div class="dialogue_item_left" v-if="calendarStore.currentDialogue.question">
              <div class="dialogue_bubble bubble_left">
                {{ calendarStore.currentDialogue.answer || "请稍等···" }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="flex-column">
        <div class="questionList flex-row flex-wrap" v-if="!isInputDisabled && !inputStr && inputStatus">
          <div class="questionInfo" @mousedown="choseQuestion(item)" v-for="(item, index) in calendarQuestionList">
            <div class="infoText">{{ index + 1 + "、" + item }}</div>
          </div>
        </div>
        <div class="bottom_contaner">
          <el-button class="new_chat" type="primary" size="large" :icon="ChatDotRound" @click="newChat">新会话</el-button>
          <div class="bottom_input" :style="calcInputStyle">
            <el-input v-model="inputStr" :autosize="{ minRows: 1, maxRows: 4 }" class="input_textarea" type="textarea"
              :disabled="isInputDisabled" @focus="inputFocus" @blur="inputBlur" />
            <el-button plain @click="send" class="send_btn" :style="calcSendBtnStyle" :disabled="isInputDisabled"
              :icon="Promotion">
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 右侧区域 -->
    <div class="right_content">
      <FullCalendar class="custom_calendar" :options="calendarOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Promotion, ChatDotRound } from "@element-plus/icons-vue";

import {
  ref,
  watch,
  computed,
  reactive,
  nextTick,
  onMounted,
  onUnmounted,
} from "vue";
import { useCalendarStore } from "../../store/modules/calendar";
import { calendarQuestionList } from "../../util/defineData";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interaction from "@fullcalendar/interaction";
import zhCnLocale from "@fullcalendar/core/locales/zh-cn";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import "tippy.js/animations/scale.css";

let requestInterval: NodeJS.Timeout | null | undefined = null;
const calendarOptions = reactive({
  plugins: [dayGridPlugin, timeGridPlugin, interaction],
  initialView: "timeGridWeek",
  timeZone: "local",
  selectable: true,
  dayMaxEvents: true,
  locale: zhCnLocale,
  handleWindowResize: true, //随浏览器窗口变化
  headerToolbar: {
    // 头部toolba
    left: "prev,next today",
    center: "title",
    right: "timeGridDay,timeGridWeek,dayGridMonth",
  },
  // select: this.handleDateSelect,
  // eventClick: this.handleEventClick, // 日程点击事件
  eventMouseEnter: function (info: any) {
    console.log(info);
    tippy(info.el, {
      content: info.event.title,
      theme: "light",
      placement: "right-end",
      allowHTML: true,
    });
  },
  // eventsSet: this.handleEvents,
  // dateClick: this.handleDateClick,//日期方格点击事件
  // eventClick: this.handleEventClick, //日程点击事件
  events: <any>[],
});
const calendarStore = useCalendarStore();
const scrollWrap = ref();
let isInputDisabled = ref(false);
let inputStr = ref("");
let inputStatus = ref(false);
const userId = "111"; // userID number
// 流式自动滚动
watch(
  () => [calendarStore.currentDialogue, calendarStore.dialogueList],
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
  () => inputStr,
  () => {
    if (inputStr.value != "") {
      inputStatus.value = false;
    }
  },
  { deep: true }
);
watch(
  () => calendarStore.scheduleList,
  () => {
    calendarOptions.events = calendarStore.scheduleList;
  },
  { deep: true }
);
onMounted(() => {
  window.addEventListener("keydown", handleKeyPress);
  initPage();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyPress);
  requestInterval && clearInterval(requestInterval);
});
function newChat() {
  calendarStore.deleteUserSessionAction(userId, calendarStore.sessionId);
}

const choseQuestion = (data: any) => {
  console.log("chose question", data);
  inputStr.value = data;
};
const inputFocus = () => {
  nextTick(() => {
    inputStatus.value = true;
  });
};
const inputBlur = () => {
  inputStatus.value = false;
};

const handleKeyPress = (e: any) => {
  if (e.keyCode == 13 && !isInputDisabled.value) {
    e.preventDefault();
    send();
  }
};
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
function initPage() {
  calendarStore.getUserSchedule(userId);
  calendarStore.getUserSession(userId);
  // 定时获取日程;
  requestInterval = setInterval(() => {
    calendarStore.getUserSchedule(userId);
  }, 10000);
}

async function send() {
  if (!inputStr.value) {
    return;
  }
  if (calendarStore.currentDialogue.question) {
    calendarStore.dialogueList.push(calendarStore.currentDialogue);
  }
  calendarStore.currentDialogue = {
    question: inputStr.value,
    answer: "",
  };
  // 拼接历史记录
  const tempArr = [...calendarStore.dialogueList];
  const history = [
    ...tempArr.splice(-10),
    {
      question: inputStr.value,
    },
  ];
  calendarStore
    .getLLmAnswer({
      userId: userId,
      sessionId: calendarStore.sessionId,
      text: history,
    })
    .then((res: any) => {
      isInputDisabled.value = false;
    });
  inputStr.value = "";
}
</script>

<style scoped>
:deep(.fc .fc-button:focus) {
  box-shadow: none !important;
}

.production_interview_analysis {
  /* width: 1366px; */
  height: 100%;
  display: flex;
  box-sizing: border-box;

  .left {
    width: calc(100% - 850px);
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
        max-width: 340px;
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
        color: #3d3d3d;
      }

      .bubble_left_charts {
        border-bottom-left-radius: 0px;
        min-width: 600px;
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

    .bottom_contaner {
      display: flex;
      justify-content: center;
      align-items: center;

      .new_chat {
        border-radius: 8px;
        padding: 12px 20px;
        margin-right: 8px;
      }
    }

    .bottom_input {
      position: relative;
      min-height: 56px;
      display: flex;
      flex: 1;
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
    height: calc(100% - 24px);
    background: white;
    padding: 12px;
    border-radius: 8px;

    .custom_calendar {
      width: 850px;
      height: 100%;
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
