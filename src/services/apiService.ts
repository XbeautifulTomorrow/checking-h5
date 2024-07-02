import axios from "axios";
import { useUserStore } from "@/store/user.js";
import config from "./env";
import { useMessageStore } from "@/store/message.js";
import { getLocalStore } from "@/utils";
const axiosInstance = axios.create({
  baseURL: config.api,
  withCredentials: true,
  timeout: 300000,
});

// 希望控制报错信息，就把接口地址写这里
const notMessage: any = [];

axiosInstance.interceptors.request.use(
  (config: any) => {
    if (getLocalStore("certificate")) {
      config.headers.certificate = getLocalStore("certificate");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {

    const { setMessageText } = useMessageStore();
    setMessageText("Network is unstable, please check your network.");

    return Promise.reject(error);
  }
);

const handleRes = ({ response, url, data }: any) => {

  // 取得服务器时间
  const { setCurrentTime } = useUserStore();
  if (data && data.localDateTime) {
    setCurrentTime(data.localDateTime);
  }
  if (data.code === 200 || data.status === 200) {
    return data;
  } else if (data.code === 20011) {
    const { logoutApi } = useUserStore();
    logoutApi();
    return [false, data.code, data];
  } else {
    if (!notMessage.includes(url)) {
      const { setMessageText } = useMessageStore();
      setMessageText(data.message);
    }

    if (notMessage.includes(url)) {
      return response;
    } else {
      return [false, data.code, data];
    }
  }
};

export async function post(url: any, params: object, config = {}) {
  try {
    const res = await axiosInstance.post(url, params, config);
    return handleRes({
      response: res,
      url,
      data: res.data,
    });
  } catch (err: any) {
    console.warn(err);
    err.message = "error";
    return err;
  }
}

export async function get(url: any, params: object) {
  try {
    const res = await axiosInstance.get(url, { params });
    return handleRes({
      response: res,
      url,
      data: res.data,
    });
  } catch (err: any) {
    console.warn(err);
    err.message = "error";
    return err;
  }
}