<template>
  <div>
    <div class="activity_info">
      <div class="left_btn" @click="handlePrev()">
        <v-icon v-if="currentIndex > 0" color="#fff" icon="mdi-chevron-left" size="30"></v-icon>
        <v-icon v-else color="#fff" icon="mdi-apps" size="30"></v-icon>
      </div>
      <div class="center_box">
        <div class="activity_time">
          {{ `${currentChallenge?.startDateStr || "-"} - ${currentChallenge?.endDateStr || "-"}` }}
        </div>
        <div class="prize_pool">
          <v-img :width="40" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
          <div class="prize_num">{{ `$${currentChallenge?.prizePool || "0"}` }}</div>
        </div>
      </div>
      <div class="right_btn" @click="handleNext()">
        <v-icon v-if="currentIndex < challengeList.length - 1" color="#fff" icon="mdi-chevron-right" size="30"></v-icon>
        <v-icon v-else color="#fff" icon="mdi-apps" size="30"></v-icon>
      </div>
    </div>
    <div class="check_in_panel">
      <div class="check_in_hint" v-if="challengeInfo?.userStatus == 2">
        <span v-if="challengeInfo?.stage == 'REGISTRATION'">
          Check in for 7 days to win.
        </span>
        <span v-if="challengeInfo?.stage == 'SIGNIN'">

          Unable to join an ongoing challenge.
        </span>
        <span v-if="challengeInfo?.stage == 'ENDED'">
          This challenge is closed.
        </span>
      </div>
      <div class="check_in_items">
        <div :class="['check_in_item']" v-for="(item, index) in challengeInfo?.ucCheckInVOs" :key="index">
          <div class="check_in_main">
            <div class="check_in_title">
              {{ getProject(item) }}
            </div>
            <v-img :width="40" cover :src="project[item.signType as keyof typeof project]"></v-img>
            <div class="check_in_time"> {{ formatTime(item.startDate) }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="interval_panel">
      <div class="interval"></div>
      <div class="interval"></div>
    </div>
    <div class="rankings_panel">
      <div class="leaderboard_title">
        <div class="title">Check-in Leaderboard</div>
        <div class="val">
          <v-img :width="16" src="@/assets/images/svg/check_in/user.svg"></v-img>
          <span>{{ challengeInfo?.notEliminatedNumber }}</span>
          <span>/</span>
          <span style="color: #C3C0C0;">{{ challengeInfo?.totalNumber }}</span>
        </div>
      </div>
      <div class="ranking_box">
        <div class="leaderboard_item" v-for="(item, index) in challengeInfo?.cpRankingVOs" :key="index">
          <div class="ranking">
            <v-img :width="30" v-if="index == 0" src="@/assets/images/svg/check_in/leaderboard_0.svg"></v-img>
            <v-img :width="30" v-if="index == 1" src="@/assets/images/svg/check_in/leaderboard_1.svg"></v-img>
            <v-img :width="30" v-if="index == 2" src="@/assets/images/svg/check_in/leaderboard_2.svg"></v-img>
            <div class="user">
              <v-avatar v-if="item?.avatar" size="30" :image="item?.avatar"></v-avatar>
              <img v-else width="30" height="30" :avatar="item?.userName" color="#FEC72F" class="avatar">
              <div class="user_name">
                {{ item?.userName }}
              </div>
            </div>
          </div>
          <div class="bonus">
            <v-img :width="24" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
            <div class="val">{{ `+${item?.winAmount}` }}</div>
          </div>
          <div class="points">
            <div>{{ item?.points || "--" }}</div>
            <v-img :width="24" cover src="@/assets/images/svg/check_in/points.svg"></v-img>
          </div>
        </div>
        <div class="leaderboard_item you" v-if="challengeInfo?.userStatus == 1">
          <div class="ranking">
            <v-img :width="24" v-if="challengeInfo?.ranking - 1 == 0"
              src="@/assets/images/svg/check_in/leaderboard_0.svg"></v-img>
            <v-img :width="24" v-else-if="challengeInfo?.ranking - 1 == 1"
              src="@/assets/images/svg/check_in/leaderboard_1.svg"></v-img>
            <v-img :width="24" v-else-if="challengeInfo?.ranking - 1 == 2"
              src="@/assets/images/svg/check_in/leaderboard_2.svg"></v-img>
            <div v-else class="ranking_num">{{ challengeInfo?.ranking || 1 }}</div>
            <div class="user">
              <v-avatar v-if="challengeInfo.avatar" size="30" :image="userInfo.avatar"></v-avatar>
              <img v-else width="30" height="30" :avatar="challengeInfo?.userName" color="#FEC72F" class="avatar">
              <div class="user_name">YOU</div>
            </div>
          </div>
          <div class="bonus">
            <v-img :width="24" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
            <div class="val">{{ `+${challengeInfo?.winAmount}` }}</div>
          </div>
          <div class="points">
            <div>{{ challengeInfo?.totalPoints || "--" }}</div>
            <v-img :width="24" cover src="@/assets/images/svg/check_in/points.svg"></v-img>
          </div>
        </div>
      </div>
    </div>
    <div class="join_panel">
      <v-text-field v-model="bonusNum" :placeholder="formatPlaceholder()" variant="solo" density="comfortable"
        :readonly="challengeInfo.stage != 'REGISTRATION'" v-if="challengeInfo?.userStatus == 2" rounded="10px">
        <template v-slot:append-inner>
          <div v-if="challengeInfo.stage == 'REGISTRATION'" class="join_btn" @click="handleRegistration()">Join</div>
          <div v-else class="join_btn disabled">Join</div>
        </template>
      </v-text-field>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { getChallengeList, getChallengeDetails, challengeRegistration } from '@/services/api/challenge';
import { telegramLogin } from "@/services/api/user";
import { useUserStore } from "@/store/user.js";
import { useCheckInStore } from '@/store/check_in.js';
import { useMessageStore } from "@/store/message.js";
import { timeForStr } from "@/utils";

import GM from "@/assets/images/svg/check_in/GM.svg";
import BREAKFAST from "@/assets/images/svg/check_in/BREAKFAST.svg";
import LUNCH from "@/assets/images/svg/check_in/LUNCH.svg";
import SUPPER from "@/assets/images/svg/check_in/SUPPER.svg";
import GN from "@/assets/images/svg/check_in/GN.svg";

interface ucCheckInVOs {
  signType: string;
  [x: string]: string | number | any;
}

interface challenge {
  challengeId: number;
  signType: string;
  [x: string]: string | number | any;
}

interface challengeDetails {
  stage: string;
  prizePool: number;
  ucCheckInVOs: Array<ucCheckInVOs>;
  [x: string]: string | number | any;
}

export default defineComponent({
  data() {
    return {
      challengeList: [] as Array<challenge>,
      challengeInfo: {} as challengeDetails,
      currentIndex: 0,
      bonusNum: null as number | any,
      page: 1,
      size: 10,
      project: {
        GM,
        BREAKFAST,
        LUNCH,
        SUPPER,
        GN
      }
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    currentChallenge() {
      const { currentIndex, challengeList } = this;
      return challengeList[currentIndex];
    },
    challengeId() {
      const { challengeId } = useCheckInStore();
      return challengeId
    }
  },
  async created() {
    this.fetchChallengeList();
    const userStore = useUserStore();
    if (!userStore.isLogin) {

      let tg_certificate = "dXNlcj0lN0IlMjJpZCUyMiUzQTUwODA1ODkxNTIlMkMlMjJmaXJzdF9uYW1lJTIyJTNBJTIyQXN0cmFlYSUyMiUyQyUyMmxhc3RfbmFtZSUyMiUzQSUyMiUyMiUyQyUyMnVzZXJuYW1lJTIyJTNBJTIyYXN0cmFlYV9sZXZzJTIyJTJDJTIybGFuZ3VhZ2VfY29kZSUyMiUzQSUyMnpoLWhhbnMlMjIlMkMlMjJhbGxvd3Nfd3JpdGVfdG9fcG0lMjIlM0F0cnVlJTdEJmNoYXRfaW5zdGFuY2U9LTE0OTM1Mjg2MTg3OTkwMjE4NTEmY2hhdF90eXBlPXByaXZhdGUmYXV0aF9kYXRlPTE3MTg3NzY3MTgmaGFzaD1jMWVlMzYwMjFlNWQzNTM2MjJkMzVmZTk5NDJhOTFjOTY5NWNiYjFmMWUzMGYzOWYzYTI2MTYyOTIwN2JiMDU2"
      const res = await
        telegramLogin({
          tgEncodeStr: tg_certificate,
          inviteCode: ""
        });

      if (res.code == 200) {
        if (res.data.certificate) {
          localStorage.setItem("certificate", res.data.certificate);
          userStore.setLogin(res.data);
        }
      }
    }
  },
  methods: {
    // 获取挑战列表
    async fetchChallengeList() {
      const res = await getChallengeList({
        page: this.page,
        size: this.size
      });
      if (res.code == 200) {
        this.challengeList = res.data.records;
        const index = this.challengeList.findIndex(e => e.challengeId == this.challengeId);

        if (index > -1) {
          this.currentIndex = index;
        } else {
          this.currentIndex = 0;
        }
        if (this.challengeList.length > 0) {
          this.fetchChallengeDetail();
        }
      }
    },
    // 获取挑战详情
    async fetchChallengeDetail() {
      const { currentChallenge } = this;
      const { challengeId } = currentChallenge;

      const res = await getChallengeDetails({
        challengeId
      });
      if (res.code == 200) {
        this.challengeInfo = res.data;
        this.$nextTick(() => {
          (window as any).LetterAvatar.transform();
        });
      }
    },
    // 挑战报名
    async handleRegistration() {
      const { bonusNum, currentChallenge, userInfo } = this;
      const { setMessageText } = useMessageStore();

      if (!bonusNum || Number(bonusNum) < 1) {
        setMessageText("Please enter the GMC quantity!");
        return
      }

      if (userInfo.gmcAmount < bonusNum) {
        setMessageText("Not enough balance!");
        return
      }

      const res = await challengeRegistration({
        challengeId: currentChallenge?.challengeId,
        amount: bonusNum
      });

      if (res.code == 200) {
        setMessageText("Successful registration!");
        this.fetchChallengeDetail();
      }
    },
    handlePrev() {
      const { currentIndex } = this;
      if (currentIndex > 0) {
        this.currentIndex--;
      } else {
        // 返回列表
        this.$router.push('/activity');
      }
    },
    handleNext() {
      const { challengeList, currentIndex } = this;
      if (challengeList.length - 1 > currentIndex) {
        this.currentIndex++;
      } else {
        // 返回列表
        this.$router.push('/activity');
      }
    },
    // 项目名称
    getProject(event: any) {
      const { signType } = event;
      if (signType == "GM") {
        return "GM"
      } else if (signType == "BREAKFAST") {
        return "Breakfast"
      } else if (signType == "LUNCH") {
        return "Lunch"
      } else if (signType == "SUPPER") {
        return "Supper"
      } else if (signType == "GN") {
        return "GN"
      }
    },
    // 时间格式化
    formatTime(event: any) {
      return timeForStr("2001-01-01 " + event, "HH:mm")
    },
    // 输入框提示
    formatPlaceholder() {
      const { userInfo, challengeInfo } = this;
      if (challengeInfo.stage == "REGISTRATION") {
        return `Limit ${userInfo?.minAmount}-${userInfo?.maxAmount} GMC`;
      } else if (challengeInfo.stage == "SIGNIN") {
        return "The challenge is locked.";
      } else {
        return "The challenge is closed.";
      }
    }
  },
  watch: {
    currentIndex(val, old) {
      const { challengeList } = this;
      const { setChallengeId } = useCheckInStore();
      setChallengeId(challengeList[val].challengeId);

      if (this.challengeList.length > 0) {
        // 每次更新重新获取排行榜
        this.fetchChallengeDetail();
      }
    }
  }
});
</script>
<style lang="scss" scoped>
.activity_info {
  margin: 8px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(6, 4, 4, 0.6);
  overflow: hidden;

  .left_btn,
  .right_btn {
    width: 30px;
    height: 100px;
    background-color: rgba(255, 255, 255, 0.5);

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .center_box {
    flex: 1;
    height: 100px;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    .activity_time {
      font-size: 24px;
      text-align: center;
      font-weight: bold;
      color: #FBB11B;
    }

    .prize_pool {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: bold;
      color: #fff;
    }
  }
}

.check_in_panel {
  margin: 8px;
  background-color: rgba(255, 255, 255, 1);
  border: none;
  border-radius: 20px;
}

.check_in_hint {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  font-size: 18px;
  color: #FE2E75;
}

.check_in_items {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;


}

.check_in_item {
  flex: 1;
  min-width: 30%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.check_in_item:nth-child(1) {
  min-width: 40%;
  justify-content: flex-end;
}

.check_in_item:nth-child(2) {
  justify-content: flex-start;
  min-width: 40%;
  margin-left: 10%;
}

.check_in_main {
  width: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(249, 248, 248, 1);
  border-radius: 5px;

  .check_in_title {
    width: 100%;
    text-align: center;
    background-color: rgba(243, 242, 243, 1);
    border-radius: 5px;
    color: #6F6F6F;
    font-size: 14px;
    padding: 2px 4px;
  }

  .v-img {
    margin: 8px 0;
  }

  .check_in_time {
    font-size: 18px;
    color: #6F6F6F;
    font-weight: bold;
  }
}

.interval_panel {
  margin: -16px 8px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .interval {
    width: 6px;
    height: 50px;
    background: linear-gradient(90deg, rgba(251, 234, 203, 1) 0%, rgba(253, 190, 175, 1) 103%);
    border-radius: 10px;
  }
}

.rankings_panel {
  margin: 8px;
  min-height: 174px;
  background-color: rgba(243, 59, 89, 1);
  border-radius: 20px;
  padding: 14px 0;
  box-sizing: border-box;
}

.ranking_box {
  margin-top: 8px;
}

.leaderboard_title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  font-size: 16px;

  .val {
    display: flex;
    align-items: center;

    .v-img {
      margin-right: 4px;
    }
  }
}

.avatar {
  border: 4px solid #FBE945;
  border-radius: 50%;
}

.leaderboard_item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;

  &.you {
    background-color: #fe5f6d;
  }
}

.ranking {
  display: flex;
  align-items: center;

  .ranking_num {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .user {
    margin-left: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #fff;

    img {
      margin-right: 4px;
    }

    .user_name {
      width: 50px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.bonus {
  margin-left: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
  color: #fff;

  .v-img {
    margin-right: 4px;
  }
}

.points {
  margin-left: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
  color: #FFAD2E;

  .v-img {
    margin-left: 4px;
  }
}

.join_panel {
  margin: 0 8px;

  .join_btn {
    padding: 0 24px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(90deg, rgba(253, 239, 213, 1) 0%, rgba(248, 215, 156, 1) 101%);
    color: #FE2E75;
    font-size: 16px;
    border-radius: 4px;

    &.disabled {
      background: linear-gradient(90deg, rgba(155, 154, 153, 1) 0%, rgba(113, 113, 113, 1) 101%);
      color: #C8C1C1;
    }
  }

  ::v-deep .v-field--appended {
    padding-inline-end: 4px;
  }
}
</style>