<template>
  <div class="earn_wrapper">
    <div class="gift_box">
      <v-img cover src="@/assets/images/earn/gift.png"></v-img>
      <div class="description_text">Earn More $GMC</div>
    </div>
    <div class="task_panel">
      <div class="task_title">Daily Task</div>
      <div class="task_list">
        <div class="task_item" v-for="(item, index) in dailyTask" :key="index">
          <div class="task_item_left">
            <v-img :width="40" cover :src="taskImages[item.abbreviation as keyof typeof taskImages]"></v-img>
            <div class="task_item_reward">
              <div class="task_name" v-if="item.abbreviation == 'AD'">{{ `${item.fullName} 0/3` }}</div>
              <div class="task_name" v-else>{{ item.fullName }}</div>
              <div class="task_bonus">
                <v-img :width="20" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
                <div class="bonus">{{ `+ ${item.coinAmount}` }}</div>
              </div>
            </div>
          </div>
          <div class="task_item_right">
            <v-btn :color="item.isFinish ? 'rgb(0,0,0,0)' : 'info'" :loading="item.loading" height="30"
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
      <div class="task_title">Daily Task</div>
      <div class="task_list">
        <div class="task_item" v-for="(item, index) in explore" :key="index">
          <div class="task_item_left">
            <div class="telegram_img" v-if="item.abbreviation == 'TGGROUP' || item.abbreviation == 'TGCHANNEL'">
              <v-img :width="30" cover src="@/assets/images/svg/earn/telegram.svg"></v-img>
            </div>
            <div class="telegram_img twitter" v-else-if="item.abbreviation == 'TW' || item.abbreviation == 'TWEET'">
              <v-img :width="20" cover src="@/assets/images/svg/earn/twitter.svg"></v-img>
            </div>
            <v-img v-else :width="40" cover src="@/assets/images/svg/earn/3base.svg"></v-img>
            <div class="task_item_reward">
              <div class="task_name">{{ item.fullName }}</div>
              <div class="task_bonus">
                <v-icon color="#FFF100" size="20" icon="mdi-lightning-bolt"></v-icon>
                <div class="bonus">{{ `+ ${item.energyAmount}` }}</div>
              </div>
            </div>
          </div>
          <div class="task_item_right">
            <v-btn :color="item.isFinish ? 'rgb(0,0,0,0)' : 'info'" :loading="item.loading" height="30"
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
import { shareOnTelegram } from "@/utils";

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
        const res = await completeTask({
          taskId: event.id
        });
        event.loading = false;
        if (res.code == 200) {
          if (res.data) {
            // 任务完成了，重新获取列表
            this.fetchChallengeList();
          } else {
            // 做任务
            this.toTask(event.abbreviation);
          }
        }
      }, 3000)
    },
    // 去做任务
    toTask(event: string) {
      if (event == "INVITE") {
        // 分享拉新
        const { inviteCode } = this.userInfo;

        shareOnTelegram("Test text", `https://t.me/cyclone384_bot/checking?startapp=${inviteCode}`);
      } else if (event == "GM") {
        // 去签到
        this.$router.push('/');
      } else if (event == "CHALLENGE") {
        // 去参加挑战
        this.$router.push('/activity');
      } else if (event == "AD") {
        // 看广告
      } else if (event == "TGGROUP") {
        // 加入Telegram群
      } else if (event == "TGCHANNEL") {
        // 加入Telegram群
      } else if (event == "TW") {
        // 关住Twitter，跳到用户
      } else if (event == "3BASE") {
        // 在3Base群里转发
      } else if (event == "TWEET") {
        // 转发Twitter帖子，跳到帖子
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
    width: 180px;
    height: auto;
    flex: none;
  }

  .description_text {
    position: absolute;
    width: 100%;
    bottom: 0;
    text-align: center;
    font-weight: 700;
    font-size: 20px;
    color: #F7F7F7;
  }
}

.task_panel {
  margin-top: 24px;

  .task_title {
    font-size: 20px;
    font-weight: bold;
    color: #fff;
  }
}

.task_list {
  &>.task_item+.task_item {
    margin-top: 8px;
  }
}

.task_item {
  background-color: rgba(6, 4, 4, 0.65);
  border-radius: 20px;
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
    margin-right: 12px;
  }
}

.telegram_img {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #49b6f6;
  border-radius: 10px;
  margin-right: 12px;

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
  }

  .task_bonus {
    display: flex;
    align-items: center;

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