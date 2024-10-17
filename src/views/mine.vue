<template>
  <div class="mine_wrapper">
    <div class="user_box">
      <v-avatar
        v-if="userInfo?.avatar"
        size="50"
        :image="userInfo?.avatar"
      ></v-avatar>
      <img
        v-else
        width="50"
        height="50"
        :avatar="userInfo?.userName || 'avatar'"
        color="#3D3D3D"
        class="avatar"
      />
      <div class="min_text">{{ userInfo?.userName }}</div>
      <div class="points">
        <v-img
          :width="20"
          cover
          src="@/assets/images/svg/check_in/points.svg"
        ></v-img>
        <span>{{ Number(userInfo?.pointAmount || 0).toLocaleString() }}</span>
      </div>
    </div>
    <div class="level_panel">
      <div class="level_text">King's Level</div>
      <div class="level_list">
        <div class="level_item level_description">
          <div class="level_item_left">
            <div class="v-btn finished" style="width: 80px">Level</div>
            <div class="v-btn finished">Entry Limits</div>
          </div>
          <div class="level_item_right">
            <div class="v-btn finished">Level Up</div>
          </div>
        </div>
        <div class="level_item" v-for="(item, index) in levelList" :key="index">
          <div class="level_item_left">
            <div class="level_num">
              <div class="num">{{ `Lvl ${item.level}` }}</div>
              <v-img
                :width="70"
                :class="[index > 3 && 'level_img']"
                cover
                :src="levelImages[item.level as keyof typeof levelImages]"
              ></v-img>
            </div>
            <div class="level_item_reward">
              <div class="level_bonus">
                <v-img
                  :width="20"
                  cover
                  src="@/assets/images/svg/check_in/gm_coin.svg"
                ></v-img>
                <div class="bonus">
                  {{
                    `${Number(item.minAmount).toLocaleString()} - ${Number(
                      item.maxAmount
                    ).toLocaleString()}`
                  }}
                </div>
              </div>
              <div class="level_expected_revenue" v-if="!item.isLocked">
                <span>Daily Earn: </span>
                <span style="color: #55e60c; font-weight: bold">
                  ${{ calculateReturn(item.minAmount) }}
                </span>
                <span style="color: #55e60c; font-weight: bold">-</span>
                <span style="color: #55e60c; font-weight: bold">
                  ${{ calculateReturn(item.maxAmount) }}
                </span>
              </div>
            </div>
          </div>
          <div class="level_item_right">
            <v-btn
              :color="item.isLocked ? 'rgb(0,0,0,0)' : '#49B6F6'"
              :loading="item.loading"
              height="24"
              width="80"
              density="compact"
              @click="levelUp(item)"
              :variant="item.isLocked ? 'elevated' : 'flat'"
              :disabled="item.isLocked"
              size="x-small"
              v-if="item.level <= userInfo?.level + 1"
            >
              <div class="btn_box">
                <v-img
                  v-if="!item.isLocked"
                  :width="18"
                  cover
                  src="@/assets/images/svg/check_in/gm_coin.svg"
                ></v-img>
                <div v-if="!item.isLocked" class="finished">
                  {{ unitConversion(item.upgradeAmount) }}
                </div>
                <div v-if="item.isLocked" class="finished">Unlocked</div>
                <div class="dot" v-else-if="userInfo.isUpgrade"></div>
              </div>
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { useCheckInStore } from "@/store/check_in.js";
import { getLevelList, levelUpgrade } from "@/services/api/user.js";
import { useMessageStore } from "@/store/message.js";
import { unitConversion } from "@/utils";

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
import bigNumber from "bignumber.js";

interface levelInfo {
  id: number; //等级ID
  level: number; //等级
  upgradeAmount: number; //升级消耗金额(GMC)
  minAmount: number; //最小输入金额(GMC)
  maxAmount: number; //最大输入金额(GMC)
  isLocked: boolean; //是否解锁(true-解锁，false-未解锁)
  [x: string]: string | number | any;
}

export default defineComponent({
  data() {
    return {
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
        10: Level_10,
      },
      levelList: [] as Array<levelInfo>,
      timer: null as number | any,
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    gmtConvertUsd() {
      const { gmtConvertUsd } = useUserStore();
      return gmtConvertUsd;
    },
    expectedReturn() {
      const { expectedReturn } = useCheckInStore();
      return expectedReturn;
    },
  },
  created() {
    this.fetchLevelList();

    // 获取收益率
    const { fetchExpectedReturn } = useCheckInStore();
    fetchExpectedReturn();

    // 获取 GMT > U 汇率
    const { fetchCoinExchange } = useUserStore();
    fetchCoinExchange("GMT");
  },
  methods: {
    unitConversion: unitConversion,
    // 获取等级列表
    async fetchLevelList() {
      const res = await getLevelList({});
      if (res.code == 200) {
        this.levelList = res.data;
        this.levelList.forEach((item: any) => {
          item.loading = false;
        });
      }
    },
    async levelUp(event: any) {
      const { userInfo } = this;
      const { setMessageText } = useMessageStore();
      if (userInfo.gmcAmount < event.upgradeAmount) {
        const { setShowRecharge, setRechargeType } = useUserStore();
        setRechargeType(1);
        setShowRecharge(true);
        return;
      }

      event.loading = true;
      const res = await levelUpgrade({
        levelId: event.id,
      });

      event.loading = false;
      if (res.code == 200) {
        setMessageText("Upgrade successful");
        const userStore = useUserStore();
        userStore.fetchUserInfo();
        this.fetchLevelList();
      }
    },
    calculateReturn(event: number) {
      const { expectedReturn, gmtConvertUsd } = this;

      const returnVal = new bigNumber(event)
        .multipliedBy(expectedReturn)
        .dividedBy(10000)
        .multipliedBy(gmtConvertUsd)
        .toNumber();

      const index = this.getNonZeroDecimalIndex(returnVal);

      return returnVal.toFixed(index > 1 ? index + 1 : 2);
    },
    // 去邀请
    toFrens() {
      this.$router.push("/frens");
    },
    // 去做任务
    toEarn() {
      this.$router.push("/earn");
    },
    // 获取小数点后第一个非0的索引
    getNonZeroDecimalIndex(number: number) {
      const decimalPart = number.toString().split(".")[1];
      if (!decimalPart) return -1; // 如果没有小数部分，返回 -1

      for (let i = 0; i < decimalPart.length; i++) {
        if (decimalPart[i] !== "0") {
          return i; // 返回第一个不为 0 的索引
        }
      }
      return -1; // 如果全部为 0，返回 -1
    },
  },
  mounted() {
    this.$nextTick(() => {
      (window as any).LetterAvatar.transform();
    });
  },
});
</script>
<style lang="scss" scoped>
.mine_wrapper {
  padding: 16px 8px 8px;
}

.user_box {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: 0 auto;

  .min_text {
    font-size: 20px;
    font-weight: bold;
    color: #f7f7f7;
  }

  .points {
    min-width: 160px;
    padding: 2px 10px;
    background-color: rgba(6, 4, 4, 0.65);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    line-height: 1;
    font-weight: bold;
    color: #fbb11b;

    .v-img {
      flex: none;
      margin-right: 4px;
    }
  }
}

.avatar {
  border: 4px solid #ffad2e;
  border-radius: 50%;
}

.level_panel {
  padding-top: 12px;

  .level_text {
    font-weight: bold;
    font-size: 20px;
    color: #fdefd6;
  }
}

.level_panel {
  .level_title {
    font-size: 16px;
    font-weight: bold;
    color: #fff;
  }
}

.level_list {
  & > .level_item + .level_item {
    margin-top: 8px;
  }

  & > .level_item:nth-child(2) {
    margin-top: 0;
  }
}

.level_item {
  background-color: rgba(6, 4, 4, 0.65);
  border-radius: 14px;
  padding: 8px 16px 8px 8px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.level_description {
  background-color: transparent;
  padding: 0px 8px;
}

.level_item_left {
  display: flex;
  align-items: center;
  color: #fff;

  .level_num {
    margin-right: 8px;
    box-sizing: border-box;

    .level_img {
      margin-top: -8px;
    }

    .num {
      box-sizing: border-box;
      text-align: right;
      padding-right: 12px;
      margin-bottom: -4px;
      font-size: 14px;
      font-weight: bold;
    }
  }

  .finished {
    font-size: 14px;
    color: #fff;
    text-transform: capitalize;
  }
}

.level_item_reward {
  .level_name {
    font-size: 14px;
    font-weight: bold;
  }

  .level_bonus {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: bold;
    color: #fbb11b;

    .v-img {
      flex: none;
      margin-right: 2px;
    }
  }

  .level_expected_revenue {
    font-size: 12px;
  }
}

.level_item_right {
  .v-btn {
    color: #fff;
  }

  .finished {
    font-size: 12px;
    color: #fff;
    text-transform: capitalize;
  }
}

.dialog_box {
  background-color: #000;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  align-items: center;
  flex-direction: column;
  color: #fff;
  text-align: center;
  font-size: 20px;
  line-height: 1.2;

  .dialog_text {
    margin-bottom: 12px;
  }

  .recharge_btns {
    display: flex;
    flex-direction: column;
  }

  .recharge_item + .recharge_item {
    margin-top: 8px;
  }

  .recharge_item {
    background-color: #49b6f6;
    font-size: 16px;

    &.gift {
      background-color: #f33b59;
    }

    .v-img {
      margin-right: 4px;
    }

    .finished {
      color: #fff;
    }
  }
}

.finished {
  text-transform: none;
}

.btn_box {
  display: flex;
  align-items: center;
  position: relative;

  .v-img {
    flex: none;
  }

  .dot {
    position: absolute;
    top: 0;
    right: -10px;
    width: 10px;
    height: 10px;
    background-color: red;
    border: 2px solid #fff;
    border-radius: 50%;
  }
}
</style>