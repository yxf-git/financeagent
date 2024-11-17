import { defineStore } from "pinia";
import { dataFixed, Typewriter } from "../../util/common";
import {
  getNewLLMChat,talkListInfo
} from "../../http/api";
import { CONTENTTYPE } from "../../util/defineData";

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
export const useChatStore = defineStore("chat", {
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
    sparkTypewriter: {} as any,
  }),
  getters: {
    // 当前选中的文件的类型
    selectedFileType: (state) =>
      state.historyFileList.find((item: any) => item.id === state.selectedFile)
        ?.type,
  },
  actions: {
    changeSpeedForShow(num: number) {
      // @ts-ignore
      this.curTyperWriter.setSpeed(num);
    },
    writerDone(){
      this.curTyperWriter.done();
    },
    //获取聊天返回
    async getSparkChatAnswer(params: any) {
      let that = this;
      return new Promise((resolve, reject) => {
        let sessionId = "";
        that.curTyperWriter = new Typewriter((str: string) => {
          if (str === "&") {
            that.curTyperWriter.done();
            resolve(sessionId);
            return;
          }
          this.currentDialogue.answer += str || "";
        });
        that.curTyperWriter.start();
        getNewLLMChat(params, (text: string) => {
          let textObject = JSON.parse(text);
          if(textObject?.status == 3){
            that.curTyperWriter.add("异常，请重试~&");
            return;
          }else if(textObject?.status == 2){
            that.curTyperWriter.add("&");
            return;
          }else{
            that.curTyperWriter.add(textObject.msg);
          }
        });
      });
    },

    //获取历史记录
    async getChatListInfo(params: any){
      let that = this
      return new Promise((resolve, reject) => {
        talkListInfo(params).then(res=>{
          let talkObj = {
            question: "",
            answer: "",
          }
          let dataList = res.data.list;
          for(let i = dataList.length-1;i>-1;i--){
            if(dataList[i].contentType == "in"){
              talkObj.question = dataList[i].dialogueContent
            }else if(dataList[i].contentType == "out"){
              talkObj.answer = dataList[i].dialogueContent
            }
            if(talkObj.question != "" && talkObj.answer != "" || i == 0){
              that.dialogueList.push(talkObj)
              talkObj = {
                question: "",
                answer: "",
              }
            }
          }
          resolve(true)
        })
      });
    }
  },
});
