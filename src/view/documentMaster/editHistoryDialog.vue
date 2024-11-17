<template>
  <div class="source-detail-dialog">
    <el-dialog align-center :model-value="props.isShow" title="修改名称" :lock-scroll="false" width="700"
      @close="closeDialog">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0">
        <el-form-item label="" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item class="btns-wrap">
          <el-button type="default" size="large" @click="closeDialog">取消</el-button>
          <el-button type="primary" size="large" color="#017efa" @click="onSubmit">确定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from "vue";
import { editHistoryTitle } from "@/http/api"
import { ElMessage } from "element-plus";
const props = defineProps({
  // 是否显示
  isShow: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    default: ""
  }
})

const emits = defineEmits(['closeDialog'])

const formRef = ref()
const form = ref({
  title: props.title
})

watch(() => props.isShow, (n) => {
  if (n) {
    form.value.title = props.title
  }
}, { immediate: true })

const rules = ref({
  title: [
    { required: true, message: '请输入名称', trigger: 'blur' },
  ],
})

const closeDialog = () => {
  formRef.value.clearValidate()
  emits('closeDialog')
}

// 确定修改
const onSubmit = () => {
  formRef.value.validate((valid: any) => {
    if (valid) {
      editHistoryTitle(props.id, form.value.title).then(res => {
        if (res.message === "ok") {
          ElMessage({
            message: "修改成功",
            type: "success",
          });
          closeDialog()
        } else {
          ElMessage({
            message: "修改失败",
            type: "error",
          });
        }
      })
    }
  })
}
</script>
<style lang="scss" scoped>
.source-detail-dialog {

  :deep(.el-dialog) {
    .el-dialog__header {
      background: linear-gradient(180deg, #FFFFFF 0%, #F5F7FA 97%);
      padding: var(--el-dialog-padding-primary);

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
      margin: 20px 0 20px;
      box-sizing: border-box;
      max-height: 80vh;
      overflow: auto;

      .el-input {
        height: 46px;
        line-height: 46px;
        font-size: 16px;
      }

      .el-form-item {
        &.btns-wrap {
          .el-form-item__content {
            margin-top: 6px;
            display: flex;
            align-items: center;
            justify-content: flex-end;

            .el-button {
              width: 80px;
            }
          }
        }
      }
    }

  }
}
</style>