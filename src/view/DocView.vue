<template>
  <div class="container flex-column">
    <Header />
    <div class="content flex-row flex--justify--between flex--grow">
      <Sider />
      <div class="body flex-column flex--grow">
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import Header from "../components/header.vue";

import { useRoute } from "vue-router";

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
}

/* 渐变设置 */
.fade-enter-from,
.fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.fade-enter-active {
  transition: all 0.7s ease;
}

.fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.6, 0.6, 1);
}
</style>
