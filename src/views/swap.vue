<template>
  <div class="swap_wrapper">
    <div class="swap_title">SWAP</div>
    <div class="swap_panel">
      <div class="swap_item">
        <div class="swap_item_title">
          <div class="operating">From</div>
          <div class="balance">
            <span v-if="coinName == 'GMC'">
              {{ `Available ${unitConversion(userInfo.gmcAmount)}` }}
            </span>
            <span v-else>
              {{ `Available ${unitConversion(userInfo.gmtAmount, 2, false)}` }}
            </span>
            <v-img
              v-if="coinName == 'GMC'"
              :width="20"
              cover
              src="@/assets/images/svg/check_in/gm_coin.svg"
            ></v-img>
            <v-img
              v-else
              :width="20"
              cover
              src="@/assets/images/airdrop/coin_gmt.png"
            ></v-img>
          </div>
        </div>
        <div class="swap_from_input">
          <div class="coin_box">
            <v-img
              v-if="coinName == 'GMC'"
              :width="24"
              cover
              src="@/assets/images/svg/check_in/gm_coin.svg"
            ></v-img>
            <v-img
              v-else
              :width="24"
              cover
              src="@/assets/images/airdrop/coin_gmt.png"
            ></v-img>
            <span>${{ coinName == "GMC" ? "GMC" : "GMT" }}</span>
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
          <div class="zero_fill" v-if="coinName != 'GMC'">00</div>
          <div class="unit" v-else>M</div>
          <div class="max_btn" @click="handleMax()">MAX</div>
        </div>
        <div v-if="isError" class="error_box">$GMC is not enough.</div>
      </div>
      <div class="convert_btn" @click="handleConvert()">
        <v-img
          :width="30"
          cover
          src="@/assets/images/svg/airdrop/icon_convert.svg"
        ></v-img>
      </div>
      <div class="swap_item">
        <div class="swap_item_title">
          <div class="operating">To</div>
        </div>
        <div class="swap_from_input">
          <div class="coin_box">
            <v-img
              v-if="coinName != 'GMC'"
              :width="24"
              cover
              src="@/assets/images/svg/check_in/gm_coin.svg"
            ></v-img>
            <v-img
              v-else
              :width="24"
              cover
              src="@/assets/images/airdrop/coin_gmt.png"
            ></v-img>
            <span>${{ coinName != "GMC" ? "GMC" : "GMT" }}</span>
          </div>
          <v-text-field
            v-model="toAmount"
            base-color="#fff"
            bg-color="rgba(0,0,0,0)"
            color="#fff"
            variant="plain"
            hide-details="auto"
            @input="handleInput"
            placeholder="0"
            @focus="fromOrTo = false"
            reverse
          ></v-text-field>
          <div class="zero_fill" v-if="coinName == 'GMC'">00</div>
          <div class="unit" v-else>M</div>
        </div>
        <div class="convert_coin" v-if="coinName == 'GMC'">
          <span v-if="coinRate">{{ `≈ ${coinRate} USDT` }}</span>
          <span v-else>--</span>
        </div>
      </div>
      <div class="tips_text">1$GMT=10,000$GMC</div>
    </div>
    <div class="swap_buttons">
      <v-btn
        class="button swap"
        @click="submitSwap()"
        width="100%"
        height="40"
        rounded="lg"
        size="small"
        :disabled="(coinName == 'GMT' && isError) || !fromAmount || !toAmount"
      >
        <div class="btn_text">
          <span class="finished">SWAP</span>
          <v-img
            :width="24"
            cover
            src="@/assets/images/svg/airdrop/convert.svg"
          ></v-img>
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
import { transferSwap, getExchangeRate } from "@/services/api/user";
import { useMessageStore } from "@/store/message.js";

type coin = "GMC" | "GMT";

export default defineComponent({
  data() {
    return {
      coinName: "GMC" as coin,
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
    maxAmount() {
      const {
        userInfo: { gmcAmount, gmtAmount },
      } = useUserStore();
      if (this.coinName == "GMC") {
        // swap只能输入百万以上
        const amount = new bigNumber(gmcAmount).dividedBy(1000000).toNumber();

        if (amount >= 1) {
          return Math.floor(amount).toLocaleString();
        } else {
          return "";
        }
      } else {
        if (gmtAmount >= 100) {
          const rctV = new bigNumber(gmtAmount).dividedBy(100).toNumber();
          return Math.floor(rctV).toLocaleString();
        } else {
          return "";
        }
      }
    },
    coinRate() {
      const { coinExchangeRate, toAmount } = this;
      if (!toAmount) return 0;

      const amount = this.removeTxt(toAmount);
      const rate = new bigNumber(amount)
        .multipliedBy(100)
        .multipliedBy(coinExchangeRate)
        .toNumber();
      return accurateDecimal(rate, 2);
    },
  },
  created() {
    this.fetchExchangeRate();
  },
  methods: {
    unitConversion: unitConversion,

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

      if (this.coinName == "GMC") {
        if (!this.fromOrTo) {
          const past = parts[0] + "00";
          parts[0] = past.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          parts[0] = parts[0].slice(0, -2);
        }
      } else {
        if (this.fromOrTo) {
          const past = parts[0] + "00";
          parts[0] = past.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          parts[0] = parts[0].slice(0, -2);
        }
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

      // 更新输入框的值
      if (this.fromOrTo) {
        this.fromAmount = parts[0];
      } else {
        this.toAmount = parts[0];
      }
    },
    handleMax() {
      this.fromOrTo = true;
      this.fromAmount = this.maxAmount;

      if (!this.fromAmount) {
        this.isError = false;
      }
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
      const {
        fromAmount,
        coinName,
        removeTxt,
        userInfo: { gmcAmount },
      } = this;
      let amountVal = Number(removeTxt(fromAmount));

      if (this.coinName == "GMC") {
        amountVal = new bigNumber(amountVal).multipliedBy(1000000).toNumber();
      } else {
        amountVal = new bigNumber(amountVal).multipliedBy(100).toNumber();
      }

      if (coinName == "GMC") {
        if (amountVal > gmcAmount) {
          const { setShowRecharge } = useUserStore();
          setShowRecharge(true);
          return;
        }
      }

      const res = await transferSwap({
        amount: amountVal,
        coinName: coinName == "GMC" ? "GMT" : "GMC",
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
.swap_wrapper {
  margin: 0 8px;
}

.swap_title {
  font-size: 28px;
  font-weight: 700;
  font-style: normal;
  color: #fdefd6;
  padding-top: 16px;
}

.swap_item {
  background-color: rgba(6, 4, 4, 0.75);
  border-radius: 8px;
  padding: 20px 8px 24px;
  position: relative;

  .swap_item_title {
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

.swap_from_input {
  background-color: #2b2b2b;
  border-radius: 8px;
  padding: 8px;
  margin-top: 8px;
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

.convert_coin {
  font-weight: 700;
  font-style: normal;
  font-size: 16px;
  color: #b0b5c5;
  text-align: right;
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

.swap_buttons {
  padding: 4px 8px 0;

  .button {
    padding: 10px 0;
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
    }

    &.back {
      margin-top: 20px;
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
}
</style>