<template>
  <div class="create_div">
    <div class="category">
      <div class="flex-row flex--justify--start">
        <div
            v-for="(item, index) in categoryData"
            :key="index"
            @click="onHover(index, item.typeId)"
            class="item"
            :class="activeFlag == index ? 'itemActive' : ''"
        >
          {{ item.typeName }}
        </div>
      </div>
      <div class="search-container ml100">
        <el-input v-model="searchInput" placeholder="搜索应用" class="search">
          <template #prepend>
            <el-button :icon="Search" @click="search()" />
          </template>
        </el-input>
        <span class="user_btn" @click="goPage('/userCenter')">我的</span>
      </div>
    </div>
    <div class="app_list">
      <div
        v-for="(item, index) in categoryInfoList"
        :key="index"
        class="infoItem"
        @click="goPage('/appDetail', item)"
      >
        <div class="content_info">
          <img :src="item.icon" />
          <div class="list_content">
            <div class="info_title">
              <div class="title">{{ item.appName }}</div>
              <div @click.stop="collectApp(item)" class="btn">
                <img
                  src="../../assets/img/collect.png"
                  width="18.49"
                  height="18.49"
                  v-if="item.isFavorite !== '0'"
                />
                <img
                  src="../../assets/img/collectNo.png"
                  width="18.49"
                  height="18.49"
                  v-else
                />
              </div>
            </div>
            <div class="info_content">{{ item.description }}</div>
            <div class="del_btn" @click.stop="delInfo(item)">
              <el-icon>
                <Delete />
              </el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="page_btn">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :hide-on-single-page="flag"
        layout="  prev, pager,next"
        :total="total"
        :background="flag"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :customLocale="customLocale"
      />
    </div>
  </div>
</template>
  
  <script setup lang="ts">
import { ref, defineEmits, onMounted } from "vue";
import router from "../../router";
import { Star, Search, Delete } from "@element-plus/icons-vue";

import {
  DelApp,
  GetAppList,
  GetAppTypeList,
  SetAppCancelFavorite,
  SetAppFavorite,
} from "../../http/api";
import { ElMessage } from "element-plus";
const customLocale = {
  go: "前往", // 自定义跳转文字
  pageClassifier: "", // 自定义页码文字，例如 '页'
};
const flag = ref(true);
const currentPage = ref(1);
const pageSize = ref(16);
const total = ref(0);
const emit = defineEmits(["btnChange"]);
const categoryData = ref();
let activeFlag = ref(0);
let activeInfo = ref();
const searchInput = ref();
const categoryInfoList = ref();
const btnChange = () => {
  emit("btnChange", "userCnter");
};
const goPage = (url: string, category?: any) => {
  if (url) {
    let pathUrl;
    let params = {};
    if (category?.appSource == 30) {
      pathUrl = "/aw";
    } else if (category?.appSource == 31) {
      pathUrl = "/productionInterview";
    } else if (category?.appSource == 32) {
      pathUrl = "/comment";
    } else if (category?.appSource == 33) {
      pathUrl = "/calendar";
    } else {
      pathUrl = url;
      params = category;
    }
    let _route = {
      path: pathUrl,
      query: params,
    };
    router.push(_route);
  }
};
const onHover = (index: number, typeId: number) => {
  activeFlag.value = index;
  activeInfo.value = typeId;
  queryList(typeId);
};
const delInfo = (info: any) => {
  DelApp(info.appId).then((data) => {
    if (data.code === 200) {
      ElMessage({
        message: "删除成功",
        type: "success",
      });
      queryList();
    } else {
      ElMessage({
        message: data.message,
        type: "error",
      });
    }
  });
};
// 收藏应用
const collectApp = async (item: any) => {
  // 收藏
  let params = {
    appId: item.appId,
  };
  item.isFavorite == 0
    ? await SetAppFavorite(params)
    : await SetAppCancelFavorite(params);
  queryList(activeInfo.value);
};
// 搜索有应用
const search = () => {
  queryList();
};
onMounted(() => {
  queryTypeList();
  queryList();
});
const queryList = (activeFlag?: any) => {
  const params = {
    pageSize: pageSize.value,
    pageNum: currentPage.value,
    appName: searchInput.value,
    appTypeId: activeFlag ? activeFlag : 0,
  };
  GetAppList(params).then((data) => {
    console.log(8888,data)
    if (data.code === 200) {
      if (data.data) {
        categoryInfoList.value = data?.data?.list;
        total.value = data.data.total;
      } else {
        total.value = 0;
        categoryInfoList.value = [];
      }
    }
  });
};
const queryTypeList = () => {
  GetAppTypeList().then((data) => {
    if (data.code === 200) {
      categoryData.value = data?.data;
    }
  });
};
const handleSizeChange = (val: number) => {
  queryList(activeInfo.value);
};
const handleCurrentChange = (val: number) => {
  queryList(activeInfo.value);
};
</script>
  
 <style scoped lang="scss" >
.create_div {
  margin: 0px 52px 17px 44px;
}
.category {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  .item {
    text-align: center;
    padding: 7.5px 36px;
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    font-size: 20px;
    color: #94A0AF;
    margin-right: 20px;
    margin-bottom: 14px;
    cursor: pointer;
  }
  .itemActive {
    color: #ffffff !important;
    background: #017efa !important;
  }
  .item:hover{
    color: #017EFA;
  }
}
.list_content {
  flex: 1;
  position: relative;
}
.del_btn {
  display: none;
  position: absolute;
  right: 15px;
  bottom: 0px;
  font-size: 14px;
  color: #838c98;
}
.list_content:hover{
  .del_btn{
    display: block;
  }
}

.input_div {
  width: 120px;
  height: 44px;
  line-height: 44px;
}
.ml100 {
  //margin-left: 137px;
}
.search {
  width: 160px;
  height: 40px;
  border-radius: 50px;
  overflow: hidden;
  margin-top: -10px;
}

.el-input__wrapper.is-focus {
  border: none;
  box-shadow: none;
}
.user_btn {
  font-family: 思源黑体;
  font-size: 20px;
  color: #94a0af;
  margin-left: 15px;
  margin-top: -10px;
  padding-left: 15px;
  display: inline-block;
  border-left: 1px solid rgba(255, 255, 255, 0.4);
  cursor: pointer;
}
.app_list {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  column-gap: 0px;
  width: 100%;
  margin-top: 50px;
  height: 620px;
  align-content:flex-start;
  .infoItem:hover{
    border: 2px solid #017EFA;
    backdrop-filter: blur(8px);
  }
  .infoItem {
    width: 326px;
    display: flex;
    justify-content: flex-start;
    background-color: #ffffff;
    border: 2px solid #ffffff;
    backdrop-filter: blur(8px);
    height: 120px;
    margin-bottom: 32px;
    border-radius: 6px;
    margin-right: 15px;
    cursor: pointer;
    .content_info {
      width: 100%;
      display: flex;
      justify-content: flex-start;
      margin: 24px 14px 24px 13px;
      img{
        height: 68px;
        width: 68px;
        border-radius: 6px;
      }
    }
    img {
      margin-right: 14px;
    }
    .info_title {
      font-family: Source Han Sans;
      font-size: 18px;
      font-weight: bold;
      color: #444444;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      .title {
        max-width: 150px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .btn {
        img {
          width: 18.49px;
          height: 18.49px;
        }
      }
    }
    .info_content {
      font-size: 14px;
      color: #94a0af;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      margin-top: 10px;
    }
  }
}
.page_btn {
  display: flex;
  justify-content: flex-end;
  margin-right: 17px;
}
.search-container {
  display: flex;
  align-items: center;
}
</style>
  