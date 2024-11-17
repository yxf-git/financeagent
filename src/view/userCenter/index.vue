<template>
  <div class="user_center">
    <div class="tabs">
      <div class="tab tab1">
        <div
          class="tab_info"
          :class="{ active: activeName === '1' }"
          @click="handleClick('1')"
        >
          我的收藏
        </div>
      </div>
      <div class="tab">
        <div
          class="tab_info"
          :class="{ active: activeName === '2' }"
          @click="handleClick('2')"
        >
          我的创建
        </div>
      </div>
    </div>
    <div>
      <div class="app_list">
        <div
          v-for="(item, index) in categoryInfoList"
          :key="index"
          class="infoItem"
          @click="goPage('/appDetail', item)"
        >
          <div class="content_info">
            <img :src="item.icon" width="72" height="72" />
            <div style="flex: 1">
              <div class="info_title">
                <div>{{ item.appName }}</div>
                <div @click.stop="collectApp(item)">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  <script lang="ts" setup>
import { ref, onMounted } from "vue";
import router from "../../router";
import { appList, categoryList, categoryInfo } from "../../util/defineData";
import { getAssetsFiles } from "../../util/common";
import {
  GetAppList,
  SetAppCancelFavorite,
  SetAppFavorite,
} from "../../http/api";

interface Category {
  index: number;
  title: string;
  icon: string;
  url: string;
  sparkAppId: string;
  content: string;
}
const activeName = ref("1");
const categoryInfoList = ref();
const handleClick = (name: string) => {
  activeName.value = name;
  queryList(activeName.value);
};
const collectApp = async (item: any) => {
  let params = {
    appId: item.appId,
  };
  item.isFavorite == 0
    ? await SetAppFavorite(params)
    : await SetAppCancelFavorite(params);
  queryList(activeName.value);
};
const goPage = (url: string, category?: any) => {
  if (url) {
    let _route = {
      path: url,
      query: category,
    };
    // if (category?.sparkAppId) {
    //   _route.query = {
    //     sparkAppId: category.sparkAppId,
    //   };
    // }
    router.push(_route);
  }
};
onMounted(() => {
  queryList();
});
const queryList = (activeFlag?: any) => {
  const params = {
    pageSize: 10,
    pageNum: 1,
    appSearchTab: activeFlag ? activeFlag : 1,
  };
  GetAppList(params).then((data) => {
    if (data.code === 200) {
      categoryInfoList.value = data?.data?.list;
    }
  });
};
</script>
  <style scoped lang="scss" >
.user_center {
  margin: 32px 90px 30px 66px;
}
.tabs {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 0 auto;
  align-items: center;
  border-bottom: 2px solid rgba(255, 255, 255, 0.4);
  position: relative;

  .tab {
    margin: 0 80px;
    text-align: center;
  }
  .tab1::after {
    content: "";
    position: absolute;
    top: 20%;
    left: 50%;
    width: 1px;
    height: 60%;
    background-color: #94a0af;
  }
  .tab_info {
    padding: 18px 80px;
    position: relative;
    font-size: 20px;
    color: #94a0af;
    font-weight: bold;
  }

  .tab_info.active {
    color: #017efa;
    border-bottom: 2px solid #017efa;
    z-index: 1;
  }
  .tab_info::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    background-color: #017efa;
    transform-origin: left;
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  .tab_info.active::after {
    transform: scaleX(1);
  }
}

.app_list {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 50px;
  .infoItem {
    width: 23.5%;
    display: flex;
    justify-content: flex-start;
    background-color: #ffffff;
    margin-bottom: 32px;
    margin-right: 15px;
    .content_info {
      width: 100%;
      display: flex;
      justify-content: flex-start;
      margin: 24px 14px 24px 13px;
    }
    img {
      margin-right: 14px;
    }
    .info_title {
      font-family: Source Han Sans;
      font-size: 18px;
      color: #444444;
      margin-bottom: 10px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;

      img {
        width: 18.49px;
        height: 18.49px;
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
    }
  }
}
</style>
  