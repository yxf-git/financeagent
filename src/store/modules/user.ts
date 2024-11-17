import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({ count: 12 , sum:5 , userid:'',userInfo:{}}),
    getters: {
        double: (state) => state.count * 2,
    },
    actions: {
        increment(num : number) {
            this.count ++
            this.sum ++
        },
        checkSome(num : number){
            return ++num;
        },
    },
})
