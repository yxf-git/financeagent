import { defineStore } from "pinia";
import {
  getLLMChatCalendar,
  requestUserSchedule,
  requestUserSession,
  deleteUserSession,
} from "../../http/api";
import { Typewriter } from "../../util/common";
interface Dialogue {
  question: string;
  answer: string;
}
export const useCalendarStore = defineStore("message", {
  state: () => ({
    // 当前session ID
    sessionId: "",
    // 日程列表
    scheduleList: [] as any[],
    // 对话列表
    dialogueList: [] as Dialogue[],
    // 用于展示打字机效果和语音转文本，对话最后一条
    currentDialogue: <Dialogue>{
      question: "",
      answer: "",
    },
  }),
  actions: {
    changeSpeedForShow(num: number) {
      // @ts-ignore
      this.curTyperWriter.setSpeed(num);
    },
    //获取聊天返回
    async getLLmAnswer(params: any) {
      return new Promise((resolve, reject) => {
        const typewriter = new Typewriter((str: string) => {
          if (str === "&") {
            typewriter.done();
            this.dialogueList.push(this.currentDialogue);
            this.currentDialogue = {
              question: "",
              answer: "",
            };
            resolve(true);
            return;
          }
          this.currentDialogue.answer += str || "";
        });
        typewriter.start();
        getLLMChatCalendar(
          params,
          (text: string) => {
            console.log("获取聊天内容", text);
            if (text === "[done]") {
              typewriter.add("&");
              return;
            }
            typewriter.add(text);
          },
          () => {}
        );
      });
    },

    // 查询用户前7天及以后的日程安排
    async getUserSchedule(userId: string) {
      const sd = await requestUserSchedule(userId);
      // 日期数据处理
      const userSchedule = sd.map((item: any) => ({
        title: item.title,
        email: item.email,
        start: item.startTime,
        end: item.endTime,
        color: "#007bff",
      }));
      console.log("查询用户前7天及以后的日程安排", userSchedule);
      this.scheduleList = userSchedule;
    },
    // 查询用户当前会话
    async getUserSession(userId: string) {
      const dialog = await requestUserSession(userId);
      this.sessionId = dialog.sessionId;
      dialog.conversions &&
        dialog.conversions.infos &&
        dialog.conversions.infos.forEach((item: any) => {
          if (!item.answer) {
            item.answer = "这个我还在学习中~";
          }
          this.dialogueList.push(item);
        });
    },
    // 清空用户当前会话
    async deleteUserSessionAction(userId: string, sessionId: string) {
      const res = await deleteUserSession(userId, sessionId);
      if (res.code === 200) {
        this.dialogueList = [];
        this.sessionId = res.data.sessionId;
      } else {
        console.log("清空用户当前会话失败");
      }
    },
  },
});
