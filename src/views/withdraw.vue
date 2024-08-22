<template>
  <div class="withdraw_wrapper">
    <div class="withdraw_title">Withdraw</div>
    <div class="withdraw_panel">
      <div class="withdraw_item">
        <div class="withdraw_item_title">
          <div class="operating">Network</div>
          <div class="balance">
            <v-img
              :width="24"
              cover
              src="@/assets/images/svg/airdrop/history.svg"
              @click="toHistory()"
            ></v-img>
          </div>
        </div>
        <div class="withdraw_from_input">
          <div class="coin_box">
            <v-img
              :width="24"
              cover
              src="@/assets/images/airdrop/coin_ton.png"
            ></v-img>
            <span>TON</span>
          </div>
          <div style="height: 26px"></div>
        </div>
      </div>
      <div class="withdraw_item">
        <div class="withdraw_item_title">
          <div class="operating">Wallet Address</div>
        </div>
        <div class="withdraw_from_input">
          <v-text-field
            v-model="withdrawAddr"
            base-color="#fff"
            bg-color="rgba(0,0,0,0)"
            color="#fff"
            variant="plain"
            hide-details="auto"
            placeholder="Enter your address"
          ></v-text-field>
          <div style="height: 26px"></div>
        </div>
      </div>
      <div class="withdraw_item">
        <div class="withdraw_item_title">
          <div class="operating">Withdraw Amount</div>
          <div class="balance">
            <span>
              {{ `Balance: ${unitConversion(userInfo.gmtAmount, 2, false)}` }}
            </span>
            <v-img
              :width="20"
              cover
              src="@/assets/images/airdrop/coin_gmt.png"
            ></v-img>
          </div>
        </div>
        <div class="withdraw_from_input">
          <div class="coin_box">
            <v-img
              :width="24"
              cover
              src="@/assets/images/airdrop/coin_gmt.png"
            ></v-img>
            <span>${{ coinName }}</span>
          </div>
          <v-text-field
            v-model="fromAmount"
            base-color="#fff"
            bg-color="rgba(0,0,0,0)"
            color="#fff"
            variant="plain"
            hide-details="auto"
            reverse
            @input="handleInput"
            @focus="fromOrTo = true"
            placeholder="0"
          ></v-text-field>
          <div class="zero_fill">00</div>
          <div class="max_btn" @click="handleMax()">MAX</div>
        </div>
        <div class="exchange_rate">
          <span v-if="coinRate">{{ `≈ ${coinRate} USDT` }}</span>
          <span v-else>--</span>
        </div>
        <div v-if="isError" class="error_box">$GMT is not enough.</div>
      </div>
    </div>
    <div class="gas_fee">Gas Fee: 75 $GMT</div>
    <div class="hint_box">
      <v-img
        :width="16"
        cover
        src="@/assets/images/svg/airdrop/hint.svg"
      ></v-img>
      <span>Minimum deposit quantity is 100 $GMT</span>
    </div>
    <div class="withdraw_buttons">
      <v-btn
        class="button swap"
        @click="submitSwap()"
        width="100%"
        height="40"
        rounded="lg"
        size="small"
        :disabled="isWithdraw"
      >
        <div class="btn_text">
          <v-img
            :width="24"
            cover
            src="@/assets/images/svg/airdrop/withdraw.svg"
          ></v-img>
          <span class="finished">WITHDRAW</span>
        </div>
      </v-btn>
      <div class="button back" @click="handleBack()">BACK</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import bigNumber from "bignumber.js";
import { unitConversion, isEmpty, accurateDecimal } from "@/utils";
import { transferWithdraw, getExchangeRate } from "@/services/api/user";
import { useMessageStore } from "@/store/message.js";

import { TonConnectUI, ConnectedWallet } from "@tonconnect/ui";
import { Address } from "@ton/ton";

type coin = "GMC" | "GMT";

export default defineComponent({
  data() {
    return {
      coinName: "GMT" as coin,
      withdrawAddr: "" as any,
      fromAmount: "" as string | any,
      toAmount: "" as string | any,
      fromOrTo: false,
      isError: false,

      coinExchangeRate: 0,
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    tonConnect: {
      get() {
        const { tonConnect } = useUserStore();
        return tonConnect;
      },
      set(val: boolean) {
        const { setTonConnect } = useUserStore();
        setTonConnect(val);
      },
    },
    coinRate() {
      const { coinExchangeRate, fromAmount } = this;
      if (!fromAmount) return 0;

      const amount = this.removeTxt(fromAmount);
      const rate = new bigNumber(amount)
        .multipliedBy(100)
        .multipliedBy(coinExchangeRate)
        .toNumber();

      return Number(accurateDecimal(rate, 2)).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
    },
    maxAmount() {
      const {
        userInfo: { gmtAmount },
      } = useUserStore();

      if (gmtAmount >= 100) {
        const rctV = new bigNumber(gmtAmount).dividedBy(100).toNumber();
        return Math.floor(rctV).toLocaleString();
      } else {
        return "";
      }
    },
    isWithdraw() {
      const { fromAmount, isError, withdrawAddr } = this;
      let isV = false;

      if (!fromAmount) {
        isV = true;
      }

      if (!withdrawAddr) {
        isV = true;
      }

      if (isError) {
        isV = true;
      }

      return isV;
    },
  },
  created() {
    this.initTonConnect();
    this.fetchExchangeRate();
  },
  methods: {
    unitConversion: unitConversion,

    // 初始化ton-connect
    async initTonConnect() {
      let miniappUrl = "https://t.me/gm_coin_test_bot/checking";

      this.tonConnect = new TonConnectUI({
        manifestUrl: "https://file.gmking.io/tonconnect-manifest.json",
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

          this.withdrawAddr = Address.parse(address).toString({
            bounceable: false,
          });
        }
      });
    },
    handleInput(event: any) {
      let {
        target: { _value },
      } = event;

      if (isEmpty(_value)) {
        this.isError = false;
        return;
      }

      // 去除非数字字符
      let value = _value.replace(/[^\d.]/g, "");
      // 分割整数和小数部分
      let parts = value.split(".");
      // 处理整数部分添加逗号
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      if (this.fromOrTo) {
        const past = parts[0] + "00";
        parts[0] = past.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        parts[0] = parts[0].slice(0, -2);
      }

      // 判断余额
      if (
        Number(this.removeTxt(this.fromAmount)) >
        Number(this.removeTxt(this.maxAmount))
      ) {
        this.isError = true;
      } else {
        this.isError = false;
      }

      this.fromAmount = parts[0];
    },
    // 获取汇率
    async fetchExchangeRate() {
      const res = await getExchangeRate({
        areaCoin: "GMT",
        coinName: "USDT",
      });

      if (res.code == 200) {
        this.coinExchangeRate = res.data;
      }
    },
    handleMax() {
      this.fromOrTo = true;
      this.fromAmount = this.maxAmount;

      if (!this.fromAmount) {
        this.isError = false;
      }
    },
    async handleConvert() {
      if (this.coinName == "GMC") {
        this.coinName = "GMT";
      } else {
        this.coinName = "GMC";
      }

      this.fromOrTo = true;
      this.fromAmount = this.toAmount;
    },
    async submitSwap() {
      const { fromAmount, withdrawAddr, coinName, removeTxt } = this;
      let amountVal = Number(removeTxt(fromAmount));

      amountVal = new bigNumber(amountVal).multipliedBy(100).toNumber();

      const res = await transferWithdraw({
        amount: amountVal,
        coinName: coinName,
        chainName: "TON", //网络
        address: Address.parse(withdrawAddr).toRawString(), //提币地址
      });
      if (res.code == 200) {
        const { fetchUserInfo } = useUserStore();
        fetchUserInfo();

        this.fromOrTo = true;
        this.fromAmount = "";

        const { setMessageText } = useMessageStore();
        setMessageText("Swap successful");
      }
    },
    // 删除指定字符串
    removeTxt(event: string, type = ",") {
      return String(event).replace(new RegExp(type, "g"), "");
    },
    handleBack() {
      this.$router.go(-1);
    },
    toHistory() {
      this.$router.push({
        name: "History",
      });
    },
  },
  watch: {
    fromAmount(newV: any) {
      if (!this.fromOrTo) return;

      if (!newV) {
        this.toAmount = "";
      }

      const { coinName } = this;
      const fromV = Number(this.removeTxt(newV));
      if (coinName == "GMC") {
        const amount = new bigNumber(fromV || 0).multipliedBy(100).toNumber();
        this.toAmount = amount
          ? Math.floor(amount).toLocaleString().slice(0, -2)
          : "";
      } else {
        const amount = new bigNumber(fromV || 0)
          .multipliedBy(100) // 乘以100
          .multipliedBy(10000)
          .dividedBy(1000000)
          .toNumber();

        this.toAmount = amount ? Math.floor(amount).toLocaleString() : "";
      }
    },
    toAmount(newV: any) {
      if (this.fromOrTo) return;

      if (!newV) {
        this.fromAmount = null;
      }

      const { coinName } = this;
      const fromV = Number(this.removeTxt(newV));
      if (coinName == "GMC") {
        const amount = new bigNumber(fromV || 0)
          .multipliedBy(100) // 乘以100
          .multipliedBy(10000)
          .dividedBy(1000000)
          .toNumber();
        this.fromAmount = amount ? Math.floor(amount).toLocaleString() : "";
      } else {
        const amount = new bigNumber(fromV || 0).multipliedBy(100).toNumber();
        this.fromAmount = amount
          ? Math.floor(amount).toLocaleString().slice(0, -2)
          : "";
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.withdraw_wrapper {
  margin: 0 8px;
}

.withdraw_title {
  font-size: 24px;
  font-weight: 700;
  font-style: normal;
  color: #fdefd6;
  padding-top: 16px;
}

.withdraw_panel {
  background-color: rgba(6, 4, 4, 0.75);
  border-radius: 8px;
  padding: 16px 0;

  & > .withdraw_item + .withdraw_item {
    margin-top: 12px;
  }
}

.withdraw_item {
  padding: 0 8px;
  position: relative;

  .withdraw_item_title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    font-weight: 700;
    font-style: normal;
    font-size: 16px;
    color: #b0b5c5;

    .balance {
      display: flex;
      align-items: center;

      .v-img {
        flex: none;
        margin-left: 4px;
      }
    }
  }
}

.withdraw_from_input {
  background-color: #2b2b2b;
  border-radius: 8px;
  padding: 8px;
  margin-top: 4px;
  color: #fff;
  display: flex;
  align-items: center;

  .coin_box {
    display: flex;
    align-items: center;
    font-weight: 700;
    font-style: normal;
    font-size: 14px;
    color: #b0b5c5;

    .v-img {
      flex: none;
      margin-right: 4px;
      border-radius: 50%;
    }
  }

  :deep(.v-field__input) {
    font-size: 16px;
    padding: 0;
    min-height: 0;
    line-height: 1.2;
    font-weight: bold;
  }

  .zero_fill {
    font-size: 16px;
    font-weight: 700;
    color: #b0b5c5;
  }

  .unit {
    margin-left: 4px;
    font-weight: 700;
    font-style: normal;
    font-size: 16px;
    color: #b0b5c5;
  }

  .max_btn {
    margin-left: 4px;
    background: linear-gradient(
      90deg,
      rgba(253, 239, 213, 1) 0%,
      rgba(248, 215, 156, 1) 101%
    );
    color: #fe2e75;
    padding: 4px 16px;
    border-radius: 4px;
    font-weight: 700;
    font-style: normal;
    font-size: 12px;
  }
}

.convert_btn {
  margin: 16px 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .v-img {
    flex: none;
    transform: rotate(90deg);
  }
}

.exchange_rate {
  text-align: right;
  font-weight: 700;
  font-style: normal;
  font-size: 16px;
  color: #b0b5c5;
}

.error_box {
  position: absolute;
  bottom: 4px;
  font-size: 12px;
  color: #ff0000;
}

.tips_text {
  padding: 16px 0;
  font-size: 14px;
  color: white;
  text-align: center;
}

.gas_fee {
  font-size: 16px;
  color: #fdefd6;
  text-align: right;
  padding-top: 4px;
}

.hint_box {
  padding: 16px 0 4px;
  font-size: 10px;
  color: #fdefd6;
  display: flex;
  align-items: center;

  .v-img {
    flex: none;
    margin-right: 4px;
  }
}

.withdraw_buttons {
  .button {
    height: 40px;
    padding: 0;
    text-align: center;
    font-weight: bold;
    font-style: normal;
    font-size: 20px;
    line-height: 1;
    border-radius: 8px;

    &.swap {
      background-color: rgba(73, 182, 246, 1);
      box-sizing: border-box;
      border-width: 2px;
      border-style: solid;
      border-color: #242424;
      font-weight: 700;
      font-style: normal;
      color: #ffffff;

      &.v-btn--disabled {
        background-color: rgba(53, 53, 53, 1);
        color: #696969;

        .btn_text {
          .v-img {
            opacity: 0.2;
          }
        }
      }
    }

    &.back {
      margin-top: 12px;
      line-height: 40px;
      background-color: #ececec;
      box-sizing: border-box;
      color: #000;
      border-width: 2px;
      border-style: solid;
      border-color: #242424;
      font-weight: 700;
      font-style: normal;
    }
  }
}

.btn_text {
  display: flex;
  align-items: center;

  .v-img {
    flex: none;
    margin-left: 4px;
    margin-bottom: -2px;
  }
}

.finished {
  text-transform: none;
  letter-spacing: 0;
  text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.64);
}
</style>