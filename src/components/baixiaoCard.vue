<template>
  <div class="cardContainer">
    <div class="baixiaoTitle" @click="gotoPage">
      <img src="../assets/img/baixiaoCard.png" />
      <div class="titleFond">百晓</div>
    </div>
    <div class="buttonContainer flex--align--center flex--justify--center">
      <div class="switchButton flex-row flex--align--center flex--justify--between">
        <div class="app" :class="{ ac_font: commentStore.showTab === false }" @click="handleClick('0')">应用</div>
        <div class="chat" :class="{ ac_font: commentStore.showTab === true }" @click="handleClick('1')">对话</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import router from "../router";
import { useHomeStore } from "../store/modules/home";
const commentStore = useHomeStore();
const gotoPage = () => {
  router.push("/application");
}

const handleClick = (name: string) => {
  if (name === "0") {
    router.push("/application");
    commentStore.showTab = false;
  } else {
    router.push("/talk");
    commentStore.showTab = true;
  }
};
</script>

<style lang="scss" scoped>
.cardContainer {
  width: 100%;
  height: 70px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(15px);
  border-top-left-radius: 8px;
  display: flex;
  align-items: center;

  .baixiaoTitle {
    width: 270px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: absolute;
    left: 104px;
    top: 50%;
    transform: translateY(-50%);

    img {
      width: 48px;
      height: 48px;
      margin-right: 12px;
    }

    .titleFond {
      font-family: Source Han Sans;
      font-size: 30px;
      font-weight: bold;
      line-height: 100%;
      letter-spacing: 0em;
      color: #07084d;
    }
  }

  .buttonContainer {
    height: 100%;
    width: 100%;
    flex: 1;
    display: flex;

    .ac_font {
      border-radius: 100px;
      height: 36px;
      opacity: 1;
      background: rgba(1, 126, 250, 0.15);
      font-weight: bold !important;
      color: #017efa !important;
    }

    .ac_font::after {
      transform: scaleX(1);
    }

    .switchButton {
      width: 248px;
      height: 36px;
      border-radius: 100px;
      opacity: 1;
      padding: 4px;
      background: #ffffff;

      .app,
      .chat {
        width: 122px;
        height: 36px;
        text-align: center;
        font-family: Source Han Sans;
        font-size: 16px;
        line-height: 36px;
        font-weight: normal;
        letter-spacing: 0em;
        font-variation-settings: "opsz" auto;
        font-feature-settings: "kern" on;
        color: #94A0AF;
        cursor: pointer;
      }
    }
  }
}
</style>
