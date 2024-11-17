<template>
  <div class="production_interview_analysis">
    <!-- 左侧区域 -->
    <div class="left">
      <!-- 顶部组件 -->
      <topComp :filelist="commentStore.fileList" :selectFileId="commentStore.selectedFile" @selectFileIdChange="selectFileIdChange" @analysisFile="analysisFile" @clearAll="clearAll" @handleSuccess="handleSuccess" @beforeUpload="beforeUpload" @handleOnError="handleOnError"></topComp>
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
           <div class="infoText"> {{ index + 1 + "、" + item }}</div>
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
<!--      <div class="no_data" v-if="messageStore.rightContentType === CONTENTTYPE.NODATA">-->
<!--        <img src="../../assets/img/data_empty.png" />-->
<!--      </div>-->
      <BrandComment class="comp_content"></BrandComment>
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
          <el-icon class="icon" @click="close"><Close /></el-icon>
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
import {useCommentStore} from "../../store/modules/comment";
import { FILETYPE, CONTENTTYPE } from "../../util/defineData";
import ChatChart from "../../components/chatChart.vue";
import { questionList } from "../../util/defineData";
import {ElLoading,ElMessage} from "element-plus";
import BrandComment from "./brandComment.vue";
const messageStore = useMessageStore();
const commentStore = useCommentStore();

const scrollWrap = ref();
let isInputDisabled = ref(true);
let percentage = ref(20);
let inputStr = ref("");
let fileUploadDialog = ref(false);
let fileAnalysisDialog = ref(false);
let inputStatus = ref(false);

//是否上传中的状态
let uploadLoading:any;
// 是否开启输入框
watch(
  () => messageStore.selectedFile,
  () => {
    if (messageStore.selectedFileType === FILETYPE.MULT_RECORD_FILE) {
      isInputDisabled.value = false;
    } else {
      isInputDisabled.value = true;
    }
  },
  { immediate: true }
);
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

watch(()=>inputStr,()=>{
  if(inputStr.value != ""){
    inputStatus.value = false;
  }
},{deep: true})
onMounted(() => {
  window.addEventListener("keydown", handleKeyPress);
  commentStore.getFileList()
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyPress);
});

const choseQuestion = (data: any) => {
  console.log("111111111", data);
  inputStr.value = data;
};


const handleSuccess = (response:any, uploadFile:any, uploadFiles:any)=>{
  console.log("this is index handleSuccess")
  uploadLoading.close();
  commentStore.getFileList()
  // 选中当前上传的文件
  const fileId = messageStore.historyFileList.find((item) => item.fileName === uploadFiles.name)?.id || "";
  messageStore.selectedFile = fileId;
  ElMessage({
    message: "文件上传成功",
    type: "success",
  });
}

const beforeUpload = (uploadFile:any)=>{
  console.log("this is index beforeUpload",uploadFile)
  uploadLoading = ElLoading.service({
    lock: true,
    text: "文件上传中",
    background: "rgba(0, 0, 0, 0.7)",
  });
}

const handleOnError = ()=>{
  console.log("this is index handleOnError")
  uploadLoading.close();
  ElMessage({
    message: "文件上传失败",
    type: "warning",
  });
}
const handlePreview = (uploadFile:any)=>{
  console.log("this is index handlePreview",uploadFile)
}

const selectFileIdChange = (fileId:any)=>{
  console.log("selectFileIdChange",fileId)
  commentStore.selectedFile = fileId
}

// 清空已有内容
const clearAll = ()=> {
  messageStore.rightContentType = CONTENTTYPE.NODATA;
  messageStore.dialogueList = [];
  messageStore.currentDialogue = {
    question: "",
    answer: "",
  };
}

const analysisFile = ()=>{
  clearAll();
  if (messageStore.selectedFileType === FILETYPE.MULT_RECORD_FILE) {
    // 多条 Excel
    messageStore.analysisMultExcel();
  } else if (messageStore.selectedFileType === FILETYPE.SINGLE_RECORD_FILE) {
    // 单条 Excel
    messageStore.analysisSingleExcel();
  }
}

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
  if (!inputStr.value || !messageStore.selectedFile) {
    ElMessage({
      message: "请检查文件和输入是否完成~",
      type: "warning",
    });
    return false;
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
    .getLLmAnswer({
      id: messageStore.selectedFile,
      message: inputStr.value,
    })
    .then((res: any) => {
      isInputDisabled.value = false;
    });
  inputStr.value = "";
}
</script>

<style scoped>
.production_interview_analysis {
  width: 100%;
  height: calc(100% - 68px);
  display: flex;
  padding: 16px 0 60px 24px;
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
        .infoText{
          display: inline-block;
          margin:  5px 10px;
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
