import { defineStore } from "pinia";
import { DocTypewriter, deepCopy, pattern } from "@/util/common";
import {
  requestFileList,
  docMasterChat,
  referencesFetch
} from "../../http/api";
import { FetchSSE } from "@/util/fetchSSE"
import dayjs from "dayjs"
import { ElMessage, UploadFiles } from "element-plus";

interface Dialogue {
  role: string; // 助手： assistant  用户： user
  content: string; // 内容
  datetime?: string; // 时间
  docs?: UploadFiles; // 相关文件
  metaData: MetaData; // 相关来源
}

interface DialogueDetail {
  index_id: string;
  contents: Array<Dialogue>
}

export interface MetaData {
  knowledge_id: string;
  node_ids: Array<Source>; // 相关来源
}

export interface Source {
  id: string;
  score: number;
  url?: string;
  content?: string;
  page?: number;
}

type ReferencesResourceInfo = {
  content: string,
  type: string
}

export const useDialogueStore = defineStore("dialogue", {
  state: () => ({
    replyTypewriter: {} as DocTypewriter,
    replyStatus: "ready", // 回复状态：ready 准备中，loading 加载中，typing 回复中，done 回复完成
    // 对话id / 知识库id （每次上传文件会生成一个知识库id）
    dialogueId: "",
    // 对话列表
    dialogueList: [] as Dialogue[],
    // 文件列表
    fileList: [] as UploadFiles,
    // sse流式请求实体
    streamFetch: {} as FetchSSE
  }),
  //开启数据持久化缓存
  persist: {
    key: "dialogue",
    storage: localStorage,
    paths: ["dialogueId"], // 用于指定 state 中哪些数据需要被持久化。[] 表示不持久化任何状态，undefined 或 null 表示持久化整个 state。
  },
  getters: {
    // 是否显示 回复加载中
    showReplyLoading(state) {
      return state.replyStatus == 'loading'
    },
    // 是否显示 停止回复按钮
    showReplyStop(state) {
      return state.replyStatus == 'loading' || state.replyStatus == 'typing'
    }
  },
  actions: {
    setDialogueId(id: string) {
      this.dialogueId = id
    },
    resetDialogueId() {
      this.dialogueId = ""
    },
    // 新增一条对话消息
    addDialogue(role: string, content: string, files?: UploadFiles, resources?: Array<Source>) {
      const dialogue = {
        role: role,
        content: content,
        datetime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        docs: deepCopy(files) as UploadFiles || [] as UploadFiles,
        metaData: {
          knowledge_id: this.dialogueId,
          node_ids: resources || [] as Array<Source>,
        }
      }
      this.dialogueList.push(dialogue);
    },
    // 删除最后一条对话
    popDialogue() {
      this.dialogueList.pop();
    },
    // 获取回复
    getRemoteReply(inputStr?: string, retry?: Boolean, typingCb?: Function) {
      return new Promise((resolve, reject) => {
        if (!this.dialogueId) {
          console.error("对话ID为空")
          reject("对话ID为空")
          return
        }
        this.replyTypewriter = new DocTypewriter((str: string) => {
          if (str != "骉") {
            this.dialogueList[this.dialogueList.length - 1].content += str || ""
            this.dialogueList[this.dialogueList.length - 1].content = this.dialogueList[this.dialogueList.length - 1].content.replaceAll(pattern, "")
            typingCb && typingCb()
          }
          if (str == "骉") {
            this.replyStatus = "done"
            this.replyTypewriter.done();
            if (typingCb) {
              let cbTimer = setTimeout(() => {
                typingCb()
                clearTimeout(cbTimer)
              }, 280)
            }
            resolve(true);
            return;
          }
        });
        this.replyTypewriter.start();

        // 增加一条空的回复数据
        this.addDialogue("assistant", "");
        const doc_ids = this.getRecentFileIds()
        this.replyStatus = "loading"
        this.streamFetch = docMasterChat({
          index_id: this.dialogueId,
          role: "user",
          doc_ids: doc_ids ? doc_ids : [],
          retry: retry ? retry : false,
          userId: localStorage.getItem("userId"),
          // 用户输入的内容或 删除最后一条回复后的最近一条用户输入内容
          content: inputStr,
        })
        // onopen
        this.streamFetch.setOpenEvent(() => {
          console.log("streamFetch: opened")
        })
        this.streamFetch.setMessageEvent((jsonStr: any) => {
          // onmessage
          // 流式请求，每收到一条回复会执行一次
          // console.log("收到回复：", JSON.parse(jsonStr))
          this.replyStatus = "typing"
          let res = JSON.parse(jsonStr);
          if (res.content.indexOf("[done]") > -1) {
            this.replyTypewriter.add("[end]");
            return;
          } else {
            this.replyTypewriter.add(res.content);
            if (res.metadata && res.metadata.node_ids) {
              res.metadata.node_ids.sort((a: Source, b: Source) => b.score - a.score)
              const source_page_query = res.metadata.node_ids.slice(0, 3).map((item: Source) => this.getSourcePage(item.id))
              Promise.all(source_page_query).then(res_all => {
                res_all.forEach((item, index) => {
                  if (item.message == "ok" && item.data) {
                    const images = item.data.filter((i: { type: string }) => i.type == "image")
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
                      res.metadata.node_ids[index].page = Number(pages[0])
                    } else {
                      res.metadata.node_ids[index].page = index + 1
                    }
                  }
                })
                this.dialogueList[this.dialogueList.length - 1].metaData = res.metadata
              })
            }
          }
        })
        // onclose
        this.streamFetch.setCloseEvent(() => {
          console.log("streamFetch: onclose")
        })
        // onerror
        this.streamFetch.setErrorEvent((err: any) => {
          console.log("streamFetch: error")
          this.replyStatus = "done"
          this.popDialogue()
          if (err.message) {
            ElMessage({
              message: err.message,
              type: "error",
            });
          }
          reject(err)
        })
        this.streamFetch.send()
      });
    },

    // 获取最近一次上传的所有doc_ids
    getRecentFileIds() {
      const recentDialogueItem = deepCopy(this.dialogueList).reverse().find(item => {
        return item.docs && item.docs.length > 0
      }) as Dialogue
      return recentDialogueItem.docs?.map((item: any) => {
        if (item.response) {
          return item.response.doc_id
        } else if (item.doc_id) {
          return item.doc_id
        } else {
          return ""
        }
      })
    },

    // 获取对话中所有的文件ids
    isDialogueListHasFile() {
      const hasFileIndex = this.dialogueList.findIndex(item => {
        return item.docs && item.docs.length > 0
      })
      return hasFileIndex > -1
    },

    // 根据source的id获取详情
    getSourcePage(source_id: string) {
      return referencesFetch(this.dialogueId, [source_id])
    },

    // 获取文件列表
    setFileList(files: UploadFiles) {
      this.fileList = files;
    },

    // 获取文件列表
    async getFileList() {
      const res = await requestFileList([0, 1, 2]);
      this.fileList = res;
    },

    // 停止输出，停止接收回复
    stopReply() {
      // 取消请求
      this.streamFetch.abort()
      console.warn("StreamFetch请求连接已关闭：stopReply")
      // 停止打字机
      this.replyStatus = "done"
      if (this.replyTypewriter && this.replyTypewriter.abort) {
        this.replyTypewriter.abort();
        this.replyTypewriter = {} as DocTypewriter
      }
      if (this.dialogueList.slice(-1)[0] && this.dialogueList.slice(-1)[0].content === "") {
        this.popDialogue() // 如果最后一条回复为空，则删除最后一条回复数据
      }
    },
    // 重置对话（新建对话）
    resetDialogue() {
      console.log("resetDialogue => 清空对话列表")
      this.replyStatus = "ready"
      this.dialogueId = ""
      this.dialogueList = [] as Dialogue[]
      this.fileList = [] as UploadFiles
      if (this.streamFetch && this.streamFetch.abort) {
        this.streamFetch.abort()
        console.warn("StreamFetch请求连接已关闭：resetDialogue")
        this.streamFetch = {} as FetchSSE
      }
    },
    // 根据历史对话详情，初始化对话列表
    initDialogueByDetail(detail: DialogueDetail) {
      this.dialogueId = detail.index_id
      this.dialogueList = detail.contents.map(item => {
        return {
          ...item,
          content: item.content.replaceAll(pattern, "")
        }
      }) as Dialogue[]
      this.initDialoguePagesByDetail()
    },
    // 初始化dialoguList中原有的参考来源
    initDialoguePagesByDetail() {
      let assistantNoPageList = this.dialogueList.filter(item => item.role === "assistant" && item.metaData && item.metaData.node_ids && item.metaData.node_ids.findIndex(i => i.hasOwnProperty("page")) == -1)
      if (assistantNoPageList.length > 0) {
        assistantNoPageList = assistantNoPageList.reverse() // 浅拷贝
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        const processArray = async (list: Dialogue[]) => {
          for (const assistant of list) {
            // 延时500毫秒触发参考来源查询
            await delay(500);
            if (assistant.metaData && assistant.metaData.node_ids) {
              assistant.metaData.node_ids.sort((a: Source, b: Source) => b.score - a.score)
              const source_page_query = assistant.metaData.node_ids.slice(0, 3).map(async (item: Source) => await this.getSourcePage(item.id))
              Promise.all(source_page_query).then(res_all => {
                res_all.forEach((item, index) => {
                  if (item.message == "ok" && item.data) {
                    const images = item.data.filter((i: { type: string }) => i.type == "image")
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
                      assistant.metaData.node_ids[index].page = Number(pages[0])
                    } else {
                      assistant.metaData.node_ids[index].page = index + 1
                    }
                  }
                })
              })
            }
          }
        };
        processArray(assistantNoPageList);
      }
    }
  }
});
