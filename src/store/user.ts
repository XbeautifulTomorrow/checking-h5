import { defineStore } from "pinia";
import { getLocalStore, setSessionStore, getSessionStore, removeSessionStore } from "@/utils";
import { getUserInfo, receiveGifts } from "@/services/api/user";
import { en, zhHant } from 'vuetify/locale'
import { getLang } from "@/locales/index";

const langMenu: any = {
  zh_CN: en,
  en_US: zhHant
};

interface userInterface {
  userId: number, // 用户ID
  userName: string; // 用户名
  tgId: number, // tgID
  avatar: string, // 头像
  energyAmount: number, // 能量数量
  gmcAmount: number, // GMC数量
  pointAmount: number, // 积分
  level: number, //等级
  minAmount: number, // 最小输入金额(GMC)
  maxAmount: number, // 最大输入金额(GMC)
  inviteCode: string, // 邀请码
  totalInviteAmount: number // 总返佣金额
  [x: string]: string | number | any;
}

interface logInterface {
  id: string | number, //用户ID
  userName: string, //用户名
  email: string, //邮箱
  roleId: number | string,
  ip: string, // 登录IP
  certificate: string, //用户Token
  createTime: string, // 注册时间
  tgId: number | string //tgID
}


export const useUserStore = defineStore("user", {
  state: () => ({
    locale: langMenu[getLang()],
    userInfo: {} as userInterface,
    logInfo: {} as logInterface,
    userPage: null as string | any,
    currentTime: null as string | any,
    isLogin: getLocalStore("certificate") ? true : false,
    showGift: false,
    retryCount: 5, // 登录重试次数
    loadLog: false,
  }),
  persist: {
    enabled: true,
    strategies: [
      { key: "userInfo", storage: localStorage, paths: ["userInfo"] },
      { key: "logInfo", storage: localStorage, paths: ["logInfo"] },
      { key: "retryCount", storage: sessionStorage, paths: ["retryCount"] }
    ],
  },
  actions: {
    setLogin(data: any) {
      this.logInfo = data;
      this.isLogin = true;
    },
    setLoad(data: any) {
      this.loadLog = data;
    },
    async fetchUserInfo() {
      const res = await getUserInfo({});
      if (res.code == 200) {
        this.userInfo = res.data;
      } else {
        this.logoutApi();
      }
    },
    setShowGift(data: any) {
      this.showGift = data;
    },
    setLocale(data: any) {
      this.locale = data == "en_US" ? en : zhHant;
    },
    setCurrentTime(data: any) {
      this.currentTime = data;
    },
    // 领取礼物
    fetchReceiveGifts() {
      const recommend = getSessionStore("recommend");

      if (recommend) {
        removeSessionStore("recommend");
        receiveGifts({}).then(e => {
          if (e.code == 200 && e.data) {
            // 如果可领取
            this.showGift = true;

            //刷新用户数据
            this.fetchUserInfo();
          }
        })
      }
    },
    logoutApi() {
      const invateCode = getSessionStore("invateCode");
      sessionStorage.clear();
      setSessionStore("invateCode", invateCode);

      localStorage.removeItem("logInfo");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("certificate");
      this.isLogin = false;
      this.userInfo = {} as userInterface;
      window.NavigationPreloadManager;

      if (import.meta.env.MODE != "dev") {
        if (this.retryCount >= 0) {
          window.location.href = "/";
        }

        this.retryCount--;
      }
    }
  }
});