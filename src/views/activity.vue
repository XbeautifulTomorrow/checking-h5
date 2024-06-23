<template>
  <div class="activity_wrapper">
    <div class="challenge_box">
      <div class="challenge_item" v-for="(item, index) in challengeList" :key="index">
        <div class="avatar_left">
          <div class="avatar_item" v-if="userJoin(item.userInfoVOList)">
            <v-avatar v-if="userInfo?.avatar" size="34" :image="userInfo?.avatar"></v-avatar>
            <img v-else width="34" height="34" :avatar="userInfo?.userName || 'avatar'" color="#3D3D3D" class="avatar">
          </div>
          <div class="use_text" v-if="userJoin(item.userInfoVOList)">YOU</div>
        </div>
        <div class="avatar_box" @click="toChallenge(item)">
          <div class="avatar_item" v-for="(nodes, indices) in item.userInfoVOList" :key="indices">
            <v-avatar v-if="nodes?.avatar" size="34" :image="nodes?.avatar"></v-avatar>
            <img v-else width="34" height="34" :avatar="nodes?.userName || 'avatar'" color="#3D3D3D" class="avatar">
          </div>
        </div>
        <div class="avatar_right"></div>
        <div class="challenge_info" @click="toChallenge(item)">
          <div :class="['challenge_time', item.stage]">
            {{ `${item?.startDateStr || "-"} - ${item?.endDateStr || "-"}` }}
          </div>
          <div class="challenge_bonus">
            <v-img :width="20" src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
            <div class="bonus_num">{{ Number(item?.prizePool || 0).toLocaleString() }}</div>
          </div>
          <div class="challenge_user">
            <v-img :width="20" src="@/assets/images/svg/active/user.svg"></v-img>
            <div class="bonus_num">{{ Number(item?.totalNumber || 0).toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserStore } from "@/store/user.js";
import { getChallengeList } from '@/services/api/challenge';
import { useCheckInStore } from '@/store/check_in.js';

interface userInfoVOList {
  avatar: string;
  tgId: string;
  userId: number | string;
  userName: string;
  [x: string]: string | number | any;
}

interface challenge {
  challengeId: number;
  signType: string;
  userInfoVOList: Array<userInfoVOList>;
  [x: string]: string | number | any;
}

export default defineComponent({
  data() {
    return {
      challengeList: [] as Array<challenge>,
      challengeTotal: 0,
      page: 1,
      size: 10,
      finished: false,
    };
  },
  created() {
    this.fetchChallengeList();
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
  },
  methods: {
    // 获取挑战列表
    async fetchChallengeList(type = 1, isSearch = true) {
      if (this.finished) return;
      let _page = this.page;
      if (isSearch) {
        this.finished = false;
        this.page = 1;
        _page = 1;
      }

      const res = await getChallengeList({
        page: _page,
        size: this.size
      });
      if (res.code == 200) {
        this.challengeTotal = res.data.total;

        if (res.data.current >= res.data.pages) {
          this.finished = true;
        }

        if (type == 1) {
          this.challengeList = res.data.records;
        } else {
          this.challengeList.push.apply(this.challengeList, res.data.records);
        }

        const count = 10;

        for (let i = 0; i < this.challengeList.length; i++) {
          const counts = this.challengeList[i].userInfoVOList.length;
          for (let j = 0; j < count; j++) {
            if (j >= counts) {
              this.challengeList[i].userInfoVOList.push({
                avatar: '',
                tgId: '',
                userId: '',
                userName: ''
              });
            }
          }
        }

        this.$nextTick(() => {
          (window as any).LetterAvatar.transform();
        });
      }
    },
    // 加载更多
    nextQuery() {
      this.page++;
      this.fetchChallengeList(2, false);
    },
    // 比赛详情
    toChallenge(event: challenge) {
      const { challengeId } = event;

      const useCheckIn = useCheckInStore();
      useCheckIn.setChallengeId(challengeId);

      this.$router.push('/');
    },
    // 当前比赛是否参加
    userJoin(event: Array<userInfoVOList>) {
      const { userInfo } = this;
      return event.findIndex(e => e.userId == String(userInfo?.userId)) > -1;
    }
  },
  mounted() {
    const _this = this;
    window.addEventListener('scroll', function () {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        if (!_this.finished) {
          _this.nextQuery();
        }
      }
    });
  },
});
</script>
<style lang="scss" scoped>
.activity_wrapper {
  padding: 16px 8px;
}

.challenge_box {
  display: flex;
  flex-direction: column;
}

.challenge_item {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .avatar_left,
  .avatar_right {
    width: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .avatar_left {
    justify-content: flex-end;

    .avatar_item {
      width: 100%;
      display: flex;
    }
  }

  .use_text {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -24px;
    font-weight: bold;
    color: #fff;
  }
}

.challenge_item+.challenge_item {
  margin-top: 24px;
}

.avatar_box {
  width: 170px;
  margin: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  .avatar_item {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar_item:nth-child(5) {
    justify-content: flex-start;
    flex: 1;
    min-width: 50%;
    margin: 4px 0;
  }

  .avatar_item:nth-child(6) {
    justify-content: flex-end;
    flex: 1;
    min-width: 50%;
    margin: 4px 0;
  }
}



.challenge_info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid #000;
  border-radius: 10px;
  overflow: hidden;

  .challenge_time {
    padding: 2px 8px;
    font-size: 12px;
    color: #fff;

    &.REGISTRATION {
      background-color: #fff;
      color: #FE3A71;
    }

    &.SIGNIN {
      background-color: #fe2e75;
    }

    &.ENDED {
      background-color: #A8A7A7;
    }
  }

  .challenge_bonus,
  .challenge_user {
    padding: 0 8px;
    display: flex;
    align-items: center;
    justify-content: center;

    .v-img {
      margin-right: 4px;
      flex: none;
    }
  }

  .challenge_bonus {
    background-color: #000;
    color: #FFAD2E;
    font-weight: bold;
  }

  .challenge_user {
    background-color: #ffad2e;
  }
}

.avatar {
  border: 4px solid #FBE945;
  border-radius: 50%;
}
</style>