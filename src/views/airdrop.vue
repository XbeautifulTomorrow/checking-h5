<template>
  <div class="airdrop_wrapper">
    <div class="gift_box">
      <v-img :width="160" cover src="@/assets/images/airdrop/coin_gmc.png"></v-img>
      <div class="description_text">
        <span v-if="stageType == 1">Keep up the good habits, the airdrop is coming.</span>
        <span v-else-if="stageType == 2 && !isConnect">
          <span class="connect_title">Airdrop Launched</span>
          <span class="connect_description">Connect wallet and unlock your withdrawals.</span>
        </span>
        <span v-else-if="stageType == 2 && isConnect"></span>
      </div>
    </div>
    <div class="preparation_phase" v-if="stageType == 1">
      <div class="prepare_item" v-for="(item, index) in prepareList" :key="index">
        <div :class="['check_box', item.isCheck && 'checked']">
          <v-img v-if="item.isCheck" :width="14" cover src="@/assets/images/svg/airdrop/checked.svg"></v-img>
        </div>
        <div class="prepare_text">{{ item.text }}</div>
      </div>
    </div>
    <div class="connect_panel" v-if="stageType == 2 && !isConnect">
      <div class="connect_wallet_title">Wallet</div>
      <div class="connect_btn" @click="connectToWallet()">
        <v-img class="wallet_img" :width="40" cover src="@/assets/images/airdrop/wallet.png"></v-img>
        <span>Connect your TON wallet</span>
        <v-img class="arrow_img" :width="24" cover src="@/assets/images/svg/airdrop/icon_arrow.svg"></v-img>
      </div>
    </div>
    <div class="exchange_panel" v-else-if="stageType == 2 && isConnect">
      <div class="exchange_balance">
        <div class="exchange_balance_title">Portfolio</div>
        <div class="exchange_balance_val">
          <v-img :width="28" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
          <span>{{ Number(userInfo.gmcAmount).toLocaleString() }}</span>
        </div>
      </div>
      <div class="exchange_project">
        <div class="exchange_item">
          <div class="exchange_coin">
            <div class="exchange_text">
              <v-img :width="40" class="gmc_img" cover src="@/assets/images/airdrop/coin_gmc.png"></v-img>
              <span>GMT</span>
            </div>
            <div class="exchange_val">0</div>
          </div>
          <div class="exchange_type">
            <div class="exchange_btn">
              <span>SWAP</span>
              <span class="tip_text">Soon</span>
            </div>
            <div class="exchange_btn">
              <span>WITHDRAW</span>
              <span class="tip_text">Soon</span>
            </div>
          </div>
        </div>
        <div class="exchange_item">
          <div class="exchange_coin">
            <div class="exchange_text">
              <v-img :width="40" cover src="@/assets/images/airdrop/coin_ton.png"></v-img>
              <span>TON</span>
            </div>
            <div class="exchange_val">0</div>
          </div>
          <div class="exchange_type">
            <div class="exchange_btn">
              <span>SWAP</span>
              <span class="tip_text">Soon</span>
            </div>
            <div class="exchange_btn">
              <span>WITHDRAW</span>
              <span class="tip_text">Soon</span>
            </div>
          </div>
        </div>
      </div>
      <div class="connect_info">
        <div class="connect_address">
          <v-img :width="30" cover src="@/assets/images/svg/airdrop/icon_wallet.svg"></v-img>
          <span>{{ formatAddr(walletAddr) }}</span>
        </div>
        <div class="disconnect_btn" @click="handleDisconnect()">
          <v-img :width="20" cover src="@/assets/images/svg/airdrop/icon_disconnect.svg"></v-img>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUserStore } from "@/store/user.js";
import { TonConnectUI, ConnectedWallet } from '@tonconnect/ui'

export default defineComponent({
  data() {
    return {
      stageType: 2,
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
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
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
  },
  created() {
    this.initTonConnect();
  },
  methods: {
    // 初始化ton-connect
    async initTonConnect() {
      let miniappUrl = "https://t.me/gm_coin_test_bot/checking";

      this.tonConnect = new TonConnectUI({
        manifestUrl: "https://file.gmking.io/tonconnect-manifest.json"
      });

      if (import.meta.env.MODE == "prod") {
        miniappUrl = "https://t.me/theGMCoinBot/GMCoin";
      }
      // webapp重定向
      this.tonConnect.uiOptions = {
        twaReturnUrl: miniappUrl
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
    // 格式化地址
    formatAddr(event: string) {
      if (!event) return event;
      var reg = /^(\S{8})\S+(\S{6})$/;
      return event.replace(reg, "$1...$2");
    },
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

  .connect_title {
    display: block;
    font-size: 26px;
  }

  .connect_description {
    display: block;
    font-size: 14px;
    font-weight: 400;
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

.connect_panel {
  margin-top: 24px;

  .connect_wallet_title {
    font-weight: 700;
    font-style: normal;
    font-size: 22px;
    color: #FDEFD6;
  }
}

.connect_btn {
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  font-weight: 400;
  font-style: normal;
  font-size: 18px;
  color: #FFFFFF;
  margin-top: 8px;

  .v-img {
    flex: none;
  }

  .wallet_img {
    border-radius: 10px;
  }

  .arrow_img {
    transform: rotate(90deg);
  }
}

.exchange_panel {
  padding-top: 24px;
}

.exchange_balance {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .exchange_balance_title {
    font-size: 20px;
    font-weight: 700;
    color: #FDEFD6;
  }

  .exchange_balance_val {
    display: flex;
    align-items: center;
    font-weight: 700;
    font-style: normal;
    font-size: 16px;
    color: #FDEFD6;

    .v-img {
      flex: none;
      margin-right: 4px;
    }
  }
}

.exchange_project {
  padding-top: 20px;

  .exchange_item+.exchange_item {
    margin-top: 8px;
  }
}

.exchange_item {
  background-color: rgba(6, 4, 4, 0.6);
  border-radius: 10px;
  padding: 12px;

  .exchange_coin {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 700;
    font-style: normal;
    font-size: 20px;
    color: #FDEFD6;
  }

  .exchange_text {
    display: flex;
    align-items: center;

    .v-img {
      flex: none;
      margin-right: 4px;
      border-radius: 50%;
    }

    .gmc_img {
      transform: scale(1.2);
    }
  }
}

.exchange_type {
  padding-top: 12px;

  .exchange_btn+.exchange_btn {
    margin-top: 8px;
  }
}

.exchange_btn {
  position: relative;
  background-color: rgba(53, 53, 53, 1);
  border-radius: 10px;
  font-weight: 700;
  font-size: 20px;
  color: #696969;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  .tip_text {
    position: absolute;
    top: -4px;
    right: 4px;
    background-color: rgba(249, 219, 165, 1);
    border: none;
    padding: 0 8px;
    border-radius: 20px;
    -moz-box-shadow: none;
    -webkit-box-shadow: none;
    box-shadow: none;
    color: #000000;
    font-weight: 400;
    font-size: 14px;
  }
}

.connect_info {
  padding-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  .connect_address {
    display: flex;
    align-items: center;
    font-weight: 700;
    font-style: normal;
    color: #fff;
    font-size: 16px;
    background-color: rgba(0, 152, 235, 1);
    border-radius: 10px;
    padding: 4px 8px;
    margin-right: 8px;

    .v-img {
      flex: none;
      margin-right: 4px;
    }
  }

  .disconnect_btn {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(6, 2, 2, 1);
    border-radius: 10px;

    .v-img {
      flex: none;
    }
  }
}
</style>