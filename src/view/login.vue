<template>
  <div class="bg_content">
    <img src="../assets/img/title.png" alt="" class="title" />
    <div class="content">
      <div class="left_div">
        <img src="../assets/img/loginIcon.png" alt="" class="login_icon" />
      </div>
      <div class="right_div">
        <div class="login_title">国创领域大模型应用桌面</div>
        <div class="login_form">
          <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane label="账号登录" name="first">
              <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" class="login-form">
                <el-form-item prop="userName">
                  <div class="custom-input-wrapper">
                    <el-input v-model="ruleForm.userName" placeholder="用输入用户名/手机号码/邮箱" class="input_div"></el-input>
                    <el-icon class="custom-icon">
                      <User />
                    </el-icon>
                  </div>
                </el-form-item>
                <el-form-item prop="password">
                  <div class="custom-input-wrapper">
                    <el-input v-model="ruleForm.password" :type="showPass" placeholder="请输入登录密码"
                      class="input_div"></el-input>
                    <el-icon class="custom-icon">
                      <Lock />
                    </el-icon>
                    <el-button circle @click="togglePasswordVisible" :disabled="!ruleForm.password"
                      class="password-toggle">
                      <el-icon class="icon" v-if="showPass == 'text'">
                        <View />
                      </el-icon>
                      <el-icon class="icon" v-else>
                        <Hide />
                      </el-icon>
                    </el-button>
                  </div>
                </el-form-item>
                <!-- <el-form-item prop="autoLogin">
                  <div class="auto_div">
                    <div>
                      <el-checkbox
                        label="自动登录"
                        name="autoLogin"
                        v-model="ruleForm.autoLogin"
                        class="fs14"
                      />
                    </div>
                    <div class="fs14">修改密码</div>
                  </div>
                </el-form-item> -->
                <el-form-item>
                  <el-button type="primary" class="btn" @click="submitForm(ruleFormRef)">立即登录</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="立即注册" name="second">
              <el-form ref="ruleFormRegisterRef" :model="registerForm" :rules="registerRules" class="login-form">
                <el-form-item prop="userName">
                  <div class="custom-input-wrapper">
                    <el-input v-model="registerForm.userName" placeholder="用输入用户名/手机号码/邮箱" class="input_div"></el-input>
                    <el-icon class="custom-icon">
                      <User />
                    </el-icon>
                  </div>
                </el-form-item>
                <el-form-item prop="password">
                  <div class="custom-input-wrapper">
                    <el-input v-model="registerForm.password" :type="showRegisterPass" placeholder="请输入登录密码"
                      class="input_div"></el-input>
                    <el-icon class="custom-icon">
                      <Lock />
                    </el-icon>
                    <el-button circle @click="registerPasswordVisible" :disabled="!registerForm.password"
                      class="password-toggle">
                      <el-icon class="icon" v-if="showRegisterPass == 'text'">
                        <View />
                      </el-icon>
                      <el-icon class="icon" v-else>
                        <Hide />
                      </el-icon>
                    </el-button>
                  </div>
                </el-form-item>
                <el-form-item prop="newPassword">
                  <div class="custom-input-wrapper">
                    <el-input v-model="registerForm.newPassword" :type="showRegisterSecondPass" placeholder="请再次输入密码"
                      class="input_div"></el-input>
                    <el-icon class="custom-icon">
                      <Lock />
                    </el-icon>
                    <el-button circle @click="registerPasswordSeondVisible" :disabled="!registerForm.newPassword"
                      class="password-toggle">
                      <el-icon class="icon" v-if="showRegisterSecondPass == 'text'">
                        <View />
                      </el-icon>
                      <el-icon class="icon" v-else>
                        <Hide />
                      </el-icon>
                    </el-button>
                  </div>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" class="btn"
                    @click="submitRegisterForm(ruleFormRegisterRef)">立即注册</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import {
  FormInstance,
  FormRules,
  ElIcon,
  TabsPaneContext,
  ElMessage,
} from "element-plus";
import { View, Hide, User, Lock } from "@element-plus/icons-vue";
import { Login, RegisterUser } from "../http/api";
import router from "../router";
const showPass = ref("password");
const showRegisterPass = ref("password");
const showRegisterSecondPass = ref("password");

const activeName = ref("first");
const ruleFormRef = ref<FormInstance>();
const ruleFormRegisterRef = ref<FormInstance>();

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请输入用户名/手机号码/邮箱"));
  } else {
    callback();
  }
};
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请输入登录密码"));
  } else {
    callback();
  }
};
const validatePass3 = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("输入登录密码"));
  } else if (value !== registerForm.password) {
    callback(new Error("密码输入不一致"));
  } else {
    callback();
  }
};

const ruleForm = reactive({
  userName: "",
  password: "",
  autoLogin: "",
});
const registerForm = reactive({
  userName: "",
  password: "",
  newPassword: "",
});

const rules = reactive<FormRules<typeof ruleForm>>({
  userName: [{ validator: validatePass, trigger: "blur" }],
  password: [{ validator: validatePass2, trigger: "blur" }],
});
const registerRules = reactive<FormRules<typeof registerForm>>({
  userName: [{ validator: validatePass, trigger: "blur" }],
  password: [{ validator: validatePass2, trigger: "blur" }],
  newPassword: [{ validator: validatePass3, trigger: "blur" }],
});
const togglePasswordVisible = () => {
  showPass.value = showPass.value == "password" ? "text" : "password";
};
const registerPasswordVisible = () => {
  showRegisterPass.value =
    showRegisterPass.value == "password" ? "text" : "password";
};
const registerPasswordSeondVisible = () => {
  showRegisterSecondPass.value =
    showRegisterSecondPass.value == "password" ? "text" : "password";
};
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      Login(ruleForm).then((data) => {
        if (data.code === 200) {
          ElMessage({
            message: "登录成功",
            type: "success",
          });
          localStorage.setItem("token", data.data.token);
          localStorage.setItem("userName", data.data.userName);
          localStorage.setItem("userId", data.data.userId);
          router.push("/guid");
        } else {
          ElMessage({
            message: data.message,
            type: "error",
          });
        }
      });
    } else {
      return false;
    }
  });
};

const submitRegisterForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      RegisterUser(registerForm).then((data) => {
        if (data.code === 200) {
          ElMessage({
            message: "您已注册成功，请登录",
            type: "success",
          });
          setTimeout(() => {
            activeName.value = "first";
            ruleFormRegisterRef.value?.resetFields();
          }, 300);
        } else {
          ElMessage({
            message: data.message,
            type: "error",
          });
        }
      });
    } else {
      return false;
    }
  });
};
const handleClick = (tab: TabsPaneContext, event: Event) => {
  if (activeName.value === "first") {
    ruleFormRef.value?.resetFields();
  } else {
    ruleFormRegisterRef.value?.resetFields();
  }
};
</script>
<style scoped lang="scss">
.bg_content {
  width: 100%;
  height: 100%;
  background: url("../assets/img/loginBg.png") center / 100% 100% no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .title {
    position: absolute;
    left: 84px;
    top: 44px;
    width: 453px;
    height: 68px;
  }

  .content {
    display: flex;
    justify-content: flex-start;

    .left_div {
      display: flex;
      align-items: center;
      margin-right: 26px;
    }

    .login_icon {
      width: 530px;
    }

    .right_div {
      .login_title {
        font-family: Source Han Sans;
        font-size: 40px;
        font-weight: bold;
        color: #07084d;
      }

      .login_form {
        height: 440px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.4);
        border: 1px solid;
        border-image: linear-gradient(128deg,
            rgba(255, 255, 255, 0.7) 2%,
            rgba(255, 255, 255, 0.55) 99%) 1;
        backdrop-filter: blur(20px);
        padding: 40px 100px 62px 100px;
        margin-top: 35px;
      }
    }
  }
}

::v-deep(.el-tabs__item) {
  font-family: Source Han Sans;
  font-size: 18px;
  color: #757575;
}

::v-deep(.el-tabs__item.is-active) {
  font-family: Source Han Sans;
  font-size: 18px;
  color: #409eff;
}

.login-form {
  width: 100%;
  margin-top: 10px;
}

.user {
  position: relative;
}

.input_div {
  height: 56px;
  position: relative;
  width: 400px;
  margin-bottom: 21px;
  font-size: 20px;
}

.auto_div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.fs14 {
  font-size: 14px;
  color: #757575;
}

.custom-icon {
  position: absolute;
  top: 40%;
  left: 21px;
  transform: translateY(-60%);
  color: #999;
  font-size: 20px;
}

::v-deep(.el-input__wrapper) {
  padding-left: 50px;
}

.btn {
  width: 100%;
  height: 56px;
  font-size: 18px;
}

.password-toggle {
  position: absolute;
  top: calc(56px / 2);
  right: 5px;
  transform: translateY(-50%);
  border: none;
  background-color: transparent;
  outline: none;
}

.btn {
  width: 100%;
  margin-bottom: 10px;
}

.icon {
  cursor: pointer;
}
</style>
