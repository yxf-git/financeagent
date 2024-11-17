<template>
<div class="sideContainer flex-column flex--align--center">
  <div class="flex-row flex--justify--center flex--align--center iconTitle">
    <div class="icon"></div>
    <div>国创中心</div>
  </div>

  <div class="flex-row flex--align--center flex--justify--center appButton active" @click="goPage('/index')">
    <div class="appIcon"></div>
    <div>应用中心</div>
  </div>
  <div class="flex-row flex--align--center flex--justify--center appButton active" @click="goPage('/application')">
    <div class="chatIcon"></div>
    <div>应用中心New</div>
  </div>
  <div class="flex-row flex--align--center flex--justify--center chatButton">
    <div class="chatIcon"></div>
    <div>新建对话</div>
  </div>
</div>
</template>

<script lang="ts" >

import router from "../router";

export default {
  name: "SideLeft",
  setup(){
    const goPage = (url : string)=>{
      url?router.push(url):""
    }
    return{
      goPage,
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
.sideContainer{
  width: 264px;
  .iconTitle{
    height: 68px;
    font-family: Source Han Sans;
    font-size: 24px;
    font-weight: bold;
    line-height: normal;
    letter-spacing: 0px;
    font-feature-settings: "kern" on;
    color: #FFFFFF;
    .icon{
      height: 38px;
      width: 38px;
      background-image: url("../assets/img/icon.png");
      background-size: 100% 100%;
      margin-right: 8px;
    }
  }
  .appButton{
    cursor: pointer;
    background: rgba(1, 126, 250, 0.2);
    margin-top: 55px;
    width: 216px;
    height: 48px;
    border-radius: 8px;
    opacity: 1;

    font-family: 思源黑体;
    font-size: 20px;
    font-weight: normal;
    line-height: 100%;
    letter-spacing: 0em;
    font-feature-settings: "kern" on;
    color: #FFFFFF;

    z-index: 1;
    .appIcon{
      height: 24px;
      width: 24px;
      background-image: url("../assets/img/appIcon.png");
      background-size: 100% 100%;
      margin-right: 10px;
    }
  }


  .chatButton{
    cursor: pointer;
    margin-top: 24px;
    width: 216px;
    height: 48px;
    border-radius: 8px;
    opacity: 1;
    background: rgba(1, 126, 250, 0.2);

    font-family: 思源黑体;
    font-size: 20px;
    font-weight: normal;
    line-height: 100%;
    letter-spacing: 0em;
    font-feature-settings: "kern" on;
    color: #FFFFFF;

    z-index: 1;
    .chatIcon{
      height: 22px;
      width: 22px;
      background-image: url("../assets/img/chatIcon.png");
      background-size: 100% 100%;
      margin-right: 10px;
    }
  }

  .active{
    background: #017EFA;
  }


}
</style>
