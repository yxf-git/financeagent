<template>
  <div class="top-card">
    <div class="left-wrap">
      <img class="title-icon" :src="getImgUrl(props.icon)" />
      <div class="title-label">{{ props.title }}</div>
    </div>
    <div class="center-wrap flex--align--center flex--justify--center">
      <div class="switch-button flex-row flex--align--center flex--justify--between">
        <div v-for="(item, index) of btnList" :key="item.key" class="switch-button-item"
          :class="{ active: activeBtnKey == item.key }" @click="handleClick(item)">{{ item.label }}
        </div>
      </div>
    </div>
    <div class="right-wrap">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, watch } from "vue";
import { getImgUrl } from "@/util/common"

defineOptions({
  name: "TopCard"
})

export type ButtonType = {
  label: string;
  key: string;
  fun?: Function
}

const props = defineProps({
  icon: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  btnList: {
    type: Array<ButtonType>,
    default: [] as Array<ButtonType>,
  },
  activeTab: {
    type: String,
    default: ""
  }
});

watch(() => props.activeTab, (n: string) => {
  if (n) {
    handleClick({
      key: n
    } as ButtonType)
  }
})

const activeBtnKey = ref(props.activeTab)

const handleClick = (btn: ButtonType) => {
  activeBtnKey.value = btn.key
  if (btn.fun) {
    btn.fun()
  }
};
</script>

<style lang="scss" scoped>
.top-card {
  width: 100%;
  height: 70px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(15px);
  border-top-left-radius: 8px;
  display: flex;
  align-items: center;

  .left-wrap {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: absolute;
    left: 104px;
    top: 50%;
    transform: translateY(-50%);

    .title-icon {
      width: 48px;
      height: 48px;
      margin-right: 12px;
    }

    .title-label {
      font-family: Source Han Sans;
      font-size: 30px;
      font-weight: bold;
      line-height: 100%;
      letter-spacing: 0em;
      color: #07084D;
    }
  }

  .center-wrap {
    height: 100%;
    width: 100%;
    flex: 1;
    display: flex;

    .active {
      border-radius: 100px;
      height: 36px;
      opacity: 1;
      background: rgba(1, 126, 250, 0.15);
      font-weight: bold !important;
      color: #017efa !important;
    }

    .active::after {
      transform: scaleX(1);
    }

    .switch-button {
      height: 36px;
      border-radius: 100px;
      opacity: 1;
      padding: 4px;
      background: #ffffff;

      .switch-button-item {
        width: 122px;
        height: 36px;
        text-align: center;
        font-family: Source Han Sans;
        font-size: 16px;
        line-height: 36px;
        font-weight: normal;
        letter-spacing: 0em;
        color: #94A0AF;
        cursor: pointer;
        user-select: none;
      }
    }
  }

  .right-wrap {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: absolute;
    right: 104px;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
