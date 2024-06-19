import * as http from "@/services/apiService";

/**
 * Telegram登录。
 * @param params
 */
const telegramLogin = (params: any) => http.post("/GMCoin-server-web/tg-user/login", params);

/**
 * 获取用户信息
 * @param params
 */
const getUserInfo = (params: any) => http.get("/GMCoin-server-web/user/userInfo", params);

/**
 * 获取等级列表
 * @param params
 */
const getLevelList = (params: any) => http.get("/GMCoin-server-web/user-level/list", params);

/**
 * 用户升级
 * @param params
 */
const levelUpgrade = (params: any) => http.get("/GMCoin-server-web/user-level/upgrade", params);

/**
 * 邀请用户列表
 * @param params
 */
const getInviteUserList = (params: any) => http.get("/GMCoin-server-web/user/inviteUsers", params);

/**
 * 邀请排行榜
 * @param params
 */
const getInviteRankingList = (params: any) => http.get("/GMCoin-server-web/user/inviteRanking", params);

export {
  telegramLogin,
  getUserInfo,
  getLevelList,
  levelUpgrade,
  getInviteUserList,
  getInviteRankingList
};