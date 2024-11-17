<template>
  <div class="spark_app_desc">
    <el-row class="container">
      <el-col :span="4"><div class="title">助手名称 :</div></el-col>
      <el-col :span="20"
        ><div class="content">{{ formData.name || "--" }}</div></el-col
      >
    </el-row>
    <el-row class="container">
      <el-col :span="4"><div class="title">助手类型 :</div></el-col>
      <el-col :span="20"
        ><div class="content">{{ formData.type || "--" }}</div></el-col
      >
    </el-row>
    <el-row class="container">
      <el-col :span="4"><div class="title">选择模型 :</div></el-col>
      <el-col :span="20"
        ><div class="content">{{ formData.model || "--" }}</div></el-col
      >
    </el-row>
    <el-row class="container">
      <el-col :span="4"><div class="title">助手回答 :</div></el-col>
      <el-col :span="20"
        ><div class="content">{{ formData.answerType || "--" }}</div></el-col
      >
    </el-row>
    <el-row class="container">
      <el-col :span="4"><div class="title">功能描述 :</div></el-col>
      <el-col :span="20"
        ><div class="content">{{ formData.description || "--" }}</div></el-col
      >
    </el-row>
    <el-row class="container">
      <el-col :span="4"><div class="title">助手指令 :</div></el-col>
      <el-col :span="20"
        ><div class="content">{{ formData.prompt || "--" }}</div></el-col
      >
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineProps } from "vue";
import { sparkAppData } from "../util/defineData";
const formData = ref<any>({});
const props = defineProps({
  appId: {
    type: String,
    default: "",
  },
});
onMounted(() => {
  // 匹配对应的app
  formData.value = sparkAppData[props.appId];
});
</script>

<style scoped>
.spark_app_desc {
  width: 680px;
  height: 100%;
  box-sizing: border-box;
  opacity: 1;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  padding: 20px 20px;
  .container {
    padding: 15px 20px;
    .title {
      color: #94a0af;
      padding: 6px 12px;
      font-size: 16px;
    }
    .content {
      letter-spacing: 1px;
      border: 1px solid #e2e7ee;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 16px;
      color: #333;
      max-height: 350px;
      overflow-y: auto;
    }
  }
}
</style>
