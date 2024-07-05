<template>
  <v-dialog v-model="showConfirm" width="100%">
    <div class="dialog_box">
      <div class="recharge_panel">
        <div class="close_btn" @click="showConfirm = false">
          <v-img :width="16" cover src="@/assets/images/svg/icon_x.svg"></v-img>
        </div>
        <div class="recharge_box" v-if="status == 'pending'">
          <div class="buy_title">PURCHASE</div>
          <div class="user_wallet" v-if="isConnect">
            <div class="address">{{ formatAddr(walletAddr) }}</div>
            <v-btn class="disconnect_btn" @click="handleDisconnect()" size="x-small" height="30">
              <v-img :width="24" cover src="@/assets/images/svg/icon_disconnect.svg"></v-img>
            </v-btn>
          </div>
          <div class="user_wallet interval" v-else></div>
          <div class="product_box">
            <div class="product_ton_val">{{ `${productInfo.amount} TON` }}</div>
            <div class="product_usd_val">{{ `$${productInfo.price}` }}</div>
          </div>
          <v-btn v-if="!isConnect" class="connect_btn" :elevation="8" width="90%" height="40"
            @click="connectToWallet()">
            <v-img width="24" class="reward_img" cover src="@/assets/images/recharge/icon_ton.png"></v-img>
            <span class="finished">TON CONNECT</span>
          </v-btn>
          <v-btn v-else class="connect_btn" :elevation="8" width="90%" height="40" @click="handlePayment()">
            <span class="finished">PAYMENT</span>
          </v-btn>
        </div>
        <div v-else class="recharge_box">
          <div class="success_img">
            <v-img width="60" cover src="@/assets/images/svg/airdrop/checked.svg"></v-img>
          </div>
          <div class="success_text">Successful</div>
          <v-btn class="connect_btn" :elevation="8" width="80%" height="36" @click="handleReady()">
            <span class="finished">OK</span>
          </v-btn>
        </div>
      </div>
    </div>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useUserStore } from "@/store/user.js";
import { unitConversion } from "@/utils";
import { TonConnectUI, ConnectedWallet } from '@tonconnect/ui'
import { toNano, beginCell } from '@ton/ton';

type statusType = "pending" | "success" | "error";

export default defineComponent({
  data() {
    return {
      status: "pending" as statusType
    }
  },
  computed: {
    showConfirm: {
      get() {
        const { showConfirm } = useUserStore();
        return showConfirm
      },
      set(val: boolean) {
        const { setShowConfirm } = useUserStore();
        setShowConfirm(val)
      }
    },
    tonConnect: {
      get() {
        const { tonConnect } = useUserStore();
        return tonConnect
      },
      set(val: boolean) {
        const { setTonConnect } = useUserStore();
        setTonConnect(val)
      }
    },
    isConnect() {
      const { isConnect } = useUserStore();
      return isConnect
    },
    walletAddr() {
      const { walletAddr } = useUserStore();
      return walletAddr
    },
    productId() {
      const { productId } = useUserStore();
      return productId
    },
    productInfo() {
      const { productInfo } = useUserStore();
      return productInfo
    },
  },
  created() { },
  methods: {
    unitConversion: unitConversion,
    handleReady() {
      this.showConfirm = false;
    },
    async initTonConnect() {
      this.tonConnect = new TonConnectUI({
        manifestUrl: "https://test1.xlab.red:28089/gm-coin-server-web/config/tonconnect/json"
      });

      // webapp重定向
      this.tonConnect.uiOptions = {
        twaReturnUrl: 'https://t.me/gm_coin_test_bot/checking'
      }

      // 监听钱包链接状态
      this.tonConnect.onStatusChange((wallet: ConnectedWallet) => {
        if (wallet) {
          const { listening } = useUserStore();
          const { account: { publicKey } } = wallet;
          const isC = this.tonConnect.connected;
          listening({
            isc: isC,
            account: publicKey
          });
        }
      });
    },
    async connectToWallet() {
      this.handleDisconnect();
      this.tonConnect.connectWallet().then((res: any) => {
        console.log(res);
      }).catch((err: any) => {
        console.log(err);
      })
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
          address: null
        })
      }
    },
    // 处理购买
    async handlePayment() {
      const { productInfo: { publicKey, amount, remark } } = this;

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
            amount: toNano(amount).toString(), //以nanotons计的Toncoin
            payload: body.toBoc().toString("base64")
          }
        ]
      }

      this.status = "pending";

      this.tonConnect.sendTransaction(transaction).then((res: any) => {
        this.status = "success";
      }).catch((err: any) => {
        console.log(err);
      })
    },
    // 格式化地址
    formatAddr(event: string) {
      if (!event) return event;
      var reg = /^(\S{5})\S+(\S{4})$/;
      return event.replace(reg, "$1...$2");
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initTonConnect();
    })
  }
})
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
  background: linear-gradient(180deg, #F0D3B3 0%, #F2D0AC 100%);
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3), 0px 5px 5px 0px rgba(255, 255, 255, 0.3) inset;
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
  box-shadow: 0px 0px 4px rgba(21, 12, 7, 0.5), 0px 5px 5px 0px rgba(96, 69, 54, 1) inset;

  .recharge_box {
    background-color: rgba(117, 87, 72, 1);
    box-sizing: border-box;
    border: 1px solid rgba(96, 69, 54, 1);
    border-radius: 16px;
    box-shadow: 2px 2px 5px rgba(21, 12, 7, 0.5), 0px 5px 5px 0px rgba(96, 69, 54, 1) inset;
    padding: 8px 8px 16px;
  }
}



.buy_title {
  margin-top: 8px;
  background-color: rgba(252, 223, 189, 1);
  border-radius: 30px;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3), 0px 5px 5px 0px rgba(255, 255, 255, 0.3) inset;
  word-wrap: break-word;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.6);
  font-weight: 700;
  font-style: normal;
  display: inline-block;
  padding: 6px 32px;
  font-size: 20px;
  color: #FFFFFF;
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
    color: #FCDFBD;
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
    color: #E3D1AF;
  }

  .product_usd_val {
    white-space: nowrap;
    text-shadow: 1px 1px 5px rgba(197, 27, 24, 1);
    font-size: 20px;
    color: #FFEDD6;
    margin-top: 12px;
  }
}

.success_img {
  width: 100px;
  height: 100px;
  background-color: #73DA7F;
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
  color: #E3D1AF;
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
  color: #FFFFFF;
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
</style>