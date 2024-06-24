<template>
  <div class="airdrop_wrapper">
    <div class="gift_box">
      <v-img :width="160" cover src="@/assets/images/airdrop/coin_gmc.png"></v-img>
      <div class="description_text">Keep up the good habits, the airdrop is coming.</div>
    </div>
    <div class="preparation_phase">
      <div class="prepare_item" v-for="(item, index) in prepareList" :key="index">
        <div :class="['check_box', item.isCheck && 'checked']">
          <v-img v-if="item.isCheck" :width="14" cover src="@/assets/images/svg/airdrop/checked.svg"></v-img>
        </div>
        <div class="prepare_text">{{ item.text }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      prepareList: [
        {
          isCheck: true,
          text: 'Foundation Negotiations'
        },
        {
          isCheck: true,
          text: 'Market Maker Preparation'
        },
        {
          isCheck: true,
          text: 'Preparation for Market Making Funds'
        },
        {
          isCheck: true,
          text: 'Core Partners are Coming'
        },
        {
          isCheck: false,
          text: 'Airdrop Task List Release'
        }
      ]
    };
  },
  methods: {
  },
});
</script>
<style lang="scss" scoped>
.airdrop_wrapper {
  padding: 0 16px;
}

.gift_box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .description_text {
    width: 90%;
    text-align: center;
    font-weight: bold;
    font-size: 20px;
    color: #FDEFD6;
    margin-top: -10px;
  }
}

.preparation_phase {
  margin-top: 24px;

  .prepare_item+.prepare_item {
    margin-top: 12px;
  }
}

.prepare_item {
  display: flex;
  align-items: center;

  .check_box {
    width: 24px;
    height: 24px;
    background-color: #4f4f4f;
    box-sizing: border-box;
    border: 2px solid #b2b2b2;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;

    .v-img {
      flex: none;
    }

    &.checked {
      background-color: #66df2b;
      border-color: white;
    }
  }

  .prepare_text {
    font-weight: bold;
    font-size: 16px;
    color: #FDEFD6;
  }
}
</style>