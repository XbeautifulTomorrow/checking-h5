<template>
  <div class="nav_wrapper">
    <v-bottom-navigation
      app
      fixed
      grow
      v-model="activeItem"
      bg-color="rgba(215, 215, 215, 0.65)"
      :active="activeNav"
      rounded="lg"
      class="nav_panel"
      :style="{ transform: `translateY(${activeNav ? '-8px' : '54px'})` }"
    >
      <v-btn
        value="check_in"
        :to="{ path: '/' }"
        density="compact"
        slim
        min-width="0"
      >
        <div class="btn_box">
          <v-img
            :width="20"
            :class="['nav_img', activeItem == 'check_in' && 'active']"
            cover
            src="@/assets/images/svg/tabr/check_in.svg"
          ></v-img>
          <span :class="['btn_text', activeItem == 'check_in' && 'active']">
            CHECK IN
          </span>
        </div>
      </v-btn>
      <v-btn
        value="earn"
        :to="{ name: 'Earn' }"
        density="compact"
        slim
        min-width="0"
      >
        <div class="btn_box">
          <v-img
            :width="20"
            :class="['nav_img', activeItem == 'earn' && 'active']"
            cover
            src="@/assets/images/svg/tabr/earn.svg"
          ></v-img>
          <span :class="['btn_text', activeItem == 'earn' && 'active']">
            EARN
          </span>
          <div class="dot" v-if="userInfo.isUnFinish"></div>
        </div>
      </v-btn>
      <v-btn
        value="frens"
        :to="{ name: 'Frens' }"
        density="compact"
        slim
        min-width="0"
      >
        <div class="btn_box">
          <v-img
            :width="20"
            :class="['nav_img', activeItem == 'frens' && 'active']"
            cover
            src="@/assets/images/svg/tabr/frens.svg"
          ></v-img>
          <span :class="['btn_text', activeItem == 'frens' && 'active']">
            FRENS
          </span>
        </div>
      </v-btn>
      <v-btn
        value="mine"
        :to="{ name: 'Mine' }"
        density="compact"
        slim
        min-width="0"
      >
        <div class="btn_box">
          <v-img
            :width="20"
            :class="['nav_img', activeItem == 'mine' && 'active']"
            cover
            src="@/assets/images/svg/tabr/mine.svg"
          ></v-img>
          <span :class="['btn_text', activeItem == 'mine' && 'active']">
            MINE
          </span>
          <div class="dot" v-if="userInfo.isUpgrade"></div>
        </div>
      </v-btn>
      <v-btn
        value="airdrop"
        :to="{ name: 'Airdrop' }"
        density="compact"
        slim
        min-width="0"
      >
        <div class="btn_box">
          <v-img
            :width="20"
            cover
            src="@/assets/images/svg/tabr/airdrop.svg"
          ></v-img>
          <span :class="['btn_text', activeItem == 'airdrop' && 'active']">
            AIRDROP
          </span>
        </div>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";

// 有底部导航的页面
const navList = [
  "/",
  "/activity",
  "/earn",
  "/frens",
  "/mine",
  "/airdrop",
] as Array<string>;

export default defineComponent({
  data() {
    return {
      activeItem: "check_in",
      activeNav: true,
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
  },
  methods: {},
  watch: {
    "$route.path"(val: string) {
      if (navList.includes(val)) {
        this.activeNav = true;
      } else {
        this.activeNav = false;
      }
    },
  },
});
</script>

<style scoped lang="scss">
.v-btn {
  letter-spacing: normal;
}

.nav_panel {
  width: calc(100% - 16px) !important;
  margin: 0 8px;

  box-sizing: border-box;
}

.nav_img {
  filter: grayscale(100%);

  &.active {
    filter: none;
  }
}

.btn_text {
  padding-top: 4px;
  color: #737373;
  font-weight: 400;

  &.active {
    color: #000;
    font-weight: bold;
  }
}

.btn_box {
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;

  .v-img {
    flex: none;
  }

  .dot {
    position: absolute;
    top: 0;
    right: 0;
    width: 10px;
    height: 10px;
    background-color: red;
    border: 2px solid #fff;
    border-radius: 50%;
  }
}
</style>