<template>
  <div class="wrapper flex flex--justify--between" v-loading="loadingStatus" element-loading-text="分析中··· ···" element-loading-background="rgba(0, 0, 0, 0.7)">
    <div class="table">
      <el-row>
        <el-col :span="8"
          ><span class="title">用户昵称：</span>
          <span>{{ userInfo.customerName || "--" }}</span></el-col
        >
        <el-col :span="8"
          ><span class="title">品牌：</span>
          <span class="detail">{{ userInfo.brand || "--" }}</span></el-col
        >
        <el-col :span="8"
          ><span class="title">用户电话：</span>
          <span class="detail">{{ userInfo.phone || "--" }}</span></el-col
        >
      </el-row>
      <el-row>
        <el-col :span="8"
          ><span class="title">产品类型：</span>
          <span class="detail">{{ userInfo.productType || "--" }}</span></el-col
        >
        <el-col :span="8"
          ><span class="title">产品档次：</span>
          <span class="detail">{{
            userInfo.productGrade || "--"
          }}</span></el-col
        >
        <el-col :span="8"
          ><span class="title">价格段：</span>
          <span class="detail">{{ userInfo.priceRange || "--" }}</span></el-col
        >
      </el-row>
      <el-row>
        <el-col :span="12"
          ><span class="title">购机日期：</span>
          <span class="detail">{{
            userInfo.purchaseDate || "--"
          }}</span></el-col
        >
        <el-col :span="12"
          ><span class="title">销售价格：</span>
          <span class="detail">{{
            userInfo.sellingPrice || "--"
          }}</span></el-col
        >
      </el-row>
      <el-row>
        <el-col :span="24"
          ><span class="title">评价类型：</span
          ><span class="detail">{{ userInfo.rate || "--" }}</span></el-col
        >
      </el-row>
      <el-row>
        <el-col :span="2">
          <div class="flex flex--align--center flex--justify--center">
            <span class="title">好</span> <span class="title">评</span>
          </div>
        </el-col>
        <el-col :span="22">
          <div class="detail" v-html="formatGoodComment">
          </div></el-col
        >
      </el-row>
      <el-row>
        <el-col :span="2">
          <div class="flex flex--align--center flex--justify--center">
            <span class="title">差</span> <span class="title">评</span>
          </div></el-col
        >
        <el-col :span="22">
            <div class="detail" v-html="formatBadComment"> </div>
          </el-col
        >
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {onMounted, reactive, ref, computed, watch,defineProps} from "vue";
  import { useCommentAwStore } from "../../store/modules/commentAw";
  import { requestAWFormData } from "../../http/api";
  import {ElLoading} from "element-plus";

  interface IComment {
    dimension: string;
    emotion: string;
    summary: string;
}
  let props = defineProps({
    messageData:{
      type:String,
      default:""
    }
  });
  const commentAwStore = useCommentAwStore();
  let loadingStatus = ref(true);

  let userInfo = reactive({
    customerName: "", // 用户昵称
    brand: "", // 品牌
    phone: "", // 用户电话
    productType: "", // 产品类型
    productGrade: "", // 产品档次
    priceRange: "", // 价格段
    purchaseDate: "", // 购机日期
    sellingPrice: "", // 销售价格
    rate: "", // 评价类型
    goodComment: [] as IComment[], // 好评
    badComment: [] as IComment[],  // 差评
  });

  watch(
      ()=>[props.messageData],
      ()=>{
        getInfo(props.messageData);
      }
  )
  const formatGoodComment = computed(() => {
    return userInfo.goodComment && userInfo.goodComment.map(item =>{
      return `${item.dimension}: 满意  ${item.summary}`
    }).join('<br>') || '--';
    });
  const formatBadComment = computed(() => {
    return userInfo.badComment && userInfo.badComment.map(item =>{
      return `${item.dimension}: 不满意  ${item.summary}`
    }).join('<br>') || '--';
    });

  const getInfo = (data:string)=>{
    loadingStatus.value = true;
    requestAWFormData(data).then((res)=>{
      setTimeout(()=>{
        Object.assign(userInfo, res);
        loadingStatus.value = false;
      },2000)
    });
  }
  onMounted( () => {
    getInfo(props.messageData);
  });
</script>

<style lang="scss" scoped>
.wrapper {
  width: 776px;
  overflow-y: auto;
  overflow-x: hidden;
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
      min-height: 80px;
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
}
</style>
