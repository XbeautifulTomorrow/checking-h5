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
 * 星星支付
 * @param params
 */
const starPayment = (params: any) => http.get("/gm-coin-server-web/product-info/starPayment", params);

/**
 * 查询充值状态
 * @param params
 */
const getOrderList = (params: any) => http.get("/gm-coin-server-web/order/list", params, { showLoading: false });

/**
 * swap 
 * @param params
 */
const transferSwap = (params: any) => http.post("/gm-coin-server-web/transfer/swap", params);

/**
 * 提币 
 * @param params
 */
const transferWithdraw = (params: any) => http.post("/gm-coin-server-web/transfer/withdraw", params);

/**
 * 提币记录
 * @param params
 */
const getWithdrawList = (params: any) => http.get("/gm-coin-server-web/transfer/record/withdrawList", params, { showLoading: false });
/**
 * 充币 
 * @param params
 */
const transferDeposit = (params: any) => http.post("/gm-coin-server-web/transfer/deposit", params);


/**
 * 充币记录
 * @param params
 */
const getDepositList = (params: any) => http.get("/gm-coin-server-web/transfer/record/depositList", params, { showLoading: false });

/**
 * 获取汇率 
 * @param params
 */
const getExchangeRate = (params: any) => http.get("/gm-coin-server-web/coin/price/exchangeRate", params, { showLoading: false });

/**
 * 获取滑点
 * @param params
 */
const getSlippage = (params: any) => http.get("/gm-coin-server-web/gmc-order/slippage", params, { showLoading: false });

/**
 * 购买GMC点数
 * @param params
 */
const purchasePoints = (params: any) => http.get("/gm-coin-server-web/gmc-order/purchase", params);
/**
 * 星星购买GMC点数
 * @param params
 */
const starPurchasePoints = (params: any) => http.get("/gm-coin-server-web/gmc-order/starPayment", params);

/**
 * 获取GMC购买 U的价格
 * @param params
 */
const getUsdPrice = (params: any) => http.get("/gm-coin-server-web/gmc-order/uPrice", params);




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
  starPayment,
  getOrderList,
  transferSwap,
  transferWithdraw,
  transferDeposit,
  getDepositList,
  getWithdrawList,
  getExchangeRate,
  getSlippage,
  purchasePoints,
  getUsdPrice,
  starPurchasePoints
};