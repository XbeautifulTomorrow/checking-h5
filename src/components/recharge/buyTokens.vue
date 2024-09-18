<template>
  <div class="buy_tokens_wrapper">
    <div class="buy_gmc">
      <div class="buy_gmc_title">
        <div class="operating">Buy</div>
      </div>
      <div class="buy_to_input">
        <div class="coin_box">
          <v-img
            :width="40"
            cover
            src="@/assets/images/svg/check_in/gm_coin.svg"
          ></v-img>
        </div>
        <v-text-field
          v-model="toAmount"
          base-color="#fff"
          bg-color="rgba(0,0,0,0)"
          color="#fff"
          variant="plain"
          hide-details="auto"
          reverse
          placeholder="Recive"
          @input="handleInput"
        ></v-text-field>
        <div class="unit">M</div>
      </div>
      <div class="hint_to_number" v-if="toAmount">
        <span>{{ `You'll receice ${handleExchangeGMC()}` }}</span>
        <v-img
          :width="16"
          cover
          src="@/assets/images/svg/check_in/gm_coin.svg"
        ></v-img>
      </div>
    </div>
    <div class="buy_gmc">
      <div class="buy_gmc_title">
        <div class="operating">Price</div>
        <div class="number">{{ `$${formatRounding(usdPrice) || 0}` }}</div>
      </div>
      <div class="convert_ton">
        {{ `≈ ${formatNumber(exchangeTonAmount || 0, 4)} TON` }}
      </div>
    </div>
    <div class="expected_box">
      <div class="expected_item">
        <div class="expected_item_left">Swap Rate</div>
        <div class="expected_item_right" v-if="gmtConvertTon">
          <div class="expected_item_val">
            {{ `1M GMC ≈ ${formatNumber(gmtConvertTon || 0, 6)} TON` }}
          </div>
        </div>
        <div class="expected_item_right" v-else>--</div>
      </div>
      <div class="expected_item">
        <div class="expected_item_left">Slippage</div>
        <div class="expected_item_right">
          <div class="expected_item_val" v-if="slippageNum">
            {{ formatNumber(slippageNum || 0, 2) }}%
          </div>
          <div class="expected_item_val" v-else>--</div>
        </div>
      </div>
      <div class="expected_item">
        <div class="expected_item_left">Service Fee</div>
        <div class="expected_item_right" v-if="serviceFee">
          <div class="expected_item_val">
            <span>
              {{ `≈ $${formatNumber(serviceFee || 0, 4)}` }}
            </span>
          </div>
        </div>
        <div class="expected_item_right" v-else>--</div>
      </div>
    </div>
    <v-btn
      class="connect_btn"
      :elevation="8"
      height="36"
      @click="handleBuy()"
      :disabled="!toAmount"
    >
      <span class="finished">Preview</span>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { getSlippage, purchasePoints, getUsdPrice } from "@/services/api/user";

// 工具类
import bigNumber from "bignumber.js";
import { accurateDecimal, isEmpty } from "@/utils";

export default defineComponent({
  data() {
    return {
      toAmount: "1",
      usdPrice: "",
      slippageNum: "",
      timer: null as any,
    };
  },
  computed: {
    // GMT转化至USD价格
    gmtConvertUsd() {
      const { gmtConvertUsd } = useUserStore();
      return gmtConvertUsd;
    },
    // TON转化至USD价格
    tonConvertUsd() {
      const { tonConvertUsd } = useUserStore();
      return tonConvertUsd;
    },
    // TON转化至GMT价格
    gmtConvertTon() {
      const { gmtConvertUsd, tonConvertUsd } = this;
      const rate = new bigNumber(gmtConvertUsd)
        .dividedBy(tonConvertUsd)
        .multipliedBy(100)
        .toNumber();

      return accurateDecimal(rate, 6);
    },
    // GMT兑换U数量
    exchangeUsdAmount(): any {
      const { toAmount, gmtConvertUsd, removeTxt } = this;
      if (!toAmount) return 0;

      const amount = removeTxt(toAmount);

      const usd = new bigNumber(amount)
        .multipliedBy(100) // 1M ≈ 100 GMT
        .multipliedBy(gmtConvertUsd)
        .toNumber();

      return usd;
    },
    // GMT兑换TON数量
    exchangeTonAmount() {
      const { tonConvertUsd, usdPrice } = this;
      const ton = new bigNumber(usdPrice).dividedBy(tonConvertUsd).toNumber();

      return ton;
    },
    // 服务费
    serviceFee() {
      const { toAmount, usdPrice } = this;
      if (!toAmount) return 0;
      let receiveFee = new bigNumber(usdPrice).multipliedBy(0.003).toNumber();

      const fee = new bigNumber(receiveFee).plus(0.2).toNumber();
      return accurateDecimal(fee, 4);
    },
  },

  async created() {
    this.getExchangePrice();
    this.fetchSlippage(this.toAmount);
    this.fetchBuyUsdPrice(this.toAmount);
  },
  methods: {
    handleInput(event: any) {
      let {
        target: { _value },
      } = event;

      if (isEmpty(_value)) {
        return;
      }

      // 去除非数字字符
      let value = _value.replace(/[^\d.]/g, "");

      // 分割整数和小数部分
      let parts = value.split(".");

      // 大于1000，则取1000
      if (Number(parts[0]) > 1000) {
        parts[0] = "1000";
      }

      // 处理整数部分添加逗号
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      // 更新输入框的值
      this.toAmount = parts[0];

      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      this.timer = setTimeout(() => {
        this.fetchSlippage(this.toAmount);
        this.fetchBuyUsdPrice(this.toAmount);
      }, 300);
    },
    // 购买GMC对应USD价值
    async fetchBuyUsdPrice(event: string) {
      const { removeTxt } = this;
      const amount = new bigNumber(removeTxt(event))
        .multipliedBy(1000000)
        .toNumber();

      const res = await getUsdPrice({
        gmcAmount: amount,
      });

      if (res.code == 200) {
        this.usdPrice = res.data;
      }
    },
    handleExchangeGMC() {
      const { toAmount, removeTxt, formatNumber } = this;
      const gmc = new bigNumber(removeTxt(toAmount))
        .multipliedBy(1000000)
        .toNumber();
      return formatNumber(gmc, 2);
    },
    getExchangePrice() {
      const { fetchCoinExchange } = useUserStore();
      fetchCoinExchange("GMT");
      fetchCoinExchange("TON");
    },
    // 获取滑点
    async fetchSlippage(event: string) {
      const { removeTxt } = this;
      const amount = new bigNumber(removeTxt(event))
        .multipliedBy(1000000)
        .toNumber();

      const res = await getSlippage({
        gmcAmount: amount,
      });
      if (res.code == 200) {
        this.slippageNum = new bigNumber(res.data).multipliedBy(100).toString();
      }
    },
    // 处理下单
    async handleBuy() {
      const { toAmount, removeTxt } = this;
      const { setShowConfirm, setProductInfo, setBuyGmcAmount } =
        useUserStore();

      const amount = new bigNumber(removeTxt(toAmount))
        .multipliedBy(1000000)
        .toNumber();

      const res = await purchasePoints({ gmcAmount: amount });
      if (res.code == 200) {
        setBuyGmcAmount(amount);
        setProductInfo(res.data);
        setShowConfirm(true);
      }
    },
    // 向上取整
    formatRounding(event: number | string) {
      const num = new bigNumber(event).multipliedBy(100).toNumber();
      const amount = new bigNumber(Math.ceil(num)).dividedBy(100).toNumber();
      return Number(amount).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
    },
    // 格式化数字
    formatNumber(event: number | string, type: number) {
      const num = accurateDecimal(event, type);
      return Number(num).toLocaleString(undefined, {
        maximumFractionDigits: type,
      });
    },
    // 删除指定字符串
    removeTxt(event: string, type = ",") {
      return String(event).replace(new RegExp(type, "g"), "");
    },
  },
});
</script>

<style lang="scss" scoped>
.buy_gmc {
  border-radius: 8px;
  padding: 4px 8px;
  position: relative;

  .buy_gmc_title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    font-size: 16px;
    font-weight: 700;
    font-style: normal;
    color: #ffe6c6;
    padding-bottom: 4px;

    .number {
      white-space: nowrap;
      text-shadow: 1px 1px 5px rgba(197, 27, 24, 1);
    }
  }

  .convert_ton {
    padding-top: 4px;
    font-size: 14px;
    text-align: right;
    color: #ffe6c6;
  }

  .hint_to_number {
    text-align: right;
    font-style: normal;
    font-size: 14px;
    color: #fe2e75;
    font-weight: 700;
    padding-top: 4px;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .v-img {
      flex: none;
      margin-left: 4px;
    }
  }
}

.buy_to_input {
  background-color: rgba(255, 230, 198, 1);
  border-width: 2px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 1);
  border-radius: 10px;
  padding: 8px;
  color: #000;
  display: flex;
  align-items: center;

  .coin_box {
    display: flex;
    align-items: center;
    font-weight: 700;
    font-style: normal;
    font-size: 24px;
    color: #000;
    border-radius: 16px;

    .v-img {
      flex: none;
      border-radius: 50%;
      border-width: 2px;
      border-style: solid;
      border-color: rgba(0, 0, 0, 1);
    }
  }

  :deep(.v-field__input) {
    font-size: 16px;
    padding: 0;
    min-height: 0;
    line-height: 1.2;
    font-weight: bold;

    &::-webkit-input-placeholder {
      /* WebKit, Blink, Edge */
      color: #cccccc;
    }
    &:-moz-placeholder {
      /* Mozilla Firefox 4 to 18 */
      color: #cccccc;
      opacity: 1;
    }
    &::-moz-placeholder {
      /* Mozilla Firefox 19+ */
      color: #cccccc;
      opacity: 1;
    }
    &:-ms-input-placeholder {
      /* Internet Explorer 10-11 */
      color: #cccccc;
    }
    &::-ms-input-placeholder {
      /* Microsoft Edge */
      color: #cccccc;
    }

    &::placeholder {
      /* Most modern browsers support this now. */
      color: #cccccc;
    }
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
    color: #f33b59;
  }
}

.expected_box {
  margin: 16px 8px;
  padding: 4px 8px;
  background-color: rgba(255, 237, 214, 1);
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.34);
  border-radius: 8px;
}

.expected_item {
  padding: 4px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.expected_item_left {
  font-size: 14px;
  color: #999999;
}

.expected_item_right {
  font-size: 14px;
  color: #2a2a2a;
  display: flex;
  align-items: center;

  .operating_box {
    margin-left: 8px;
    padding: 4px;
    border-radius: 4px;
    background-color: #f2f3f5;

    .v-img {
      flex: none;
    }
  }
}

.connect_btn {
  width: calc(100% - 16px);
  box-sizing: border-box;
  background-color: rgba(73, 182, 246, 1);
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

  &.v-btn--disabled {
    background-color: rgba(53, 53, 53, 1);
    color: #696969;
  }
}

.finished {
  text-transform: none;
  letter-spacing: 0;
  display: inline-block;
  height: 20px;
  line-height: 1.2;
}
</style>