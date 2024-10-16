import { defineStore } from "pinia";
import { challengeExpectedReturn } from "@/services/api/challenge";

export const useCheckInStore = defineStore("checkIn", {
  state: () => ({
    challengeId: null, // 当前挑战Id
    showRules: false, // 显示规则
    expectedReturn: null as number | any, // 预期收益率
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
    async fetchExpectedReturn() {
      const res = await challengeExpectedReturn({});
      if (res.code === 200) {
        this.expectedReturn = res.data;
      }
    },
  },
});