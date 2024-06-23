<template>
  <div>
    <v-app-bar elevation="2" style="padding: 0 8px;" app fixed dark color="#ff197c" density="compact">
      <template v-slot:prepend>
        <div class="back_btn" v-if="$route.path == '/'" @click="toMain()">
          <v-icon color="#fff" size="24" icon="mdi-chevron-left"></v-icon>
        </div>
      </template>
      <template v-slot:append>
        <div class="t"></div>
        <div class="energy_box">
          <v-icon color="#FFF100" :size="24" icon="mdi-lightning-bolt"></v-icon>
          <div class="energy_item">
            <div class="energy_val">{{ userInfo.energyAmount }}</div>
            <v-fab color="#49B6F6" size="24" icon="mdi-plus" elevation="0" rounded="lg" @click="toFrens()"
              class="btn_border">
              <v-icon color="#fff" size="20"></v-icon>
            </v-fab>
          </div>
        </div>
        <div class="energy_box">
          <v-img :width="24" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
          <div class="energy_item">
            <div class="energy_val">{{ Number(userInfo?.gmcAmount || 0).toLocaleString() }}</div>
            <v-fab color="#49B6F6" size="24" icon="mdi-plus" elevation="0" rounded="lg" @click="toEarn()"
              class="btn_border">
              <v-icon color="#fff" size="20"></v-icon>
            </v-fab>
          </div>
        </div>
        <v-avatar v-if="userInfo.avatar" size="32" :image="userInfo.avatar"></v-avatar>
        <img v-else width="32" height="32" :avatar="userInfo.userName || 'avatar'" color="#3D3D3D" class="avatar">
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
      const userStore = useUserStore();
      userStore.fetchUserInfo();
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
    toMain() {
      const checkInStore = useCheckInStore();
      checkInStore.setChallengeId(null);
      this.$router.push('/activity');
    },
    toFrens() {
      this.$router.push('/frens');
    },
    toEarn() {
      this.$router.push('/earn');
    },
  },
  watch: {
    isLogin(val) {
      if (val) {
        const userStore = useUserStore();
        userStore.fetchUserInfo();
      }
    },
    "$route.path"() {
      const userStore = useUserStore();
      userStore.fetchUserInfo();
    }
  },
});
</script>
<style lang="scss" scoped>
.back_btn {
  width: 24px;
  height: 24px;
  border-radius: 8px;
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

  :deep(.btn_border) {
    .v-btn {
      border: 1px solid #000 !important;
    }
  }
}

.avatar {
  border: 4px solid #FBE945;
  border-radius: 50%;
}
</style>