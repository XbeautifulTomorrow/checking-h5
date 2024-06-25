<template>
  <v-app class="main">
    <TopToolbar></TopToolbar>
    <v-main>
      <router-view></router-view>
    </v-main>
    <BottomNav></BottomNav>
    <v-snackbar v-model="showMessage" :timeout="3000">
      {{ messageText }}
      <template v-slot:actions>
        <v-btn color="pink" variant="text" @click="closeMessage()">
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-dialog v-model="showGift" width="auto">
      <div class="gift_panel">
        <v-img :width="160" cover src="@/assets/images/user/gift.png"></v-img>
        <div class="gift_text">Congratulations! Your exclusive 3BASE gift has arrived.</div>
        <div class="gift_bonus">
          <v-img :width="40" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
          <span class="bonus_num">{{ `+${Number(5000).toLocaleString()}` }}</span>
        </div>
        <v-btn class="close_btn" @click="showGift = false" height="40" rounded="lg" size="small">CONFIRM</v-btn>
      </div>
    </v-dialog>
  </v-app>
</template>

<script lang="ts">
import TopToolbar from '@/components/TopToolbar.vue';
import BottomNav from '@/components/BottomNav.vue';
import { useMessageStore } from "@/store/message.js";
import { useUserStore } from "@/store/user.js";

import { defineComponent } from 'vue';
export default defineComponent({
  data() {
    return {
    };
  },
  components: {
    TopToolbar,
    BottomNav
  },
  computed: {
    showMessage: {
      get() {
        const { showMessage } = useMessageStore();
        return showMessage
      },
      set(val: boolean) {
        const { setShowMessage } = useMessageStore();
        setShowMessage(val)
      }
    },
    showGift: {
      get() {
        const { showGift } = useUserStore();
        return showGift
      },
      set(val: boolean) {
        const { setShowGift } = useUserStore();
        setShowGift(val)
      }
    },
    messageText() {
      const { messageText } = useMessageStore();
      return messageText
    },
  },
  methods: {
    // 关闭消息
    closeMessage() {
      const { setShowMessage } = useMessageStore();
      setShowMessage(false);
    }
  },
})
</script>
<style lang="scss" scoped>
.main {
  background: linear-gradient(180deg, #ff197c 0%, #fd4c6b 48%, #ff6b6f 100%)
}

.gift_panel {
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  align-items: center;
  flex-direction: column;
  color: #fff;
  text-align: center;
  font-size: 20px;
  line-height: 1.2;

  .v-img {
    flex: none;
  }

  .gift_text {
    font-size: 20px;
    color: #FDEFD6;
    text-align: center;
    line-height: 1.2;
    padding-bottom: 24px;
  }

  .gift_bonus {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    font-size: 36px;
    color: #FBB11B;

    .v-img {
      flex: none;
      margin-right: 4px;
    }
  }

  .close_btn {
    background: linear-gradient(90deg, rgba(253, 239, 213, 1) 0%, rgba(248, 215, 156, 1) 101%);
    color: #FE2E75;
    font-size: 20px;
    font-weight: bold;
    padding: 0 20px;
  }
}
</style>
<style>
/* 谷歌，元素隐藏必须设置宽度  不然无效 */
html::-webkit-scrollbar {
  display: none;
  width: 0px;
  height: auto;
}

/* /兼容火狐/ */
html {
  scrollbar-width: none;
}

/* / 兼容IE10+ */
html {
  -ms-overflow-style: none;
}
</style>
