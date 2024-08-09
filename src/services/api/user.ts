import * as http from "@/services/apiService";

/**
 * Telegram验证
 * @param params
 */
const validateToken = (params: any) => http.get("/gm-coin-server-web/tg-user/validate", params);
/**
 * Telegram登录。
 * @param params
 */
const telegramLogin = (params: any) => http.post("/gm-coin-server-web/tg-user/login", params);

/**
 * 获取用户信息
 * @param params
 */
const getUserInfo = (params: any) => http.get("/gm-coin-server-web/user/userInfo", params, { showLoading: false });

/**
 * 获取等级列表
 * @param params
 */
const getLevelList = (params: any) => http.get("/gm-coin-server-web/user-level/list", params);

/**
 * 用户升级
 * @param params
 */
const levelUpgrade = (params: any) => http.get("/gm-coin-server-web/user-level/upgrade", params);

/**
 * 邀请用户列表
 * @param params
 */
const getInviteUserList = (params: any) => http.get("/gm-coin-server-web/user/inviteUsers", params);

/**
 * 邀请排行榜
 * @param params
 */
const getInviteRankingList = (params: any) => http.get("/gm-coin-server-web/user/inviteRanking", params);

/**
 * 3base赠礼
 * @param params
 */
const receiveGifts = (params: any) => http.get("/gm-coin-server-web/user/threeBaseAssociations", params);

/**
 * 充值产品
 * @param params
 */
const getProductList = (params: any) => http.get("/gm-coin-server-web/product-info/list", params);

/**
 * 购买产品
 * @param params
 */
const buyProduct = (params: any) => http.get("/gm-coin-server-web/product-info/purchase", params);


/**
 * 查询充值状态
 * @param params
 */
const getOrderList = (params: any) => http.get("/gm-coin-server-web/order/list", params, { showLoading: false });

export {
  validateToken,
  telegramLogin,
  getUserInfo,
  getLevelList,
  levelUpgrade,
  getInviteUserList,
  getInviteRankingList,
  receiveGifts,
  getProductList,
  buyProduct,
  getOrderList
};