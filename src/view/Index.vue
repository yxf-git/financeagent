<template>
  <div class="body flex-column flex--align--center">
    <div class="switchTitle flex-row flex--align--center">
      <div class="switchContent active">应用市场</div>
      <div class="switchContent">应用收藏</div>
    </div>
    <div class="category flex-row flex--justify--between">
      <div v-for="(item,index) in categoryData" :key="index" @mouseover="onHover(index)" class="item" :class="activeFlag==index?'itemActive':''">{{item}}</div>
    </div>
    <div class="infoList flex-row flex--wrap flex--justify--between">
      <div v-for="(item,index) in categoryDataInfo" :key="index" class="infoItem" @click="goPage(item.url, item)">
        <div class="infoTitle flex-row">
          <img :src="getAssetsFiles(item.icon)">
          <div>{{item.title}}</div>
        </div>
        <div class="itemText">
          {{item.content}}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {reactive, ref} from "vue";
import router from "../router";
import {category,categoryInfo} from "../util/defineData";
import {getAssetsFiles} from "../util/common";

export default {
  setup(){
    let categoryData = ref(category)
    let categoryDataInfo = reactive(categoryInfo)
    let activeFlag = ref(0);

    interface Category {
      index: number;
      title: string;
      icon: string;
      url: string;
      sparkAppId: string;
      content: string;
    }

    const goPage = (url : string, category: Category)=>{
      if(url) {
        let _route = {
          path: url,
          query: {}
        }
        if(category.sparkAppId) {
          _route.query = {
            sparkAppId: category.sparkAppId
          }
        }
        router.push(_route)
      }
    }

    const onHover = (index : number)=>{
      activeFlag.value = index;
      console.log(index)
    }


    return{
      categoryData,
      goPage,
      onHover,
      activeFlag,
      categoryDataInfo,
      getAssetsFiles
    }
  },
  beforeCreate() {

  },
  beforeMount() {

  },
  components:{
  }
}

</script>

<style lang="scss" scoped>
.body{
  width: 964px;
  padding: 32px;
  .switchTitle{
    margin-top: 23px;
    width: 250px;
    height: 44px;
    background: #FFFFFF;
    border-radius: 8px;
    .switchContent{
      text-align: center;
      width: 123px;
      height: 40px;
      font-family: Source Han Sans;
      font-size: 20px;
      font-weight: bold;
      line-height: 40px;
      letter-spacing: 0em;
      font-feature-settings: "kern" on;
      color: #838C98;
    }
    .active{
      background-color: #E6F2FE;
      border-radius: 6px;
      color: #017EFA;
    }
  }
  .category{
    margin-top: 34px;
    width: 100%;
    .item{
      text-align: center;
      padding: 7.5px 30px;
      min-width: 70px;
      height: 29px;
      border-radius: 8px;
      opacity: 1;
      background: #FFFFFF;

      font-family: Source Han Sans;
      font-size: 20px;
      font-weight: normal;
      line-height: 29px;
      letter-spacing: 0em;

      font-feature-settings: "kern" on;
      color: #838C98;

      z-index: 0;
    }
    .itemActive{
      color: #FFFFFF;
      background: #017EFA;
    }
  }
  .infoList{
    margin-top: 38px;
    width: 100%;
    .infoItem{
      cursor: pointer;
      margin-top: 22px;
      width: 310px;
      height: 133px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(5px);
      box-shadow: 0px 0px 12px 0px rgba(1, 126, 250, 0.2);
      border-radius: 8px;
      .infoTitle{
        margin-top: 24px;
        margin-left: 16px;
        font-family: Source Han Sans;
        font-size: 16px;
        font-weight: bold;
        line-height: normal;
        letter-spacing: 0em;

        font-feature-settings: "kern" on;
        color: #838C98;
      }
      img{
        width: 24px;
        height: 24px;
        margin-right: 6px;
      }
      .itemText{
        margin-left: 16px;
        margin-top: 15px;
        font-family: 思源黑体;
        font-size: 14px;
        font-weight: normal;
        line-height: 21px;
        letter-spacing: 0em;
        font-feature-settings: "kern" on;
        color: #94A0AF;
        height: 44px;
        width: 278px;
        overflow:hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
      }
    }
  }
}
</style>
