<template>
  <div class="create_div">
    <div class="form_div">
      <p class="title">{{ title }}</p>
      <el-upload
        class="avatar-uploader"
        action="/poc/app/upload"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
      >
        <div v-if="formLabelAlign.icon" class="avatar">
          <img :src="formLabelAlign.icon" class="avatar" />
          <div class="icn_div">
            <el-icon class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </div>
        </div>
        <div v-else class="noImg">
          <img src="../../assets/img/create_icon.png" class="avatar" />
          <div class="icn_div">
            <el-icon class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </div>
        </div>
      </el-upload>
    </div>

    <el-form
      :label-position="labelPosition"
      label-width="100px"
      :model="formLabelAlign"
      :rules="rules"
      ref="ruleFormRef"
    >
      <el-form-item label="名称" prop="appName">
        <el-input
          size="large"
          v-model="formLabelAlign.appName"
          placeholder="请填写应用名称"
        />
      </el-form-item>
      <el-form-item label="分类" prop="appTypeId">
        <el-select
          v-model="formLabelAlign.appTypeId"
          placeholder="请选择"
          clearable
          class="select"
        >
          <el-option
            v-for="item in categoryData"
            :key="item.typeId"
            :label="item.typeName"
            :value="item.typeId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="应用描述" prop="description">
        <el-input
            v-model="formLabelAlign.description"
            type="textarea"
            placeholder="请输入描述~"
        />
      </el-form-item>
      <el-form-item label="应用设定" prop="appSettings">
        <el-input
          size="large"
          v-model="formLabelAlign.appSettings"
          type="textarea"
          :placeholder="descText"
        />
      </el-form-item>
      <el-form-item label="输入示例">
        <div class="example_div">
          <el-input
            v-model="formLabelAlign.examples0"
            placeholder="请填写输入示例1"
            class="example_item"
          />
          <el-input
            v-model="formLabelAlign.examples1"
            placeholder="请填写输入示例2"
            class="example_item ml15"
          />
          <el-input
            v-model="formLabelAlign.examples2"
            placeholder="请填写输入示例3"
            class="example_item ml15"
          />
        </div>
      </el-form-item>
      <el-form-item label="权限设置" prop="appAuth">
        <el-select
          v-model="formLabelAlign.appAuth"
          placeholder="请选择"
          clearable
          class="select"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          size="large"
          @click="submitForm(ruleFormRef)"
          class="btn"
          >{{ btn_title }}</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>  
    
  <script lang="ts" setup>
import { reactive, ref, defineProps, watch, onMounted, watchEffect } from "vue";
import { ElMessage, FormInstance, FormProps, FormRules } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import type { UploadProps } from "element-plus";
import router from "../../router";
import { useRoute } from "vue-router";
import { AddApp, GetAppTypeList, UpdateApp } from "../../http/api";
const route = useRoute();
const categoryData = ref();
const icon = ref();
let queryList = ref();
const ruleFormRef = ref<FormInstance>();

let formLabelAlign = reactive({
  appName: "",
  appTypeId: "",
  appSource: "",
  appSettings: "",
  examples: "",
  examples0: "",
  examples1: "",
  examples2: "",
  appAuth: "",
  icon: "",
  description:""
});
const options = [
  {
    value: "1",
    label: "公开",
  },
  {
    value: "2",
    label: "分享",
  },
  {
    value: "3",
    label: "仅自己可见",
  },
];

const title = ref("创建应用");
const btn_title = ref("创建");
const descText = ref(
  "例：作为一个天气预报员，可以通过用户提供的城市，查询当天的天气情况，并提示用户可以穿着的衣服搭配，同时给出用户正能量的鼓励和加油。 "
);
const labelPosition = ref<FormProps["labelPosition"]>("top");

const filterOption = (query:string, option:object)=>{
  console.log('query:', query)
  console.log('option:', option)
  return true
}

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      if (!icon.value) {
        ElMessage({
          message: "请上传头像",
          type: "error",
        });
        return;
      } else {
        formLabelAlign.icon = icon.value;
      }
      if (title.value == "编辑应用") {
        if (formLabelAlign.appAuth == ("公开" || "分享" || "仅自己可见")) {
          const auth = options.find(
            (item: any) => item.value == queryList.value.appAuth
          );
          formLabelAlign.appAuth = String(auth?.value);
        }
      }
      formLabelAlign.examples = [
        formLabelAlign.examples0,
        formLabelAlign.examples1,
        formLabelAlign.examples2,
      ].join(",");
      subFun(formLabelAlign);
    } else {
      return false;
    }
  });
};

const subFun = (formLabelAlign: any) => {
  if (title.value !== "编辑应用") {
    AddApp(formLabelAlign).then((data) => {
      subCallBack(data, "add");
    });
  } else {
    formLabelAlign.appId = queryList.value.appId;
    UpdateApp(formLabelAlign).then((data) => {
      subCallBack(data, "edit");
    });
  }
};
const subCallBack = (data: any, type: string) => {
  if (data.code === 200) {
    ElMessage({
      message: type === "add" ? "创建成功" : "编辑成功",
      type: "success",
    });
    router.push("/application");
  }
};

const handleAvatarSuccess: UploadProps["onSuccess"] = (
  response,
  uploadFile
) => {
  formLabelAlign.icon = response.data;
  icon.value = response.data;
};

const beforeAvatarUpload: UploadProps["beforeUpload"] = async (uploadFile) => {
  return true;
};
onMounted(() => {
  queryTypeList();
});
const queryTypeList = () => {
  GetAppTypeList().then((data) => {
    if (data.code === 200) {
      categoryData.value = data?.data.filter((item:any)=>{
        return item.typeId != "1"
      });
      if (categoryData.value) {
        const selectedOption = categoryData.value.find(
          (item: any) => item.typeId == queryList.value?.appTypeId
        );
        selectedOption ? formLabelAlign.appTypeId = selectedOption.typeId:"";
      }
    }
  });
};

watch(
  () => route.query,
  (query) => {
    if (query.appName) {
      title.value = "编辑应用";
      btn_title.value = "更新";
      queryList.value = query;
      const val = queryList.value?.examples?.split(",");
      const auth = options.find(
        (item: any) => item.value == queryList.value.appAuth
      );

      Object.assign(formLabelAlign, {
        appName: queryList?.value?.appName,
        appSource: queryList?.value?.appSource,
        appSettings: queryList.value.appSettings
          ? queryList.value?.appSettings
          : "",
        description: queryList.value.description
            ? queryList.value?.description
            : "",
        appTypeId: queryList.value.appTypeId,
        examples0: val ? val[0] : "",
        examples1: val ? val[1] : "",
        examples2: val ? val[2] : "",
        appAuth: auth?.label ? auth?.label : "",
        icon: queryList.value.icon,
      });
      icon.value = queryList.value.icon;
    }
  },
  { immediate: true }
);
const validatePassName = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请输入应用名称"));
  } else {
    callback();
  }
};
const validatePassType = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请选择分类"));
  } else {
    callback();
  }
};
const validatePassSetting = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请输入应用设定"));
  } else {
    callback();
  }
};
const validatePassAuth = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请选择权限设置"));
  } else {
    callback();
  }
};
const rules = reactive<FormRules<typeof formLabelAlign>>({
  appName: [{ validator: validatePassName, trigger: "blur" }],
  appTypeId: [{ validator: validatePassType, trigger: "blur" }],
  appSettings: [{ validator: validatePassSetting, trigger: "blur" }],
  appAuth: [{ validator: validatePassAuth, trigger: "blur" }],
});
</script>  
    
<style scoped lang="scss">
.create_div {
  width: 60%;
  margin: 0 auto;

  .title {
    font-family: Source Han Sans;
    font-size: 18px;
    color: #3d3d3d;
  }
  .example_div {
    display: flex;
    justify-content: flex-start;
    width: 100%;
    .example_item {
      width: 33%;
    }
    .ml15 {
      margin-left: 15px;
    }
  }
  .btn {
    width: 100%;
    margin-top: 20px;
  }
  .form_div {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
}
.select {
  width: 100%;
}

.avatar-uploader .avatar {
  width: 106px;
  height: 106px;
  border-radius: 50%; /* 设置为圆形头像 */
  position: relative;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #fff;
}
.icn_div {
  width: 32px;
  height: 32px;
  background-color: #017efa;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 0px;
  right: 10px;
  border: 1px solid #ddebfe;
}
.noImg {
  position: relative;
}
</style>