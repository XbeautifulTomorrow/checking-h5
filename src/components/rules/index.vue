<template>
  <v-dialog v-model="showRules" width="auto" transition="dialog-bottom-transition">
    <div class="dialog_box">
      <div class="rules_title">GMCoin Rules</div>
      <div class="rules_panel">
        <span>Welcome to </span>
        <span style="font-weight: bold">GMCoin</span>
        <span> , with the development of technology, people in their daily life more and more ways of
          entertainment, too much entertainment occupies a lot of time, which makes people's habits have been greatly
          affected, GMCoin is a Web3 application in order to improve the status quo, our vision is to through the
          mechanism of GMCoin to make the participants of the game to develop a good work and rest habits - go to bed
          early and eat on time, and will also through its own way to provide Real Rewards for the players.
        </span>
        <br />
        <br />
        <span>
          Each day GMCoin will hold a round of challenges that will last for 8 days, with 1 day for signups and 7 days
          to complete the challenge. Each day's challenge consists of 5 check-ins, which are:
        </span>
        <br />
        <br />
        <span>
          <span>GM: </span>
          <span style="font-weight: bold;color: #FDEFD6;">From UTC 07:00 to 07:30</span>
        </span>
        <br />
        <span>
          <span>Breakfast: </span>
          <span style="font-weight: bold;color: #FDEFD6;">From UTC 08:30 to 09:00</span>
        </span>
        <br />
        <span>
          <span>Lunch: </span>
          <span style="font-weight: bold;color: #FDEFD6;">From UTC 12:00 to 12:30</span>
        </span>
        <br />
        <span>
          <span>Dinner: </span>
          <span style="font-weight: bold;color: #FDEFD6;">From UTC 18:00 to 18:30</span>
        </span>
        <br />
        <span>
          <span>GN: </span>
          <span style="font-weight: bold;color: #FDEFD6;">FFrom UTC 21:00 to 21:30</span>
        </span>
        <br />
        <br />
        <span>
          <span>Each day players can participate in the challenge by spending </span>
          <span style="font-weight: bold;color:   #0DA5CE;">$GMC</span>
          <span>
            , and each check-in will add an additional 3% of the entry fee to the prize pool to increase the rewards
            that can be earned from a successful challenge.
          </span>
        </span>
        <br />
        <br />
        <span>
          After signing up, you will enter a one-day sign-up phase, during which players do not need to complete 5
          check-ins to enter the next day's challenge phase normally.
        </span>
        <br />
        <br />
        <span>
          <span>After entering the challenge phase, players must complete five daily check-ins to be considered a
            successful challenge and move on to the next day's challenge. After completing a challenge that lasts for
            seven days, rewards will be awarded based on the </span>
          <span style="font-weight: bold;color:   #0DA5CE;"> $GMC</span>
          <span> consumed when signing up for the challenge, and the more </span>
          <span style="font-weight: bold;color:   #0DA5CE;"> $GMC</span>
          <span> consumed, the greater the rewards.</span>
        </span>
        <br />
        <br />
        <span style="color: #FE2E75;">
          <span>If you miss a check-in, you will need to expend </span>
          <span style="font-weight: bold;color: #FDEFD6;">POWER</span>
          <span>on that day to make up the check-in. If you fail to
            complete the check-in on that day, you will lose this round of the challenge and lose the
          </span>
          <span style=" font-weight: bold;color: #0DA5CE;"> $GMC</span>
          <span> you have accumulated in this challenge.</span>
        </span>
        <br />
        <br />
        <span>
          <span> At the start of each check-in, players have 30 minutes to check-in and earn </span>
          <span style="font-weight: bold;color: #FDEFD6;">POINTS</span>
          <span>, up to a maximum of 1,800 </span>
          <span style="font-weight: bold;color: #FDEFD6;">POINTS</span>
          <span>per check-in, with 1 POINT lost for each second of delay. Players will be ranked by the total number of
          </span>
          <span style="font-weight: bold;color: #FDEFD6;">POINTS</span>
          <span> they have earned, with the top three players receiving additional </span>
          <span style=" font-weight: bold;color: #0DA5CE;"> $GMC</span>
          <span> prizes of 1% (up to a maximum of 1,000,000), 0.5% (up to a maximum of 500,000), and 0.01% (up to a
            maximum of 100,000) of the total prize pool.</span>
        </span>
      </div>
      <div class="rules_footer">
        <v-btn :class="['ready_btn', 'active']" width="160" height="32" rounded="lg" size="small"
          @click="handleReady()">
          <span class="finished">Close</span>
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useCheckInStore } from '@/store/check_in.js';

export default defineComponent({
  data() {
    return {}
  },
  computed: {
    showRules: {
      get() {
        const { showRules } = useCheckInStore();
        return showRules
      },
      set(val: boolean) {
        const { setShowRules } = useCheckInStore();
        setShowRules(val)
      }
    },
  },
  methods: {
    handleReady() {
      this.showRules = false;
    },
  }
})
</script>
<style lang="scss" scoped>
:deep(.v-overlay__content) {
  margin: 0 !important;
  max-width: max-content !important;
  bottom: 0;
}

.dialog_box {
  width: 100%;
  background-color: #000;
  border-radius: 16px 16px 0 0;
  padding: 16px;
  display: flex;
  align-items: center;
  flex-direction: column;
  color: #fff;
  text-align: center;
  font-size: 20px;
  line-height: 1.2;

  .rules_title {
    color: #FDEFD6;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 4px;
  }
}

.rules_panel {
  padding: 4px;
  border-radius: 4px;
  max-height: 50vh;
  overflow-y: scroll;
  font-size: 14px;
  text-align: left;
  background-color: rgba(47, 47, 47, 0.6);
}

.rules_footer {
  margin-top: 16px;

  .ready_btn {
    background: linear-gradient(90deg, rgba(155, 154, 153, 1) 0%, rgba(113, 113, 113, 1) 101%);
    color: #C8C1C1;
    font-size: 16px;

    &.active {
      background: linear-gradient(90deg, rgba(253, 239, 213, 1) 0%, rgba(248, 215, 156, 1) 101%);
      color: #FE2E75;
    }
  }

  .selected_box {
    padding-top: 8px;
    display: flex;
    align-items: center;
    font-size: 14px;

    .v-img {
      flex: none;
      margin-right: 4px;
    }
  }
}

.finished {
  text-transform: none;
}
</style>