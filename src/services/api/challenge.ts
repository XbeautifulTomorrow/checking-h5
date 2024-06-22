import * as http from "@/services/apiService";

/**
 * 挑战列表
 * @param params
 */
const getChallengeList = (params: any) => http.get("/gm-coin-server-web/challenge/list", params);

/**
 * 挑战导航
 * @param params
 */
const getChallengeNav = (params: any) => http.get("/gm-coin-server-web/challenge/nav/list", params);


/**
 * 挑战详情
 * @param params
 */
const getChallengeDetails = (params: any) => http.get("/gm-coin-server-web/user-challenge/getDetails", params);

/**
 * 挑战报名
 * @param params
 */
const challengeRegistration = (params: any) => http.post("/gm-coin-server-web/user-challenge/registration", params);

/**
 * 挑战签到
 * @param params
 */
const challengeCheckIn = (params: any) => http.post("/gm-coin-server-web/user-challenge/checkIn", params);

/**
 * 挑战补签
 * @param params
 */
const challengeReCheckin = (params: any) => http.post("/gm-coin-server-web/user-challenge/supplementary", params);
/**
 * 挑战领取
 * @param params
 */
const challengePickUp = (params: any) => http.get("/gm-coin-server-web/user-challenge/pickUp", params);

export {
  getChallengeList,
  getChallengeNav,
  getChallengeDetails,
  challengeRegistration,
  challengeCheckIn,
  challengeReCheckin,
  challengePickUp
};