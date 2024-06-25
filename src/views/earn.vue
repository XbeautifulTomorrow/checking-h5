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
              <div class="task_bonus">
                <v-img :width="18" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
                <div class="bonus">{{ `+ ${Number(item.coinAmount).toLocaleString()}` }}</div>
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
        <div class="task_item" v-for="(item, index) in explore" :key="index">
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
              <div class="task_bonus">
                <v-icon color="#FFF100" size="20" icon="mdi-lightning-bolt"></v-icon>
                <div class="bonus">{{ `+ ${item.energyAmount}` }}</div>
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
      currentTask: "",
      taskImages: {
        LOGIN,
        INVITE,
        GM,
        CHALLENGE,
        AD
      },
      timer: null as number | any,
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
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

        for (let i = 0; i < data.length; i++) {
          const element = data[i];
          if (element.type == "DAILY") {
            element.loading = false;
            this.dailyTask.push(element);
          } else {
            element.loading = false;
            this.explore.push(element);
          }
        }
      }
    },
    // 完成任务
    completed(event: any) {
      event.loading = true;
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(async () => {

        if (event.abbreviation == "AD") {
          this.toAdController(event);
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
          inviteUrl = `https://t.me/theGMCoin_Bot/GMCoin?startapp=${inviteCode}`;
        } else {
          inviteUrl = `https://t.me/cyclone384_bot/checking?startapp=${inviteCode}`
        }

        shareOnTelegram(inviteUrl);
      } else if (abbreviation == "GM") {
        // 去签到
        this.$router.push('/');
      } else if (abbreviation == "CHALLENGE") {
        // 去参加挑战
        this.$router.push('/activity');
      } else if (abbreviation == "TGGROUP") {
        // 加入Telegram群
        openUrl("https://t.me/GMCoin_Chat");
      } else if (abbreviation == "TGCHANNEL") {
        // 加入Telegram群
        openUrl("https://t.me/theGMCoin");
      } else if (abbreviation == "TW") {
        // 关住Twitter，跳到用户
        openUrl("https://x.com/GMCoin_Fam");
      } else if (abbreviation == "3BASE") {
        // 在3Base群里转发
        openUrl("https://t.me/ton_3base_bot/Ton3Base?startapp=673_BRZLED");
      } else if (abbreviation == "TWEET") {
        // 转发Twitter帖子，跳到帖子
        openUrl("https://x.com/GMCoin_Fam/status/1805241310422745452");
      }
    },
    // 生成一个随机数
    getRandom() {
      const min = 0;
      const max = 1;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  },
});
</script>
<style lang="scss" scoped>
.earn_wrapper {
  padding: 0 8px;
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