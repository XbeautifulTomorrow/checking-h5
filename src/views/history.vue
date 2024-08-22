<template>
  <div class="history_wrapper">
    <div
      class="history_list"
      @scroll="handleScroll"
      v-if="historyList.length > 0"
    >
      <div class="history_item" v-for="item in historyList" :key="item.time">
        <div class="history_info">
          <div class="info_title">
            {{ timeForStr(item.time, "YYYY-MM-DD HH:mm:ss") }}
          </div>
          <div class="info_val">
            <span>Status:</span>
            <span>{{ item.status }}</span>
          </div>
        </div>
        <div class="history_info">
          <div class="info_title">DEPOSIT AMOUNT:</div>
          <div class="info_val amount">
            <span>{{ Number(item.amount).toLocaleString() }}</span>
            <v-img
              :width="24"
              cover
              src="@/assets/images/airdrop/coin_gmt.png"
            ></v-img>
          </div>
        </div>
        <div class="history_info">
          <div class="info_title">ADDRESS:</div>
          <div class="info_val">{{ formatAddr(item.address) }}</div>
        </div>
        <div class="history_info">
          <div class="info_title">HASH:</div>
          <div class="info_val">
            <span>{{ formatAddr(item.hash) }}</span>
            <v-img
              :width="24"
              cover
              @click="openLink(item.hash)"
              src="@/assets/images/svg/airdrop/icon_link.svg"
            ></v-img>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no_data">No Orders Found</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { getWithdrawList } from "@/services/api/user";
import { timeForStr, openUrl } from "@/utils";
import { Address } from "@ton/ton";

interface orderInfo {
  hash: string; //hash
  address: string; //提币地址
  amount: number; //提币数量
  status: string; //状态
  time: string; //时间
}

export default defineComponent({
  data() {
    return {
      historyList: [] as Array<orderInfo>,
      page: 1,
      size: 10,
      finished: false,
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
  },
  created() {},
  methods: {
    timeForStr: timeForStr,
    openLink(event: string) {
      if (!event) return;
      const tonUrl = "https://tonviewer.com/";
      openUrl(`${tonUrl}${event}`);
    },
    async fetchHistoryList(type = 1, isSearch = true) {
      let _page = this.page;
      if (isSearch) {
        this.finished = false;
        this.page = 1;
        _page = 1;
      }

      const res = await getWithdrawList({ page: _page, size: this.size });
      if (res.code == 200) {
        if (res.data.current >= res.data.pages) {
          this.finished = true;
        }
        if (type == 1) {
          this.historyList = res.data.records;
        } else {
          this.historyList.push.apply(this.historyList, res.data.records);
        }
      }
    },

    // 处理滚动事件
    async handleScroll(event: Event) {
      const target = event.target as HTMLElement;
      const bottom =
        target.scrollHeight === target.scrollTop + target.clientHeight;

      if (bottom && !this.finished) {
        this.page++;
        this.fetchHistoryList(2, false);
      }
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
  },
});
</script>

<style lang="scss" scoped>
.history_list {
  background-color: rgba(0, 0, 0, 0.6);
}

.history_item {
  padding: 8px;
  .history_info {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .info_title {
      font-weight: 700;
      font-style: normal;
      font-size: 14px;
      color: #b0b5c5;
    }

    .info_val {
      display: flex;
      align-items: center;
      font-style: normal;
      font-size: 14px;
      color: #b0b5c5;

      &.amount {
        color: white;
        font-weight: 700;
      }

      .v-img {
        flex: none;
        margin-left: 4px;
      }
    }
  }

  .history_info:nth-child(1) {
    padding-bottom: 8px;
  }

  .history_info:nth-child(n + 3) {
    .info_title {
      font-weight: 400;
    }
  }
}

.no_data {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #b0b5c5;
}
</style>