<template>
  <div class="deposit_wrapper">
    <div class="deposit_title">SWAP</div>
    <div class="deposit_panel">
      <div class="deposit_item">
        <div class="deposit_item_title">
          <div class="operating">From</div>
          <div class="balance">
            <v-img
              :width="24"
              cover
              src="@/assets/images/svg/airdrop/history.svg"
            ></v-img>
          </div>
        </div>
        <div class="deposit_from_input">
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
        </div>
        <div class="hint_box">
          <div class="hint_left">
            <v-img
              :width="16"
              cover
              src="@/assets/images/svg/airdrop/hint.svg"
            ></v-img>
            <span>Minimum deposit quantity is 100 $GMT</span>
          </div>
          <div class="hint_right">≈ 15.55 USDT</div>
        </div>
      </div>
    </div>
    <div class="deposit_buttons">
      <v-btn
        class="button swap"
        @click="submitSwap()"
        width="100%"
        height="40"
        rounded="lg"
        size="small"
        :disabled="!fromAmount"
      >
        <div class="btn_text">
          <v-img
            :width="24"
            cover
            src="@/assets/images/svg/airdrop/deposit.svg"
          ></v-img>
          <span class="finished">DEPOSIT</span>
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
import { unitConversion, isEmpty } from "@/utils";
import { transferSwap } from "@/services/api/user";
import { useMessageStore } from "@/store/message.js";

type coin = "GMC" | "GMT";

export default defineComponent({
  data() {
    return {
      coinName: "GMT" as coin,
      fromAmount: "" as string | any,
      toAmount: "" as string | any,
      fromOrTo: false,
      isError: false,
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    maxAmount() {
      const {
        userInfo: { gmcAmount, rctAmount },
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
        if (rctAmount >= 100) {
          const rctV = new bigNumber(rctAmount).dividedBy(100).toNumber();
          return Math.floor(rctV).toLocaleString();
        } else {
          return "";
        }
      }
    },
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
.deposit_wrapper {
  margin: 0 8px;
}

.deposit_title {
  font-size: 28px;
  font-weight: 700;
  font-style: normal;
  color: #fdefd6;
  padding-top: 16px;
}

.deposit_item {
  background-color: rgba(6, 4, 4, 0.75);
  border-radius: 8px;
  padding: 20px 8px 12px;
  position: relative;

  .deposit_item_title {
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

.deposit_from_input {
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

.hint_box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;

  .hint_left {
    bottom: 4px;
    font-size: 10px;
    color: #fdefd6;
    display: flex;
    align-items: center;

    .v-img {
      flex: none;
      margin-right: 4px;
    }
  }

  .hint_right {
    font-weight: 700;
    font-style: normal;
    font-size: 12px;
    color: #b0b5c5;
  }
}

.tips_text {
  padding: 16px 0;
  font-size: 14px;
  color: white;
  text-align: center;
}

.deposit_buttons {
  padding: 32px 0 0;

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
      margin-top: 8px;
      background-color: #ececec;
      box-sizing: border-box;
      color: #666565;
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