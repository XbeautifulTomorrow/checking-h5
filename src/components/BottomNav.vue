<template>
  <v-bottom-navigation app fixed grow v-model="activeItem" bg-color="rgba(215, 215, 215, 0.65)" :active="activeNav"
    mode="shift">
    <v-btn value="check_in" :to="{ path: '/' }" density="compact" slim min-width="0">
      <v-img :width="20" cover src="@/assets/images/svg/tabr/check_in.svg"></v-img>
      <span>CHECK IN</span>
    </v-btn>
    <v-btn value="earn" :to="{ name: 'Earn' }" density="compact" slim min-width="0">
      <v-img :width="20" cover src="@/assets/images/svg/tabr/earn.svg"></v-img>
      <span>EARN</span>
    </v-btn>
    <v-btn value="frens" :to="{ name: 'Frens' }" density="compact" slim min-width="0">
      <v-img :width="20" cover src="@/assets/images/svg/tabr/frens.svg"></v-img>
      <span>FRENS</span>
    </v-btn>
    <v-btn value="mine" :to="{ name: 'Mine' }" density="compact" slim min-width="0">
      <v-img :width="20" cover src="@/assets/images/svg/tabr/mine.svg"></v-img>
      <span>MINE</span>
    </v-btn>
    <v-btn value="airdrop" :to="{ name: 'Airdrop' }" density="compact" slim min-width="0">
      <v-img :width="20" cover src="@/assets/images/svg/tabr/airdrop.svg"></v-img>
      <span>AIRDROP</span>
    </v-btn>
  </v-bottom-navigation>
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

<style scoped>
.v-btn {
  letter-spacing: normal;
}
</style>