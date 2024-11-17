<template>
  <div class="top_comp">
    <div class="select_wrapper">
      <img :src="calcSrc" v-if="calcSrc" class="select_file_icon" />
      <el-select
        v-model="messageStore.selectedFile"
        class="select_file"
        placeholder="选择文件"
        :suffix-icon="CaretBottom"
        no-data-text="暂无数据"
      >
        <el-option
          v-for="item in messageStore.historyFileList"
          :key="item.id"
          :label="item.fileName"
          :value="item.id"
        >
          <div class="option_container">
            <img
              src="../../assets/img/excel.png"
              class="select_file_icon"
              v-if="
                item.type === FILETYPE.MULT_RECORD_FILE ||
                item.type === FILETYPE.SINGLE_RECORD_FILE
              "
            />
            <img
              src="../../assets/img/audio.png"
              class="select_file_icon"
              v-if="item.type === FILETYPE.AUDIO"
            />
            <div class="select_file_label">{{ item.fileName }}</div>
          </div>
        </el-option>
      </el-select>
    </div>

    <div class="file_view flex-row">
      <el-button
        type="primary"
        plain
        :icon="Mute"
        class="mute"
        @click="audioMute"
        v-if="messageStore.showMuteBtn"
        >跳过</el-button
      >
      <audio ref="audioPlayer" style="display: none"></audio>
    </div>
    <el-upload
      v-model:file-list="fileList"
      class="file_upload flex-row"
      action="api/follow-up/upload"
      :show-file-list="false"
      :on-preview="handlePreview"
      :on-error="handleOnError"
      :on-success="handleSuccess"
      :before-upload="beforeUpload"
    >
      <el-button type="primary" :icon="CirclePlus" class="add_file">添加</el-button>
    </el-upload>
    <el-button
      class="analysis"
      type="primary"
      plain
      :icon="TrendCharts"
      :disabled="messageStore.isAnalysisDisabled"
      @click="analysisFile"
      >分析</el-button
    >
  </div>
</template>

<script setup lang="ts">
import {
  CirclePlus,
  TrendCharts,
  CaretBottom,
  Mute,
} from "@element-plus/icons-vue";
import {
  UploadUserFile,
  UploadProps,
  ElLoading,
  ElMessage,
} from "element-plus";
import { ref, onMounted, computed, watch } from "vue";
import { useMessageStore } from "../../store/modules/message";
import audioImg from "../../assets/img/audio.png";
import excelImg from "../../assets/img/excel.png";
import { CONTENTTYPE, FILETYPE } from "../../util/defineData";
const messageStore = useMessageStore();

let uploadLoading: any;
let fileList = ref<UploadUserFile[]>([]);
let audioPlayer = ref();
onMounted(() => {
  messageStore.getFileList();
});
const calcSrc = computed(() => {
  console.log(messageStore.selectedFileType);
  if (messageStore.selectedFileType === FILETYPE.NO_FILE) {
    return "";
  } else if (messageStore.selectedFileType === FILETYPE.AUDIO) {
    return audioImg;
  } else if (
    messageStore.selectedFileType === FILETYPE.SINGLE_RECORD_FILE ||
    messageStore.selectedFileType === FILETYPE.MULT_RECORD_FILE
  ) {
    return excelImg;
  }
});

const handleSuccess: UploadProps["onSuccess"] = async (file, uploadFiles) => {
  console.log("success", file, uploadFiles);
  uploadLoading.close();
  await messageStore.getFileList();
  // 选中当前上传的文件
  const fileId =
    messageStore.historyFileList.find(
      (item) => item.fileName === uploadFiles.name
    )?.id || "";
  messageStore.selectedFile = fileId;
  ElMessage({
    message: "文件上传成功",
    type: "success",
  });
};
const beforeUpload: UploadProps["beforeUpload"] = async () => {
  console.log("beforeUpload");
  uploadLoading = ElLoading.service({
    lock: true,
    text: "文件上传中",
    background: "rgba(0, 0, 0, 0.7)",
  });
};
const handleOnError: UploadProps["onError"] = async () => {
  console.log("onError");
  uploadLoading.close();
  ElMessage({
    message: "文件上传失败",
    type: "warning",
  });
};

const handlePreview: UploadProps["onPreview"] = (uploadFile) => {
  console.log(uploadFile);
};
// 清空已有内容
function clearAll() {
  messageStore.showMuteBtn = false;
  messageStore.rightContentType = CONTENTTYPE.NODATA;
  messageStore.dialogueList = [];
  messageStore.currentDialogue = {
    question: "",
    answer: "",
  };
}

// 分析文件
function analysisFile() {
  clearAll();
  if (messageStore.selectedFileType === FILETYPE.AUDIO) {
    // 音频
    // 播放音频
    messageStore.showMuteBtn = true;
    const url =
      messageStore.historyFileList.find(
        (item) => item.id === messageStore.selectedFile
      )?.ossUrl || "";
    audioPlayer.value.src = url;
    audioPlayer.value.play();
    messageStore.isAnalysisDisabled = true;
    setTimeout(()=>{
      // 分析音频
      messageStore.analysisAudio();
    },6000)
  } else if (messageStore.selectedFileType === FILETYPE.MULT_RECORD_FILE) {
    // 多条 Excel
    messageStore.analysisMultExcel();
  } else if (messageStore.selectedFileType === FILETYPE.SINGLE_RECORD_FILE) {
    // 单条 Excel
    messageStore.analysisSingleExcel();
  }
}

function audioMute() {
  // 媒体播放结束
  messageStore.showMuteBtn = false;
  messageStore.changeSpeedForShow(25);
  audioPlayer.value.pause();
  // loading
  messageStore.showDialogue = false;
  messageStore.skipLoading = ElLoading.service({
    lock: true,
    text: "音频解析中",
    background: "rgba(0, 0, 0, 0.7)",
  });
}

</script>

<style scoped>
.top_comp {
  height: 52px;
  padding: 8px;
  border-radius: 8px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.6);
  .select_wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
  }
  :deep(.el-input__wrapper) {
    box-shadow: none;
    background: rgba(255, 255, 255, 0.8);
  }
  :deep(.el-input__inner) {
    color: #017efa;
  }
  :deep(.el-select__caret) {
    color: #017efa;
  }
  :deep(.el-select-dropdown__item .selected) {
    background: rgba(1, 126, 250, 0.1) !important;
    border-radius: 4px;
  }
  .file_upload {
    width: 80px;
    height: 36px;
    background: #017efa;
    border-radius: 8px;
    margin: 0 8px;
  }

  .analysis {
    width: 80px;
    height: 36px;
    border-radius: 8px;
  }
  .add_file {
    width: 80px;
    height: 36px;
    border-radius: 8px;
  }
  .file_view {
    flex: 1;
    .mute {
      cursor: pointer;
      margin-left: 12px;
    }
  }
}
.option_container {
  display: flex;
  align-items: center;
}
.select_file_label {
  display: inline-block;
  font-size: 14px;
  margin-left: 4px;
}
.select_file_icon {
  width: 20px;
  height: 20px;
  margin-left: 4px;
}
.el-select-dropdown__item.selected {
  background: rgba(1, 126, 250, 0.1);
  border-radius: 4px;
}
.el-select-dropdown__item {
  margin: 0 8px;
  padding: 0;
}
</style>
