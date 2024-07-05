<template>
  <div class="frens_ranking_wrapper">
    <div class="frens_ranking_base">
      <v-img :width="60" cover src="@/assets/images/svg/frens/report.svg"></v-img>
      <div class="title">GM Kings</div>
      <div class="description">Invite more frens to get here</div>
      <div class="invite_btns">
        <v-btn class="invite_btn" color="#49B6F6" height="32" width="220" @click="inviteToTelegram()" variant="flat"
          size="small">
          <v-img :width="24" style="margin-right: 4px;" cover src="@/assets/images/svg/frens/linvite_user.svg"></v-img>
          <span style="font-size: 20px; text-transform: capitalize;color: white;">Invite Friend</span>
        </v-btn>
        <v-btn style="margin-left: 12px;" color="#49B6F6" height="32" @click="copyInvite()" variant="flat" size="small">
          <v-icon icon="mdi-content-copy" size="20" color="#fff"></v-icon>
        </v-btn>
      </div>
    </div>
    <div class="ranking_list">
      <div class="ranking_list_item" v-for="(item, index) in frensRankingList" :key="index">
        <div class="ranking_num">
          <v-img :width="36" v-if="index == 0" src="@/assets/images/svg/check_in/leaderboard_0.svg"></v-img>
          <v-img :width="36" v-else-if="index == 1" src="@/assets/images/svg/check_in/leaderboard_1.svg"></v-img>
          <v-img :width="36" v-else-if="index == 2" src="@/assets/images/svg/check_in/leaderboard_2.svg"></v-img>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div class="user_info">
          <v-avatar v-if="item.avatar" size="40" :image="item.avatar"></v-avatar>
          <img v-else width="40" height="40" :avatar="item.userName" color="#3D3D3D" class="avatar">
          <div class="user_box">
            <div class="user_name">{{ item.userName }}</div>
            <div class="frens_relevant">
              <div class="frens_num">{{ `${item.totalNumber} Frens` }}</div>
              <div class="frens_prize">
                <span>{{ `+ ${Number(item.gmcAmount).toLocaleString()}` }}</span>
                <v-img :width="16" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserStore } from "@/store/user.js";
import { shareOnTelegram, onCopy } from "@/utils";
import { getInviteRankingList } from "@/services/api/user.js";


interface frensRankingInfo {
  userId: number, //用户ID
  userName: string | any, //用户名
  avatar: string | any, //头像
  totalNumber: number, //总邀请用户数
  gmcAmount: number //GMC数量
  [x: string]: string | number | any;
}

export default defineComponent({
  data() {
    return {
      frensRankingTotal: 0,
      frensRankingList: [] as Array<frensRankingInfo>,
      page: 1,
      size: 10,
      finished: false
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
  },
  created() {
    this.fetchInviteUserList();
  },
  methods: {
    // 获取邀请用户列表
    async fetchInviteUserList(type = 1, isSearch = true) {
      if (this.finished) return;
      let _page = this.page;
      if (isSearch) {
        this.finished = false;
        this.page = 1;
        _page = 1;
      }

      const res = await getInviteRankingList({
        page: _page,
        size: this.size
      });
      if (res.code == 200) {
        this.frensRankingTotal = res.data.total;

        if (res.data.current >= res.data.pages && this.page * this.size >= 300) {
          this.finished = true;
        }

        if (type == 1) {
          this.frensRankingList = res.data.records;
        } else {
          this.frensRankingList.push.apply(this.frensRankingList, res.data.records);
        }

        this.$nextTick(() => {
          (window as any).LetterAvatar.transform();
        });
      }
    },
    // 加载更多
    nextQuery() {
      this.page++;
      this.fetchInviteUserList(2, false);
    },
    // 邀请
    inviteToTelegram() {
      const { inviteCode } = this.userInfo;
      let inviteUrl = "";
      if (import.meta.env.MODE == "prod") {
        inviteUrl = `https://t.me/theGMCoinBot/GMCoin?startapp=${inviteCode}`;
      } else {
        inviteUrl = `https://t.me/gm_coin_test_bot/checking?startapp=${inviteCode}`
      }
      shareOnTelegram(inviteUrl);
    },
    // 复制链接
    copyInvite() {
      const { inviteCode } = this.userInfo;
      let inviteUrl = "";
      if (import.meta.env.MODE == "prod") {
        inviteUrl = `https://t.me/theGMCoinBot/GMCoin?startapp=${inviteCode}`;
      } else {
        inviteUrl = `https://t.me/gm_coin_test_bot/checking?startapp=${inviteCode}`
      }
      onCopy(inviteUrl)
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
.frens_ranking_wrapper {
  padding: 8px;
}

.frens_ranking_base {
  display: flex;
  align-items: center;
  flex-direction: column;

  .title {
    font-weight: bold;
    color: #FDEFD6;
    font-size: 24px;
  }

  .description {
    color: #FDEFD6;
    font-size: 18px;
  }

  .invite_btns {
    padding-top: 4px;
  }
}

.ranking_list {
  padding-top: 16px;

  &>.ranking_list_item+.ranking_list_item {
    margin-top: 8px;
  }
}

.ranking_list_item {
  background-color: rgba(249, 249, 249, 0.25);
  border-radius: 16px;
  padding: 8px;
  display: flex;
  align-items: center;

  .ranking_num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin-right: 8px;

    font-weight: bold;
    font-style: normal;
    font-size: 20px;
    color: #FDEFD6;

    .v-img {
      flex: none;
    }
  }

  .user_info {
    flex: 1;
    display: flex;
    align-items: center;

    &>img,
    &>.v-img {
      margin-right: 8px;
    }
  }

  .user_box {
    flex: 1;
  }

  .user_name {
    font-weight: bold;
    font-size: 18px;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .frens_relevant {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .frens_num {
      font-size: 16px;
      color: #FDEFD6;
    }

    .frens_prize {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: bold;
      color: #FBB11B;

      .v-img {
        margin-left: 4px;
      }
    }
  }
}

.avatar {
  border: 4px solid #FFAD2E;
  border-radius: 50%;
}
</style>