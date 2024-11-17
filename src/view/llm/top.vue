<template>
  <div class="top_comp flex-row flex--justify--between">
    <div class="select_wrapper">
      <img
        v-if="messageStore.imageChoseResult"
        src="../../assets/img/image.png"
        class="select_file_icon"
      />
      <el-select
        v-model="messageStore.imageChoseResult"
        class="select_file"
        placeholder="选择图片"
        :suffix-icon="CaretBottom"
        no-data-text="暂无数据"
        @change="imageChoseChange"
      >
        <el-option
          v-for="item in messageStore.imageList"
          :key="item.id"
          :label="item.name"
          :value="item.uid"
        >
          <div class="option_container">
            <img src="../../assets/img/image.png" class="select_file_icon" />
            <div class="select_file_label">{{ item.name }}</div>
          </div>
        </el-option>
      </el-select>
    </div>
    <div class="flex-row">
      <el-upload
        v-model:file-list="messageStore.imageList"
        class="file_upload flex-row"
        :auto-upload="false"
        :show-file-list="false"
        @change="handelChange"
        :icon="DocumentAdd"
      >
        <el-button type="primary" :icon="DocumentAdd" class="add_file"
          >添加</el-button
        >
      </el-upload>
      <el-button
        class="analysis"
        type="primary"
        plain
        :icon="Refresh"
        @click="reset"
        >重置</el-button
      >
    </div>
  </div>
</template>

<script setup>
import {
  CirclePlus,
  TrendCharts,
  CaretBottom,
  Mute,
  Refresh,
  DocumentAdd,
} from "@element-plus/icons-vue";

import { ref, onMounted, computed, watch } from "vue";
import { useMessageStore } from "../../store/modules/message";
import { inject } from "vue";
const messageStore = useMessageStore();

const imageChoseChange = (data) => {
  console.log("imageChoseChange in");
  let result = messageStore.imageList.find((item) => item.uid === data);
  console.log(data);
  if (result) {
    handelChange(result);
  }
};

const handelChange = (file) => {
  //判断数组是否包含某个值
  let result = messageStore.imageList.some((item) => item.name === file.name);
  if (!result) {
    messageStore.imageList.push(file);
  }
  console.log(
    "handelChange messageStore.imageList",
    JSON.stringify(messageStore.imageList) + "  " + file.uid
  );
  messageStore.imageChoseResult = file.uid;

  messageStore.imgurl = URL.createObjectURL(file.raw);
  //   console.log("messageStore.imgurl: " + messageStore.imgurl);
  const reader = new FileReader();
  reader.onload = function (event) {
    // console.log("content: ", event.target.result.split(","));
    const [_, content] = event.target.result.split(",");
    messageStore.imgBase64 = content;
    console.log("this is imgbase64", messageStore.imgBase64); // This is the base64 representation of the image
  };
  reader.readAsDataURL(file.raw);
};

// 清空已有内容
// function reset() {
//   messageStore.imgurl = "";
//   messageStore.imageList.length = 0;
//   messageStore.imageChoseResult = "";
//   messageStore.imgBase64 = "";
// }

const reset = inject("reset");
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
</style>
