<template>
  <div class="source-detail-dialog">
    <el-dialog align-center :model-value="props.isShow" :title="props.title" :lock-scroll="false" width="1240"
      @close="closeDialog">
      <div class="source-detail" v-for="(item, index) in props.sourceData" :key="index">
        <template v-if="item.type === 'image'">
          <div class="source-detail-node node-image" v-for="(i, idx) in item.content" :key="idx">
            <img v-if="typeof i.content == 'string'" class="source-detail-node-image" :src="i.content" />
          </div>
        </template>
        <!-- 只显示图片的数据，其他的暂时忽略 -->
        <template v-if="!hasImage && item.type === 'table'">
          <div class="source-detail-node node-table" v-for="(i, idx) in item.content" :key="idx">
            <div class="table-name">{{ i.name }}</div>
            <div class="table-content">{{ i.content }}</div>
          </div>
        </template>
        <template v-if="!hasImage && item.type === 'source_doc'">
          <div class="source-detail-node node-source_doc" v-for="(i, idx) in item.content" :key="idx">
            <div class="source_doc-name">{{ i.name }}</div>
            <div class="source_doc-content-item-wrap" v-for="(_i, _idx) in i.content" :key="_idx">
              <div class="source_doc-content-item" v-if="typeof _i === 'object' && 'text' in _i"
                :class="{ 'hight-light': _i.is_hight_light, 'main-node': _i.is_main_node }"
                v-html="formatText(_i.text)">
              </div>
            </div>
          </div>
        </template>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, PropType, ref, watch } from "vue";

interface SourceNodeImage {
  type: string,
  content: string,
  name?: string
}

interface SourceNodeTable {
  name: string,
  content: string
}

interface SourceNodeSourceDoc {
  name: string,
  content: Array<SourceNodeSourceDocContent>
}
interface SourceNodeSourceDocContent {
  text: string,
  is_hight_light: boolean,
  is_main_node: boolean
}

export interface SourceNode {
  type: string,
  content: Array<SourceNodeImage | SourceNodeTable | SourceNodeSourceDoc>
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
  sourceData: {
    type: Array as PropType<Array<SourceNode>>,
    default: () => {
      return [] as Array<SourceNode>
    }
  }
})
const hasImage = ref(false)

watch(() => props.sourceData, (n) => {
  const hasImageNode = n.findIndex(i => i.type === 'image')
  hasImage.value = hasImageNode > -1
}, { immediate: true, deep: true })

// 格式化文本的换行符
const formatText = (text: string) => {
  return text.replaceAll(/\n\n/g, '<br/>')
}

const emits = defineEmits(['closeDialog'])

const closeDialog = () => {
  emits('closeDialog')
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
      margin: 20px 0 30px;
      box-sizing: border-box;
      max-height: 80vh;
      overflow: auto;
    }

    .source-detail {

      .source-detail-node {
        font-family: Source Han Sans;
        font-size: 16px;
        line-height: 24px;
        width: 100%;

        .source-detail-node-image {
          width: 100%;
        }

        .source_doc-name {
          font-weight: bold;
          line-height: 28px;
          margin-bottom: 12px;
        }

        .source_doc-content-item {
          &.hight-light {
            color: #017EFA;
          }

          &.main-node {
            font-weight: bold;
          }
        }
      }
    }
  }
}
</style>