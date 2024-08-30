<template>
  <div class="deposit_wrapper">
    <div class="deposit_title">SWAP</div>
    <div class="deposit_panel">
      <div class="deposit_item">
        <div class="deposit_item_title">
          <div class="operating">From</div>
          <div class="balance">
            <span>
              {{ `Bal: ${formatNumber(coinBalance, 2)}` }}
            </span>
            <v-img
              :width="24"
              cover
              src="@/assets/images/svg/airdrop/history.svg"
              @click="toHistory()"
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
            <div>
              <span>Minimum deposit quantity is 100 $GMT. </span>
              <span
                style="
                  text-decoration: underline;
                  color: #fbb11b;
                  font-weight: 700;
                "
                @click="toExchange()"
                >No $GMT? Go Exchange</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="deposit_buttons">
      <v-btn
        class="button swap"
        @click="submitDeposit()"
        width="100%"
        height="40"
        rounded="lg"
        size="small"
        :disabled="isSubmit"
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
    <deposit></deposit>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import bigNumber from "bignumber.js";
import { accurateDecimal, isEmpty, openUrl } from "@/utils";
import { transferDeposit, getExchangeRate } from "@/services/api/user";
import deposit from "@/components/depositConfirm/index.vue";

import { TonConnectUI, ConnectedWallet } from "@tonconnect/ui";
import { fromNano, toNano, Address } from "@ton/ton";

type coin = "GMC" | "GMT";

export default defineComponent({
  data() {
    return {
      coinName: "GMT" as coin,
      coinBalance: 0 as number | string | any,
      fromAmount: "" as string | any,
      withdrawAddr: "" as string | any,
      coinExchangeRate: 0,
      gmtJettons: "",
      isError: false,
    };
  },
  components: {
    deposit,
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
    // 链接状态
    isConnect() {
      const { isConnect } = useUserStore();
      return isConnect;
    },
    walletAddr() {
      const { walletAddr } = useUserStore();
      return walletAddr;
    },
    // jetton地址
    jettonAddr() {
      const { jettonAddr } = useUserStore();
      return jettonAddr;
    },
    productInfo() {
      const { productInfo } = useUserStore();
      return productInfo;
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
    // 是否可提交
    isSubmit() {
      const { isConnect, fromAmount, coinBalance } = this;

      let isPass = false;

      if (!isConnect) {
        return false;
      }

      if (!fromAmount) {
        isPass = true;
      }

      const amount = new bigNumber(this.removeTxt(fromAmount) || 0)
        .multipliedBy(100)
        .toNumber();

      if (Number(coinBalance) < Number(amount)) {
        isPass = true;
      }

      return isPass;
    },
  },
  created() {
    this.gmtJettons =
      "0:93d1b05e7214a22569548f1addae3facde413d9c38101706542fa5ad5dac446d"; // 测试币(NEOJ)

    if (import.meta.env.MODE == "prod") {
      this.gmtJettons =
        "0:e53bbbaf5a62cb28748e917b245b9e322574a42864721b0741b005b62b44a247"; // 正式币(GMT)
    }

    if (!this.tonConnect) {
      this.initTonConnect();
    } else {
      this.withdrawAddr = Address.parse(this.walletAddr).toString({
        bounceable: false,
      });

      // 获取余额和Jetton地址
      this.fetchBalance();
    }

    this.fetchExchangeRate();
  },
  methods: {
    // 获取余额
    async fetchBalance() {
      const { walletAddr, coinName, gmtJettons } = this;

      let fetchUrl = `https://tonapi.io/v2/accounts/${encodeURIComponent(
        walletAddr
      )}`;

      if (coinName == "GMT") {
        fetchUrl += `/jettons/${encodeURIComponent(gmtJettons)}`;
      }

      axios
        .get(fetchUrl)
        .then((res: any) => {
          if (res.status == 200) {
            if (coinName == "GMT") {
              const { balance, jetton, wallet_address } = res.data;
              this.coinBalance = new bigNumber(balance || 0)
                .dividedBy(this.formatZeroFill(jetton.decimals) || 0)
                .toNumber();

              const { setJettonAddr } = useUserStore();
              setJettonAddr(wallet_address.address);
            } else {
              this.coinBalance = fromNano(res.data.balance);
            }
          }
        })
        .catch(function (error) {
          console.log(error);
        });
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

          this.withdrawAddr = Address.parse(address).toString({
            bounceable: false,
          });

          // 获取余额和Jetton地址
          this.fetchBalance();
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

      const past = parts[0] + "00";
      parts[0] = past.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      parts[0] = parts[0].slice(0, -2);

      // 更新输入框的值
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
    async submitDeposit() {
      const { fromAmount, withdrawAddr, coinName, removeTxt } = this;
      let amountVal = Number(removeTxt(fromAmount));

      amountVal = new bigNumber(amountVal).multipliedBy(100).toNumber();

      const res = await transferDeposit({
        amount: amountVal,
        coinName: coinName,
        formAddress: Address.parse(withdrawAddr).toRawString(), //提币地址
      });
      if (res.code == 200) {
        this.fromAmount = "";

        const { setProductInfo } = useUserStore();
        setProductInfo(res.data);
        this.handleTransfer();
      }
    },
    async handleTransfer() {
      const {
        jettonAddr,
        productInfo: { cell },
      } = this;

      // 创建交易体
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 3600,
        messages: [
          {
            address: jettonAddr,
            amount: toNano("0.05").toString(), //以nanotons计的Toncoin
            payload: cell,
          },
        ],
      };

      this.tonConnect
        .sendTransaction(transaction)
        .then(async (res: any) => {
          const { setShowWithdraw } = useUserStore();
          setShowWithdraw(true);
        })
        .catch((err: any) => {
          console.log(err);
        });
    },
    // Exchange
    toExchange() {
      openUrl(" https://t.me/theGMCoinBot/GMExchange");
    },
    toHistory() {
      const { setCurrentHistory } = useUserStore();
      setCurrentHistory(1);
      this.$router.push({
        name: "History",
      });
    },
    // 末尾补零
    formatZeroFill(event: any) {
      let str = "1";

      for (let i = 0; i < event; i++) {
        str += "0";
      }

      return str;
    },
    // 删除指定字符串
    removeTxt(event: string, type = ",") {
      return String(event).replace(new RegExp(type, "g"), "");
    },
    // 格式化数字
    formatNumber(event: number | string, type: number) {
      const num = accurateDecimal(event, type);
      return Number(num).toLocaleString(undefined, {
        maximumFractionDigits: type,
      });
    },
    handleBack() {
      this.$router.go(-1);
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