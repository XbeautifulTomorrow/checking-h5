<template>
  <div>
    <v-app-bar elevation="2" style="padding: 0 8px;" app fixed dark color="#ff197c" density="compact">
      <template v-slot:prepend>
        <div class="back_btn" v-if="$route.path == '/'" @click="toMain()">
          <v-icon color="#fff" size="24" icon="mdi-chevron-left"></v-icon>
        </div>
        <v-img v-else :width="40" style="background-color: #fff;border-radius: 6px;" cover
          src="@/assets/images/svg/logo.svg"></v-img>
      </template>
      <v-app-bar-title class="ms-1" style="color: #fff;font-size: 16px">{{ title }}</v-app-bar-title>
      <template v-slot:append>
        <div class="t"></div>
        <div class="energy_box">
          <v-icon color="#FFF100" :size="20" icon="mdi-lightning-bolt"></v-icon>
          <div class="energy_item">
            <div class="energy_val">{{ userInfo.energyAmount }}</div>
            <v-fab color="#49B6F6" size="24" icon="mdi-plus" elevation="0">
              <v-icon color="#fff" size="20"></v-icon>
            </v-fab>
          </div>
        </div>
        <div class="energy_box">
          <v-img :width="20" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
          <div class="energy_item">
            <div class="energy_val">{{ userInfo.gmcAmount }}</div>
            <v-fab color="#49B6F6" size="24" icon="mdi-plus" elevation="0">
              <v-icon color="#fff" size="20"></v-icon>
            </v-fab>
          </div>
        </div>
        <v-avatar v-if="userInfo.avatar" size="32" :image="userInfo.avatar"></v-avatar>
        <img v-else width="32" height="32" :avatar="userInfo.userName || 'avatar'" color="#FEC72F" class="avatar">
      </template>
    </v-app-bar>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserStore } from "@/store/user.js";
import { useCheckInStore } from "@/store/check_in.js";
import { getUserInfo } from "@/services/api/user";

export default defineComponent({
  data() {
    return {
      title: "GMCoin",
      showMenu: false,
    };
  },
  created() {
    if (this.isLogin) {
      this.fetchUserInfo();
    }
  },
  computed: {
    isLogin() {
      const { isLogin } = useUserStore();
      return isLogin;
    },
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
  },
  methods: {
    getUserInfo: getUserInfo,
    async fetchUserInfo() {
      const res = await getUserInfo({});
      if (res.code == 200) {
        const userStore = useUserStore();
        userStore.setUserInfo(res.data);
        this.$nextTick(() => {
          (window as any).LetterAvatar.transform();
        });
      }
    },
    toMain() {
      const checkInStore = useCheckInStore();
      checkInStore.setChallengeId(null);
      this.$router.push('/activity');
    }
  },
  watch: {
    isLogin(val) {
      if (val) {
        this.fetchUserInfo();
      }
    }
  },
});
</script>
<style lang="scss" scoped>
.back_btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #000;
  background-color: #49B6F6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.energy_box {
  height: 24px;
  padding-right: 24px;
  display: flex;
  align-items: center;
  background-color: rgba(210, 210, 214, 1);
  border-radius: 30px;
  margin-right: 8px;

  .energy_item {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: #000;

    .energy_val {
      font-size: 12px;
      font-weight: bold;
      padding: 0 4px;
    }
  }
}

.avatar {
  border: 4px solid #FBE945;
  border-radius: 50%;
}
</style>