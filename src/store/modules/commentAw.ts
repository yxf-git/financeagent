import { defineStore } from 'pinia'
import {getLLMChat, getLLMChatAw, requestFileList, requestFileListAw} from "../../http/api";
import {dataFixed, Typewriter} from "../../util/common";

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
export const useCommentAwStore = defineStore('commend', {
    state:() =>({
        fileList:[] as FileAttr[],
        selectedFile:"",
        // 对话列表
        dialogueList: [] as Dialogue[],
        // 对话最后一条
        currentDialogue: <Dialogue>{
            question: "",
            answer: "",
        },
    }),
    getters: {

    },
    actions:{
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
                getLLMChatAw(params, (text: string) => {
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
                    if (text === "[done]") {
                        typewriter.add("&");
                        return;
                    }
                    typewriter.add(text + "<br/>");
                });
            });
        },
        //获取文件列表
        async getFileList() {
            let fileList = await requestFileListAw();
            // let fileList = JSON.parse('[{"id":"397652281151459328","fileName":"多品牌表格.xlsx","type":4,"ossUrl":null,"createTime":"2024-01-03 15:28:19"},{"id":"398301727941988352","fileName":"单品牌表格.xlsx","type":3,"ossUrl":null,"createTime":"2024-01-05 10:29:01"}]')
            if(fileList.length > 0){
                this.fileList = fileList;
            }
        },
    }
})
