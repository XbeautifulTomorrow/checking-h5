<template>
  <div class="mine_wrapper">
    <div class="user_box">
      <v-avatar v-if="userInfo?.avatar" size="70" :image="userInfo?.avatar"></v-avatar>
      <img v-else width="70" height="70" :avatar="userInfo?.userName || 'avatar'" color="#FEC72F" class="avatar">
      <div class="min_text">Constantin</div>
      <div class="points">
        <v-img :width="20" cover src="@/assets/images/svg/check_in/points.svg"></v-img>
        <span>{{ userInfo?.pointAmount }}</span>
      </div>
    </div>
    <div class="level_panel">
      <div class="level_text">King's Level</div>
      <div class="level_list">
        <div class="level_item level_description">
          <div class="level_item_left">
            <div class="v-img" style="width: 80px;">Level</div>
            <div class="level_item_reward">Entry Limits</div>
          </div>
          <div class="level_item_right">
            <div class="v-btn finished">Level Up</div>
          </div>
        </div>
        <div class="level_item" v-for="(item, index) in levelList" :key="index">
          <div class="level_item_left">
            <div class="level_num">
              <div class="num">{{ `Lvl ${item.level}` }}</div>
              <v-img :width="80" cover :src="levelImages[item.level as keyof typeof levelImages]"></v-img>
            </div>
            <div class="level_item_reward">
              <div class="level_bonus">
                <v-img :width="20" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
                <div class="bonus">{{ `${item.minAmount} - ${item.maxAmount}` }}</div>
              </div>
            </div>
          </div>
          <div class="level_item_right">
            <v-btn :color="item.isLocked ? 'rgb(0,0,0,0)' : 'info'" :loading="item.loading" height="30" width="86"
              density="compact" @click="levelUp(item)" :variant="item.isLocked ? 'elevated' : 'flat'"
              :disabled="item.isLocked" size="x-small">
              <div v-if="!item.isLocked" class="finished">{{ item.upgradeAmount }}</div>
              <div v-else-if="item.isLocked" class="finished">Unlocked</div>
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
import { getLevelList, levelUpgrade } from "@/services/api/user.js";
import { useMessageStore } from "@/store/message.js";

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

interface levelInfo {
  "id": number, //等级ID
  "level": number, //等级
  "upgradeAmount": number, //升级消耗金额(GMC)
  "minAmount": number, //最小输入金额(GMC)
  "maxAmount": number, //最大输入金额(GMC)
  "isLocked": boolean //是否解锁(true-解锁，false-未解锁)
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
        10: Level_10
      },
      levelList: [] as Array<levelInfo>
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo
    },
  },
  created() {
    this.fetchLevelList();
  },
  methods: {
    // 获取等级列表
    async fetchLevelList() {
      const res = await getLevelList({});
      if (res.code == 200) {
        this.levelList = res.data;
      }
    },
    async levelUp(event: any) {
      const { userInfo } = this;
      const { setMessageText } = useMessageStore();
      if (userInfo.gmcAmount < event.upgradeAmount) {
        setMessageText("Not enough balance");
        return
      }

      const res = await levelUpgrade({
        levelId: event.id
      });

      if (res.code == 200) {
        setMessageText("Upgrade successful");
        this.fetchLevelList();
      }
    }
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
    font-size: 24px;
    font-weight: bold;
    color: #F7F7F7;
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
    color: #FBB11B;

    .v-img {
      flex: none;
      margin-right: 4px;
    }
  }
}

.avatar {
  border: 4px solid #FBE945;
  border-radius: 50%;
}

.level_panel {
  padding-top: 16px;

  .level_text {
    font-weight: bold;
    font-size: 24px;
    color: #FDEFD6;
  }
}

.level_panel {
  margin-top: 24px;

  .level_title {
    font-size: 20px;
    font-weight: bold;
    color: #fff;
  }
}

.level_list {
  &>.level_item+.level_item {
    margin-top: 8px;
  }
}

.level_item {
  background-color: rgba(6, 4, 4, 0.65);
  border-radius: 20px;
  padding: 8px 16px 8px 8px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.level_description {
  background-color: transparent;
}

.level_item_left {
  display: flex;
  align-items: center;
  color: #fff;

  .level_num {
    margin-right: 8px;
    box-sizing: border-box;

    .num {
      box-sizing: border-box;
      text-align: right;
      padding-right: 16px;
      margin-bottom: -4px;
      font-size: 16px;
      font-weight: bold;
    }
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
    font-size: 12px;
    font-weight: bold;
    color: #FBB11B;

    .v-img {
      flex: none;
      margin-right: 2px;
    }
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
</style>