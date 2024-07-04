<template>
  <v-dialog v-model="showRecharge" width="100%" transition="dialog-top-transition" fullscreen>
    <div class="dialog_box">
      <div class="recharge_title">RECHARGE</div>
      <div class="recharge_toolbar">
        <div class="btn" @click="showRecharge = false">
          <v-img :width="16" cover src="@/assets/images/svg/icon_x.svg"></v-img>
        </div>
        <div class="shading">
          <img src="@/assets/images/svg/bg_shading.svg">
          <img src="@/assets/images/svg/bg_shading.svg">
          <img src="@/assets/images/svg/bg_shading.svg">
          <img src="@/assets/images/svg/bg_shading.svg">
          <img src="@/assets/images/svg/bg_shading.svg">
          <img src="@/assets/images/svg/bg_shading.svg">
          <img src="@/assets/images/svg/bg_shading.svg">
          <img src="@/assets/images/svg/bg_shading.svg">
        </div>
      </div>
      <div class="recharge_panel">
        <div class="recharge_box">
          <div class="product_items">
            <div class="product_item" v-for="(item, index) in productList" :key="index" @click="handleBuy(item)">
              <div class="reward_box">
                <v-img width="50" cover src="@/assets/images/recharge/reward_bg.png"></v-img>
                <div class="bonus">
                  <span class="title">Bonus</span>
                  <span class="val">{{ `${unitConversion(item.gmcAmount)} $GMC` }}</span>
                </div>
              </div>
              <div class="energy_img">
                <v-img width="70" v-if="index == 0" class="reward_img" cover
                  src="@/assets/images/recharge/energy_1.png"></v-img>
                <v-img width="70" v-else-if="index == 1" class="reward_img" cover
                  src="@/assets/images/recharge/energy_2.png"></v-img>
                <v-img width="70" v-else-if="index == 2" class="reward_img" cover
                  src="@/assets/images/recharge/energy_3.png"></v-img>
                <v-img width="70" v-else-if="index == 3" class="reward_img" cover
                  src="@/assets/images/recharge/energy_4.png"></v-img>
                <v-img width="70" v-else-if="index == 4" class="reward_img" cover
                  src="@/assets/images/recharge/energy_5.png"></v-img>
                <v-img width="70" v-else class="reward_img" cover src="@/assets/images/recharge/energy_6.png"></v-img>
              </div>
              <div class="buy_info">
                <div class="energy_val">{{ `${item.energyAmount} Energy` }}</div>
                <div class="price_val">{{ `$${item.price}` }}</div>
              </div>
            </div>
          </div>
          <div class="interval">OR</div>
          <v-btn class="connect_btn" :elevation="8" height="40" @click="toFrens()">
            <v-img width="24" class="reward_img" cover src="@/assets/images/svg/add_user.svg"></v-img>
            <span class="finished">Invite Friend</span>
          </v-btn>
        </div>
      </div>
    </div>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useUserStore } from "@/store/user.js";
import { getProductList } from "@/services/api/user.js";
import { unitConversion } from "@/utils";
interface productInfo {
  productId: number, //产品ID
  energyAmount: number, //能量数量
  gmcAmount: number, //GMC数量
  price: number, //产品价格
  priceCoin: string //价格币种
  [x: string]: string | number | any;
}

export default defineComponent({
  data() {
    return {
      productList: [] as Array<productInfo>,
      tonConnect: null as any
    }
  },
  computed: {
    showRecharge: {
      get() {
        const { showRecharge } = useUserStore();
        return showRecharge
      },
      set(val: boolean) {
        const { setShowRecharge } = useUserStore();
        setShowRecharge(val)
      }
    },
  },
  created() {
    this.fetchProductList()
  },
  methods: {
    unitConversion: unitConversion,
    handleReady() {
      this.showRecharge = false;
    },
    async fetchProductList() {
      const res = await getProductList({ page: 1, limit: 10 });
      if (res.code === 200) {
        this.productList = res.data.records;
      }
    },
    // 邀请
    toFrens() {
      this.handleReady();
      this.$router.push('/frens');
    },
    // 处理购买
    async handleBuy(event: productInfo) {
      const { setProductId } = useUserStore();

      // 打开确认弹窗
      setProductId(event.productId);
      this.handleReady();
    }
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
  max-height: 100vh;
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

.recharge_title {
  width: 90%;
  color: #FDEFD6;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
  background: linear-gradient(180deg, rgba(210, 70, 49, 1) -3%, rgba(212, 72, 52, 1) 100%);
  padding: 8px 24px;
  border-radius: 24px 24px 0 0;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3), 0px 5px 5px 0px rgba(255, 255, 255, 0.3) inset;
  margin-bottom: -4px;
}

.recharge_toolbar {
  width: 100%;
  min-height: 40px;
  background: linear-gradient(180deg, rgba(141, 103, 80, 1) 0%, rgba(141, 103, 80, 1) 100%);
  border: none;
  border-radius: 8px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.9), 0px 5px 5px 0px rgba(255, 255, 255, 0.3) inset;
  overflow: hidden;
  position: relative;
  z-index: 10;

  .btn {
    width: 30px;
    height: 30px;
    border-radius: 30px;
    background: linear-gradient(180deg, #F0D3B3 0%, #F2D0AC 100%);
    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3), 0px 5px 5px 0px rgba(255, 255, 255, 0.3) inset;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 4px;
    right: 10px;

    .v-img {
      flex: none;
    }
  }

  .shading {
    min-height: 40px;
    display: flex;
    align-items: flex-end;

    img {
      width: 50px;
      height: auto;
    }
  }
}

.recharge_panel {
  width: 100%;
  margin-top: -16px;
  padding: 4px;
  border-radius: 4px;
  overflow-y: scroll;
  font-size: 14px;
  background-color: rgba(137, 104, 85, 1);
  border-radius: 0 0 20px 20px;
  padding: 16px;
  box-shadow: 0px 0px 4px rgba(21, 12, 7, 0.5), 0px 5px 5px 0px rgba(96, 69, 54, 1) inset;

  .recharge_box {
    background-color: rgba(117, 87, 72, 1);
    box-sizing: border-box;
    border: 1px solid rgba(96, 69, 54, 1);
    border-radius: 0 0 20px 20px;
    box-shadow: 2px 2px 5px rgba(21, 12, 7, 0.5), 0px 5px 5px 0px rgba(96, 69, 54, 1) inset;
    padding: 8px 8px 16px;
  }
}

.product_items {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  &>.product_item+.product_item {
    margin-left: 12px;
  }

  &>.product_item:nth-child(2n+1) {
    margin-left: 0;
  }

  &>.product_item:nth-child(n+3) {
    margin-top: 8px;
  }
}

.product_item {
  max-width: 50%;
  min-width: 40%;
  flex: 1;
  background: linear-gradient(180deg, rgba(255, 231, 199, 1) 7%, rgba(250, 218, 182, 1) 100%);
  box-sizing: border-box;
  border-width: 2px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
  padding: 40px 0 12px;

  .v-img {
    flex: none;
  }

  .buy_info {
    padding-top: 16px;
    font-size: 16px;

    .energy_val {
      text-align: center;
      font-weight: bold;
      color: #000;
      padding-bottom: 4px;
    }

    .price_val {
      text-shadow: 1px 1px 5px rgba(197, 27, 24, 1);
      font-weight: bold;
      color: #FFEDD6;
    }
  }


  .reward_box {
    position: absolute;
    top: 0;
    left: 0;
  }

  .energy_img {
    width: 70px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;

    .v-img {
      flex: none;
    }
  }

  .bonus {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotateZ(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    white-space: nowrap;
    font-size: 12px;
    text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.9);
    z-index: 2;
  }
}

.interval {
  font-weight: 24px;
  font-weight: bold;
  padding: 16px 0;
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
  font-size: 24px;
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