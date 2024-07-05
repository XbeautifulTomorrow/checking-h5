import { defineStore } from "pinia";
import { getLocalStore, setSessionStore, getSessionStore, removeSessionStore } from "@/utils";
import { getUserInfo, receiveGifts } from "@/services/api/user";
import { buyProduct } from "@/services/api/user.js";
import { en, zhHant } from 'vuetify/locale'
import { getLang } from "@/locales/index";

const langMenu: any = {
  zh_CN: en,
  en_US: zhHant
};

export interface userInterface {
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

export interface logInterface {
  id: string | number, //用户ID
  userName: string, //用户名
  email: string, //邮箱
  roleId: number | string,
  ip: string, // 登录IP
  certificate: string, //用户Token
  createTime: string, // 注册时间
  tgId: number | string //tgID
}

export interface productInfo {
  productId: number, //产品ID
  orderId: number, //订单ID
  walletAddress: number, //充值钱包地址
  publicKey: string, //地址公钥
  price: number, //产品价格
  priceCoin: string, //价格币种
  amount: number, //充值金额
  amountCoin: string, //充值币种
  remark: string //充值钱包地址_订单ID
  [x: string]: string | number | any;
}


export const useUserStore = defineStore("user", {
  state: () => ({
    locale: langMenu[getLang()],
    userInfo: {} as userInterface,
    logInfo: {} as logInterface,
    userPage: null as string | any,
    currentTime: null as string | any,
    isLogin: getLocalStore("certificate") ? true : false,
    showGift: false, // 礼物弹窗
    showRecharge: false, // 充值弹窗
    productId: null as number | string | any, // 充值产品ID
    productInfo: {} as productInfo, // 充值产品信息
    tonConnect: null as any, // 链接对象
    walletAddr: null as number | string | any,     // 钱包地址
    isConnect: false,     //链接状态
    showConfirm: false, // 确认弹窗
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
    setUserInfo(data: any) {
      this.userInfo = data;
    },
    setShowGift(data: any) {
      this.showGift = data;
    },
    setShowRecharge(data: any) {
      this.showRecharge = data;
    },
    setTonConnect(data: any) {
      this.tonConnect = data;
    },
    async setProductId(data: any) {
      this.productId = data;

      const res = await buyProduct({ productId: data });
      if (res.code == 200) {
        this.productInfo = res.data;
      }

      this.showConfirm = true;
    },
    listening(data: any) {
      if (data.isc) {
        this.isConnect = true;
        this.walletAddr = data.account;
      } else {
        this.isConnect = false;
        this.walletAddr = null;
      }
    },
    setShowConfirm(data: any) {
      this.showConfirm = data;
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
    async logoutApi() {
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
          window.location.reload();
        }

        this.retryCount--;
      }
    }
  }
});