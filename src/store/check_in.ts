import { defineStore } from "pinia";

export const useCheckInStore = defineStore("checkIn", {
  state: () => ({
    challengeId: null, // 当前挑战Id
    showRules: false, // 显示规则
  }),
  persist: {
    enabled: true,
    strategies: [
      { key: "challengeId", storage: sessionStorage, paths: ["challengeId"] },
    ],
  },
  actions: {
    setChallengeId(data: any) {
      this.challengeId = data;
    },
    setShowRules(data: any) {
      this.showRules = data;
    },
  },
});