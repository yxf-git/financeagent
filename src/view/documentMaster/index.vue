<template>
  <div class="document-master">
    <TopCard icon="documentMaster.png" title="文档" :btnList="cardBtns" :activeTab="activeTab">
      <template #default>
        <el-button class="btn-new-chat" round size="large" @click="newChat">
          <img class="new-chat-icon" src="@/assets/img/btns/new-chat-icon.png" /><span
            class="new-chat-label">新建对话</span></el-button>
      </template>
    </TopCard>
    <div class="content-wrap" v-if="activeTab === 'current'">
      <div class="content-top">
        <div class="content-top-tip">
          <p>Hi，我是文档分析师~</p>
          <p>我可以进行文档知识问答、内容总结、多文件分析等，你可以随时把文件发给我，我来帮你分析~</p>
        </div>
      </div>
      <!-- 对话框 -->
      <div class="content-middle dialogue-wrap" ref="scrollNodeRef">
        <div class="dialogue-list" v-if="dialogueStore.dialogueList.length > 0">
          <div class="dialogue-item-wrap"
            :class="item.role == 'assistant' ? 'dialogue-item-wrap-left' : 'dialogue-item-wrap-right'"
            v-for="(item, index) in dialogueStore.dialogueList" :key="index">
            <!-- user 回复对话框 -->
            <template v-if="item.role == 'user'">
              <div class="dialogue-item dialogue-item-user" :class="{ 'has-file': item.docs && item.docs.length > 0 }">
                <!-- 对话框内容 -->
                <div class="dialogue-item-content" v-html="item.content"></div>
              </div>
            </template>
            <!-- user回复 下挂文档列表 -->
            <template v-if="item.role == 'user' && item.docs && item.docs.length > 0">
              <div class="dialogue-item-file-list file-list flex-row flex-wrap has-file">
                <div class="file-item-wrap" v-for="(i, j) in item.docs">
                  <div class="file-item" @click="viewFile(i, j)">
                    <div class="file-item-icon">
                      <img v-if="getFileTypeByFile(i) == 'pdf'" class="file-item-icon-img"
                        src="@/assets/img/icons/file-pdf.png">
                      <img v-else-if="getFileTypeByFile(i) == 'word'" class="file-item-icon-img"
                        src="@/assets/img/icons/file-word.png">
                      <img v-else-if="getFileTypeByFile(i) == 'txt'" class="file-item-icon-img"
                        src="@/assets/img/icons/file-txt.png">
                      <img v-else class="file-item-icon-img" src="@/assets/img/icons/file-pdf.png">
                    </div>
                    <div class="file-item-content">
                      <el-tooltip effect="dark" :content="getFileName(i)" placement="top" :offset="20"
                        :disabled="isOverflowed(j)">
                        <div class="file-item-name" :id="`file-item-name-${index}`">{{ getFileName(i) }}</div>
                      </el-tooltip>
                      <div class="file-item-size">
                        {{ getDocSizeLabel(i) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <!-- assistant 回复对话框 -->
            <template v-if="item.role == 'assistant'">
              <div class="dialogue-item dialogue-item-assistant">
                <!-- 对话框内容 -->
                <div class="dialogue-item-content" v-html="md.render(item.content)"></div>
                <!-- 额外内容：loading、参考来源、复制/再试一次 按钮、停止回复按钮 -->
                <docLoading class="dialogue-item-loading"
                  v-if="dialogueStore.showReplyLoading && (index + 1) == dialogueStore.dialogueList.length" />
                <div class="dialogue-item-sources"
                  :class="{ 'is-show': isShowDialogItemBtns(index, item?.metaData?.node_ids || []).isShowSources }">
                  <div class="dialogue-item-sources-label">以上内容主要来自：</div>
                  <div class="dialogue-item-sources-list"
                    v-if="item?.metaData?.node_ids && item?.metaData?.node_ids.length > 0">
                    <div class="dialogue-item-sources-item" v-for="(i, idx) in item.metaData.node_ids.slice(0, 3)"
                      :key="idx" @click="viewSource(i, idx)">
                      {{ i.page || idx + 1 }}
                    </div>
                  </div>
                </div>
                <div class="dialogue-item-btns"
                  :class="{ 'is-show': isShowDialogItemBtns(index, item?.metaData?.node_ids || []).isShowBtnWrap }">
                  <el-button v-show="isShowDialogItemBtns(index, item?.metaData?.node_ids || []).isShowBtnCopy"
                    class="dialogue-item-btn dialogue-item-btn-copy" :icon="DocumentCopy"
                    @click="copyReply(item.content)">复制</el-button>
                  <el-button v-show="isShowDialogItemBtns(index, item?.metaData?.node_ids || []).isShowBtnTryagain"
                    class="dialogue-item-btn dialogue-item-btn-tryagain" :icon="RefreshRight"
                    @click="tryagainReply(item.content)">再试一次</el-button>
                </div>
              </div>
            </template>
          </div>
          <el-button v-show="dialogueStore.showReplyStop" type="primary" plain class="dialogue-stop-reply-btn"
            :icon="Remove" @click="stopReply">停止输出</el-button>
        </div>
      </div>
      <!-- 输入、上传 -->
      <div class="content-bottom">
        <div class="input-wrap">
          <div class="file-list flex-row flex-wrap" :class="showInputFileList ? 'has-file' : ''">
            <div class="file-item-wrap" v-for="(item, index) in fileList" @click="viewFile(item, index)">
              <div class="file-item">
                <div class="file-item-icon" v-loading="uploadLoading && getIsFileLoading(item)"
                  element-loading-background="rgba(255,255,255,0.6)">
                  <img v-if="getFileTypeByFile(item) == 'pdf'" class="file-item-icon-img"
                    src="@/assets/img/icons/file-pdf.png">
                  <img v-else-if="getFileTypeByFile(item) == 'word'" class="file-item-icon-img"
                    src="@/assets/img/icons/file-word.png">
                  <img v-else-if="getFileTypeByFile(item) == 'txt'" class="file-item-icon-img"
                    src="@/assets/img/icons/file-txt.png">
                  <img v-else class="file-item-icon-img" src="@/assets/img/icons/file-pdf.png">
                </div>
                <div class="file-item-content">
                  <el-tooltip effect="dark" :content="getFileName(item)" placement="top" :offset="20"
                    :disabled="isOverflowed(index)">
                    <div class="file-item-name" :id="`file-item-name-${index}`">{{ getFileName(item) }}</div>
                  </el-tooltip>
                  <div class="file-item-status">
                    {{ getStatusLabel(item) }}
                  </div>
                </div>
              </div>
              <el-icon v-if="isCanRemoveFile" class="file-item-delete" color="#B6BABF" size="16px"
                @click.stop="removeFile(item, index)">
                <CircleCloseFilled />
              </el-icon>
            </div>
          </div>
          <div class="input-field" :class="showInputFileList ? 'has-file' : ''">
            <el-input ref="chatInputRef" v-model="chatInput" :autosize="{ minRows: 1, maxRows: 4 }"
              class="input-textarea" type="textarea" :disabled="chatInputDisabled" @keydown="chatInputKeyDown"
              placeholder="Enter 发送， Shift+Enter 换行" />
            <div class="input-btns">
              <!-- 总结文档 -->
              <el-text class="input-btns-item btn-summary" :class="btnSummaryDisabled ? 'disabled' : ''" type="primary"
                @click="onSummary">总结文档</el-text>
              <!-- 上传文件 -->
              <el-upload ref="fileUploadRef" class="input-btns-item btn-upload"
                :class="btnUploadDisabled ? 'disabled' : ''" :disabled="btnUploadDisabled" v-model:file-list="fileList"
                action="#" :auto-upload="false" name="files" :multiple="true" :limit="50" :show-file-list="false"
                accept=".pdf,.txt,.doc,.docx" :on-exceed="onFileExceed" :on-change="onFileChange">
                <UploadIcon class="input-btns-item-img" />
              </el-upload>
              <!-- 发送消息 -->
              <div class="input-btns-item btn-send" :class="btnSendDisabled ? 'disabled' : ''" @click="onSend" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="history-wrap" v-if="activeTab === 'history'">
      <div class="history-list-wrap" v-loading="historyLoading" element-loading-background="rgba(0,0,0,0)">
        <div class="history-list" v-if="historyList.length > 0">
          <div class="history-item" v-for="(item, index) in historyList" :key="index"
            @click.stop="viewDetailOnHistory(item)">
            <div class="history-item-info">
              <img class="history-item-icon" src="@/assets/img/icons/history-icon.png" />
              <div class="history-item-name">{{ item.title }}</div>
              <div class="history-item-date">{{ item.createTime }}</div>
              <div class="history-item-btns">
                <img src="@/assets/img/icons/btn-edit.png" @click.stop="editHistory(item)">
                <img src="@/assets/img/icons/btn-remove.png" @click.stop="removeHistory(item)">
              </div>
            </div>
            <div class="history-item-files" v-if="item.docs && item.docs.length > 0">
              <div class=" file-list flex-row flex-wrap has-file">
                <div class="file-item-wrap" v-for="(i, j) in item.docs">
                  <div class="file-item" @click.stop="viewFileOnHistory(i, j)">
                    <div class="file-item-icon">
                      <img v-if="i.doc_name && getFileTypeByName(i.doc_name) == 'pdf'" class="file-item-icon-img"
                        src="@/assets/img/icons/file-pdf.png">
                      <img v-else-if="i.doc_name && getFileTypeByName(i.doc_name) == 'word'" class="file-item-icon-img"
                        src="@/assets/img/icons/file-word.png">
                      <img v-else-if="i.doc_name && getFileTypeByName(i.doc_name) == 'txt'" class="file-item-icon-img"
                        src="@/assets/img/icons/file-txt.png">
                      <img v-else class="file-item-icon-img" src="@/assets/img/icons/file-pdf.png">
                    </div>
                    <div class="file-item-content">
                      <div class="file-item-name" :id="`file-item-name-${j}`">{{ i.doc_name }}</div>
                      <div class="file-item-size">
                        {{ getDocSizeLabel(i) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="history-list-empty" v-else>暂无数据</div>
      </div>
    </div>
    <!-- 参考来源弹窗 -->
    <sourceDetailDialog :isShow="isShowSourceDetail" :title="sourceDetailTitle" :sourceData="sourceDetailData"
      @closeDialog="closeSourceDetailDialog" />
    <!-- 文档预览弹窗 -->
    <fileDetailDialog :isShow="isShowFileDetail" :title="fileDetailTitle" :fileDetail="fileDetailData"
      @closeDialog="closeFileDetailDialog" />
    <!-- 修改历史对话标题弹窗 -->
    <editHistoryDialog :isShow="isShowEditHistoryDialog" :id="editHistoryId" :title="editHistoryTitle"
      @closeDialog="closeEditHistoryDialog" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, Ref, ref, watch, computed, onMounted, onUnmounted } from "vue";
import TopCard from "@/components/topCard.vue";
import type { ButtonType } from "@/components/topCard.vue";
import { CircleCloseFilled, DocumentCopy, RefreshRight, Remove } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, UploadFile, UploadFiles, UploadProgressEvent, UploadRawFile, ElLoading } from "element-plus";
import { Source, useDialogueStore } from "@/store/modules/dialogue";
const dialogueStore = useDialogueStore();

import useClipboard from 'vue-clipboard3'
const { toClipboard } = useClipboard()

import sourceDetailDialog from "./sourceDetailDialog.vue"
import type { SourceNode } from "./sourceDetailDialog.vue"
import fileDetailDialog from "./fileDetailDialog.vue"
import type { FileDetail } from "./fileDetailDialog.vue"
import editHistoryDialog from "./editHistoryDialog.vue"
import { deleteDoc, getDocListStatus, referencesFetch, UploadFileMultipart, uploadDocByUrl, getHistory, removeHistoryById, getDialogueDetailById } from "@/http/api";
import type { DocumentResult, Doc, History } from "@/http/api";
import { deepCopy, getFileTypeByFile, getFileTypeByName, getFileName, getFileUrl } from "@/util/common"
import UploadIcon from "@/assets/svg/upload.svg"
import { useRoute } from 'vue-router'
import router from "@/router";
const route = useRoute()

import hljs from 'highlight.js';
// 引入highlight样式
import 'highlight.js/styles/atom-one-dark.min.css'
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string) {
    // 添加代码块的样式，使用highlight.js库来高亮显示代码块。
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' + hljs.highlight(str, { language: lang, ignoreIllegals: true }).value + '</code></pre>';
      } catch (__) { }
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
})

const uploadLoading = ref(false)
const activeTab = ref("current")

watch(() => route.query, (n) => {
  if (n.doc_url && n.doc_name && n.doc_size) {
    uploadLoading.value = true
    dialogueStore.resetDialogue()
    const doc_url_array = n.doc_url.toString().split(",")
    const doc_name_array = n.doc_name.toString().split(",")
    const doc_size_array = n.doc_size.toString().split(",")
    const docs: Array<Doc> = doc_url_array.map((item, index) => {
      return {
        doc_url: item,
        doc_name: doc_name_array[index],
        doc_size: doc_size_array[index],
      } as Doc
    })
    nextTick(() => {
      fileListCurrent.value = docs.map((item: { doc_name: string, doc_url: string, doc_size: string }) => {
        return {
          uid: 0,
          ...item,
          name: item.doc_name,
          status: "uploading",
          response: {
            ...item
          }
        }
      }) as UploadFiles
      uploadDocByUrl(docs).then(res => {
        if (res.message == "ok") {
          dialogueStore.setDialogueId(res.data.index_id)
          dialogueStore.setFileList(res.data.documents.map((item: { doc_name: string, doc_url: string, doc_size: string }) => {
            return {
              ...item,
              name: item.doc_name,
              status: "success",
              response: {
                ...item
              }
            }
          }))
          fileList.value = deepCopy(dialogueStore.fileList) as UploadFiles
          loopQueryDocListStatus()
        }
      })
    })
  }
}, {
  immediate: true
})

defineOptions({
  name: "DocumentMaster"
})

// 顶部按钮
const cardBtns = ref([
  {
    label: "历史对话",
    key: "history",
    fun: () => {
      activeTab.value = "history"
      resetDialogue()
      getHistoryList()
    }
  },
  {
    label: "当前对话",
    key: "current",
    fun: () => {
      activeTab.value = "current"
    }
  }] as Array<ButtonType>)

watch(() => dialogueStore.dialogueId, (n) => {
  if (n) {
    getDialogueDetailById(n).then(res => {
      if (res.message == "ok" && res.data.contents) {
        dialogueStore.initDialogueByDetail(res.data)
        checkHasFile()
        nextTick(() => {
          scrollToBottom(scrollNodeRef, "smooth")
        })
      }
    })
  } else {
    dialogueStore.resetDialogue()
  }
}, { immediate: true })

const fileList = ref(deepCopy(dialogueStore.fileList) as UploadFiles)
// 一次上传的文件合集，在上传请求完成后，清空数组
const fileListCurrent = ref([] as UploadFiles)

// 输入框相关数据
const chatInput = ref("")
const chatInputRef = ref()
const chatInputDisabled = ref(false)
const chatInputEvent = ref()

// 文件是否允许删除
const isCanRemoveFile = ref(true)

// 输入框键盘事件
const chatInputKeyDown = ($event: Event) => {
  const event = $event as KeyboardEvent
  chatInputEvent.value = event.target as HTMLInputElement
  // 定义组合键 Map
  const shortCutKeys: (keyof KeyboardEvent)[] = ['shiftKey']
  const isEnterKey = event.key === 'Enter'
  const isShortcutKeys = shortCutKeys.some((item) => event[item])
  if (isEnterKey && isShortcutKeys) {
    // 获取光标位置
    const cursorPosition = chatInputEvent.value.selectionStart

    // 拆分成两段文本
    const textBeforeCursor = chatInput.value.slice(0, cursorPosition)
    const textAfterCursor = chatInput.value.slice(cursorPosition)

    // 合并为带有换行符的新文本
    const newText = textBeforeCursor + '\n' + textAfterCursor

    // 更新输入框的值
    chatInput.value = newText
    console.log(JSON.stringify(newText))
    // 文本编辑器的高度发生变化后
    nextTick(() => {
      // 高度变化 自动滚动到底部
      const editor = chatInputRef.value.textarea
      chatInputRef.value.textarea.scrollTop = editor.scrollHeight
      // 设置光标位置为: start 和 end 相同，光标会移动到换行符后面的新行首
      chatInputEvent.value.setSelectionRange(cursorPosition + 1, cursorPosition + 1)
    })
  } else if (event.key === 'Enter') {
    // 阻止掉 Enter 的默认换行行为
    event.preventDefault()
    if (!btnSendDisabled.value) {
      onSend()
    } else {
      ElMessage({
        message: "请先上传一个文档",
        type: "error",
      });
    }
  }
}

// 总结文档
const onSummary = () => {
  if (btnSummaryDisabled.value) {
    return
  }
  chatInput.value = "总结文档内容"
  onSend()
}

// 发送消息
const onSend = () => {
  if (btnSendDisabled.value) {
    return
  }
  if (chatInput.value.trim() == "") {
    chatInput.value = "总结文档内容"
  }
  if (dialogueStore.dialogueList.length == 0) {
    isCanRemoveFile.value = false
  }
  dialogueStore.addDialogue("user", chatInput.value, fileList.value)
  chatInputDisabled.value = true;
  btnSendDisabled.value = true
  btnUploadDisabled.value = true
  btnSummaryDisabled.value = true
  nextTick(() => {
    scrollToBottom(scrollNodeRef)
  })
  dialogueStore
    .getRemoteReply(chatInput.value, false, () => {
      // 优化动画卡顿问题
      requestAnimationFrame(() => {
        scrollToBottom(scrollNodeRef)
      })
    })
    .then((_sessionId: any) => {
      chatInputDisabled.value = false;
      btnSendDisabled.value = false;
      btnUploadDisabled.value = false;
      btnSummaryDisabled.value = false;
    }).catch(err => {
      chatInputDisabled.value = false;
      btnSendDisabled.value = false;
      btnUploadDisabled.value = false;
      btnSummaryDisabled.value = false;
    })
  chatInput.value = ""
  fileList.value = [] as UploadFiles
  dialogueStore.setFileList(fileList.value)
}

// 上传 / 发送消息  按钮的disabled状态
const btnSendDisabled = ref(true)  // 按钮：发送
const btnUploadDisabled = ref(false) // 按钮：上传
const btnSummaryDisabled = ref(true) // 按钮：总结文档

// 新建对话
const newChat = () => {
  console.log("新建对话")
  activeTab.value = "current"
  resetDialogue()
}

// 重置对话列表
const resetDialogue = () => {
  uploadLoading.value = false
  chatInputDisabled.value = true
  btnSendDisabled.value = true
  btnSummaryDisabled.value = true
  dialogueStore.resetDialogue()
  fileList.value = [] as UploadFiles
  fileListCurrent.value = [] as UploadFiles
  if (loopTimer.value) {
    clearTimeout(loopTimer.value)
    loopTimer.value = null
  }
}

// 文件上传ref
const fileUploadRef = ref()
const debounceTimer = ref<NodeJS.Timeout | null>(null)
const showInputFileList = computed(() => {
  // 文件列表不为空
  // && 用户已经输入一次对话（已取消这个条件）
  return fileList.value && fileList.value.length > 0
});

// 文件列表改变 -- 每有一个文件上传，就触发一次
// 文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
const onFileChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  clearDebounceTimer()
  dialogueStore.setFileList(uploadFiles)
  fileListCurrent.value.push(uploadFile)
  // // console.log("onFileChange ---> uploadFile", uploadFile)
  // // console.log("onFileChange ---> uploadFiles", uploadFiles)
  // 开启节流，同一次上传，仅在最后一次change，提交所有文件
  debounceTimer.value = setTimeout(() => {
    handleUploadFiles()
    clearDebounceTimer()
  }, 500)
}

const clearDebounceTimer = () => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
    debounceTimer.value = null
  }
}

// 文件超出限制
const onFileExceed = () => {
  ElMessage({
    message: "文档超出最大数量限制",
    type: "error",
  });
}

// 整合文件状态的文本说明
const getStatusLabel = (file: UploadFile) => {
  let status_label = ""
  const response = file.response as DocumentResult
  if (response) {
    status_label = getDocStatusLabel(response.status!)
  } else {
    status_label = getFileStatusLabel(file.status)
  }
  return status_label
}

// 判断文档是否loading状态
const getIsFileLoading = (file: UploadFile) => {
  let isFileLoading = false
  const response = file.response as DocumentResult
  if (response) {
    isFileLoading = [3, undefined].includes(response.status!)
  } else {
    isFileLoading = ["uploading"].includes(file.status)
  }
  return isFileLoading
}

// 文档大小的文本显示
const getDocSizeLabel = (file: any) => {
  let doc_size_label = ""
  const response = file.response as DocumentResult
  if (response) {
    doc_size_label = response.doc_size!
  } else {
    doc_size_label = ""
  }
  return doc_size_label
}

// 获取文件上传状态的文本说明
const getFileStatusLabel = (status: string | undefined) => {
  let status_label = ""
  switch (status) {
    case "ready":
      status_label = "准备上传";
      break;
    case "uploading":
      status_label = "上传中...";
      break;
    case "success":
      status_label = "上传成功";
      break;
    case "fail":
      status_label = "上传失败";
      break;
    default:
      status_label = "上传失败"
  }
  return status_label
}
// 获取文档处理状态的文本说明
const getDocStatusLabel = (status: number) => {
  let status_label = ""
  switch (status) {
    case 1:
      status_label = "处理完成";
      break;
    case 2:
      status_label = "保留状态,暂时可以忽略";
      break;
    case 3:
      status_label = "处理中...";
      break;
    case 4:
      status_label = "处理失败";
      break;
    default:
      status_label = "处理中...";
      break;
  }
  return status_label
}


onMounted(() => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    loginFailed()
    return
  }
})

// 检查列表中是否有文件，以开放上传、消息发送
const checkHasFile = () => {
  // 对话列表中有文件  或者  上传候选有文件
  if (dialogueStore.isDialogueListHasFile()) {
    btnSendDisabled.value = false
    chatInputDisabled.value = false
    btnSummaryDisabled.value = false
  }
}

// 登录信息失效，重新登录
const loginFailed = () => {
  ElMessage({
    message: "登录失效，请重新登录",
    type: "error",
  });
  dialogueStore.resetDialogueId()
  router.push("/login");
}

// 手动上传文件
const handleUploadFiles = () => {
  uploadLoading.value = true
  let params = new FormData()
  const userId = localStorage.getItem("userId");
  params.append("userId", userId!)
  fileListCurrent.value.forEach((item: UploadFile) => {
    const file: UploadRawFile | undefined = item.raw
    // 参数中只添加没有response的文件，有response的文件是已经上传过的文件，不需要再次上传
    if (file) {
      params.append("files", file)
      const fileItem = fileList.value.find(i => i.uid === file.uid) as UploadFile | undefined
      // 更新文件状态为上传中...
      if (fileItem) fileItem.status = "uploading"
    }
  })
  const index_id = dialogueStore.dialogueId
  if (index_id) {
    params.append("index_id", index_id)
  }
  UploadFileMultipart(params).then(res => {
    if (res.message === "ok") {
      // 对话id / 知识库id （每次上传文件会生成一个知识库id）
      dialogueStore.setDialogueId(res.data.index_id)
      // 处理fileList状态和返回数据
      fileListCurrent.value.forEach((item: UploadFile) => {
        const fileItem = fileList.value.find(i => i.uid === item.uid) as UploadFile | undefined
        if (fileItem) {
          fileItem.status = "success"
          let res_fileItem = res.data.documents.find((i: DocumentResult) => i.doc_name == item.name)
          if (res_fileItem) {
            fileItem.response = Object.assign({} as DocumentResult, res_fileItem as DocumentResult)
          } else {
            fileItem.response = {} as DocumentResult
            console.error("UploadFileMultipart: 本次上传的文件与接口返回不一致")
          }
        }
      })
      // 循环查询文档状态
      // 如果上传的文件均是txt，则两秒后开始查询，否则五秒后开始查询
      const isAllTxt = fileListCurrent.value.every(item => item.name.endsWith(".txt"))
      const timerSeconds = isAllTxt ? 2 : 5
      let timer = <NodeJS.Timeout | null>(null)
      timer = setTimeout(() => {
        loopQueryDocListStatus(timerSeconds)
        timer && clearTimeout(timer)
        timer = null
      }, timerSeconds * 1000)
    } else {
      fileListCurrent.value.forEach((item: UploadFile) => {
        const fileItem = fileList.value.find(i => i.uid === item.uid) as UploadFile | undefined
        if (fileItem) fileItem.status = "fail"
      })
      uploadLoading.value = false
      fileListCurrent.value = [] as UploadFiles
      ElMessage({
        message: "文档上传失败，请删除后重试",
        type: "error",
      });
    }
  }).catch(err => {
    console.error("文档上传失败，请删除后重试", err)
    uploadLoading.value = false
    ElMessage({
      message: "文档上传失败，请删除后重试",
      type: "error",
    });
    fileListCurrent.value.forEach((item: UploadFile) => {
      const fileItem = fileList.value.find(i => i.uid === item.uid) as UploadFile | undefined
      if (fileItem) fileItem.status = "fail"
    })
    fileListCurrent.value = [] as UploadFiles
  })
}

const page = ref(1)
const pageSize = ref(50)
const isFinish = ref(false)
const isAllFailed = ref(false)
const loopTimer = ref<NodeJS.Timeout | null>(null)
// 轮询文档解析状态
const loopQueryDocListStatus = (seconds?: number) => {
  if (dialogueStore.dialogueId) {
    getDocListStatus(dialogueStore.dialogueId, page.value, pageSize.value).then(res => {
      if (res.message === "ok") {
        page.value = 1
        pageSize.value = res.data.total
        const finishedArr = res.data.documents.filter((item: { status: number }) => item.status && (item.status === 1 || item.status === 4));
        isFinish.value = res.data.documents.every((item: { status: number }) => item.status && (item.status === 1 || item.status === 4))
        if (fileListCurrent.value.some(i => i.uid && i.uid != 0)) {
          // 本地上传
          fileListCurrent.value.forEach((item: UploadFile) => {
            const fileItem = fileList.value.find(i => i.uid === item.uid) as UploadFile | undefined
            if (fileItem) {
              let res_fileItem = res.data.documents.find((i: DocumentResult) => i.doc_name == item.name)
              if (res_fileItem) {
                let _response = Object.assign(deepCopy(fileItem.response) as DocumentResult, res_fileItem as DocumentResult)
                fileItem.response = _response as DocumentResult
              } else {
                fileItem.response = {} as DocumentResult
                console.error("loopQueryDocListStatus: 本次上传的文件与接口返回不一致")
              }
            }
          })
        } else {
          // 通过url上传
          fileListCurrent.value.forEach((item: UploadFile) => {
            const fileItem = fileList.value.find(i => i.name === item.name) as UploadFile | undefined
            if (fileItem) {
              let res_fileItem = res.data.documents.find((i: DocumentResult) => i.doc_name == item.name)
              if (res_fileItem) {
                let _response = Object.assign(deepCopy(fileItem.response) as DocumentResult, res_fileItem as DocumentResult)
                fileItem.response = _response as DocumentResult
              } else {
                fileItem.response = {} as DocumentResult
                console.error("loopQueryDocListStatus: 本次上传的文件与接口返回不一致")
              }
            }
          })
        }
        if (isFinish.value) {
          // 关闭文件上传loading
          uploadLoading.value = false
          // 文档全部处理完成：成功/失败
          loopTimer.value && clearTimeout(loopTimer.value)
          loopTimer.value = null
          isFinish.value = false
          // 判断是否全部失败，如果全部失败则弹窗提示
          isAllFailed.value = res.data.documents.every((item: { status: number }) => item.status && item.status === 4);
          if (isAllFailed.value) {
            btnUploadDisabled.value = false
            btnSummaryDisabled.value = true
            btnSendDisabled.value = true
            chatInputDisabled.value = true
            // 文档全部处理失败
            ElMessageBox.confirm(
              '文档解析失败，请重新上传',
              '错误',
              {
                showConfirmButton: false,
                cancelButtonText: '关 闭',
                type: 'error',
                center: false,
                customStyle: {
                  width: "320px"
                }
              }
            )
          } else {
            btnUploadDisabled.value = false
            btnSummaryDisabled.value = false
            btnSendDisabled.value = false
            chatInputDisabled.value = false
            ElMessage({
              message: `文档处理完成：${finishedArr.length}/${fileListCurrent.value.length}`,
              type: "success",
            });
          }
          fileListCurrent.value = [] as UploadFiles
        } else {
          loopTimer.value = setTimeout(() => {
            loopQueryDocListStatus(seconds || 5)
            loopTimer.value && clearTimeout(loopTimer.value)
            loopTimer.value = null
          }, seconds ? seconds * 1000 : 5000)
        }
      } else {
        console.error("轮询文档解析状态失败：message不等于ok")
      }
    }).catch(err => {
      console.error("轮询文档解析状态失败", err)
      ElMessageBox.confirm(
        '文档解析失败，请重新上传',
        '错误',
        {
          showConfirmButton: false,
          cancelButtonText: '关 闭',
          type: 'error',
          center: false,
          customStyle: {
            width: "320px"
          }
        }
      ).catch(() => {
        loopTimer.value && clearTimeout(loopTimer.value)
        loopTimer.value = null
        uploadLoading.value = false
        isFinish.value = false
      })
    })
  }
}

watch(() => uploadLoading.value, (n) => {
  if (n) {
    // 上传文件过程中，禁止输入、发送、上传、删除
    btnUploadDisabled.value = true
    btnSummaryDisabled.value = true
    btnSendDisabled.value = true
    chatInputDisabled.value = true
    isCanRemoveFile.value = false
  } else {
    btnUploadDisabled.value = false
    isCanRemoveFile.value = true
  }
}, { deep: true, immediate: true })

const removeFile = (item: any, index: number) => {
  if (!dialogueStore.dialogueId || !item.response || !item.response.doc_id) {
    // 所有文件均上传失败，导致没有生成知识库id，此时也没有doc_id，所以只需要在fileList中移除即可
    fileUploadRef.value.handleRemove(fileList.value[index])
    dialogueStore.setFileList(fileList.value)
    return
  }
  deleteDoc(dialogueStore.dialogueId, [item.response.doc_id]).then((res: { message: string }) => {
    if (res.message == "ok") {
      fileUploadRef.value.handleRemove(fileList.value[index])
      dialogueStore.setFileList(fileList.value)
      if (fileList.value.length == 0) {
        chatInputDisabled.value = true
        btnSendDisabled.value = true
        btnSummaryDisabled.value = true
      }
    } else {
      throw new Error("接口请求失败")
    }
  }).catch(err => {
    ElMessage({
      message: "文档删除失败",
      type: "error",
    });
  })

}

// 判断文件名是否溢出
const isOverflowed = (index: number) => {
  let el = document.getElementById(`file-item-name-${index}`)
  if (!el) return
  if (el.clientWidth < el.scrollWidth) {
    // 溢出
    return false
  } else {
    return true
  }
}

// 对话框相关
const scrollNodeRef = ref()

// 监听打字机状态，在完成时，需要0.18秒之后，再至于底部
watch(
  () => dialogueStore.replyStatus,
  (n) => {
    if (n == "done" || n == "ready") {
      const timer = setTimeout(() => {
        scrollToBottom(scrollNodeRef)
        clearTimeout(timer)
      }, 180)
    }
  },
  { immediate: true }
);

// 滚动到底部
const scrollToBottom = (nodeRef: Ref, behavior: string = "auto") => {
  // behavior 为 smooth的时候，滚动会有延迟
  if (nodeRef.value && nodeRef.value.scrollTop < nodeRef.value.scrollHeight) {
    // nodeRef.value.scrollIntoView({ behavior: 'smooth', block: 'end' });
    nodeRef.value.scrollTo({ top: nodeRef.value.scrollHeight, left: 0, behavior: behavior });
  }
}

// 复制回复
const copyReply = async (str: string) => {
  try {
    await toClipboard(str);
    ElMessage({
      message: "复制成功！",
      type: "success",
    });
  } catch (e) {
    ElMessage({
      message: "复制失败！",
      type: "error",
    });
  }
}

// 再试一次
const tryagainReply = (str: string) => {
  dialogueStore.popDialogue()
  chatInputDisabled.value = true;
  btnSendDisabled.value = true
  btnUploadDisabled.value = true
  btnSummaryDisabled.value = true
  const inputStr = dialogueStore.dialogueList[dialogueStore.dialogueList.length - 1].content
  dialogueStore
    .getRemoteReply(inputStr, true)
    .then((_sessionId: any) => {
      chatInputDisabled.value = false;
      btnSendDisabled.value = false
      btnUploadDisabled.value = false
      btnSummaryDisabled.value = false
    }).catch(err => {
      chatInputDisabled.value = false;
      btnSendDisabled.value = false
      btnUploadDisabled.value = false
      btnSummaryDisabled.value = false
    })
}

// 停止回复
const stopReply = () => {
  chatInputDisabled.value = false;
  btnSendDisabled.value = false
  btnUploadDisabled.value = false
  btnSummaryDisabled.value = false
  dialogueStore.stopReply()
}

const isShowSourceDetail = ref(false)
const sourceDetailTitle = ref("")
const sourceDetailData = ref([] as Array<SourceNode>)

// 关闭参考来源弹窗
const closeSourceDetailDialog = () => {
  isShowSourceDetail.value = false
  sourceDetailTitle.value = ""
  sourceDetailData.value = [] as Array<SourceNode>
}

type ReferencesResourceInfo = {
  content: string,
  type: string
}

// 查看来源信息
const viewSource = (item: any, index: number) => {
  // sourceDetailTitle.value = "参考来源：" + (index + 1)
  let node_ids = []
  node_ids.push(item.id)
  referencesFetch(dialogueStore.dialogueId, node_ids).then(res => {
    if (res.message == "ok") {
      if (res.data) {
        isShowSourceDetail.value = true
        sourceDetailData.value = res.data
        const images = res.data.filter((i: { type: string }) => i.type == "image")
        const imagesContent = [] as Array<string>
        images.forEach((i: { content: Array<ReferencesResourceInfo> }) => {
          i.content.forEach((_i: ReferencesResourceInfo) => {
            imagesContent.push(_i.content)
          })
        })
        const pages = imagesContent.map((i: string) => {
          if (i.split("page-") && i.split("page-").length > 1) {
            if (i.split("page-")[1].split(".") && i.split("page-")[1].split(".").length > 0) {
              return i.split("page-")[1].split(".")[0]
            } else {
              return ""
            }
          } else {
            return ""
          }
        })
        if (pages && pages.length > 0) {
          sourceDetailTitle.value = "页码：" + pages.join("、")
        } else {
          sourceDetailTitle.value = ""
        }
      } else {
        ElMessage({
          message: "找不到相关信息",
          type: "error",
        });
      }
    } else {
      ElMessage({
        message: "服务请求失败",
        type: "error",
      });
    }
  }).catch(err => {
  })
}

// 文件预览相关变量
const isShowFileDetail = ref(false)
const fileDetailTitle = ref("")
const fileDetailData = ref({} as FileDetail)

// 关闭参考来源弹窗
const closeFileDetailDialog = () => {
  isShowFileDetail.value = false
  fileDetailTitle.value = ""
  fileDetailData.value = {} as FileDetail
}

// 预览文件
const viewFile = (item: any, index: number) => {
  isShowFileDetail.value = true
  fileDetailTitle.value = getFileName(item)
  fileDetailData.value = {
    type: getFileTypeByName(fileDetailTitle.value),
    url: getFileUrl(item),
    content: null
  } as FileDetail
}

// 预览历史文件
const viewFileOnHistory = (item: any, index: number) => {
  isShowFileDetail.value = true
  fileDetailTitle.value = getFileName(item)
  fileDetailData.value = {
    type: getFileTypeByName(fileDetailTitle.value),
    url: getFileUrl(item),
    content: null
  } as FileDetail
}

// 通过历史记录进入对话
const viewDetailOnHistory = (item: any) => {
  dialogueStore.setDialogueId(item.index_id)
  activeTab.value = "current"
}

type IsShowDialogItemBtns = {
  isShowSources: boolean;
  isShowBtnWrap: boolean;
  isShowBtnCopy: boolean;
  isShowBtnTryagain: boolean;
}
// 是否显示  复制 /再试一次 按钮区域 ：回复完成时显示
const isShowDialogItemBtns = (index: number, sources: undefined | Array<Source>) => {
  const result = {
    isShowSources: false,
    isShowBtnWrap: false,
    isShowBtnCopy: false,
    isShowBtnTryagain: false,
  } as IsShowDialogItemBtns
  const replyStatus = dialogueStore.replyStatus
  const dialogueLength = dialogueStore.dialogueList.length
  // 这里只考虑回复的状态，只有在回复的对话框中才添加了按钮区域
  if (dialogueLength == index + 1) {
    // 最后一条
    if (replyStatus == "typing") {
      // 回复中，不显示按钮区域，因为回复中，用户无法操作，只能等待回复完成，才能操作，所以不显示按钮区域，避免用户误操作。
    } else if (replyStatus == "done" || replyStatus == "ready") {
      // 回复完成，显示按钮区域，用户可以操作，所以显示按钮区域，让用户可以操作。
      result.isShowBtnWrap = true
      result.isShowBtnCopy = true
      result.isShowBtnTryagain = true
      if (sources && sources.length > 0) {
        result.isShowSources = true
      }
    }
  } else {
    // 非最后一条
    result.isShowBtnWrap = true
    result.isShowBtnCopy = true
    result.isShowBtnTryagain = false
    if (sources && sources.length > 0) {
      result.isShowSources = true
    }
  }
  return result
}

const historyList = ref([] as Array<History>)
const historyLoading = ref(false)

const isShowEditHistoryDialog = ref(false)
const editHistoryId = ref("")
const editHistoryTitle = ref("")

const getHistoryList = () => {
  historyLoading.value = true
  const userId = localStorage.getItem("userId");
  getHistory(userId!).then(res => {
    if (res.message == "ok") {
      historyList.value = res.data
    } else {
      historyList.value = []
    }
  }).finally(() => {
    historyLoading.value = false
  })
}

// 编辑历史记录
const editHistory = (item: History) => {
  editHistoryId.value = item.index_id!
  editHistoryTitle.value = item.title!
  isShowEditHistoryDialog.value = true
}
// 移除历史记录
const removeHistory = (item: History) => {
  removeHistoryById(item.index_id).then(res => {
    if (res.message === "ok") {
      ElMessage({
        message: "删除成功",
        type: "success",
      });
      getHistoryList()
    } else {
      ElMessage({
        message: "删除成功",
        type: "error",
      });
    }
  })
}

// 关闭编辑标题的弹窗
const closeEditHistoryDialog = () => {
  isShowEditHistoryDialog.value = false
  editHistoryId.value = ""
  editHistoryTitle.value = ""
  getHistoryList()
}

</script>
<style lang="scss">
.el-loading-mask {
  .el-loading-spinner {
    margin-top: calc(0px - ((16px + 32px + 68px) / 2));

    svg {
      width: 68px;
      height: 68px;
    }

    .el-loading-text {
      letter-spacing: 2px;
      white-space: pre-wrap;
      font-size: 18px;
      line-height: 32px;
      margin-top: 16px;
    }
  }
}
</style>

<style scoped lang="scss">
.document-master {
  position: relative;
  height: 100%;
  width: 100%;

  .btn-new-chat {
    position: relative;
    height: 44px;
    color: #017EFA;
    border-color: #017EFA;
    background-color: transparent;
    border-radius: 22px;
    padding: 0 14px;
    transition: .3s;

    &:hover {
      transform: scale(1.06);
    }

    .new-chat-icon {
      height: 32px;
      width: 32px;
      margin-right: 6px;
    }

    .new-chat-label {
      font-size: 16px;
      line-height: 16px;
      margin-bottom: -2px;
    }
  }

  .content-wrap {
    position: relative;
    width: 100%;
    height: calc(100% - 74px);
    display: flex;
    justify-content: flex-start;
    margin-top: 4px;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(8px);
    padding: 24px 104px 18px;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    box-sizing: border-box;

    .content-top {
      position: relative;
      width: 100%;
      flex-shrink: 0;

      .content-top-tip {
        padding: 16px;
        background-color: rgba(255, 255, 255, 0.6);
        border-radius: 12px;
        opacity: 1;

        p:first-child {
          font-family: Source Han Sans;
          font-size: 24px;
          color: #017EFA;
          margin-bottom: 10px;
        }

        p {
          font-family: Source Han Sans;
          font-size: 16px;
          color: #444444;
          margin: 0;
        }
      }
    }

    .content-middle {
      width: 100%;
      flex: 1;
      overflow: hidden;

      &.dialogue-wrap {
        width: 100%;
        height: 100%;
        position: relative;
        box-sizing: border-box;
        margin-bottom: 24px;
        margin-top: 24px;
        padding-right: 24px;
        overflow: auto;

        .dialogue-list {
          width: 100%;
          // height: 100%;
          box-sizing: border-box;
          position: relative;
          display: flex;
          flex-direction: column;

          .dialogue-item-wrap {
            max-width: 100%;
            word-wrap: break-word;
            font-family: "Source Han Sans", sans-serif;

            &.dialogue-item-wrap-left {
              align-self: flex-start;
            }

            &.dialogue-item-wrap-right {
              align-self: flex-end;
              display: flex;
              flex-direction: column;
              align-items: flex-end;

              &:first-child {
                .dialogue-item-user {
                  margin-top: 0;
                }
              }
            }

            .dialogue-item {
              max-width: 100%;
              border-radius: 6px;
              padding: 18px 24px;
              background-color: #f5fbff;
              margin: 12px 0;

              &.dialogue-item-assistant {
                // border-bottom-left-radius: 0px;
                color: #444444;
              }

              &.dialogue-item-user {
                // border-bottom-right-radius: 0px;
                background: #017EFA;
                color: #ffffff;

                &.has-file {
                  margin-bottom: 8px;
                }
              }
            }

            .dialogue-item-content {
              white-space: normal;
              font-size: 18px;
              line-height: 24px;

              :deep(p) {
                margin: 0;
              }
            }

            .dialogue-item-loading {
              height: 24px;
            }

            .dialogue-item-assistant {
              font-size: 0;

              .dialogue-item-sources {
                background-color: rgba(255, 255, 255, 0.8);
                color: #94A0AF;
                display: inline-flex;
                align-items: center;
                flex-wrap: nowrap;
                height: 0;
                width: 0;
                padding: 0 8px;
                margin-top: 0;
                transform: scale(0.5, 0);
                overflow: hidden;
                transition: .4s;
                transform-origin: top left;

                &.is-show {
                  height: auto;
                  width: auto;
                  padding: 8px;
                  margin-top: 24px;
                  transform: scale(1, 1);
                }

                .dialogue-item-sources-label {
                  flex-shrink: 0;
                  font-size: 14px;
                  margin-right: 12px;
                  overflow: hidden;
                }

                .dialogue-item-sources-list {
                  display: flex;
                  align-items: center;
                  flex-wrap: wrap;
                  overflow: hidden;

                  .dialogue-item-sources-item {
                    box-sizing: borde r-box;
                    height: 26px;
                    line-height: 26px;
                    font-size: 14px;
                    font-weight: bold;
                    padding: 0 6px;
                    margin-right: 6px;
                    color: #fff;
                    background-color: var(--el-color-primary);
                    color: var(--el-color-white);
                    border-radius: 2px;
                    cursor: pointer;
                    user-select: none;
                    min-width: 24px;
                    text-align: center;
                  }
                }
              }

              .dialogue-item-btns {
                margin-top: 0;
                height: 0;
                overflow: hidden;
                transform: scale(0.5, 1);
                transform-origin: top left;
                transition: .4s;

                &.is-show {
                  margin-top: 24px;
                  height: auto;
                  transform: scale(1);
                }

                .dialogue-item-btn {
                  border: none;
                  color: #94A0AF;

                  &:hover {
                    color: #017EFA;
                  }
                }
              }
            }
          }

          .dialogue-stop-reply-btn {
            margin-top: 18px;
            align-self: flex-start;
            height: 36px;
            padding-left: 12px;
            padding-right: 12px;
            border-radius: 8px;
          }
        }
      }
    }

    .content-bottom {
      width: 100%;
      flex-shrink: 0;

      .input-wrap {
        position: relative;
        width: 100%;
        box-sizing: border-box;

        .input-field {
          position: relative;
          width: 100%;
          box-sizing: border-box;
          background: #FFFFFF;
          padding: 10px 20px;
          border-radius: 8px;
          // padding-right: calc(20px + 40px * 2 + 10px * 2 + 14px * 4 + 10px);
          padding-right: calc(20px + 40px * 2 + 10px * 2);

          &.has-file {
            border-top-left-radius: 0;
            border-top-right-radius: 0;
          }

          .input-textarea {

            :deep(.el-textarea__inner) {
              box-shadow: none;
              line-height: 30px;
              padding: 5px 6px;
            }
          }

          .input-btns {
            position: absolute;
            right: 20px;
            bottom: 10px;
            display: flex;
            align-items: center;

            .input-btns-item {
              width: 40px;
              height: 40px;
              cursor: pointer;
              user-select: none;
              transition: .3s;
              display: flex;
              align-items: center;
              justify-content: center;

              &.btn-summary {
                display: none;
                word-break: keep-all;
                margin-left: 10px;
                width: auto;
                line-height: 40px;
                color: #017EFA;
                font-size: 14px;
              }

              &.disabled {
                cursor: not-allowed;
                color: #DFE2E6;

                :deep(.el-upload) {
                  cursor: not-allowed;

                  .input-btns-item-img {
                    fill: #DFE2E6;
                    width: 40px;
                    height: 40px;

                    svg {
                      width: 100%;
                      height: 100%;
                    }
                  }
                }

                &:hover {
                  transform: none;
                }
              }

              &:hover {
                transform: scale(1.12);
              }

              &.btn-send {
                background: url("@/assets/img/btns/send.png") center / 100% 100% no-repeat;

                &.disabled {
                  background-image: url("@/assets/img/btns/send-disabled.png");
                }
              }

              +.input-btns-item {
                margin-left: 10px;
              }

              .input-btns-item-img {
                width: 100%;
                height: 100%;
                fill: #8A9099;
              }
            }
          }
        }
      }
    }

    // 文件列表
    .file-list {
      position: relative;
      height: 0;
      width: 100%;
      box-sizing: border-box;
      padding: 0;
      background-color: rgba(255, 255, 255, 0.6);
      border-radius: 8px;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;

      .file-item-wrap {
        height: 0;

        .file-item-icon {
          height: 0;

          .file-item-icon-img {
            height: 0;
          }
        }

        .file-item-content {
          font-size: 0;
        }
      }


      &.has-file {
        min-height: calc(16px * 2 + 56px);
        height: auto;
        padding: 16px 24px 8px;

        // 对话区域中的filelist样式
        &.dialogue-item-file-list {
          min-height: 56px;
          padding: 0;
          background-color: rgba(255, 255, 255, 0);
          margin-bottom: 12px;
          justify-content: flex-end;

          .file-item-wrap {
            background-color: #fff;
            margin-left: 12px;
            margin-right: 0;

            &:last-child {
              margin-right: 0;
            }
          }
        }

        .file-item-wrap {
          position: relative;
          height: 56px;
          max-width: 236px;
          box-sizing: border-box;
          background: #E9ECF0;
          padding: 12px 42px 12px 14px;
          border-radius: 6px;
          margin-right: 12px;
          margin-bottom: 8px;
          cursor: default;

          &:last-child {
            margin-right: 0;
          }

          .file-item {
            position: relative;
            display: flex;
            align-items: center;
            flex-wrap: nowrap;
            cursor: pointer;

            .file-item-icon {
              position: relative;
              width: 32px;
              height: 32px;
              margin-right: 6px;
              background-color: #fff;
              flex-shrink: 0;
              border-radius: 4px;

              .file-item-icon-img {
                width: 100%;
                height: 100%;
              }

              :deep(.el-loading-spinner) {
                margin-top: calc(-16px / 2);

                svg {
                  width: 20px;
                  height: 20px;
                }
              }
            }

            .file-item-content {
              color: #444;
              font-size: 14px;
              height: 100%;

              .file-item-name {
                max-width: 160px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              .file-item-status,
              .file-item-size {
                color: #7D8592;
                font-size: 12px;
              }
            }
          }

          .file-item-delete {
            position: absolute;
            top: 6px;
            right: 6px;
            cursor: pointer;
            transition: .2s;

            &:hover {
              transform: scale(1.16);
            }
          }
        }
      }
    }
  }

  .history-wrap {
    position: relative;
    width: 100%;
    height: calc(100% - 74px);
    padding: 24px 10px 18px;
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    box-sizing: border-box;


    .history-list-wrap {
      overflow-x: hidden;
      overflow-y: auto;
      position: relative;
      width: 100%;
      height: 100%;
    }

    .history-list-empty {
      font-size: 16px;
      color: #8A9099;
      opacity: .6;
      text-align: center;
    }

    .history-list {
      width: 900px;
      overflow: hidden;
      box-sizing: border-box;
      margin: auto;

      .history-item {
        width: 100%;
        line-height: 24px;
        font-size: 14px;
        color: #444444;
        padding: 18px 16px;
        background-color: #fff;
        box-sizing: border-box;
        border-radius: 6px;
        cursor: pointer;
        margin-bottom: 16px;

        &:hover {
          box-shadow: 0px 10px 12px -3px rgba(0, 0, 0, 0.1), 0px -10px 12px -3px rgba(0, 0, 0, 0.1);

          .history-item-info {
            .history-item-date {
              visibility: hidden;
            }

            .history-item-btns {
              display: block;
            }
          }
        }

        .history-item-info {
          width: 100%;
          position: relative;
          display: flex;
          align-items: flex-start;
          flex-wrap: wrap;
          justify-content: flex-start;
          box-sizing: border-box;

          .history-item-icon {
            width: 24px;
            height: 24px;
          }

          .history-item-name {
            margin-right: 6px;
            margin-left: 6px;
            flex: 1;
            line-height: 24px;
            white-space: pre-wrap;
          }

          .history-item-date {
            line-height: 24px;
          }

          .history-item-btns {
            display: none;
            position: absolute;
            top: 0;
            right: 0;
            height: 24px;
            width: auto;

            img {
              width: 20px;
              height: 20px;

              &:first-child {
                margin-right: 10px;
              }
            }
          }
        }

        .history-item-files {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-start;
          margin-top: 12px;

          // 文件列表
          .file-list {
            position: relative;
            height: 0;
            width: 100%;
            box-sizing: border-box;
            padding: 0;
            background-color: rgba(255, 255, 255, 0.6);

            .file-item-wrap {
              height: 0;

              .file-item-icon {
                height: 0;

                .file-item-icon-img {
                  height: 0;
                }
              }

              .file-item-content {
                font-size: 0;
              }
            }


            &.has-file {
              min-height: calc(16px * 0 + 56px);
              height: auto;
              padding: 0;

              .file-item-wrap {
                position: relative;
                height: 56px;
                max-width: 236px;
                box-sizing: border-box;
                background: #E9ECF0;
                padding: 0 18px 0 14px;
                border-radius: 6px;
                margin-right: 12px;
                margin-bottom: 8px;
                cursor: default;
                display: flex;
                align-items: center;

                &:last-child {
                  margin-right: 0;
                }

                .file-item {
                  position: relative;
                  display: flex;
                  align-items: center;
                  flex-wrap: nowrap;
                  cursor: pointer;

                  .file-item-icon {
                    position: relative;
                    width: 32px;
                    height: 32px;
                    margin-right: 6px;
                    background-color: #fff;
                    flex-shrink: 0;
                    border-radius: 4px;

                    .file-item-icon-img {
                      width: 100%;
                      height: 100%;
                    }

                    :deep(.el-loading-spinner) {
                      margin-top: calc(-16px / 2);

                      svg {
                        width: 20px;
                        height: 20px;
                      }
                    }
                  }

                  .file-item-content {
                    color: #444;
                    font-size: 14px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;

                    .file-item-name {
                      max-width: 160px;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    }

                    .file-item-status,
                    .file-item-size {
                      color: #7D8592;
                      font-size: 12px;
                    }
                  }
                }

                .file-item-delete {
                  position: absolute;
                  top: 6px;
                  right: 6px;
                  cursor: pointer;
                  transition: .2s;

                  &:hover {
                    transform: scale(1.16);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
