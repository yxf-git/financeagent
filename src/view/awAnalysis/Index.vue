<template>
  <div class="production_interview_analysis">
    <!-- 左侧区域 -->
    <div class="left flex-column flex--grow">
      <!-- 顶部组件 -->
      <topComp uploadUrl="/aw/llm-aw/upload" :filelist="commentStore.fileList" :selectFileId="commentStore.selectedFile" @selectFileIdChange="selectFileIdChange" @analysisFile="analysisFile" @clearAll="clearAll" @handleSuccess="handleSuccess" @beforeUpload="beforeUpload" @handleOnError="handleOnError"></topComp>
      <!-- 对话区域 -->
      <div class="dialogue_container flex--grow" ref="scrollWrap">
        <div class="dialogue_item" v-for="(item, index) in commentStore.dialogueList" :key="index">
          <div class="dialogue_item_right">
            <div class="dialogue_bubble bubble_right">
              {{ item.question || "" }}
            </div>
          </div>
          <div class="dialogue_item_left">
            <div class="dialogue_bubble bubble_left_charts" v-if="checkChartOrNormal(item.answer)">
              <div class="chartTitle">
                {{ getChartData(item.answer, "title") }}
              </div>
              <ChatChart :list="getChartData(item.answer, 'data')" class="chartInfo"></ChatChart>
            </div>
            <div class="dialogue_bubble bubble_left" v-html="item.answer ? item.answer : ''" v-if="!checkChartOrNormal(item.answer)"></div>
          </div>
        </div>
        <div class="dialogue_item" :id="'chat' + commentStore.dialogueList.length" v-if="commentStore.currentDialogue.question">
          <div class="dialogue_item_right" >
            <div class="dialogue_bubble bubble_right">
              {{ commentStore.currentDialogue.question  }}
            </div>
          </div>
          <div class="dialogue_item_left">
            <div class="dialogue_bubble bubble_left_charts" v-if="checkCharCurrent">
              <div class="chartTitle">
                {{ getChartData(commentStore.currentDialogue.answer, "title") }}
              </div>
              <ChatChart :list="getChartData(commentStore.currentDialogue.answer, 'data')" class="chartInfo"></ChatChart>
            </div>
            <div class="dialogue_bubble bubble_left" v-html="commentStore.currentDialogue.answer || '请稍等···'" v-if="!checkCharCurrent"></div>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="flex-column">
        <div class="bottom_input flex-row" :style="calcInputStyle">
          <el-select v-model="analysisType" class="select_type">
            <el-option label="固定维度" :value="0"/>
            <el-option label="生成维度" :value="1"/>
          </el-select>
          <el-input v-model="inputStr" :autosize="{ minRows: 1, maxRows: 4 }" class="input_textarea flex-row flex--align--center" type="textarea" :disabled="isInputDisabled" @focus="inputFocus"/>
          <el-button plain @click="send" class="send_btn" :style="calcSendBtnStyle" :disabled="isInputDisabled" :icon="Promotion"></el-button>
        </div>
      </div>
    </div>
    <!-- 右侧区域标签 -->
    <div class="right_content">
      <div class="no_data flex-column flex--align--center flex--justify--center" v-if="commentStore.selectedFile==''">
        <img src="../../assets/img/data_empty.png" />
      </div>
      <div class="no_data flex-column flex--align--center flex--justify--center" v-else>
        <div class="flex-column flex--align--center">
          <img src="../../assets/img/excel-big.png" />
          <div class="excelTitle">{{ fileListSimple.fileName }}</div>
          <el-button type="success" round @click="downFile">{{ fileTypeButton }}</el-button>
        </div>
      </div>
    </div>
    <!-- 弹出层 -->
    <el-dialog v-model="fileUploadDialog" append-to-body :show-close="false" width="438" class="upload_dialog">
      <template #header="{ close, titleId, titleClass }">
        <div class="upload_dialog_header ">
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
    <el-dialog v-model="fileAnalysisDialog" append-to-body :show-close="false" width="454" class="analysis_dialog" :close-on-click-modal="false" title="等待分析" align-center="true">
      <div class="analysis_dialog_content">
        <div class="right_wrapper">
          <el-progress :percentage="percentage" color="#017EFA" />
        </div>
      </div>
    </el-dialog>


  </div>
</template>

<script setup lang="ts">
import { Promotion, Close } from "@element-plus/icons-vue";
import { findObjectById} from "../../util/common";
import { commentQuestionList } from "../../util/defineData";
import {ref,watch,computed,reactive,nextTick,onMounted,onUnmounted} from "vue";
import {useCommentAwStore} from "../../store/modules/commentAw";
import { FILETYPE, CONTENTTYPE } from "../../util/defineData";
import {ElLoading,ElMessage} from "element-plus";
import {analysisAwFile, downAwFile, downAwFilePost} from "../../http/api";
const commentStore = useCommentAwStore();

let rightTyple = ref(-1)
const scrollWrap = ref();
let isInputDisabled = ref(true);
let percentage = ref(0);
let inputStr = ref("");
let fileUploadDialog = ref(false);
let fileAnalysisDialog = ref(false);
let inputStatus = ref(false);
let analysisType = ref(0)
//是否上传中的状态
let uploadLoading:any;
let fileTypeButton = ref("待分析");
//传递单条总结
let messageStr = ref("");
let fileListSimple = reactive({fileName:undefined,id:undefined});
let intervalTimer:any;
let downLoadUrl = ref("")
let drawerListType = ref(true)
// 流式自动滚动
watch(
  () => [commentStore.currentDialogue, commentStore.dialogueList],
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
  inputStr.value = data;
};


const handleSuccess = (response:any, uploadFile:any, uploadFiles:any)=>{
  uploadLoading.close();
  if(response.response.data){
    commentStore.getFileList()

    fileListSimple.fileName = response.name
    fileListSimple.id = response.response.data
    nextTick(()=>{
      commentStore.selectedFile = response.response.data
      ElMessage({
        message: "文件上传成功",
        type: "success",
      });
    })
  }else{
    ElMessage({
      message: response.response.message,
      type: "warning",
    });
  }
};

const beforeUpload = (uploadFile: any) => {
  console.log("this is index beforeUpload", uploadFile);
  uploadLoading = ElLoading.service({
    lock: true,
    text: "文件上传中",
    background: "rgba(0, 0, 0, 0.7)",
  });
};

const handleOnError = () => {
  console.log("this is index handleOnError");
  uploadLoading.close();
  ElMessage({
    message: "文件上传失败",
    type: "warning",
  });
};
const handlePreview = (uploadFile: any) => {
  console.log("this is index handlePreview", uploadFile);
};

const selectFileIdChange = (fileId: any) => {
  console.log("selectFileIdChange", fileId);
  commentStore.selectedFile = fileId;
  fileListSimple = findObjectById(fileId,commentStore.fileList)
};

// 清空已有内容
const clearAll = ()=> {
  rightTyple.value = CONTENTTYPE.NODATA;
  commentStore.dialogueList = [];
  commentStore.currentDialogue = {
    question: "",
    answer: "",
  };
};

const analysisFile = () => {
  if(!commentStore.selectedFile){
    ElMessage({
      message: "请选择文件~",
      type: "warning",
    });
    return false;
  }
  analysisAwFile("aw/llm-aw/analysis",{"projectId":commentStore.selectedFile,"type":analysisType.value}).then((res:any)=>{
    if(res.code == 200){
      fileAnalysisDialog.value = true
      downLoadUrl.value = ""
      fileTypeButton.value = "分析中"
      intervalNow(commentStore.selectedFile)
    }else{
      ElMessage({
        message: res.message,
        type: "warning",
      });
    }
  })
};

const inputFocus = () => {
  inputStatus.value = true;
};
// const inputBlur = () => {
//   inputStatus.value = false;
// };

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
  return /^[\s]*\{[\s\S]*\}[\s]*$/.test(commentStore.currentDialogue.answer);
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
    background : "#ffffff"
    // background: isInputDisabled.value ? "#e4e7ed" : "#ffffff",
  };
});

const calcSendBtnStyle = computed(() => {
  return {
    color: isInputDisabled.value ? "#a8abb2" : "#017efa",
    background: isInputDisabled.value ? "rgba(255, 255, 255, 0.5)" : "rgba(1, 126, 250, 0.1)",
  };
});

async function send() {
  if (!inputStr.value || (!commentStore.selectedFile && analysisType.value==0)) {
    ElMessage({
      message: "请检查文件和输入是否完成~",
      type: "warning",
    });
    return false;
  }

  if (commentStore.currentDialogue.question) {
    commentStore.dialogueList.push(commentStore.currentDialogue);
  }
  commentStore.currentDialogue = {
    question: inputStr.value,
    answer: "",
  };
  isInputDisabled.value = true;

  if(analysisType.value==1){
    commentStore.currentDialogue = {
      question: inputStr.value,
      answer: "请看右侧图表~",
    };
    commentStore.dialogueList.push(commentStore.currentDialogue);
    commentStore.currentDialogue = {
      question: "",
      answer: "",
    };
    messageStr.value = inputStr.value
    rightTyple.value = FILETYPE.SINGLE_COMMENT
    nextTick(()=>{
      isInputDisabled.value = false;
      inputStr.value = "";
    })
    return  false;
  }

  commentStore.getLLmAnswer(
      {
        id: commentStore.selectedFile,
        message: inputStr.value,
      }
  )
    .then((res: any) => {
      isInputDisabled.value = false;
      console.log("adfdfsdsaaaa",commentStore.dialogueList)
    });
  inputStr.value = "";
}

let intervalNow = (id:string)=>{
  intervalTimer = setInterval(()=>{
    downAwFilePost("aw/llm-aw/speed/",{"projectId":commentStore.selectedFile,"type":analysisType.value}).then((res:any)=>{
      console.log("this is file process",res)
      if(res.data?.downLoadUrl!=""){
        fileAnalysisDialog.value = false
        downLoadUrl.value = res.data.downLoadUrl
        fileTypeButton.value = "下载"
        clearInterval(intervalTimer)
      }else{
        percentage.value = res.data.speed
      }
    })
  },1000)
}

const downFile = ()=>{
  if(downLoadUrl.value != ""){
    window.open(downLoadUrl.value);
  }
}

onUnmounted(() => {
  clearInterval(intervalTimer)
});
</script>

<style lang="scss" scoped>
.production_interview_analysis {
  width: 100%;
  height: calc(100% - 68px);
  display: flex;
  padding: 16px 0 60px 24px;
  box-sizing: border-box;
  .left {
    height: 100%;
    margin-right: 16px;

    .dialogue_container {
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
        align-items: center;
      }
      .dialogue_item_right {
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
      padding: 8px 12px;
      border-radius: 8px;
      align-items: center;
      box-sizing: border-box;
      .input_textarea {
        margin-right: 12px;
      }
      .select_type{
        margin-right: 12px;
      }
      .send_btn {
        width: 40px;
        height: 40px;
        font-size: 20px;
        border-radius: 8px;
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
      img {
        width: 300px;
      }
      .excelTitle{
        font-family: Source Han Sans;
        font-size: 16px;
        color: #3d3d3d;
        margin-bottom:24px;
      }
    }
  }
}
.upload_dialog_header {
  font-family: Source Han Sans;
  font-size: 16px;
  color: #3d3d3d;
  .icon {
    cursor: pointer;
  }
}

.upload_dialog_content {
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
  .dialog_content_img {
    width: 40px;
    margin-right: 12px;
  }
  .content_title {
    font-size: 14px;
    color: #333;
  }
  .right_wrapper {
    width: 100%;
  }
}

.analysis_dialog {
  .el-dialog__body {
    padding-top: 0;
  }
}
.upload_dialog {
  .el-dialog__body {
    padding-top: 20px;
  }
}

.chartInfo {
  width: 600px;
  height: 300px;
}

.drawerList{
  width:100%;
  height: 80px;
  background-color: #6e7079;
  .draweItem{
    width: 80%;
    height: 40px;
    background-color: rgba(157,190,255,0.6);
    border-radius: 10px;
    padding-left: 12px;
  }
}


</style>