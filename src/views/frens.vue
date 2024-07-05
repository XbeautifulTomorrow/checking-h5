<template>
  <div class="frens_wrapper">
    <div class="frens_text">Invite Friends!</div>
    <div class="total_rewards">
      <div class="rewards">
        <v-img :width="24" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
        <div> {{ Number(userInfo?.totalInviteAmount).toLocaleString() }}</div>
      </div>
      <div class="invitation_ranking" @click="toRanking()">
        <v-img :width="40" cover src="@/assets/images/svg/frens/report.svg"></v-img>
        <div>Top 300 Leaders</div>
        <v-icon size="20" icon="mdi-menu-right-outline"></v-icon>
      </div>
    </div>
    <div class="frens_descriptions">
      <div class="frens_descriptions_item">
        <div class="dots">
          <div class="line"></div>
          <div class="dot_box">
            <div class="dot"></div>
          </div>
        </div>
        <div class="descriptions_text">Share your invitation link to your frens.</div>
      </div>
      <div class="frens_descriptions_item">
        <div class="dots">
          <div class="line"></div>
          <div class="dot_box">
            <div class="dot"></div>
          </div>
        </div>
        <div class="descriptions_text">Your frens join GMCoin and start any Challenge.</div>
      </div>
      <div class="frens_descriptions_item">
        <div class="dots">
          <div class="line"></div>
          <div class="dot_box">
            <div class="dot"></div>
          </div>
        </div>
        <div class="descriptions_text">You and your frens will receive bonuses.</div>
      </div>
      <div class="frens_descriptions_item">
        <div class="dots">
          <div class="line"></div>
          <div class="dot_box">
            <div class="dot"></div>
          </div>
        </div>
        <div class="descriptions_text">
          <span>{{ `You'll also get an extra ` }}</span>
          <span style='color: #49B6ED;'>1%</span>
          <span>{{ ` from each of your frens' check-ins.` }}</span>
        </div>
      </div>
    </div>
    <div class="invitation_method">
      <div class="method_item">
        <div class="method_item_img">
          <v-img :width="50" cover src="@/assets/images/frens/invite_prize.png"></v-img>
        </div>
        <div class="method_box">
          <div class="method_text">Invite a Friend</div>
          <div class="method_prize">
            <div class="energy">
              <span class="dot">·</span>
              <v-icon color="#FFF100" :size="18" icon="mdi-lightning-bolt"></v-icon>
              <span>{{ `+ 1` }}</span>
            </div>
            <div class="bonus">
              <v-img :width="18" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
              <span>{{ `+ 100` }}</span>
            </div>
            <div class="text">for you and your friend</div>
          </div>
        </div>
      </div>
      <div class="method_item">
        <div class="method_item_img">
          <v-img :width="60" cover src="@/assets/images/frens/telegram_premium_prize.png"></v-img>
        </div>
        <div class="method_box">
          <div class="method_text">
            <div>
              <span>Invite a Friend with </span>
              <span style="color:#49B6F6;">Telegram Premium</span>
            </div>
          </div>
          <div class="method_prize">
            <div class="energy">
              <span class="dot">·</span>
              <v-icon color="#FFF100" :size="18" icon="mdi-lightning-bolt"></v-icon>
              <span>{{ `+ 3` }}</span>
            </div>
            <div class="bonus">
              <v-img :width="18" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
              <span>{{ `+ 500` }}</span>
            </div>
            <div class="text">for you and your friend</div>
          </div>
        </div>
      </div>
    </div>
    <div class="frens_list">
      <div class="frens_list_text">{{ `Friend List(${frensTotal})` }}</div>
      <div class="frens_list_content">
        <div class="frens_list_item" v-for="(item, index) in frensList" :key="index">
          <div class="frens_list_item_left">
            <v-avatar v-if="item.avatar" size="40" :image="item.avatar"></v-avatar>
            <img v-else width="40" height="40" :avatar="item.userName" color="#3D3D3D" class="avatar">
            <div class="frens_list_item_left_box">
              <div :class="['user_name', item.isMember && 'premium']">{{ item.userName }}</div>
              <div class="user_other">
                <v-img :width="60" cover :src="levelImages[item.level as keyof typeof levelImages]"></v-img>
                <div class="user_points" v-if="item.points">
                  <v-img :width="18" cover src="@/assets/images/svg/check_in/points.svg"></v-img>
                  <span>{{ `${unitConversion(item.points)}` }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="frens_list_item_right">
            <div class="frens_list_item_right_time">{{ timeForStr(item.registrationTime, "MM-dd HH:mm:ss") }}</div>
            <div class="user_prize">
              <div class="energy" v-if="item.energyAmount">
                <v-icon color="#FFF100" :size="18" icon="mdi-lightning-bolt"></v-icon>
                <span>{{ `+ ${item.energyAmount}` }}</span>
              </div>
              <div class="bonus" v-if="item.gmcAmount">
                <v-img :width="18" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
                <span>{{ `+ ${unitConversion(item.gmcAmount)}` }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <v-btn class="invite_btn" height="32" width="70%" @click="inviteToTelegram()" rounded="lg" size="small">
      <v-img :width="24" style="margin-right: 4px;" cover src="@/assets/images/svg/frens/linvite_user.svg"></v-img>
      <span style="font-size: 20px; text-transform: capitalize;">Invite Friend</span>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserStore } from "@/store/user.js";
import { getInviteUserList } from "@/services/api/user.js";
import { shareOnTelegram, timeForStr, unitConversion } from "@/utils";

// 等级图标
import Level_1 from "@/assets/images/svg/main/level_1.svg";
import Level_2 from "@/assets/images/svg/main/level_2.svg";
import Level_3 from "@/assets/images/svg/main/level_3.svg";
import Level_4 from "@/assets/images/svg/main/level_4.svg";
import Level_5 from "@/assets/images/svg/main/level_5.svg";
import Level_6 from "@/assets/images/svg/main/level_6.svg";
import Level_7 from "@/assets/images/svg/main/level_7.svg";
import Level_8 from "@/assets/images/svg/main/level_8.svg";
import Level_9 from "@/assets/images/svg/main/level_9.svg";
import Level_10 from "@/assets/images/svg/main/level_10.svg";

interface frensInfo {
  userId: number, //用户ID
  userName: string, //用户名
  avatar: string | any, //头像
  level: number | string, //用户等级
  points: number | string | any, //用户积分
  registrationTime: string, //注册时间
  energyAmount: number | string | any, //能量数量
  gmcAmount: number | string | any //GMC数量
  isMember: boolean; // 是否是会员
  [x: string]: string | number | any;
}

export default defineComponent({
  data() {
    return {
      frensTotal: 0,
      frensList: [] as Array<frensInfo>,
      levelImages: {
        1: Level_1,
        2: Level_2,
        3: Level_3,
        4: Level_4,
        5: Level_5,
        6: Level_6,
        7: Level_7,
        8: Level_8,
        9: Level_9,
        10: Level_10
      },
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
  methods: {
    timeForStr: timeForStr,
    unitConversion: unitConversion,
    // 获取邀请用户列表
    async fetchInviteUserList(type = 1, isSearch = true) {
      if (this.finished) return;
      let _page = this.page;
      if (isSearch) {
        this.finished = false;
        this.page = 1;
        _page = 1;
      }

      const res = await getInviteUserList({
        page: _page,
        size: this.size
      });
      if (res.code == 200) {
        this.frensTotal = res.data.total;

        if (res.data.current >= res.data.pages) {
          this.finished = true;
        }

        if (type == 1) {
          this.frensList = res.data.records;
        } else {
          this.frensList.push.apply(this.frensList, res.data.records);
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
    // 打开邀请奖励排行榜
    toRanking() {
      this.$router.push({
        path: "/frensRanking"
      })
    }
  },
});
</script>
<style lang="scss" scoped>
.frens_wrapper {
  padding: 8px;
  box-sizing: border-box;
}

.frens_text {
  font-weight: bold;
  font-size: 24px;
  color: #FDEFD6;
  text-align: center;
}

.total_rewards {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(6, 4, 4, 0.6);
  height: 50px;
  border-radius: 10px;
  padding: 0 8px;
  margin-top: 4px;
}

.rewards {
  min-width: 80px;
  flex: 1 0 36%;
  height: 100%;
  font-weight: bold;
  font-size: 18px;
  color: #FBB11B;
  border-right: 4px solid #fdefd6;

  display: flex;
  align-items: center;

  .v-img {
    flex: none;
    margin-right: 4px;
  }
}

.invitation_ranking {
  flex: 1 0 60%;
  font-size: 16px;
  color: #FDEFD6;
  display: flex;
  align-items: center;
  justify-content: center;

  .v-img {
    flex: none;
    margin-right: 4px;
  }
}

.frens_descriptions {
  margin-top: 8px;

  .frens_descriptions_text {
    font-size: 14px;
    color: #FDEFD6;
  }
}

.frens_descriptions_item {
  display: flex;

  .dots {
    margin-right: 8px;
    position: relative;

    .line {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      height: 100%;
      width: 2px;
      background-color: #FBE945;
    }

    .dot_box {
      display: flex;
      align-items: center;
      height: 20px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #FEC72F;
      border: 2px solid #FBE945;
    }
  }



  .descriptions_text {
    font-size: 14px;
    color: #fdefd6;
  }
}

.frens_descriptions_item:nth-child(1) {
  .dots {
    margin-right: 8px;
    position: relative;

    .line {
      height: 10px;
      bottom: 0;
    }
  }
}

.frens_descriptions_item:last-child {
  .dots {
    margin-right: 8px;
    position: relative;

    .line {
      height: 10px;
      top: 0;
    }
  }
}

.invitation_method {
  margin-top: 12px;

  .method_item+.method_item {
    margin-top: 8px;
  }
}


.method_item {
  background-color: rgba(6, 4, 4, 0.65);
  border-radius: 14px;
  display: flex;
  align-items: center;
  padding: 8px;

  .method_item_img {
    width: 60px;
    height: 60px;
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;

    .v-img {
      flex: none;
    }
  }

  .method_box {
    .method_text {
      display: flex;
      align-items: center;
      height: 36px;
      font-weight: bold;
      font-size: 16px;
      color: #FFFFFF;
      line-height: 1;
    }
  }

  .method_prize {
    display: flex;
    align-items: center;
    line-height: 1;

    &>div {
      display: flex;
      align-items: center;
      font-size: 14px;
    }

    &>div+div {
      margin-left: 4px;
    }

    .energy,
    .bonus {
      color: #FBB11B;
      font-weight: bold;

      .dot {
        font-size: 20px;
      }

      .v-img {
        margin-right: 4px;
      }
    }

    .text {
      color: #fff;
    }
  }
}

.frens_list {
  padding-top: 8px;
  padding-bottom: 50px;

  .frens_list_text {
    font-weight: bold;
    font-size: 20px;
    color: #FDEFD6;
  }
}

.frens_list_content {
  .frens_list_item+.frens_list_item {
    margin-top: 8px;
  }
}

.frens_list_item {
  background-color: rgba(6, 4, 4, 0.65);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
}

.frens_list_item_left {
  display: flex;
  align-items: center;

  &>img,
  &>v-img {
    margin-right: 8px;
    flex: none;
  }

  .user_name {
    font-weight: bold;
    font-size: 16px;
    color: #FFFFFF;
    max-width: 140px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &.premium {
      color: #49B6F6;
    }
  }

  .user_other {
    display: flex;
    align-items: center;

    &>.v-img {
      margin-right: 8px;
      flex: none;
    }
  }

  .user_points {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: bold;
    color: #FBB11B;

    &>.v-img {
      margin-right: 4px;
    }
  }
}

.frens_list_item_right {
  .frens_list_item_right_time {
    font-size: 16px;
    color: #E1E1E1;
  }

  .user_prize {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    &>div+div {
      margin-left: 8px;
    }

    &>div {
      display: flex;
      align-items: center;
      color: #FBB11B;
      font-weight: bold;
      font-size: 14px;

      .v-img {
        margin-right: 4px;
      }
    }
  }
}

.invite_btn {
  position: fixed;
  left: 0;
  right: 0;
  margin: 0 auto;
  bottom: 60px;
  z-index: 2000;
  background-color: #49b6f6;
  color: white;
}

.avatar {
  border: 4px solid #FFAD2E;
  border-radius: 50%;
}
</style>