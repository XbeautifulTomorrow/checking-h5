<template>
  <v-dialog v-model="showWithdraw" width="100%">
    <div class="dialog_box">
      <div class="recharge_panel">
        <div class="close_btn" @click="handleReady()">
          <v-img
            :width="16"
            cover
            src="@/assets/images/svg/airdrop/icon_close.svg"
          ></v-img>
        </div>
        <div class="recharge_box">
          <div v-if="status == 'complete'">
            <div class="success_img">
              <v-img
                width="60"
                cover
                src="@/assets/images/svg/airdrop/checked.svg"
              ></v-img>
            </div>
            <div class="success_text">Your withdrawal is complete.</div>
            <v-btn
              class="connect_btn"
              :elevation="8"
              width="100%"
              height="36"
              @click="handleReady()"
            >
              <span class="finished">OK</span>
            </v-btn>
            <div class="exchange_btn exchange" @click="toExchange()">
              <span>EXCHANGE</span>
              <v-icon
                color="#fe2e75"
                class="exchange_icon"
                size="24"
                icon="mdi-open-in-new"
              ></v-icon>
            </div>
          </div>
          <div v-else>
            <div class="buy_title">PROCESSING</div>
            <div class="wait">
              <v-img
                :class="[status != 'pending' ? 'timeuot' : '']"
                width="100"
                cover
                src="@/assets/images/recharge/wait.png"
              ></v-img>
            </div>
            <div class="count_down" v-if="status == 'pending'">
              <div class="count_down_time">{{ timeMsg }}</div>
              <div class="count_down_text">
                The withdraw being confirmed, please wait pateintly for a while
              </div>
            </div>
            <div class="timeout" v-if="status == 'timeout'">
              <div>Order processing is taking longer.</div>
              <div>You can keep waiting or close the window.</div>
              <div>We will notify you in bot after success.</div>
            </div>
            <div
              class="exchange_btn exchange"
              v-if="status == 'timeout'"
              @click="toExchange()"
            >
              <span>EXCHANGE</span>
              <v-icon
                color="#fe2e75"
                class="exchange_icon"
                size="24"
                icon="mdi-open-in-new"
              ></v-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { getWithdrawList } from "@/services/api/user";
import { openUrl } from "@/utils";

type statusType = "pending" | "complete" | "timeout";

interface order {
  hash: string; //hash
  address: string; //提币地址
  amount: number; //提币数量
  status: string; //状态
  time: number; //时间
  [x: string]: string | number | any;
}

export default defineComponent({
  data() {
    return {
      payment: false,
      status: "pending" as statusType,
      timer: null as number | any,
      countdown: 60,
      timeMsg: "60s",
      orderData: [] as Array<order>,
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    showWithdraw: {
      get() {
        const { showWithdraw } = useUserStore();
        return showWithdraw;
      },
      set(val: boolean) {
        const { setShowWithdraw } = useUserStore();

        if (!val) {
          this.clearTimerFun();
        }

        setShowWithdraw(val);
      },
    },
    orderId() {
      const { orderId } = useUserStore();
      return orderId;
    },
  },
  created() {
    this.status = "pending";
  },
  methods: {
    handleReady() {
      this.showWithdraw = false;
    },
    // 倒计时
    countDown() {
      const Countdown = 60;
      if (!this.timer) {
        this.countdown = Countdown;
        this.timeMsg = this.countdown + "s";
        this.timer = setInterval(() => {
          if (this.countdown > 0 && this.countdown <= 60) {
            this.countdown--;

            this.fetchWithdrawResults();
            if (this.countdown !== 0) {
              this.timeMsg = this.countdown + "s";
            } else {
              this.timeMsg = this.countdown + "s";
              this.clearTimerFun();
              this.status = "timeout";
            }
          }
        }, 1000);
      }
    },
    // 清除计时器
    clearTimerFun() {
      clearInterval(this.timer);
      this.timer = null;
    },
    // 获取支付结果，刷新余额
    async fetchWithdrawResults() {
      const res = await getWithdrawList({
        page: 1,
        size: 10,
      });
      if (res.code == 200) {
        const orderData = res.data.records as Array<order>;

        const { fetchUserInfo } = useUserStore();
        const order = orderData.find((e) => e.withdrawId == this.orderId);

        if (order && order.status == "Successful") {
          this.status = "complete";
          this.clearTimerFun();
          fetchUserInfo();
        }
      }
    },
    // Exchange
    toExchange() {
      openUrl(" https://t.me/theGMCoinBot/GMExchange");
    },
  },
  beforeUnmount() {
    this.clearTimerFun();
    if (this.status != "complete") {
      // 如果已付款，更新一下用户信息
      const { fetchUserInfo } = useUserStore();
      fetchUserInfo();
    }
  },
  watch: {
    showWithdraw(val) {
      if (val) {
        this.status = "pending";
        this.countDown();
      }
    },
  },
});
</script>
<style lang="scss" scoped>
:deep(.v-overlay__content) {
  margin: 0 !important;
  max-width: max-content !important;
}

.dialog_box {
  // width: 100%;
  min-width: calc(100vw - 16px);
  border-radius: 16px 16px 0 0;
  padding: 16px;
  display: flex;
  align-items: center;
  flex-direction: column;
  color: #fff;
  text-align: center;
  font-size: 20px;
  line-height: 1.2;
}

.close_btn {
  width: 30px;
  height: 30px;
  border-radius: 30px;
  background: linear-gradient(180deg, #f0d3b3 0%, #f2d0ac 100%);
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3),
    0px 5px 5px 0px rgba(255, 255, 255, 0.3) inset;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 24px;
  right: 24px;

  .v-img {
    flex: none;
  }
}

.recharge_panel {
  width: 100%;
  padding: 4px;
  border-radius: 4px;
  max-height: 80vh;
  overflow-y: scroll;
  font-size: 14px;
  background-color: #555251;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0px 0px 4px rgba(21, 12, 7, 0.5),
    0px 5px 5px 0px rgba(96, 69, 54, 0.6) inset;

  .recharge_box {
    background-color: #413f3d;
    box-sizing: border-box;
    border: 1px solid rgb(92, 83, 78);
    border-radius: 16px;
    box-shadow: 2px 2px 5px rgba(92, 83, 78, 0.5),
      0px 5px 5px 0px rgba(96, 69, 54, 0.6) inset;
    padding: 8px 16px 16px;
  }
}

.buy_title {
  margin-top: 8px;
  background-color: rgba(252, 223, 189, 1);
  border-radius: 30px;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3),
    0px 5px 5px 0px rgba(255, 255, 255, 0.3) inset;
  word-wrap: break-word;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.6);
  font-weight: 700;
  font-style: normal;
  display: inline-block;
  padding: 6px 32px;
  font-size: 20px;
  text-align: center;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.64);
  color: #fe2e75;
}

.user_wallet {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  margin-bottom: 16px;

  &.interval {
    margin-bottom: 24px;
  }

  .address {
    background-color: rgba(137, 104, 85, 1);
    border-radius: 5px;
    color: #fcdfbd;
    padding: 6px 24px;
  }

  .disconnect_btn {
    width: auto !important;
    background: inherit;
    background-color: rgba(247, 93, 71, 1);
    box-sizing: border-box;
    border-width: 2px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 1);
    border-radius: 5px;
    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.4);
    margin-left: 8px;

    .v-img {
      flex: none;
    }
  }
}

.product_box {
  padding: 0 0 12px;

  .product_ton_val {
    font-weight: 700;
    font-style: normal;
    font-size: 24px;
    color: #e3d1af;
  }

  .product_usd_val {
    white-space: nowrap;
    text-shadow: 1px 1px 5px rgba(197, 27, 24, 1);
    font-size: 20px;
    color: #ffedd6;
    margin-top: 12px;
  }
}

.wait {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  .v-img {
    flex: none;
    animation: rotate 3s linear infinite;

    &.timeuot {
      animation: none;
    }
  }
}

.count_down {
  .count_down_time {
    font-weight: 700;
    font-style: normal;
    font-size: 28px;
    color: #ffffff;
    text-align: center;
    margin: 8px 0;
  }

  .count_down_text {
    font-weight: 400;
    font-style: normal;
    color: #e3d1af;
    font-size: 14px;
    text-align: center;
  }
}

.timeout {
  font-style: normal;
  color: #e3d1af;
  font-size: 14px;
  text-align: center;
  margin-top: 8px;
}

.success_img {
  width: 100px;
  height: 100px;
  background-color: #73da7f;
  border: 4px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  margin-top: 24px;

  .v-img {
    flex: none;
  }
}

.success_text {
  font-weight: 700;
  color: #e3d1af;
  text-align: center;
  font-size: 16px;
  margin-top: 16px;
  margin-bottom: 16px;
}

.connect_btn {
  background-color: rgba(73, 182, 246, 1);
  box-sizing: border-box;
  border-width: 2px;
  border-style: solid;
  border-color: rgba(36, 36, 36, 1);
  border-radius: 10px;
  -moz-box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
  -webkit-box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
  font-weight: 700;
  font-style: normal;
  font-size: 20px;
  line-height: 1;
  color: #ffffff;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.6);

  .v-img {
    flex: none;
    margin-right: 4px;
  }
}

.finished {
  text-transform: none;
  letter-spacing: 0;
}

.exchange_btn {
  position: relative;
  margin-top: 8px;
  background: linear-gradient(
    90deg,
    rgba(253, 239, 213, 1) 0%,
    rgba(248, 215, 156, 1) 101%
  );
  box-sizing: border-box;
  border-width: 2px;
  border-style: solid;
  padding: 4px 0;
  border-color: rgba(0, 0, 0, 1);
  border-radius: 8px;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.64);
  color: #fe2e75;
  font-weight: 400;
  font-size: 20px;
  font-weight: 700;
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  .exchange_icon {
    position: absolute;
    right: 8px;
    text-shadow: none;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>