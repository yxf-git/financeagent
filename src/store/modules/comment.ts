import { defineStore } from 'pinia'
import { requestFileList, requestFileListAw } from "../../http/api";

interface FileAttr {
    createTime: string;
    fileName: string;
    ossUrl: string;
    id: string;
    type: number;
}
export const useCommentStore = defineStore('commend', {
    state: () => ({
        fileList: [] as FileAttr[],
        selectedFile: "",
        showTab: false,
    }),
    getters: {

    },
    actions: {
        //获取文件列表
        async getFileList() {
            let fileList = await requestFileListAw();
            // let fileList = JSON.parse('[{"id":"397652281151459328","fileName":"多品牌表格.xlsx","type":4,"ossUrl":null,"createTime":"2024-01-03 15:28:19"},{"id":"398301727941988352","fileName":"单品牌表格.xlsx","type":3,"ossUrl":null,"createTime":"2024-01-05 10:29:01"}]')
            if (fileList.length > 0) {
                this.fileList = fileList;
            }
        },
        async setShowTab() {
            this.showTab = !this.showTab
        },
    }
})
