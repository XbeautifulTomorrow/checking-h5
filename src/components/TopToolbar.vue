<template>
  <div>
    <v-app-bar
      elevation="2"
      style="padding: 0 8px"
      app
      fixed
      dark
      color="#ff197c"
      density="compact"
    >
      <template v-slot:prepend>
        <div class="back_btn" v-if="isMain" @click="toMain()">
          <v-icon color="#fff" size="24" icon="mdi-chevron-left"></v-icon>
        </div>
        <div class="back_btn" v-else-if="!isTab" @click="goBack()">
          <v-icon color="#fff" size="24" icon="mdi-chevron-left"></v-icon>
        </div>
      </template>
      <template v-slot:append>
        <div class="t"></div>
        <div class="energy_box">
          <v-icon color="#FFF100" :size="20" icon="mdi-lightning-bolt"></v-icon>
          <div class="energy_item">
            <div class="energy_val">
              {{ formatNumber(userInfo.energyAmount || 0, 0) }}
            </div>
            <v-fab
              color="#49B6F6"
              size="20"
              icon="mdi-plus"
              elevation="0"
              rounded="lg"
              @click="toFrens()"
              class="btn_border"
            >
              <v-icon color="#fff" size="20"></v-icon>
            </v-fab>
          </div>
        </div>
        <div class="energy_box">
          <v-img
            :width="20"
            cover
            src="@/assets/images/svg/check_in/gm_coin.svg"
          ></v-img>
          <div class="energy_item">
            <div class="energy_val">
              {{ unitConversion(userInfo?.gmcAmount || 0) }}
            </div>
            <v-fab
              color="#49B6F6"
              size="20"
              icon="mdi-plus"
              elevation="0"
              rounded="lg"
              @click="toEarn()"
              class="btn_border"
            >
              <v-icon color="#fff" size="20"></v-icon>
            </v-fab>
          </div>
        </div>
        <div class="energy_box">
          <v-img
            :width="20"
            cover
            src="@/assets/images/airdrop/coin_gmt.png"
          ></v-img>
          <div class="energy_item">
            <div class="energy_val">
              {{ Number(userInfo?.gmtAmount || 0).toLocaleString() }}
            </div>
            <v-fab
              color="#49B6F6"
              size="20"
              icon="mdi-plus"
              elevation="0"
              rounded="lg"
              @click="toRecharge()"
              class="btn_border"
            >
              <v-icon color="#fff" size="20"></v-icon>
            </v-fab>
          </div>
        </div>
        <v-avatar
          v-if="userInfo.avatar"
          size="32"
          :image="userInfo.avatar"
        ></v-avatar>
        <img
          v-else
          width="32"
          height="32"
          :avatar="userInfo.userName || 'avatar'"
          color="#3D3D3D"
          class="avatar"
        />
      </template>
    </v-app-bar>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { useCheckInStore } from "@/store/check_in.js";
import { getUserInfo } from "@/services/api/user";
import { accurateDecimal, unitConversion } from "@/utils";

export default defineComponent({
  data() {
    return {
      title: "GMCoin",
      isMain: false,
      isTab: false,
      showMenu: false,
      NavList: ["", "/", "/activity", "/earn", "/frens", "/mine", "/airdrop"],
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
    isConnect() {
      const { isConnect } = useUserStore();
      return isConnect;
    },
  },
  methods: {
    getUserInfo: getUserInfo,
    unitConversion: unitConversion,
    // 格式化数字
    formatNumber(event: number | string, type: number) {
      const num = accurateDecimal(event, type);
      return Number(num).toLocaleString(undefined, {
        maximumFractionDigits: type,
      });
    },
    toMain() {
      const checkInStore = useCheckInStore();
      checkInStore.setChallengeId(null);
      this.$router.push("/activity");
    },
    goBack() {
      this.$router.go(-1); // 返回上一页
    },
    toFrens() {
      // this.$router.push('/frens');
      const { setShowRecharge, setRechargeType } = useUserStore();
      setRechargeType(0);
      setShowRecharge(true);
    },
    toEarn() {
      // this.$router.push('/earn');
      const { setShowRecharge, setRechargeType } = useUserStore();
      setRechargeType(1);
      setShowRecharge(true);
    },
    toRecharge() {
      if (this.isConnect) {
        this.$router.push("/deposit");
      } else {
        this.$router.push("/airdrop");
      }
    },
  },
  watch: {
    isLogin(val) {
      if (val) {
        const userStore = useUserStore();
        userStore.fetchUserInfo();
      }
    },
    "$route.path"(val: string) {
      const userStore = useUserStore();
      userStore.fetchUserInfo();
      console.log(val);
      if (val == "/") {
        this.isTab = false;
        this.isMain = true;
      } else {
        this.isMain = false;
        this.isTab = this.NavList.includes(val);
      }
    },
  },
});
</script>
<style lang="scss" scoped>
.back_btn {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 1px solid #000;
  background-color: #49b6f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.energy_box {
  height: 20px;
  padding-right: 20px;
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
  border: 4px solid #ffad2e;
  border-radius: 50%;
}
</style>