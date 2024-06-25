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
  </v-app>
</template>

<script lang="ts">
import TopToolbar from '@/components/TopToolbar.vue';
import BottomNav from '@/components/BottomNav.vue';
import { useMessageStore } from "@/store/message.js";

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
