import * as http from "@/services/apiService";

/**
 * 挑战列表
 * @param params
 */
const getChallengeList = (params: any) => http.get("/GMCoin-server-web/challenge/list", params);

/**
 * 挑战详情
 * @param params
 */
const getChallengeDetails = (params: any) => http.get("/GMCoin-server-web/user-challenge/getDetails", params);

/**
 * 挑战报名
 * @param params
 */
const challengeRegistration = (params: any) => http.get("/GMCoin-server-web/user-challenge/registration", params);



export {
  getChallengeList,
  getChallengeDetails,
  challengeRegistration
};