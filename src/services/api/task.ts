import * as http from "@/services/apiService";

/**
 * 用户任务列表
 * @param params
 */
const getTaskList = (params: any) => http.get("/gm-coin-server-web/user-task/list", params);

/**
 * 完成任务
 * @param params
 */
const completeTask = (params: any) => http.post("/gm-coin-server-web/user-task/finish", params);

export {
  getTaskList,
  completeTask
};