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
    <v-dialog v-model="showLogin" max-width="320" persistent>
      <v-list class="py-2" color="primary" elevation="12" rounded="lg">
        <v-list-item prepend-icon="mdi-login-variant" title="Log in again..." @click="handleLogin()">
          <template v-slot:prepend>
            <div class="pe-4">
              <v-icon color="primary" size="x-large"></v-icon>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-dialog>
  </v-app>
</template>

<script lang="ts">
import TopToolbar from '@/components/TopToolbar.vue';
import BottomNav from '@/components/BottomNav.vue';
import { useMessageStore } from "@/store/message.js";
import { useUserStore } from "@/store/user.js"; import { telegramLogin } from "@/services/api/user";
import { getSessionStore } from "@/utils";

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
    showLogin: {
      get() {
        const { showLogin } = useUserStore();
        return showLogin
      },
      set(val: boolean) {
        const { setShowLogin } = useUserStore();
        setShowLogin(val)
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
    },
    // 登录
    async handleLogin() {
      const userStore = useUserStore();
      const { Telegram } = (window as any)
      let tg_certificate: any;
      if (Telegram) {
        const { WebApp } = Telegram;
        WebApp.setHeaderColor("#FF197C")
        tg_certificate = btoa(WebApp.initData);
        console.log(tg_certificate);


        const inviteCode = getSessionStore("inviteCode")

        const res = await telegramLogin({
          tgEncodeStr: tg_certificate,
          inviteCode: inviteCode
        });

        if (res.code == 200) {
          if (res.data.certificate) {
            localStorage.setItem("certificate", res.data.certificate);
          }

          // 保存登录信息
          userStore.setLogin(res.data);

          // 加载用户信息
          userStore.fetchUserInfo();
        }
      }
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
*::-webkit-scrollbar {
  display: none;
  width: 0px;
  height: auto;
}

/* /兼容火狐/ */
* {
  scrollbar-width: none;
}

/* / 兼容IE10+ */
* {
  -ms-overflow-style: none;
}
</style>
