import { defineStore } from 'pinia'

export const useHomeStore = defineStore('home', {
    state: () => ({
        showTab: false,
        changeApp: false,  //应用刷新
        changeTalk: false,// 对话刷新
        userInfo: {},
        selectedTag:1
    }),
    getters: {

    },
    actions: {

    },
})
