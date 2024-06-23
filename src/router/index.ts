import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/store/user.js";
import { validateToken, telegramLogin } from "@/services/api/user";
import { setSessionStore } from "@/utils";

//1. 定义要使用到的路由组件  （一定要使用文件的全名，得包含文件后缀名）
import activity from '@/views/activity.vue';
import checkIn from '@/views/checkIn.vue';
import earn from '@/views/earn.vue';
import frens from '@/views/frens.vue';
import airdrop from '@/views/airdrop.vue';
import mine from '@/views/mine.vue';
import frensRanking from '@/views/frensRanking.vue';

//2. 路由配置
const routes = [
  {
    path: '/',
    name: 'CheckIn',
    component: checkIn
  },
  {
    path: '/activity',
    name: 'Activity',
    component: activity
  },
  {
    path: '/earn',
    name: 'Earn',
    component: earn
  },
  {
    path: '/frens',
    name: 'Frens',
    component: frens
  },
  {
    path: '/frensRanking',
    name: 'FrensRanking',
    component: frensRanking
  },
  {
    path: '/mine',
    name: 'Mine',
    component: mine
  },
  {
    path: '/airdrop',
    name: 'Airdrop',
    component: airdrop
  }
];

// 3. 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 切换页面重置滚动位置
router.afterEach(() => {
  window.scrollTo(0, 0);
});

router.onError((error) => {
  const pattern = /Loading chunk (\d)+ failed/g;
  const isChunkLoadFailed = error.message.match(pattern);
  if (isChunkLoadFailed) {
    window.location.reload();
    // router.replace(router.history.pending.fullPath);
  } else {
    console.log(error);
  }
});

router.beforeEach(async (to, from, next) => {
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  let urlParam = params.get('tgWebAppStartParam');

  if (urlParam) {
    // 保存邀请码
    setSessionStore('inviteCode', urlParam);
  }

  const userStore = useUserStore();
  if (userStore.isLogin) {
    validateToken({});

    const { Telegram } = (window as any)
    if (Telegram) {
      const { WebApp } = Telegram;
      WebApp.setHeaderColor("#FF197C")
    }
  } else {
    const { Telegram } = (window as any)
    let tg_certificate: any;
    if (Telegram) {
      const { WebApp } = Telegram;
      WebApp.setHeaderColor("#FF197C")
      tg_certificate = btoa(WebApp.initData);
      console.log(tg_certificate);
    }

    const res = await telegramLogin({
      tgEncodeStr: tg_certificate,
      inviteCode: urlParam
    });

    if (res.code == 200) {
      if (res.data.certificate) {
        localStorage.setItem("certificate", res.data.certificate);
        userStore.setLogin(res.data);
        // 加载
        userStore.fetchUserInfo();
      }
    }
  }

  next();
});

// 4. 导出router
export default router;