<template>
  <div class="earn_wrapper">
    <div class="gift_box">
      <v-img :width="180" cover src="@/assets/images/earn/gift.png"></v-img>
      <div class="description_text">Earn More $GMC</div>
    </div>
    <div class="task_panel">
      <div class="task_title">Daily Task</div>
      <div class="task_list">
        <div class="task_item" v-for="(item, index) in dailyTask" :key="index">
          <div class="task_item_left">
            <v-img :width="36" cover :src="taskImages[item.abbreviation as keyof typeof taskImages]"></v-img>
            <div class="task_item_reward">
              <div class="task_name" v-if="item.abbreviation == 'AD'">
                <span>{{ `${item.fullName} ` }}</span>
                <span>{{ `${item.finishCount}/${item.totalCount}` }}</span>
              </div>
              <div class="task_name" v-else>{{ item.fullName }}</div>
              <div class="task_bonus_box">
                <div class="task_bonus" v-if="item.energyAmount">
                  <v-icon color="#FFF100" size="20" icon="mdi-lightning-bolt"></v-icon>
                  <div class="bonus">{{ `+ ${item.energyAmount}` }}</div>
                </div>
                <div class="task_bonus" v-if="item.coinAmount">
                  <v-img :width="18" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
                  <div class="bonus">{{ `+ ${Number(item.coinAmount).toLocaleString()}` }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="task_item_right">
            <v-btn :color="item.isFinish ? 'rgb(0,0,0,0)' : '#49B6F6'" :loading="item.loading" height="24"
              density="compact" @click="completed(item)" :variant="item.isFinish ? 'text' : 'flat'"
              :readonly="item.isFinish">
              <div v-if="!item.isFinish" class="finished">GO</div>
              <div v-else-if="item.isFinish" class="completed">
                <v-icon size="30" color="#49B6F6" icon="mdi-check-bold"></v-icon>
              </div>
            </v-btn>
          </div>
        </div>
      </div>
    </div>
    <div class="task_panel">
      <div class="task_title">Explore</div>
      <div class="task_list">
        <div class="task_item" v-for="(item, index) in explore" :key="index"
          @click.stop="item.isFinish ? toTask(item) : null">
          <div class="task_item_left">
            <div class="telegram_img" v-if="item.abbreviation == 'TGGROUP' || item.abbreviation == 'TGCHANNEL'">
              <v-img :width="26" cover src="@/assets/images/svg/earn/telegram.svg"></v-img>
            </div>
            <div class="telegram_img twitter" v-else-if="item.abbreviation == 'TW' || item.abbreviation == 'TWEET'">
              <v-img :width="16" cover src="@/assets/images/svg/earn/twitter.svg"></v-img>
            </div>
            <v-img v-else :width="36" cover src="@/assets/images/svg/earn/3base.svg"></v-img>
            <div class="task_item_reward">
              <div class="task_name">{{ item.fullName }}</div>
              <div class="task_bonus_box">
                <div class="task_bonus" v-if="item.energyAmount">
                  <v-icon color="#FFF100" size="20" icon="mdi-lightning-bolt"></v-icon>
                  <div class="bonus">{{ `+ ${item.energyAmount}` }}</div>
                </div>
                <div class="task_bonus" v-if="item.coinAmount">
                  <v-img :width="18" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
                  <div class="bonus">{{ `+ ${Number(item.coinAmount).toLocaleString()}` }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="task_item_right">
            <v-btn :color="item.isFinish ? 'rgb(0,0,0,0)' : '#49B6F6'" :loading="item.loading" height="24"
              density="compact" @click.stop="!item.isFinish ? completed(item) : toTask(item)"
              :variant="item.isFinish ? 'text' : 'flat'" :readonly="item.isFinish">
              <div v-if="!item.isFinish" class="finished">GO</div>
              <div v-else-if="item.isFinish" class="completed">
                <v-icon size="30" color="#49B6F6" icon="mdi-check-bold"></v-icon>
              </div>
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserStore } from "@/store/user.js";
import { getTaskList, completeTask } from "@/services/api/task.js";
import { shareOnTelegram, openUrl, setSessionStore, getSessionStore, removeSessionStore } from "@/utils";

interface taskInfo {
  id: string | number, //任务ID
  type: string, //任务类型(DAILY-日常，EXPLORE-发现)
  fullName: string, //任务全称
  abbreviation: string, //任务简称
  energyAmount: number, //任务奖励能量数量
  coinAmount: number, //任务奖励代币数量
  isFinish: boolean //是否完成(true-完成，false-未完成)
  [x: string]: string | number | any;
}

import LOGIN from "@/assets/images/svg/earn/login.svg";
import INVITE from "@/assets/images/svg/earn/invite.svg";
import GM from "@/assets/images/svg/earn/check_in.svg";
import CHALLENGE from "@/assets/images/svg/earn/join.svg";
import AD from "@/assets/images/svg/earn/ad.svg";
import PURCHASE from "@/assets/images/svg/earn/purchase.svg";
import CHAIN_CHECKIN from "@/assets/images/svg/earn/link_check_in.svg";
import { TonConnectUI, ConnectedWallet } from '@tonconnect/ui'
import { toNano, beginCell } from '@ton/ton';

interface showPromiseResult {
  done: boolean; // true if user watch till the end, otherwise false
  description: string; // event description
  state: 'load' | 'render' | 'playing' | 'destroy'; // banner state
  error: boolean; // true if event was emitted due to error, otherwise false
}

export default defineComponent({
  data() {
    return {
      dailyTask: [] as Array<taskInfo>,
      explore: [] as Array<taskInfo>,
      currentTask: {} as taskInfo,
      taskImages: {
        LOGIN,
        INVITE,
        PURCHASE,
        CHAIN_CHECKIN,
        GM,
        CHALLENGE,
        AD
      }
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    tonConnect: {
      get() {
        const { tonConnect } = useUserStore();
        return tonConnect
      },
      set(val: boolean) {
        const { setTonConnect } = useUserStore();
        setTonConnect(val)
      }
    },
    isConnect() {
      const { isConnect } = useUserStore();
      return isConnect
    },
    walletAddr() {
      const { walletAddr } = useUserStore();
      return walletAddr
    },
  },
  created() {
    this.fetchChallengeList();
  },
  methods: {
    // 获取挑战列表
    async fetchChallengeList() {
      const res = await getTaskList({});
      if (res.code == 200) {
        const { data } = res;
        this.dailyTask = [];
        this.explore = [];
        const linkTask = [];

        for (let i = 0; i < data.length; i++) {
          const element = data[i];
          if (element.type == "DAILY") {
            if (element.abbreviation != "PURCHASE" && element.abbreviation != "CHAIN_CHECKIN") {
              this.dailyTask.push(element);
            } else {
              linkTask.push(element);
            }
          } else {
            element.loading = false;
            this.explore.push(element);
          }
          element.loading = false;
          element.timer = false;
        }

        this.dailyTask.splice(2, 0, ...linkTask);
      }
    },
    // 完成任务
    completed(event: any) {
      event.loading = true;
      if (event.timer) clearTimeout(event.timer);
      event.timer = setTimeout(async () => {

        if (event.abbreviation == "AD") {
          this.toAdController(event);
          event.loading = false;
          return
        }

        if (event.abbreviation == "CHAIN_CHECKIN") {
          this.currentTask = event;
          if (!this.tonConnect) {
            this.initTonConnect();
          } else {
            this.connectToWallet();
          }
          return
        }

        const isOpen = getSessionStore(event.abbreviation);
        if (event.type == "EXPLORE" && isOpen != "1") {
          setSessionStore(event.abbreviation, "1");
          this.toTask(event);

          event.loading = false;
          return;
        }

        const res = await completeTask({
          taskId: event.id
        });

        event.loading = false;

        if (res.code == 200) {
          if (res.data) {
            // 任务完成了，更新余额
            const userStore = useUserStore();
            userStore.fetchUserInfo();

            // 重新获取任务列表
            this.fetchChallengeList();

            // 移除任务缓存
            removeSessionStore(event.abbreviation);
          } else {
            // 做任务
            this.toTask(event);
          }
        }
      }, 3000)
    },
    // 广告
    toAdController(event: taskInfo) {
      // 看广告
      const AdController = (window as any).Adsgram.init({ blockId: "233" });

      // 显示广告横幅
      AdController.show().then(async (result: showPromiseResult) => {
        // user watch ad till the end
        if (result.done) {
          const res = await completeTask({
            taskId: event.id
          });
          event.loading = false;
          if (res.code == 200) {
            if (res.data) {
              // 任务完成了，重新获取列表
              const userStore = useUserStore();
              userStore.fetchUserInfo();
              this.fetchChallengeList();
            }
          }
        }
        // your code to reward user
      }).catch((result: showPromiseResult) => {
        // user skipped video or get error during playing ad
        console.log(result)
        // do nothing or whatever you want
      })
    },
    // 去做任务
    toTask(event: taskInfo) {
      const { abbreviation } = event;
      if (abbreviation == "INVITE") {
        // 分享拉新
        const { inviteCode } = this.userInfo;
        let inviteUrl = "";
        if (import.meta.env.MODE == "prod") {
          inviteUrl = `https://t.me/theGMCoinBot/GMCoin?startapp=${inviteCode}`;
        } else {
          inviteUrl = `https://t.me/gm_coin_test_bot/checking?startapp=${inviteCode}`
        }

        shareOnTelegram(inviteUrl);
      } else if (abbreviation == "GM") {
        // 去签到
        this.$router.push('/');
      } else if (abbreviation == "CHALLENGE") {
        // 去参加挑战
        this.$router.push('/activity');
      } else if (abbreviation == "PURCHASE") {
        // 充值消费
        const { setShowRecharge } = useUserStore();
        setShowRecharge(true);
      }
      else if (abbreviation == "TGGROUP") {
        // 加入Telegram群
        openUrl("https://t.me/GMCoinChat1");
      } else if (abbreviation == "TGCHANNEL") {
        // 加入Telegram群
        openUrl("https://t.me/GMCoinChannel");
      } else if (abbreviation == "TW") {
        // 关住Twitter，跳到用户
        openUrl("https://x.com/GMCoin_Fam");
      } else if (abbreviation == "3BASE") {
        // 在3Base群里转发
        openUrl("https://t.me/ton_3base_bot/Ton3Base?startapp=673_BRZLED");
      } else if (abbreviation == "TWEET") {
        // 转发Twitter帖子，跳到帖子
        openUrl("https://x.com/GMCoin_Fam/status/1808708189967561097");
      }
    },
    // 初始化ton-connect
    async initTonConnect() {
      let miniappUrl = "https://t.me/gm_coin_test_bot/checking";

      this.tonConnect = new TonConnectUI({
        manifestUrl: "https://file.gmking.io/tonconnect-manifest.json"
      });

      if (import.meta.env.MODE == "prod") {
        miniappUrl = "https://t.me/theGMCoinBot/GMCoin";
      }
      // webapp重定向
      this.tonConnect.uiOptions = {
        twaReturnUrl: miniappUrl
      }

      // 如果未链接，发起链接请求
      if (!this.tonConnect.connected) {
        this.connectToWallet();
      }
      // 监听钱包链接状态
      this.tonConnect.onStatusChange((wallet: ConnectedWallet) => {
        if (wallet) {
          const { listening } = useUserStore();
          const { account: { address } } = wallet;
          const isC = this.tonConnect.connected;
          listening({
            isc: isC,
            account: address
          });

          this.handleSelfTransfer();
        }
      });

    },
    async connectToWallet() {
      this.handleDisconnect();
      this.tonConnect.connectWallet().then((res: any) => {
        console.log(res);
      }).catch((err: any) => {
        console.log(err);
        const index = this.dailyTask.findIndex(e => e.abbreviation == this.currentTask.abbreviation);
        if (index != -1) {
          this.dailyTask[index].loading = false;
        }
      })
      // 如果需要，可以对connectedWallet做一些事情
    },
    // 处理自我转账
    async handleSelfTransfer() {

      // 创建评论
      const body = beginCell()
        .storeUint(0, 32) // 写入32个零位以表示后面将跟随文本评论
        .storeStringTail('gmcoin') // 写下我们的文本评论
        .endCell();

      // 创建交易体
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
          {
            address: this.walletAddr, // 目的地址
            amount: toNano(0.001).toString(), //以nanotons计的Toncoin
            payload: body.toBoc().toString("base64")
          }
        ]
      }

      this.tonConnect.sendTransaction(transaction).then(async (res: any) => {
        console.log(res)
        const taskRes = await completeTask({
          taskId: this.currentTask.id,
          remark: res.boc,
          length: res.boc.length
        });

        const index = this.dailyTask.findIndex(e => e.abbreviation == this.currentTask.abbreviation);
        if (index != -1) {
          this.dailyTask[index].loading = false;
        }

        if (taskRes.code == 200) {
          if (taskRes.data) {
            // 任务完成了，重新获取列表
            const userStore = useUserStore();
            userStore.fetchUserInfo();
            this.fetchChallengeList();
          }
        }
      }).catch((err: any) => {
        console.log(err);
        const index = this.dailyTask.findIndex(e => e.abbreviation == this.currentTask.abbreviation);
        if (index != -1) {
          this.dailyTask[index].loading = false;
        }
      })
    },
    // 断开连接  
    async handleDisconnect() {
      const isC = this.tonConnect.connected;
      if (isC) {
        // 如果已连接，断开连接     
        await this.tonConnect.disconnect();

        const { listening } = useUserStore();
        listening({
          isc: false,
          address: null
        })
      }
    },
  },
});
</script>
<style lang="scss" scoped>
.earn_wrapper {
  padding: 0 8px 16px;
}

.gift_box {
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .v-img {
    flex: none;
  }

  .description_text {
    position: absolute;
    width: 100%;
    bottom: -8px;
    text-align: center;
    font-weight: 700;
    font-size: 20px;
    color: #FDEFD6;
  }
}

.task_panel {
  margin-top: 12px;

  .task_title {
    font-size: 20px;
    font-weight: bold;
    color: #FDEFD6;
  }
}

.task_list {
  &>.task_item+.task_item {
    margin-top: 8px;
  }
}

.task_item {
  background-color: rgba(6, 4, 4, 0.65);
  border-radius: 14px;
  padding: 8px 16px 8px 8px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task_item_left {
  display: flex;
  align-items: center;
  color: #fff;

  .v-img {
    flex: none;
    margin-right: 8px;
  }
}

.telegram_img {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #49B6F6;
  border-radius: 10px;
  margin-right: 8px;

  &.twitter {
    background-color: #000;
  }

  .v-img {
    flex: none;
    margin-right: 0;
  }
}

.task_item_reward {
  .task_name {
    font-size: 14px;
    font-weight: bold;
    line-height: 1.2;
  }

  .task_bonus_box {
    display: flex;
    align-items: center;
  }

  .task_bonus {
    display: flex;
    align-items: center;
    font-size: 14px;
    line-height: 1.2;

    .v-img {
      flex: none;
      margin-right: 4px;
    }
  }

  .task_bonus+.task_bonus {
    margin-left: 8px;
  }
}

.task_item_right {

  .v-btn {
    color: #fff;
  }

  .finished {
    color: #fff;
  }
}
</style>
