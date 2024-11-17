<template>
  <div class="container flex-column">
    <Header />
    <div class="content flex-row flex--justify--between flex--grow">
      <Sider />
      <div class="body flex-column">
        <BaixiaoCard />
        <div class="content_div">
          <div class="left">
            <LeftSide v-if="!homeStore.showTab" />
            <LeftTalkSide v-else />
          </div>
          <div class="right">
            <router-view :key="keys"></router-view>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import Header from "../components/header.vue";
import SideLeft from "../components/sideLeft.vue";
import LeftSide from "../view/components/leftSide.vue";
import LeftTalkSide from "../view/components/leftTalkSide.vue";
import { useHomeStore } from "../store/modules/home";
import { useRoute } from "vue-router";

const homeStore = useHomeStore();
const route = useRoute();

let keys = computed(() => {
  return route.fullPath;
});


</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  background-image: url("../assets/img/newBg.png");
  background-size: 100% 100%;

  .content {
    width: 100%;
    height: calc(100% - 70px);
  }

  .body {
    height: 100%;
  }

  .content_div {
    width: 1852px;
    height: calc(100% - 100px);
    display: flex;
    justify-content: flex-start;
    margin-top: 8px;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(8px);
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;

    .right {
      flex: 1;
      box-sizing: border-box;
      height: 100%;
      padding: 42px 20px 15px 20px;
    }
  }
}
</style>
