import { defineStore } from "pinia";
import { dataFixed, Typewriter } from "../../util/common";
import {
  requestFileList,
  requestAudio2Text,
  getLLMChat,
  getMessageByImage,
  getMessageByImageOther,
} from "../../http/api";
import { CONTENTTYPE } from "../../util/defineData";
import { nextTick } from "vue";
import { UploadUserFile } from "element-plus";

interface Dialogue {
  question: string;
  answer: string;
}
interface FileAttr {
  createTime: string;
  fileName: string;
  ossUrl: string;
  id: string;
  type: number;
}
export const useMessageStore = defineStore("message", {
  state: () => ({
    // 对话列表
    dialogueList: [] as Dialogue[],
    // 当前选中的文件ID
    selectedFile: "",
    // 右侧展示内容类型
    rightContentType: CONTENTTYPE.NODATA,
    // 是否不可分析
    isAnalysisDisabled: false,
    // 是否展示聊天区域
    showDialogue: true,
    // 是否展示静音按钮
    showMuteBtn: false,
    // 跳过loading
    skipLoading: {} as any,
    // 用于展示打字机效果和语音转文本，对话最后一条
    currentDialogue: <Dialogue>{
      question: "",
      answer: "",
    },
    // 下拉框中的历史上传文件
    historyFileList: [] as FileAttr[],
    //多模态当前聊天内容
    mulCurrentLog: "",
    curTyperWriter: new Typewriter(() => {}),
    //多模态当前上传图片列表
    imageList: [],
    //当前选中图片信息
    imgurl: "",
    imgBase64: "",
    imageChoseResult: "",
    ws: {} as any, // 讯飞助手 websocket连接
    sessionId: "", // 讯飞助手对话id
    sparkTypewriter: {} as any
  }),
  getters: {
    // 当前选中的文件的类型
    selectedFileType: (state) =>
      state.historyFileList.find((item: any) => item.id === state.selectedFile)
        ?.type,
  },
  actions: {
    /**文件分析*/
    /**语音：流式展示解析后的对话内容 */
    analysisAudio() {
      this.isAnalysisDisabled = true;
      let tempSyncFlag = true; // 默认右侧
      this.currentDialogue = {
        question: "",
        answer: "",
      };
      const typewriter = new Typewriter((str: string) => {
        if (str === "#") {
          if (!tempSyncFlag) {
            // 写死逻辑，当前是答案
            this.dialogueList.push(this.currentDialogue);
            this.currentDialogue = {
              question: "",
              answer: "",
            };
          }
          tempSyncFlag = !tempSyncFlag;
          return;
        }
        if (str === "&") {
          // 队列完全结束，打开右侧展示
          this.rightContentType = CONTENTTYPE.TEXT;
          typewriter.done();
          this.isAnalysisDisabled = false;
          this.showDialogue = true;
          this.showMuteBtn = false;
          this.skipLoading && this.skipLoading.close();
          return;
        }
        if (tempSyncFlag) {
          this.currentDialogue.question += str || "";
        } else {
          this.currentDialogue.answer += str || "";
        }
      });
      // @ts-ignore
      this.curTyperWriter = typewriter;
      this.curTyperWriter.setSpeed(500);
      typewriter.start();
      // 获取语音转文字内容
      requestAudio2Text(this.selectedFile, (text: string) => {
        if (text === "[done]") {
          typewriter.add("&");
          return;
        }
        text += "#";
        typewriter.add(text);
      });
    },

    changeSpeedForShow(num: number) {
      // @ts-ignore
      this.curTyperWriter.setSpeed(num);
    },

    /**单行文件：直接解析展示右侧 */
    analysisSingleExcel() {
      nextTick(() => {
        this.rightContentType = CONTENTTYPE.TEXT;
      });
    },
    /**多行文件：直接解析展示右侧 */
    analysisMultExcel() {
      this.rightContentType = CONTENTTYPE.CHART;
    },
    /**文件分析end */

    //获取聊天返回
    async getLLmAnswer(params: any) {
      return new Promise((resolve, reject) => {
        const typewriter = new Typewriter((str: string) => {
          if (str === "&") {
            typewriter.done();
            resolve(true);
            return;
          }
          this.currentDialogue.answer += str || "";
        });
        typewriter.start();
        //获取语音转文字内容
        getLLMChat(params, (text: string) => {
          if (/^[\s]*\{[\s\S]*\}[\s]*$/.test(text)) {
            let textObject = JSON.parse(text);
            if (textObject && textObject.type && textObject.type == 2) {
              textObject.data = dataFixed(textObject.data);
              this.dialogueList.push({
                question: this.currentDialogue.question,
                answer: JSON.stringify(textObject),
              });
              this.currentDialogue = {
                question: "",
                answer: "",
              };
              resolve(true);
              return;
            }
          }
          console.log("获取语音转文字信息", text);
          if (text === "[done]") {
            typewriter.add("&");
            return;
          }
          typewriter.add(text + "<br/>");
        });
      });
    },

    //获取多模态chinese聊天
    async getMuChat(params: any) {
      console.log("message store getMuChat :", JSON.stringify(params));
      return new Promise((resolve, reject) => {
        const mulTypewriter = new Typewriter((str: string) => {
          if (str === "&") {
            mulTypewriter.done();
            resolve(this.mulCurrentLog);
            this.mulCurrentLog = "";
            return;
          }
          this.mulCurrentLog += str || "";
        });
        mulTypewriter.start();
        getMessageByImage(params).then((res) => {
          if (res.response) {
            mulTypewriter.add(res.response + "&");
            return;
          }
        });
      });
    },

    //获取多模态llamacpp聊天
    async getMuChatOther(params: any) {
      console.log("message store getMuChat :", JSON.stringify(params));
      return new Promise((resolve, reject) => {
        const mulOtherTypewriter = new Typewriter((str: string) => {
          if (str === "&") {
            mulOtherTypewriter.done();
            resolve(this.mulCurrentLog);
            this.mulCurrentLog = "";
            return;
          }
          this.mulCurrentLog += str || "";
        });
        mulOtherTypewriter.start();
        getMessageByImageOther(params, (text: string) => {
          console.log("获取语音转文字信息", text);
          let temObject = JSON.parse(text);
          if (temObject.stop) {
            mulOtherTypewriter.add("&");
            return;
          } else {
            mulOtherTypewriter.add(temObject.content);
          }
        });
      });
    },

    // 获取文件列表
    async getFileList() {
      const res = await requestFileList([0,1,2]);
      this.historyFileList = res;
    },

    // 讯飞助手对话
    async getSparkAnswer(params: any) {
      return new Promise((resolve, reject) => {
       this.sparkTypewriter = new Typewriter((str: string) => {
          if (str === "&") {
            this.sparkTypewriter.done();
            resolve(this.sessionId);
            return;
          }
          this.currentDialogue.answer += str || "";
        });
        this.sparkTypewriter.start();
        const ws_params = {
          "header": {
            "traceId": params.traceId,  //8-16位数
            "assistantCode": params.assistantCode,      //助手编码，平台可看到
            "appId": params.appId,
          },
          "payload": {
            "sessionId": params.sessionId ? params.sessionId : "", //会话id，可理解上下文。若为空，返回值会生成一个id，若不为空，则联系对应会话id内容输出结果。
            "text": [
              {
                "content": params.message,
                "content_type": "text"
              }
            ],
            "pluginIds":{
              "text": [
                {

                }
              ]
            }
          }
        }
        //获取语音转文字内容
        this.ws = new WebSocket("wss://spark.gczx.cn/skybox/api/v1/chat")
        this.ws.onopen = () => {
          this.ws.send(JSON.stringify(ws_params))
        }
        this.ws.onmessage = (e:any) => {
          if(e.data && JSON.parse(e.data)?.payload?.sessionId) {
            this.sessionId = JSON.parse(e.data)?.payload?.sessionId
            const messageArr = JSON.parse(e.data)?.payload?.choices?.text.map((item:any) => {
              return item.content
            }) || []
            const message = messageArr.join("")
            // console.log("收到消息：", message)
            if(message.indexOf("<end>") > -1) {
              // 结束对话
              this.sparkTypewriter.add(message)
              this.sparkTypewriter.add("&")
            } else {
              // 未结束对话
              this.sparkTypewriter.add(message)
            }
          } else {
            console.error("大模型Websocket连接异常，message收到的消息格式错误")
          }

        }
        this.ws.onclose = () => {
          console.log("大模型Websocket连接关闭，结束对话")
          resolve(this.sessionId);
        }
      });
    },
    resetDialogue() {
      if(this.ws && this.ws.close) {
        this.ws.close()
        this.ws = {}
      }
      if(this.sparkTypewriter && this.sparkTypewriter.done) {
        this.sparkTypewriter.done()
      }
      // console.log("清空对话列表")
      this.sessionId = ""
      this.dialogueList = []
      this.currentDialogue = {
        question: "",
        answer: "",
      };
    }
  },
});
