<template>
  <div class="top_comp flex-row flex--align--center flex--justify--between">
    <div class="select_wrapper">
      <img :src="excelImg" v-if="selectedFile" class="select_file_icon" />
      <el-select v-model="selectedFile" class="select_file" placeholder="选择文件" :suffix-icon="CaretBottom" no-data-text="暂无数据" @change="selectChange">
        <el-option v-for="item in fileAllList" :key="item.id" :label="item.fileName" :value="item.id">
          <div class="option_container">
            <img src="../assets/img/excel.png" class="select_file_icon" v-if="item.type === FILETYPE.MULT_RECORD_FILE || item.type === FILETYPE.SINGLE_RECORD_FILE"/>
            <img src="../assets/img/audio.png" class="select_file_icon" v-if="item.type === FILETYPE.AUDIO"/>
            <div class="select_file_label">{{ item.fileName }}</div>
          </div>
        </el-option>
      </el-select>
    </div>
    <div class="flex-row">
      <el-upload  class="file_upload flex-row" :action="props.uploadUrl"
                 :show-file-list="false"
                 :on-preview="handlePreview"
                 :on-error="handleOnError"
                 :on-success="handleSuccess"
                 :before-upload="beforeUpload">
        <el-button type="primary" :icon="CirclePlus" class="add_file">添加</el-button>
      </el-upload>
      <el-button class="analysis" type="primary"
                 plain
                 :icon="TrendCharts"
                 @click="analysisFile">分析
      </el-button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { CirclePlus, TrendCharts, CaretBottom, Mute,} from "@element-plus/icons-vue";
import { UploadProps } from "element-plus";
import {ref, watch, defineProps, computed} from "vue";
import { CONTENTTYPE,FILETYPE} from "../util/defineData";
import audioImg from "../assets/img/audio.png";
import excelImg from "../assets/img/excel.png";

const emit = defineEmits(['handleSuccess',"beforeUpload","handleOnError","analysisFile","selectFileIdChange"])

let fileAllList = ref();
let selectedFile = ref()
let props = defineProps({
  filelist: {
    type: Array,
    default: [],
  },
  selectFileId:{
    type:Array,
    default:""
  },
  uploadUrl:{
    type:String,
    default:""
  }
});
watch(()=>[props.filelist],()=>{
  fileAllList.value = props.filelist
})
watch(()=>[props.selectFileId],()=>{
  selectedFile.value = props.selectFileId
})

const selectChange = (e:any)=>{
  console.log("top selectChange", e);
  emit("selectFileIdChange",e)
}

const handleSuccess: UploadProps["onSuccess"] = async (response, uploadFile, uploadFiles) => {
  emit("handleSuccess",uploadFile,uploadFiles)
  console.log("top success", uploadFile, uploadFiles);
};
const beforeUpload: UploadProps["beforeUpload"] = async (uploadFile) => {
  console.log("top beforeUpload")
  emit("beforeUpload",uploadFile)
};
const handleOnError: UploadProps["onError"] = async () => {
  emit("handleOnError")
  console.log("top onError");
};
const handlePreview: UploadProps["onPreview"] = (uploadFile) => {
  emit("handleOnError")
  console.log("top onPreview");
};

// 分析文件
function analysisFile() {
  console.log("top analysisFile")
  emit("analysisFile")
}

</script>

<style scoped>
.top_comp {
  height: 52px;
  padding: 8px;
  border-radius: 8px;
  box-sizing: border-box;
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
  }

  .analysis {
    width: 80px;
    height: 36px;
    border-radius: 8px;
    margin-left: 8px;
  }
  .add_file {
    width: 80px;
    height: 36px;
    border-radius: 8px;
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
