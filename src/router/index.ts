import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/login",
    name: "Home",
    component: () => import("../view/Home.vue"),
    children: [
      {
        path: "index",
        name: "Index",
        component: () => import("../view/Index.vue"),
      },
      {
        path: "productionInterview",
        name: "ProductionInterview",
        component: () => import("../view/productionInterView/Index.vue"),
      },
      {
        path: "imagellm",
        name: "Imagellm",
        component: () => import("../view/llm/imageChat.vue"),
      },
      {
        path: "comment",
        name: "Comment",
        component: () => import("../view/commentAW/Index.vue"),
      },
      {
        path: "aw",
        name: "Aw",
        component: () => import("../view/awAnalysis/Index.vue"),
      },
      {
        path: "sparkApp",
        name: "SparkApp",
        component: () => import("../view/sparkApp/Index.vue"),
      },
      {
        path: "application",
        name: "Application",
        component: () => import("../view/application/index.vue"),
      },
      {
        path: "createApp",
        name: "CreateApp",
        component: () => import("../view/application/createApp.vue"),
      },
      {
        path: "appDetail",
        name: "AppDetail",
        component: () => import("../view/application/details/index.vue"),
      },
      {
        path: "userCenter",
        name: "UserCenter",
        component: () => import("../view/userCenter/index.vue"),
      },
      {
        path: "talk",
        name: "Talk",
        component: () => import("../view/talks/index.vue"),
      },
      {
        path: "talkDetail",
        name: "TalkDetail",
        component: () => import("../view/talks/details/index.vue"),
      },
      {
        path: "calendar",
        name: "calendar",
        component: () => import("../view/calendar/Index.vue"),
      },
    ],
  },
  {
    path: "/doc",
    redirect: "/doc/documentMaster",
    name: "Document",
    component: () => import("../view/DocView.vue"),
    children: [
      {
        path: "documentMaster",
        name: "DocumentMaster",
        component: () => import("../view/documentMaster/index.vue"),
      },
    ]
  },
  {
    path: "/guid",
    name: "Guid",
    component: () => import("../view/Guid.vue"),
  },
  {
    path: "/login", // 新增的登录页面路由
    name: "Login",
    component: () => import("../view/login.vue"), // 假设你的登录页面组件名为Login.vue
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
