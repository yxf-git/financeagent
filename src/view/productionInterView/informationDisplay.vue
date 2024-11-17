<template>
  <div class="wrapper flex flex--justify--between">
    <div class="table">
      <el-row>
        <el-col :span="8"
          ><span class="title">客户名称：</span>
          <span>{{ userInfo.customerName || "--" }}</span></el-col
        >
        <el-col :span="8"
          ><span class="title">大区：</span>
          <span class="detail">{{ userInfo.region || "--" }}</span></el-col
        >
        <el-col :span="8"
          ><span class="title">电话号码：</span>
          <span class="detail">{{ userInfo.phone || "--" }}</span></el-col
        >
      </el-row>
      <el-row>
        <el-col :span="6"
          ><span class="title">月份：</span>
          <span class="detail">{{ userInfo.month || "--" }}</span></el-col
        >
        <el-col :span="6"
          ><span class="title">产品类型：</span>
          <span class="detail">{{ userInfo.productType || "--" }}</span></el-col
        >
        <el-col :span="6"
          ><span class="title">产品档次：</span>
          <span class="detail">{{
            userInfo.productGrade || "--"
          }}</span></el-col
        >
        <el-col :span="6"
          ><span class="title">价格段：</span>
          <span class="detail">{{ userInfo.priceRange || "--" }}</span></el-col
        >
      </el-row>
      <el-row>
        <el-col :span="8"
          ><span class="title">线上/线下机型：</span>
          <span class="detail">{{
            userInfo.onlineOfflineModel || "--"
          }}</span></el-col
        >
        <el-col :span="8"
          ><span class="title">新/老品：</span>
          <span class="detail">{{
            userInfo.newOldProduct || "--"
          }}</span></el-col
        >
        <el-col :span="8"
          ><span class="title">用户地址：</span>
          <span>{{ userInfo.userAddress || "--" }}</span></el-col
        > </el-row
      ><el-row>
        <el-col :span="8"
          ><span class="title">购机日期：</span>
          <span class="detail">{{
            userInfo.purchaseDate || "--"
          }}</span></el-col
        >
        <el-col :span="8"
          ><span class="title">销售价格：</span>
          <span class="detail">{{
            userInfo.sellingPrice || "--"
          }}</span></el-col
        >
        <el-col :span="8"
          ><span class="title">推荐得分：</span
          ><span class="detail">{{
            userInfo.recommendScore || "--"
          }}</span></el-col
        >
      </el-row>
      <el-row>
        <el-col :span="12"
          ><span class="title">用户出生年代：</span
          ><span class="detail">{{
            userInfo.birthDecade || "--"
          }}</span></el-col
        >
        <el-col :span="12"
          ><span class="title">用户类型：</span
          ><span class="detail">{{
            userInfo.customerAttitudeType || "--"
          }}</span></el-col
        >
      </el-row>
      <div class="problems row">
        <span class="title">问题分类：<br /></span>
        <div style="margin-top: 4px">
          <span class="detail" v-html="formatspecificReason"></span>
        </div>
      </div>
      <!-- <div class="summary row">
        <span class="title">总结：<br /></span
        ><span class="detail" v-html="formatQuestion"></span>
      </div> -->
    </div>
    <div class="bottom flex-row flex--justify--end">
      <div class="icon">
        <img src="../../assets/img/20231211/teloperator.png" alt="" />
      </div>
      <div class="operator-name">接线员：张贝贝</div>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, reactive, ref, computed } from "vue";
import { useMessageStore } from "../../store/modules/message";
import { requestFormData } from "../../http/api";

export default {
  setup() {
    const messageStore = useMessageStore();

    let userInfo = reactive({
      customerName: "",
      region: "",
      phone: "",
      month: "",
      productType: "",
      productGrade: "",
      priceRange: "",
      onlineOfflineModel: "",
      newOldProduct: "",
      userAddress: "",
      purchaseDate: "",
      sellingPrice: "",
      recommendScore: "",
      birthDecade: "",
      customerAttitudeType: "",
      specificReason: "",
      specificReasonLlm: "",
      description: "",
      descriptionLlm: "",
    });

    onMounted(async () => {
      let tempInfo = await requestFormData();
      Object.assign(userInfo, tempInfo);
    });

    const formatQuestion = computed(() => {
      let question = userInfo.description || userInfo.descriptionLlm;
      // return question.replaceAll("\n", "<br>");//条数过多会超出表单
      return userInfo.description || userInfo.descriptionLlm;
    });

    const formatspecificReason = computed(() => {
      let reason = userInfo.specificReason || userInfo.specificReasonLlm;
      console.log(userInfo.specificReasonLlm);
      return reason.replaceAll("\n", "<br>");
      // return userInfo.specificReason || userInfo.specificReasonLlm;
    });
    return {
      userInfo,
      formatQuestion,
      formatspecificReason,
    };
  },
  beforeCreate() {},
  beforeMount() {},
  components: {},
};
</script>

<style lang="scss" scoped>
.wrapper {
  width: 776px;
  height: 100%;
  box-sizing: border-box;
  opacity: 1;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  padding: 12px 40px;
  .table {
    width: 100%;
    border-left: 1px solid #94a0af;
    border-top: 1px solid #94a0af;
    .el-col {
      height: 80px;
      border-right: 1px solid #94a0af;
      border-bottom: 1px solid #94a0af;
      padding: 28px 12px;
      font-family: 思源黑体;
      font-size: 18px;
      font-weight: normal;
      letter-spacing: 0em;
      font-feature-settings: "kern" on;
      color: #3d3d3d;
      z-index: 0;
    }
    .detail {
      font-size: 18px;
      line-height: 1.5 !important;
    }
    .problems {
      //min-height: 350px;
      min-height: fit-content;
      border-right: 1px solid #94a0af;
      border-bottom: 1px solid #94a0af;
    }
    .summary {
      height: 130px;
      border-right: 1px solid #94a0af;
      border-bottom: 1px solid #94a0af;
    }
    .row {
      padding: 10px 12px;
      font-family: 思源黑体;
      font-size: 18px;
      font-weight: normal;
      line-height: 18px;
      letter-spacing: 0em;
      font-feature-settings: "kern" on;
      color: #3d3d3d;
      z-index: 0;
    }
    .title {
      color: #94a0af;
      font-size: 18px;
    }
  }
  .bottom {
    width: 100%;
    height: 60px;
    margin-top: 8px;
    .icon {
      margin-right: 4px;
      img{
        height: 20px;
        width: 20px;
      }
    }
    .operator-name {
      opacity: 1;
      font-family: 思源黑体;
      font-size: 16px;
      font-weight: normal;
      line-height: normal;
      letter-spacing: 0em;
      font-feature-settings: "kern" on;
      color: #3d3d3d;
    }
  }
}
</style>
