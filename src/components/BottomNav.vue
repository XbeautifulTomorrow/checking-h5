<template>
  <div class="nav_wrapper">
    <v-bottom-navigation app fixed grow v-model="activeItem" bg-color="rgba(215, 215, 215, 0.65)" :active="activeNav"
      rounded="lg" class="nav_panel">
      <v-btn value="check_in" :to="{ path: '/' }" density="compact" slim min-width="0">
        <v-img :width="20" cover src="@/assets/images/svg/tabr/check_in.svg"></v-img>
        <span :class="['btn_text', activeItem == 'check_in' && 'active']">CHECK IN</span>
      </v-btn>
      <v-btn value="earn" :to="{ name: 'Earn' }" density="compact" slim min-width="0">
        <v-img :width="20" cover src="@/assets/images/svg/tabr/earn.svg"></v-img>
        <span :class="['btn_text', activeItem == 'earn' && 'active']">EARN</span>
      </v-btn>
      <v-btn value="frens" :to="{ name: 'Frens' }" density="compact" slim min-width="0">
        <v-img :width="20" cover src="@/assets/images/svg/tabr/frens.svg"></v-img>
        <span :class="['btn_text', activeItem == 'frens' && 'active']">FRENS</span>
      </v-btn>
      <v-btn value="mine" :to="{ name: 'Mine' }" density="compact" slim min-width="0">
        <v-img :width="20" cover src="@/assets/images/svg/tabr/mine.svg"></v-img>
        <span :class="['btn_text', activeItem == 'mine' && 'active']">MINE</span>
      </v-btn>
      <v-btn value="airdrop" :to="{ name: 'Airdrop' }" density="compact" slim min-width="0">
        <v-img :width="20" cover src="@/assets/images/svg/tabr/airdrop.svg"></v-img>
        <span :class="['btn_text', activeItem == 'airdrop' && 'active']">AIRDROP</span>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

// 没有导航按钮的页面
const notNav = [] as Array<string>

export default defineComponent({
  data() {
    return {
      activeItem: "check_in",
      activeNav: true,
    };
  },
  methods: {
  },
  watch: {
    "$route.path"(val: string) {
      if (notNav.includes(val)) {
        this.activeNav = true;
      } else {
        this.activeNav = true;
      }
    }
  }
});
</script>

<style scoped lang="scss">
.v-btn {
  letter-spacing: normal;
}

.nav_panel {
  width: auto !important;
  margin: 0 8px 8px;
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
</style>