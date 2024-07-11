import { defineStore } from "pinia";

export const useMessageStore = defineStore("message", {
  state: () => ({
    showMessage: false, // 全局提示显示
    showLoading: true, // 全局loading显示
    messageText: "",
  }),
  actions: {
    setMessageText(data: any) {
      this.messageText = data;
      this.showMessage = true;
    },
    setShowMessage(data: boolean) {
      this.showMessage = data;
    },
    setShowLoading(data: boolean) {
      this.showLoading = data;
    }
  },
});