<template>
  <div>
    <AppList />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import router from "../../router";
import { appList, categoryList, categoryInfo } from "../../util/defineData";
import { getAssetsFiles } from "../../util/common";
import AppList from "./appList.vue";
import { useHomeStore } from "../../store/modules/home";

const appDate = ref();
const categoryData = ref();
const showTab = ref(0);
const listInfo = ref("");
const editInfo = ref();
appDate.value = appList;
categoryData.value = categoryList;
const homeStore = useHomeStore();
onMounted(() => {
  homeStore.showTab = false
})

const toggleTab = (value: number, item?: any) => {
  showTab.value = value;
  if (item) {
    listInfo.value = item;
  }
};
const editChange = (item: any) => {
  showTab.value = 1;
  editInfo.value = item;
};
const btnChange = () => {
  showTab.value = 3;
};
</script>

<style scoped lang="scss"></style>
