import { defineStore } from "pinia";

export const useCheckInStore = defineStore("checkIn", {
  state: () => ({
    challengeId: null // 当前挑战Id
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
  },
});