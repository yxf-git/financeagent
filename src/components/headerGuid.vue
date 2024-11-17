<template>
  <div class="headContainer flex-row flex--align--center flex--justify--between">
    <div class="headLeft flex-row flex--align--center">
      <div class="headIcon" @click="gotoPage"></div>
      <div class="line"></div>
      <div class="headTitle">国创领域大模型应用桌面</div>
    </div>
    <div class="setting flex-row flex--align--center flex--justify--between">
      <div class="user"></div>
      <div class="line"></div>
      <div class="more more-button" @mouseover="showDropdown = true" @mouseout="showDropdown = false">
        <div class="dropdown" @click.stop v-show="showDropdown">
          <div class="dropdown_div">
            <div class="dropdown_list flex-column flex--align--center">
              <div class="user_name">{{ userName }}</div>
              <div @click="handleOptionClick()" class="dropdown_info">
                退出登录
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage } from "element-plus";
import { ref } from "vue";
import { LoginOut } from "../http/api";
import router from "../router";
import { useDialogueStore } from "@/store/modules/dialogue";
const dialogueStore = useDialogueStore();
const showDropdown = ref(true);
const userName = localStorage.getItem("userName") || "";
const gotoPage = () => {
  router.push("/guid");
};

const handleOptionClick = () => {
  const tonkenVal = localStorage.getItem("token");
  LoginOut(tonkenVal).then((data) => {
    console.log(data, "qqqqq");
    if (data.code === 200) {
      localStorage.setItem("token", "");
      localStorage.setItem("userName", "");
      localStorage.setItem("userId", "");
      dialogueStore.resetDialogue()
      router.replace("/login")
    } else {
      ElMessage({
        message: data.message,
        type: "error",
      });
    }
  });
};
</script>

<style lang="scss" scoped>
.headContainer {
  width: 100%;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);

  .headLeft {
    .headIcon {
      margin-left: 38px;
      height: 40px;
      width: 266px;
      background-image: url("../assets/img/item/icon.png");
      background-size: 100% 100%;
    }

    .line {
      margin-left: 12px;
      height: 12px;
      width: 1px;
      background-color: rgba(7, 8, 77, 0.3);
      opacity: 1;
    }

    .headTitle {
      margin-left: 25.5px;
      font-family: Source Han Sans;
      height: 20px;
      font-size: 20px;
      font-weight: bold;
      line-height: 20px;
      letter-spacing: 0em;
      font-variation-settings: "opsz" auto;
      font-feature-settings: "kern" on;
      color: #000000;
    }
  }

  .setting {
    margin-right: 39px;
    height: 32px;
    width: 91px;

    .user {
      height: 32px;
      width: 32px;
      background-image: url("../assets/img/user.png");
      background-size: 100% 100%;
    }

    .user_name {
      width: fit-content;
      font-size: 15px;
      color: #409eff;
    }

    .line {
      height: 14px;
      width: 1px;
      background-color: rgba(7, 8, 77, 0.2);
      opacity: 1;
    }

    .more {
      height: 32px;
      width: 32px;
      background-image: url("../assets/img/more.png");
      background-size: 100% 100%;
    }
  }
}

.more-button {
  position: relative;
}

.dropdown {
  position: absolute;
  right: -35px;
  display: none;
  z-index: 1;
  width: 200px;
  border-radius: 6px;
  color: #94a0af;
}

.dropdown_div {
  margin-top: 55px;
  background-color: #f9f9f9;
  display: flex;
  justify-content: center;
  border-radius: 10px;
}

.dropdown_list {
  padding: 10px 0 20px 0;
}

.dropdown_info {
  margin-top: 10px;
  padding: 10px 45px;
  text-align: center;
  border: 1px solid #94a0af;
  border-radius: 10px;
  background-color: #cccccc;
  color: #000000;
  font-weight: bold;
}

.more-button:hover .dropdown {
  display: block;
}
</style>
