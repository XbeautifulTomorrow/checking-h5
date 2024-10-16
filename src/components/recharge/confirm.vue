<template>
  <v-dialog v-model="showConfirm" width="100%">
    <div class="dialog_box">
      <div class="recharge_panel">
        <div class="close_btn" @click="showConfirm = false">
          <v-img :width="16" cover src="@/assets/images/svg/icon_x.svg"></v-img>
        </div>
        <div class="recharge_box" v-if="!payment">
          <div class="buy_title">PURCHASE</div>
          <div class="user_wallet" v-if="isConnect">
            <div class="address">{{ formatAddr(walletAddr) }}</div>
            <v-btn
              class="disconnect_btn"
              @click="handleDisconnect()"
              size="x-small"
              height="30"
            >
              <v-img
                :width="24"
                cover
                src="@/assets/images/svg/icon_disconnect.svg"
              ></v-img>
            </v-btn>
          </div>
          <div class="user_wallet interval" v-else></div>
          <div class="product_box" v-if="!buyGmcAmount">
            <div class="product_ton_val">{{ `${productInfo.amount} TON` }}</div>
            <div class="product_usd_val">
              {{ `$${formatNumber(productInfo.price)}` }}
            </div>
          </div>
          <div class="product_box" v-else>
            <div class="product_ton_val">
              {{ `${productInfo.tonAmount} TON` }}
            </div>
            <div class="product_usd_val">
              <span>{{
                `$${formatNumber(productInfo.actualUsdtAmount)}`
              }}</span>
              <span v-if="countdown" class="timer">{{ `(${timeMsg})` }}</span>
            </div>
          </div>
          <div v-if="!countdown">
            <div class="refresh_btn" @click="handleBuy()">Refresh</div>
            <div class="error_text">
              The quote has expired. Refresh to get the latest quote.
            </div>
          </div>
          <div v-else>
            <v-btn
              class="connect_btn stars"
              :elevation="8"
              width="90%"
              height="36"
              @click="handleStars()"
            >
              <v-img
                width="20"
                class="reward_img"
                cover
                src="@/assets/images/recharge/icon_stars.png"
              ></v-img>
              <span class="finished">
                {{ `${productInfo.starPrice} Stars` }}
              </span>
            </v-btn>
            <v-btn
              class="connect_btn"
              :elevation="8"
              width="90%"
              height="36"
              @click="!isConnect ? connectToWallet() : handlePayment()"
            >
              <v-img
                width="20"
                class="reward_img"
                cover
                src="@/assets/images/recharge/icon_ton.png"
              ></v-img>
              <span class="finished">TON CONNECT</span>
            </v-btn>
          </div>
        </div>
        <div v-else class="recharge_box">
          <div v-if="status == 'complete'">
            <div class="success_img">
              <v-img
                width="60"
                cover
                src="@/assets/images/svg/airdrop/checked.svg"
              ></v-img>
            </div>
            <div class="success_text">Purchase successfully!</div>
            <v-btn
              class="connect_btn"
              :elevation="8"
              width="80%"
              height="36"
              @click="handleReady()"
            >
              <span class="finished">OK</span>
            </v-btn>
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
                The purchase being confirmed, please wait pateintly for a while
              </div>
            </div>
            <div class="timeout" v-if="status == 'timeout'">
              <div>Order processing is taking longer.</div>
              <div>You can keep waiting or close the window.</div>
              <div>We will notify you in bot after success.</div>
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
import {
  starPayment,
  getOrderList,
  purchasePoints,
  starPurchasePoints,
} from "@/services/api/user";
import { TonConnectUI, ConnectedWallet } from "@tonconnect/ui";
import { toNano, beginCell, Address } from "@ton/ton";
import bigNumber from "bignumber.js";

type statusType = "pending" | "complete" | "timeout";
interface order {
  orderId: number; //订单ID
  userId: number; //用户ID
  tgId: number; //tgID
  productId: number; //产品ID
  walletAddress: string; //充值钱包地址
  amount: number; //充值数量
  status: number; //订单状态（0-进行中，1-已完成，2-失败）
  statusStr: string;
  energyAmount: number; //能量数量
  gmcAmount: number; //GMC数量
  price: number; //产品价格
  priceCoin: string; //价格币种
  txid: string; //交易地址
  publicKey: string; //公钥
  amountCoin: string; //充值币种
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
    buyGmcAmount() {
      const { buyGmcAmount } = useUserStore();
      return buyGmcAmount;
    },
    showConfirm: {
      get() {
        const { showConfirm } = useUserStore();
        return showConfirm;
      },
      set(val: boolean) {
        const { setShowConfirm } = useUserStore();
        setShowConfirm(val);
      },
    },
    tonConnect: {
      get() {
        const { tonConnect } = useUserStore();
        return tonConnect;
      },
      set(val: any) {
        const { setTonConnect } = useUserStore();
        setTonConnect(val);
      },
    },
    isConnect() {
      const { isConnect } = useUserStore();
      return isConnect;
    },
    walletAddr() {
      const { walletAddr } = useUserStore();
      return walletAddr;
    },
    productId() {
      const { productId } = useUserStore();
      return productId;
    },
    productInfo() {
      const { productInfo } = useUserStore();
      return productInfo;
    },
  },
  created() {
    this.payment = false;
  },
  methods: {
    handleReady() {
      this.showConfirm = false;
    },
    // 初始化ton-connect
    async initTonConnect() {
      let miniappUrl = "https://t.me/gm_coin_test_bot/checking";

      this.tonConnect = new TonConnectUI({
        manifestUrl: "https://gmking.io/tonconnect-manifest.json",
      });

      if (import.meta.env.MODE == "prod") {
        miniappUrl = "https://t.me/theGMCoinBot/GMCoin";
      }
      // webapp重定向
      this.tonConnect.uiOptions = {
        twaReturnUrl: miniappUrl,
      };

      // 监听钱包链接状态
      this.tonConnect.onStatusChange((wallet: ConnectedWallet) => {
        if (wallet) {
          const { listening } = useUserStore();
          const {
            account: { address },
          } = wallet;
          const isC = this.tonConnect.connected;
          listening({
            isc: isC,
            account: address,
          });
        }
      });
    },
    async connectToWallet() {
      this.handleDisconnect();
      this.tonConnect
        .connectWallet()
        .then((res: any) => {
          console.log(res);
        })
        .catch((err: any) => {
          console.log(err);
        });
      // 如果需要，可以对connectedWallet做一些事情
    },
    // 断开连接
    async handleDisconnect() {
      const isC = this.tonConnect.connected;
      if (isC) {
        // 如果已连接，断开连接
        await this.tonConnect.disconnect();

        const { listening } = useUserStore();
        listening({
          isc: false,
          address: null,
        });
      }
    },
    // 处理Stars
    async handleStars() {
      const {
        productInfo: { productId, orderId, gmcOrderId },
        buyGmcAmount,
      } = this;

      let res = null as any;

      if (buyGmcAmount) {
        res = await starPurchasePoints({
          gmcOrderId,
        });
      } else {
        res = await starPayment({
          productId,
          orderId,
        });
      }

      if (res.code == 200) {
        const { Telegram } = window as any;
        if (Telegram) {
          const { WebApp } = Telegram;
          WebApp.openInvoice(res.data, (e: any) => {
            if (e == "paid") {
              this.status = "pending";
              this.payment = true;
              this.countDown();
            }
          });
        }
      }
    },
    // 处理购买
    async handlePayment() {
      const {
        productInfo: { publicKey, amount, remark, tonAmount },
        buyGmcAmount,
      } = this;

      // 创建评论
      const body = beginCell()
        .storeUint(0, 32) // 写入32个零位以表示后面将跟随文本评论
        .storeStringTail(remark) // 写下我们的文本评论
        .endCell();

      // 创建交易体
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
          {
            address: publicKey, // 目的地址
            amount: buyGmcAmount
              ? toNano(tonAmount).toString()
              : toNano(amount).toString(), //以nanotons计的Toncoin
            payload: body.toBoc().toString("base64"),
          },
        ],
      };

      this.tonConnect
        .sendTransaction(transaction)
        .then((res: any) => {
          this.status = "pending";
          this.payment = true;
          console.log(res);
          this.countDown();
        })
        .catch((err: any) => {
          console.log(err);
        });
    },
    // 格式化地址
    formatAddr(event: string) {
      if (!event) return event;
      const addr = Address.parse(event).toString({
        bounceable: false,
      });

      var reg = /^(\S{8})\S+(\S{6})$/;
      return addr.replace(reg, "$1...$2");
    },
    // 格式化数字
    formatNumber(event: number | string) {
      const num = new bigNumber(event).multipliedBy(100).toNumber();
      const amount = new bigNumber(Math.ceil(num)).dividedBy(100).toNumber();
      return Number(amount).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
    },
    // 倒计时
    countDown(event = 60) {
      const Countdown = event;
      const { setBuyGmcAmount } = useUserStore();
      // 防止购买出错
      setBuyGmcAmount(0);

      if (!this.timer) {
        this.countdown = Countdown;
        this.timeMsg = this.countdown + "s";
        this.timer = setInterval(() => {
          if (this.countdown > 0 && this.countdown <= event) {
            this.countdown--;
            this.fetchPaymentResults();
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
    // 过期倒计时
    expiredCountDown(event = 10) {
      const Countdown = event;

      if (!this.timer) {
        this.countdown = Countdown;
        this.timeMsg = this.countdown + "s";
        this.timer = setInterval(() => {
          if (this.countdown > 0 && this.countdown <= event) {
            this.countdown--;
            if (this.countdown !== 0) {
              this.timeMsg = this.countdown + "s";
            } else {
              this.timeMsg = this.countdown + "s";
              this.clearTimerFun();
            }
          }
        }, 1000);
      }
    },
    // 处理下单
    async handleBuy() {
      const { setProductInfo } = useUserStore();
      const res = await purchasePoints({ gmcAmount: this.buyGmcAmount });
      if (res.code == 200) {
        setProductInfo(res.data);
        this.expiredCountDown();
      }
    },
    // 清除计时器
    clearTimerFun() {
      clearInterval(this.timer);
      this.timer = null;
    },
    // 获取支付结果（刷新余额
    async fetchPaymentResults() {
      const {
        productInfo: { orderId, gmcOrderId },
        buyGmcAmount,
      } = this;

      const res = await getOrderList({
        orderId: buyGmcAmount ? gmcOrderId : orderId,
        page: 1,
        size: 10,
      });
      if (res.code == 200) {
        const orderData = res.data.records as Array<order>;

        const { fetchUserInfo } = useUserStore();
        const order = orderData.find((e) => e.orderId == orderId);
        if (order && order.status == 1) {
          this.status = "complete";
          this.clearTimerFun();
          fetchUserInfo();
        }
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.tonConnect) {
        this.initTonConnect();
      }
    });
  },
  beforeUpdate() {
    if (this.buyGmcAmount) {
      this.expiredCountDown(10);
    }
  },
  beforeUnmount() {
    this.clearTimerFun();
    if (this.payment && this.status != "complete") {
      // 如果已付款，更新一下用户信息
      const { fetchUserInfo } = useUserStore();
      fetchUserInfo();
    }
  },
});
</script>
<style lang="scss" scoped>
:deep(.v-overlay__content) {
  margin: 0 !important;
  max-width: max-content !important;
}

.dialog_box {
  width: 100%;
  min-width: 80vw;
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
  background-color: rgba(137, 104, 85, 1);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0px 0px 4px rgba(21, 12, 7, 0.5),
    0px 5px 5px 0px rgba(96, 69, 54, 1) inset;

  .recharge_box {
    background-color: rgba(117, 87, 72, 1);
    box-sizing: border-box;
    border: 1px solid rgba(96, 69, 54, 1);
    border-radius: 16px;
    box-shadow: 2px 2px 5px rgba(21, 12, 7, 0.5),
      0px 5px 5px 0px rgba(96, 69, 54, 1) inset;
    padding: 8px 8px 16px;
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
  color: #ffffff;
  text-align: center;
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

    .timer {
      text-shadow: none;
      font-size: 12px;
      padding-left: 4px;
    }
  }
}

.refresh_btn {
  background-color: rgba(43, 43, 43, 1);
  padding: 8px;
  border-radius: 8px;
  font-weight: 700;
  font-style: normal;
  font-size: 20px;
  color: white;
}

.error_text {
  margin-top: 4px;
  font-size: 12px;
  color: #fb0a0a;
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

.connect_btn + .connect_btn {
  margin-top: 8px;
}

.connect_btn {
  background-color: rgba(73, 182, 246, 1);
  box-sizing: border-box;
  border-width: 2px;
  border-style: solid;
  border-color: rgba(36, 36, 36, 1);
  border-radius: 8px;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
  font-weight: 700;
  font-style: normal;
  font-size: 18px;
  line-height: 1;
  color: #ffffff;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.6);

  &.stars {
    background: linear-gradient(
      180deg,
      rgba(93, 158, 252, 1) 0%,
      rgba(150, 74, 245, 1) 51%,
      rgba(230, 57, 173, 1) 98%
    );
  }

  .v-img {
    flex: none;
    margin-right: 4px;
  }
}

.finished {
  text-transform: none;
  letter-spacing: 0;
  display: inline-block;
  height: 20px;
  line-height: 1.2;
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