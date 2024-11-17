<template>
  <div class="sideContainer flex-column flex--align--center">
    <div class="itemList" v-for="(item, index) in dataList" :key="index">
      <div class="itemInfo flex-column flex--align--center" @click="gotoPage(item, index)">
        <div class="itemIcon">
          <img :src="homeStore.selectedTag == index ? getAssetsFiles(item.selectedIcon) : getAssetsFiles(item.icon)">
        </div>
        <div class="itemTitle" :class="homeStore.selectedTag == index ? 'ac_title' : ''">
          {{ item.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import router from "../router";
import { ref, watch } from "vue";
import { getAssetsFiles } from "../util/common";
import { useHomeStore } from "../store/modules/home";
const homeStore = useHomeStore();

//index: 0百晓 1文档 2数据 3丹青 4悬壶 5馔玉 6优伶
let dataList = ref([
  {
    title: "百晓",
    icon: "baixiaoIcon.png",
    selectedIcon: "baixiao.png",
    url: "/application"
  },
  {
    title: "文档",
    icon: "wendangIcon.png",
    selectedIcon: "wendang.png",
    url: "/doc"
  },
  {
    title: "数据",
    icon: "shujuIcon.png",
    selectedIcon: "shuju.png",
    url: "",
  },
  {
    title: "丹青",
    icon: "danqingIcon.png",
    selectedIcon: "danqing.png",
    url: ""
  },
  {
    title: "悬壶",
    icon: "xuanhuIcon.png",
    selectedIcon: "xuanhu.png",
    url: "xuanhu"
  },
  {
    title: "馔玉",
    icon: "zhuanyuIcon.png",
    selectedIcon: "zhuanyu.png",
    url: "zhuanyu"
  },
  {
    title: "优伶",
    icon: "youlianIcon.png",
    selectedIcon: "youlian.png",
    url: ""
  }
])

const gotoPage = (item: any, index: number) => {
  if (!item || !item.url) {
    console.warn("缺少对应模块")
    return;
  }
  if (item.url == "xuanhu") {
    window.open("https://homehealth.gczx.cn/", "_blank");
    return
  }
  if (item.url == "zhuanyu") {
    window.open("https://health.gczx.cn/kitchen/", "_blank");
    return
  }

  homeStore.selectedTag = index
  router.replace(item.url);
}

watch(() => router.currentRoute.value.path, (n) => {
  if (n) {
    const _index = dataList.value.findIndex(item => item.url == n)
    if (_index > -1) {
      homeStore.selectedTag = _index
    }
  }
}, { immediate: true });

</script>

<style lang="scss" scoped>
.sideContainer {
  padding-top: 30px;
  height: 100%;
  width: 68px;
  flex-shrink: 0;

  .itemList {
    .itemInfo {
      margin-bottom: 50px;
      cursor: pointer;

      .itemIcon {
        height: 36px;
        width: 36px;

        img {
          height: 36px;
          width: 36px;
        }
      }

      .itemIcon:hover {
        height: 36px;
        width: 36px;
        border-radius: 6px;
        opacity: 1;
        background: rgba(255, 255, 255, 0.5);
      }

      .itemTitle {
        margin-top: 10px;
        font-family: Source Han Sans;
        font-size: 16px;
        font-weight: normal;
        line-height: 100%;
        letter-spacing: 0em;
        font-variation-settings: "opsz" auto;
        font-feature-settings: "kern" on;
        color: #017EFA;
      }

      .ac_title {
        font-weight: bold;
      }
    }
  }
}
</style>
