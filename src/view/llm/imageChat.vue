<template>
  <div class="imageContainer flex-row">
    <div class="chatContainer flex-column flex--align--center">
      <div class="chatBody" ref="scrollWrap">
        <top></top>
        <template v-for="(item, index) in chatLog" :key="index">
          <div class="flex-row flex--justify--end">
            <div class="userContent" v-if="item.type == 'user'">
              {{ item.content }}
            </div>
          </div>
          <div class="flex-row flex--justify--start">
            <div class="chatContent" v-if="item.type == 'robot'">
              {{ item.content }}
            </div>
          </div>
        </template>
        <div class="flex-row flex--justify--start" v-if="isInputDisabled">
          <div class="chatContent">
            {{ messageStore.mulCurrentLog || "请稍等..." }}
          </div>
        </div>
      </div>
      <div class="chatInput flex-row flex--align--center">
        <el-input
          v-model="inputStr"
          :autosize="{ minRows: 1, maxRows: 4 }"
          class="input_textarea"
          type="textarea"
          :disabled="isInputDisabled"
        />
        <el-button
          plain
          class="send_btn"
          :style="calcSendBtnStyle"
          :disabled="isInputDisabled"
          :icon="Promotion"
          @click="send"
        />
      </div>
    </div>
    <div class="imageBody flex-column">
      <div class="imgContainer">
        <div class="llmModel">
          <div class="llmTitle">LLM 选择:</div>
          <el-radio-group v-model="llmModelType" @change="modelChange">
            <template v-for="(item, index) in LLMMODEL" :key="index">
              <el-radio :label="item.name">{{ item.nickName }}</el-radio>
            </template>
          </el-radio-group>
        </div>
        <!--        <div class="llmModel">-->
        <!--          <div class="llmTitle">是否保留记录:</div>-->
        <!--          <el-radio-group v-model="logType">-->
        <!--            <el-radio label="retain">保留</el-radio>-->
        <!--            <el-radio label="single">单一</el-radio>-->
        <!--          </el-radio-group>-->
        <!--        </div>-->
        <div class="flex-row flex--justify--center imgShow">
          <img :src="messageStore.imgurl" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  reactive,
  ref,
  toRefs,
  watch,
  onUnmounted,
  onMounted,
} from "vue";
import { Promotion, Close } from "@element-plus/icons-vue";
import { UploadFilled } from "@element-plus/icons-vue";
// import type , { UploadFile ,UploadFiles} from 'element-plus'
import { LLMMODEL, Llama } from "../../util/defineData";
import { useMessageStore } from "../../store/modules/message";
import { chatLogToString, chatLogToString2 } from "../../util/common";
import top from "./top.vue";
import { provide } from "vue";
const messageStore = useMessageStore();

let isInputDisabled = ref(false);
let inputStr = ref();
let scrollWrap = ref();
let promptValue = ref(
  "你是一个识图高手并且乐于助人，善良，诚实，擅长写作，并且从不忘记立即准确地回答任何请求。"
);
let llmModelType = ref("llamaChinese");
//显示chat记录
let chatLog = reactive([{}]);
//llamaCpp聊天记录
let llamaCppLog = ref("");
//是否保留历史
let logType = ref("retain");
//图片列表
let imageList = reactive([]);
let imageChoseResult = ref();

watch(
  () => [chatLog, messageStore.mulCurrentLog],
  () => {
    nextTick(() => {
      console.log(
        "heignt :" +
          scrollWrap.value.scrollHeight +
          " clientHeight :" +
          scrollWrap.value.clientHeight +
          "scrollTop :" +
          scrollWrap.value.scrollTop
      );
      console.log(
        scrollWrap.value.clientHeight < scrollWrap.value.scrollHeight
      );
      if (
        scrollWrap.value &&
        scrollWrap.value.clientHeight < scrollWrap.value.scrollHeight
      ) {
        scrollWrap.value.scrollTop = scrollWrap.value.scrollHeight;
        console.log(
          "heignt :" +
            scrollWrap.value.scrollHeight +
            " clientHeight :" +
            scrollWrap.value.clientHeight +
            "scrollTop :" +
            scrollWrap.value.scrollTop
        );
      }
    });
  },
  { deep: true }
);

onMounted(() => {
  window.addEventListener("keydown", handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyPress);
});

const handleKeyPress = (e) => {
  if (e.keyCode == 13 && !isInputDisabled.value) {
    send();
  }
};

const calcSendBtnStyle = computed(() => {
  return {
    color: isInputDisabled.value ? "#a8abb2" : "#017efa",
    background: isInputDisabled.value
      ? "rgba(255, 255, 255, 0.5)"
      : "rgba(1, 126, 250, 0.1)",
  };
});

const modelChange = () => {
  console.log("this is model change");
  chatLog.length = 0;
};

const send = () => {
  // console.log(scrollWrap.value)
  // return  false;
  console.log(inputStr);
  if (!inputStr.value || !messageStore.imgBase64) {
    return false;
  }

  //防止对话过多
  if (chatLog.length > 20) {
    chatLog = chatLog.slice(2);
  }

  isInputDisabled.value = true;
  let message = inputStr.value;
  chatLog.push({
    type: "user",
    content: message,
  });
  inputStr.value = "";

  if (llmModelType.value == "llamaChinese") {
    console.log(
      "this is chinese chat log",
      promptValue.value + chatLogToString(chatLog)
    );
    messageStore
      .getMuChat({
        message:
          promptValue.value +
          (logType.value == "retain" ? chatLogToString(chatLog) : message),
        image_data: messageStore.imgBase64,
      })
      .then((res) => {
        chatLog.push({
          type: "robot",
          content: res,
        });
        isInputDisabled.value = false;
      });
  } else if (llmModelType.value == "llamaCpp") {
    let params = Llama;
    llamaCppLog.value = "USER:[img-10]" + message;
    params.prompt =
      promptValue.value +
      (logType.value == "retain" && chatLog.length > 1
        ? chatLogToString2(chatLog) + "\n" + llamaCppLog.value + "\nASSISTANT:"
        : "\n" + llamaCppLog.value + "\nASSISTANT:");
    params.image_data[0] = {
      data: messageStore.imgBase64,
      id: 10,
    };
    //请求接口todo
    messageStore.getMuChatOther(params).then((res) => {
      chatLog.push({
        type: "robot",
        content: res,
      });
      isInputDisabled.value = false;
    });
  }
};

const reset = () => {
  messageStore.imgurl = "";
  messageStore.imageList.length = 0;
  messageStore.imageChoseResult = "";
  messageStore.imgBase64 = "";
  isInputDisabled.value = false;
  if (logType.value !== "retain") {
    chatLog.length = 0;
  }
};

provide("reset", reset);
</script>

<style scoped lang="scss">
@mixin titleCommon {
  font-family: Source Han Sans;
  font-size: 16px;
  font-weight: bold;
  line-height: normal;
  letter-spacing: 0em;
  font-feature-settings: "kern" on;
  color: #838c98;
}
.imageContainer {
  width: 100%;
  .chatContainer {
    width: calc(100% - 912px);
    height: calc(100% - 68px);
    padding: 16px 24px;
    .chatBody {
      overflow: scroll;
      margin: 10px 0;
      border-radius: 8px;
      padding: 0 10px;
      width: 100%;
      height: 794px;
      // background-color: rgba(255, 255, 255, 0.3);
      .userContent {
        float: right;
        margin-top: 32px;
        padding: 15px 20px;
        border-radius: 8px 8px 0px 8px;
        height: fit-content;
        width: fit-content;
        font-family: 思源黑体;
        font-size: 18px;
        font-weight: normal;
        line-height: 18px;
        letter-spacing: 0em;
        font-feature-settings: "kern" on;
        color: #ffffff;
        background: #017efa;
      }
      .chatContent {
        float: left;
        margin-top: 32px;
        padding: 15px 20px;
        border-radius: 8px 8px 8px 0px;
        height: fit-content;
        width: fit-content;
        font-family: 思源黑体;
        font-size: 18px;
        font-weight: normal;
        line-height: 160%;
        letter-spacing: 0em;
        font-feature-settings: "kern" on;
        color: #3d3d3d;
        background: #ffffff;
      }
    }
    .chatInput {
      margin-top: 15px;
      width: 100%;
      border-radius: 8px;
      background-color: #ffffff;
      height: 56px;
      .input_textarea {
        margin-right: 12px;
      }
      :deep(.el-textarea) {
        width: 90%;
      }

      :deep(.el-textarea__inner) {
        background-color: transparent;
        height: 66px;
        line-height: 16px;
        font-size: 16px;
        border: none;
        box-shadow: none;
        overflow: hidden;
      }
      .send_btn {
        width: 40px;
        height: 40px;
        font-size: 20px;
        border-radius: 8px;
      }
    }
  }
  .imageBody {
    width: 912px;
    padding: 24px 40px;
    background: rgba(255, 255, 255, 0.6);
    height: calc(100% - 114px);
    margin-top: 16px;
    margin-bottom: 16px;
    .llmModel {
      width: 400px;
      margin-bottom: 5px;
      .llmTitle {
        @include titleCommon;
      }
    }
    .promptContent {
      width: 90%;
      margin-bottom: 20px;
      .promptTitle {
        margin-bottom: 8px;
        @include titleCommon;
      }
    }

    .imgUpload {
      width: 90%;
    }
    .imgShow {
      margin-top: 20px;
      width: 100%;
      img {
        max-width:100%;
        height: 700px;
        object-fit: contain;
      }
    }
    .imageChose {
      width: 95%;
    }
  }
}
</style>
