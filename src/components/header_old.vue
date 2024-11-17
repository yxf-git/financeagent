<template>
  <div class="headContainer flex-row flex--align--center flex--justify--between">
    <div class="headTitle">国创中心-大模型应用中心</div>
    <div class="setting flex-row flex--align--center flex--justify--between">
      <div class="user"></div>
      <div class="line"></div>
      <div class="more"></div>
    </div>
  </div>
</template>

<script lang="ts">

export default {
  name: "Header",
  setup(){

    return{

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
.headContainer{
  border-top-left-radius: 20px;
  background: rgba(255, 255, 255, 0.5);
  width: 100%;
  height: 68px;
  .headTitle{
    margin-left: 30px;
    font-family: Source Han Sans;
    font-size: 24px;
    font-weight: bold;
    line-height: 24px;
    letter-spacing: 0em;
    font-feature-settings: "kern" on;
    color: #333333;
  }
  .setting{
    margin-right: 40px;
    height: 32px;
    width: 91px;
    .user{
      height: 32px;
      width: 32px;
      background-image: url("../assets/img/user.png");
      background-size: 100% 100%;
    }
    .line{
      height: 14px;
      width: 1px;
      background-color: #D8D8D8;
      opacity: 1;
    }
    .more{
      height: 32px;
      width: 32px;
      background-image: url("../assets/img/more.png");
      background-size: 100% 100%;
    }
  }


}
</style>
