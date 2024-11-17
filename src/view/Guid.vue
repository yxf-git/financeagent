<template>
  <div class="guidContainer flex-column">
    <Header class="headerGuid"/>
    <div class="content flex-column flex--align--center flex--grow">
      <div class="first flex-row flex--align--center flex--justify--between">
        <div class="baixiao" @click="gotoPage(1)">
          <div class="infoContent flex-column flex--align--end flex--justify--center">
            <div class="flex-row flex--align--center"><img src="../assets/img/guid/baixiaoIcon.png"><span>百晓</span></div>
            <div class="fontDes">通晓百科</div>
          </div>
        </div>
        <div class="danqing" @click="gotoPage(2)">
          <div class="infoContent flex-column flex--align--end flex--justify--center">
            <div class="flex-row flex--align--center"><img src="../assets/img/guid/danqingIcon.png"><span>丹青</span></div>
            <div class="fontDes">妙手绘图</div>
          </div>
        </div>
      </div>
      <div class="second flex-row flex--align--center flex--justify--between">
        <div class="xuanhu" @click="gotoPage(3)">
          <div class="infoContent flex-column flex--align--end flex--justify--center">
            <div class="flex-row flex--align--center"><img src="../assets/img/guid/xuanhuIcon.png"><span>悬壶</span></div>
            <div class="fontDes">科研健康</div>
          </div>
        </div>
        <div class="zhuanyu" @click="gotoPage(4)">
          <div class="infoContent flex-column flex--align--end flex--justify--center">
            <div class="flex-row flex--align--center"><img src="../assets/img/guid/zhuanyuIcon.png"><span>馔玉</span></div>
            <div class="fontDes">美味烹饪</div>
          </div>
        </div>
        <div class="youlian" @click="gotoPage(5)">
          <div class="infoContent flex-column flex--align--end flex--justify--center">
            <div class="flex-row flex--align--center"><img src="../assets/img/guid/youlianIcon.png"><span>优伶</span></div>
            <div class="fontDes">栩然角色</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import Header from "../components/headerGuid.vue";
import Sider from "../components/sider.vue";
import BaixiaoCard from "../components/baixiaoCard.vue"
import router from "../router";

const gotoPage = (id : number)=>{
  if(!id){
    return false;
  }
  switch (id){
    case 1:
      router.push("/application");
      break;
    case 3:
      window.open("https://homehealth.gczx.cn/", "_blank");
      break;
    case 4:
      window.open("https://health.gczx.cn/kitchen/", "_blank");
      break;
    default:
      break;
  }
}

</script>

<style lang="scss" scoped>
@mixin fontSytle{
  font-family: Source Han Sans;
  font-size: 50px;
  font-weight: bold;
  line-height: 100%;
  letter-spacing: 0em;
  font-variation-settings: "opsz" auto;
  font-feature-settings: "kern" on;
  color: #FFFFFF;
}

.guidContainer {
  width: 100%;
  height: 100%;
  background-image: url("../assets/img/newBg.png");
  background-size: 100% 100%;
  .headerGuid{
    margin-top: 32px;
    z-index: 100;
  }
  .content {
    width: 100%;
    margin-top: 55px;
    .first{
      width: 1600px;
      .baixiao{
        position: relative;
        width: 770px;
        height: 420px;
        border-radius: 32px;
        opacity: 1;
        border: 4px solid rgba(1, 126, 250, 0.2);
        background: url("../assets/img/guid/baixiao.png");
        background-size: 100% 100%;
        background-clip:padding-box;
        cursor: pointer;
      }
      .danqing{
        position: relative;
        width: 770px;
        height: 420px;
        border-radius: 32px;
        opacity: 1;
        border: 4px solid rgba(1, 126, 250, 0.2);
        background: url("../assets/img/guid/danqing.png");
        background-size: 100% 100%;
        background-clip:padding-box;
        cursor: pointer;
      }
    }
    .second{
      margin-top: 15px;
      width: 1600px;
      .zhuanyu,.youlian,.xuanhu{
        position: relative;
        width: 500px;
        height: 420px;
        border-radius: 32px;
        opacity: 1;
        border: 4px solid rgba(1, 126, 250, 0.2);
        cursor: pointer;
      }
      .zhuanyu{
        background: url("../assets/img/guid/zhuanyu.png");
        background-size: 100% 100%;
        background-clip:padding-box;
      }
      .youlian{
        background: url("../assets/img/guid/youlian.png");
        background-size: 100% 100%;
        background-clip:padding-box;
      }
      .xuanhu{
        background: url("../assets/img/guid/xuanhu.png");
        background-size: 100% 100%;
        background-clip:padding-box;
      }
    }

    .infoContent{
      position: absolute;
      box-sizing: border-box;
      height: 132px;
      width: 100%;
      background: linear-gradient(270deg, rgba(134, 115, 90, 0.3) 0%, rgba(134, 115, 90, 0) 100%);
      backdrop-filter: blur(8px);
      bottom: 32px;
      padding-right: 60px;
      @include fontSytle();
      img{
        height: 56px;
        width: 56px;
      }
      .fontDes{
        margin-top: 6px;
        font-family: Source Han Sans;
        font-size: 37.4px;
        font-weight: normal;
        line-height: 100%;
        letter-spacing: 0em;
        font-variation-settings: "opsz" auto;
        font-feature-settings: "kern" on;
        color: rgba(255, 255, 255, 0.8)
      }
    }
  }
}
</style>
