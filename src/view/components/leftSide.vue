<template>
  <div class="app_div" @scroll="handleScroll">
    <div class="app_content">
      <div class="btn_div">
        <div class="appButton active" @click="goPage('/application')">
          <div class="appIcon"></div>
          <div>应用中心</div>
        </div>
        <div
          class="flex-row flex--align--center flex--justify--center chatButton"
          @click="goPage('/createApp')"
        >
          <div class="chatIcon"></div>
          <div>创建应用</div>
        </div>
      </div>

      <div class="list_div">
        <p>最近应用</p>
        <div class="list_content" ref="listContainer">
          <div
            class="list_map flex-row flex--align--center"
            v-for="(item, index) in appDate"
            :key="index"
            @click="goPage('/appDetail', item)"
          >
            <img :src="item.icon"/>
            <div class="ml5">
              <div class="title">{{ item.appName }}</div>
              <div class="list_info">{{ item.content }}</div>
            </div>
            <div class="del_btn" @click.stop="delInfo(item)">
<!--              <el-icon>-->
<!--                <Delete />-->
<!--              </el-icon>-->
            </div>
          </div>
          <!-- 加载更多提示 -->
          <div v-if="isLoading" class="load-more">加载中...</div>
          <!-- 没有更多数据提示 -->
          <div
            v-if="appDate.length > 0 && !isLoading && !hasMore"
            class="no-more"
          >
            没有更多数据
          </div>
        </div>
      </div>
    </div>
  </div>
</template>  
  
  <script setup lang="ts">
import { ElMessage } from "element-plus";
import { onMounted, ref, watch } from "vue";
import { DelDialoApp, GetRecentList } from "../../http/api";
import router from "../../router";
import { useHomeStore } from "../../store/modules/home";
import { Delete } from "@element-plus/icons-vue";

const commentStore = useHomeStore();
interface AppItem {
  icon: string;
  appName: string;
  content: any;
}
const appDate = ref<AppItem[]>([]);
const isLoading = ref(false);
const total = ref(0);
const hasMore = ref(true); // 假设一开始还有更多数据可以加载
const listContainer = ref(null as null | HTMLElement);

const goPage = (url: string, category?: any) => {
  if (url) {
    let pathUrl;
    let params = {};
    if (category?.appSource == 31) {
      pathUrl = "/productionInterview";
    } else if (category?.appSource == 32) {
      pathUrl = "/aw";
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
const delInfo = (info: any) => {
  DelDialoApp(info.id).then(async (data) => {
    if (data.code === 200) {
      ElMessage({
        message: "删除成功",
        type: "success",
      });
      await query();
    } else {
      ElMessage({
        message: data.message,
        type: "error",
      });
    }
  });
};

const loadMore = async () => {
  if (isLoading.value || !hasMore.value) return;
  isLoading.value = true;

  try {
    const response = await GetRecentList({
      pageSize: 10,
      type: 1,
      pageNum: total.value > 10 ? Math.ceil(appDate.value.length / 10) + 1 : 1,
    });

    if (response.code === 200 && response.data?.list.length > 0) {
      total.value = response.data.total;
      appDate.value = appDate.value.concat(response.data.list);
    } else {
      hasMore.value = false; // 没有更多数据了
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    isLoading.value = false;
  }
};

const query = async () => {
  try {
    const response = await GetRecentList({
      pageSize: 10,
      type: 1,
      pageNum: 1,
    });

    if (response.code === 200 && response.data?.list?.length > 0) {
      total.value = response.data.total;
      appDate.value = response.data.list;
    } else {
      total.value = 0;
      appDate.value = [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const handleScroll = (event: Event) => {
  const { scrollTop, scrollHeight, clientHeight } = event.target as HTMLElement;
  if (scrollTop + clientHeight >= scrollHeight) {
    // 滚动到底部，加载更多
    if (10 > total.value) {
      return;
    }
    loadMore();
  }
};

onMounted(() => {
  // 初始加载数据
  loadMore();

  // 监听滚动事件
  listContainer.value?.addEventListener("scroll", handleScroll);

  // 组件卸载时移除滚动事件监听
  return () => {
    listContainer.value?.removeEventListener("scroll", handleScroll);
  };
});
watch(
  () => commentStore.changeApp,
  () => {
    query();
  },
  { deep: true }
);
</script>  
  
  <style scoped lang="scss" >
.app_div {
  margin: 30px 0;
  height: calc(100% - 60px);
  border-right: 1px solid rgba(1, 126, 250, 0.3);
  display: flex;
  flex-direction: column;
  width: 275px;
  padding: 0 28px;
  .app_content {
    flex: 1;
  }
  .btn_div {
    padding-top: 12px;
  }
  .list_div {
    margin-top: 46px;
    width: 100%;
    p {
      color: #333;
      font-size: 16px;
      padding-bottom: 14.5px;
      border-bottom: 1px solid rgba(51, 51, 51, 0.2);
      margin-bottom: 20px;
    }
    .list_content {
      width: 100%;
      max-height: 53vh;
      overflow-y: auto;
      margin-bottom: 30px;
    }
  }
  .list_map {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 36px;
    position: relative;
    cursor: pointer;
    img{
      height: 43px;
      width: 43px;
      border-radius: 6px;
    }
  }
  .list_map:hover{
    .del_btn{
      display: block;
    }
    //width: 100%;
    //height: 68px;
    //background: rgba(255, 255, 255, 0.3);
  }
}
.title {
  line-height: 16px;
  font-size: 16px;
  color: #444444;
  font-weight: bold;
  margin-bottom: 10px;
}
.list_info {
  width: 190px;
  line-height: 14px;
  font-size: 14px;
  color: #94a0af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ml5 {
  margin-left: 5px;
}

.appButton {
  cursor: pointer;
  background: #017efa;
  width: 100%;
  height: 48px;
  border-radius: 8px;

  font-family: 思源黑体;
  font-size: 20px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;

  .appIcon {
    height: 24px;
    width: 24px;
    background-image: url("../../assets/img/appIcon.png");
    background-size: 100% 100%;
    margin-right: 10px;
  }
}
.chatButton {
  width: 100%;
  cursor: pointer;
  margin-top: 24px;
  border-radius: 8px;
  background: rgba(1, 126, 250, 0.2);
  width: 100%;
  height: 48px;
  font-family: 思源黑体;
  font-size: 20px;
  font-weight: normal;
  box-sizing: border-box;
  border: 1px solid #017efa;
  color: #017efa;

  .chatIcon {
    height: 22px;
    width: 22px;
    background-image: url("../../assets/img/chatIcon.png");
    background-size: 100% 100%;
    margin-right: 10px;
  }
}
.del_btn {
  display: none;
  color: #838c98;
  top: 0;
  right: 0;
  font-size: 18px;
  height: 22px;
  width: 22px;
  background: url("../../assets/img/item/delete.png");
  background-size: 100% 100%;
}

.load-more {
  text-align: center;
  padding: 10px;
  background-color: #f5f5f5;
}

.no-more {
  text-align: center;
  padding: 10px;
  color: #999;
}
</style>
  