<template>
  <div class="file-detail-dialog">
    <el-dialog align-center :model-value="props.isShow" :title="props.title" :lock-scroll="false" width="1240"
      @close="closeDialog">
      <div class="file-detail">
        <template v-if="fileDetail.type === 'image'">
          <img v-if="typeof fileDetail.url == 'string'" class="file-detail-display" :src="fileDetail.url" />
        </template>
        <template v-else-if="fileDetail.type === 'pdf'">
          <iframe class="file-detail-display" :src="fileDetail.url" frameborder="0"></iframe>
        </template>
        <template v-else-if="fileDetail.type === 'word'">
          <vue-office-docx :src="fileDetail.url" class="file-detail-display" />
        </template>
        <template v-else-if="fileDetail.type === 'txt'">
          <div class="file-detail-display txt">
            <div class="file-detail-display-content">{{ fileDetail.content }}</div>
          </div>
        </template>
        <template v-else-if="fileDetail.type === 'excel'">
          <vue-office-excel :src="fileDetail.url" class="file-detail-display" />
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch } from "vue";
//引入VueOfficeDocx组件
import VueOfficeDocx from '@vue-office/docx'
import VueOfficeExcel from '@vue-office/excel'
//引入相关样式
import '@vue-office/docx/lib/index.css'
import axios from 'axios'

export type FileDetail = {
  type: string,
  url: string,
  content: unknown
}

const props = defineProps({
  // 是否显示
  isShow: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: ""
  },
  fileDetail: {
    type: Object,
    default: () => {
      return {} as FileDetail
    }
  }
})

watch(() => props.fileDetail, (n) => {
  if (n.type == "txt") {
    axios.get(props.fileDetail.url, {
      responseType: 'text'
    }).then(res => {
      n.content = res.data
    })
  }
}, { immediate: true, deep: true })

const emits = defineEmits(['closeDialog'])

const closeDialog = () => {
  emits('closeDialog')
}
</script>
<style lang="scss" scoped>
.file-detail-dialog {
  :deep(.el-dialog) {
    .el-dialog__header {
      background: linear-gradient(180deg, #FFFFFF 0%, #F5F7FA 97%);
      padding: var(--el-dialog-padding-primary);
      margin-right: 0;

      .el-dialog__title {
        font-weight: bold;
      }

      .el-dialog__close {
        font-size: 22px;
      }

      .el-dialog__headerbtn {
        &:hover {
          .el-dialog__close {
            color: #017EFA;
            font-weight: bold;
          }
        }
      }
    }

    .el-dialog__body {
      padding: 0 32px 0;
      margin: 20px 0 30px;
      box-sizing: border-box;
      max-height: 80vh;
      overflow: auto;
    }

    .file-detail {
      .file-detail-display {
        width: 100%;
        height: 78vh;
        font-family: Source Han Sans;
        font-size: 16px;
        line-height: 24px;
        white-space: pre-wrap;

        &:not(.txt) {
          .docx-wrapper {
            background-color: #525659;
          }
        }

        &.txt {
          background-color: #525659;
          padding: 30px;
          padding-bottom: 0px;
          display: flex;
          flex-flow: column;
          align-items: center;
          box-sizing: border-box;
          position: relative;
          overflow: auto;


          .file-detail-display-content {
            width: 60%;
            background-color: #fff;
            padding: 30px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            margin-bottom: 30px;
            color: #000000;
          }
        }

      }
    }
  }
}
</style>