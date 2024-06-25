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
import { useCheckInStore, } from '@/store/check_in.js';
import { getSessionStore, setSessionStore } from "@/utils";


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
  created() {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const urlParam = params.get('tgWebAppStartParam');
    const urlParams = getSessionStore("urlParams")
    if (urlParam && urlParam != urlParams) {
      // 如果推送最新
      if (urlParam.indexOf("next_") > -1) {
        const paramArray = urlParam.split("-");
        if (paramArray.length >= 2) {
          const useCheckIn = useCheckInStore();
          useCheckIn.setChallengeId(paramArray[1]);
        }
      } else if (urlParam.indexOf("frens") > -1) {
        setSessionStore('nextPath', "/frens");
      } else if (urlParam.indexOf("3base") > -1) {
        setSessionStore('recommend', "3base");
      } else {
        // 保存邀请码
        setSessionStore('inviteCode', urlParam);
      }
    }


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
