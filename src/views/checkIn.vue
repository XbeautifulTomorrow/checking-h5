<template>
  <div class="check_in_wrapper">
    <div class="activity_info">
      <div class="left_btn" @click="handlePrev()">
        <v-icon
          v-if="currentIndex > 0"
          color="#fff"
          icon="mdi-chevron-left"
          size="24"
        ></v-icon>
        <v-icon v-else color="#fff" icon="mdi-apps" size="24"></v-icon>
      </div>
      <div class="center_box">
        <div class="activity_time">
          {{
            `${currentChallenge?.startDateStr || "-"} - ${
              currentChallenge?.endDateStr || "-"
            }`
          }}
        </div>
        <div class="prize_pool">
          <v-img
            :width="28"
            cover
            src="@/assets/images/svg/check_in/gm_coin.svg"
          ></v-img>
          <div class="prize_num">
            {{ `${Number(prizePoolNum || 0).toLocaleString()}` }}
          </div>
        </div>
      </div>
      <div class="right_btn" @click="handleNext()">
        <v-icon
          v-if="currentIndex < challengeList.length - 1"
          color="#fff"
          icon="mdi-chevron-right"
          size="24"
        ></v-icon>
        <v-icon v-else color="#fff" icon="mdi-apps" size="24"></v-icon>
      </div>
    </div>
    <div class="check_in_panel">
      <!--已报名-->
      <div class="check_in_hint" v-if="challengeInfo?.userStatus == 1">
        <span v-if="challengeInfo?.stage != 'REGISTRATION' && isreCheckin">
          <span>Please </span>
          <span style="font-weight: bold">Re-Checkin</span>
          <span> in time or you will fail this challenge!</span>
        </span>
        <span v-else>
          <span>{{ `Keep check in for ` }}</span>
          <span style="font-weight: bold">{{
            `${challengeInfo?.keepCheckDays} ${
              challengeInfo?.keepCheckDays > 1 ? "days" : "day"
            } `
          }}</span>
          <span>{{ `to win ` }}</span>
          <span style="font-weight: bold">
            {{ winBonuNum ? Number(winBonuNum || 0).toLocaleString() : "--" }}
          </span>
          <span>{{ ` $GMC!` }}</span>
        </span>
      </div>
      <!--未报名-->
      <div class="check_in_hint" v-else-if="challengeInfo?.userStatus == 2">
        <span v-if="challengeInfo?.stage == 'REGISTRATION'">
          Check in for 7 days to win.
        </span>
        <span v-if="challengeInfo?.stage == 'SIGNIN'">
          Unable to join an ongoing challenge.
        </span>
        <span v-if="challengeInfo?.stage == 'ENDED'">
          This challenge is closed.
        </span>
      </div>
      <!--失败-->
      <div class="check_in_hint" v-else-if="challengeInfo?.userStatus == 3">
        <span>{{ reSigning }}</span>
      </div>
      <div class="check_in_hint" v-else-if="challengeInfo?.userStatus > 3">
        <span>
          <span>{{ `Congratulations, you have won ` }}</span>
          <span style="font-weight: bold">
            {{
              challengeInfo?.rewardAmount
                ? Number(challengeInfo?.rewardAmount).toLocaleString()
                : "--"
            }}
          </span>
          <span>{{ ` $GMC!` }}</span>
        </span>
      </div>
      <div class="check_in_items">
        <div
          class="check_in_item"
          v-for="(item, index) in challengeInfo?.ucCheckInVOs"
          :key="index"
        >
          <div
            :class="['check_in_main', challengeStatus(item)]"
            @click="
              item.userStatus == 4 && challengeInfo?.stage == 'SIGNIN'
                ? openReCheckin(item)
                : null
            "
          >
            <div class="check_in_title">
              {{ getProject(item) }}
            </div>
            <v-img
              :width="30"
              cover
              :src="project[item.signType as keyof typeof project]"
            ></v-img>
            <!--已报名-->
            <template v-if="challengeInfo?.userStatus != 2">
              <!--未开始-->
              <div v-if="item.userStatus == 1" class="check_in_time">
                {{ fetchTimeZone(item.startDate) }}
              </div>
              <!--可签到倒计时-->
              <div v-else-if="item.userStatus == 2" class="check_in_time">
                <countDown
                  v-slot="timeObj"
                  @onEnd="fetchChallengeDetail(false)"
                  :time="getCountDown(item, 2)"
                >
                  <span class="check_in">
                    {{ `${timeObj.mm}m${timeObj.ss}s Left` }}
                  </span>
                </countDown>
              </div>
              <!--已签到，显示获得积分-->
              <div v-else-if="item.userStatus == 3" class="check_in_time">
                <div class="points">
                  <span>{{
                    item.points ? Number(item.points).toLocaleString() : "--"
                  }}</span>
                  <v-img
                    :width="18"
                    cover
                    src="@/assets/images/svg/check_in/points.svg"
                  ></v-img>
                </div>
              </div>
              <!--补签-->
              <div
                v-else-if="
                  item.userStatus == 4 && challengeInfo?.stage == 'REGISTRATION'
                "
                class="check_in_time"
              >
                <span>--</span>
              </div>
              <div
                v-else-if="
                  item.userStatus == 4 && challengeInfo?.stage == 'SIGNIN'
                "
                class="check_in_time re_checkin"
                @click="openReCheckin(item)"
              >
                <span>Re-Checkin</span>
              </div>
              <!--失败-->
              <div v-else-if="item.userStatus == 5" class="check_in_time fail">
                FAIL
              </div>
            </template>
            <!--未报名-->
            <template v-else>
              <div class="check_in_time">
                {{ fetchTimeZone(item.startDate) }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="interval_panel">
      <div class="interval"></div>
      <div class="join_panel">
        <template v-if="challengeInfo?.userStatus == 2">
          <!--可以报名-->
          <v-btn
            class="check_in_btn"
            height="42"
            @click="handleOpenJoin()"
            :elevation="8"
            v-if="challengeInfo?.stage == 'REGISTRATION'"
          >
            <span class="finished">START EARN</span>
          </v-btn>
          <!--已开始，不能报名-->
          <v-btn
            class="check_in_btn not_started"
            height="42"
            readonly
            v-else
            :elevation="8"
          >
            <span class="finished">{{ formatPlaceholder }}</span>
          </v-btn>
        </template>
        <!-- 已报名 -->
        <template v-else-if="challengeInfo?.userStatus == 1">
          <!--可以签到，计算积分-->
          <v-btn
            class="check_in_btn"
            height="42"
            @click="handleAdvertise()"
            v-if="checkStart"
            :elevation="8"
          >
            <span class="finished">{{
              `Check In +${Number(createPoints.time).toLocaleString()}`
            }}</span>
            <v-img
              :width="24"
              cover
              src="@/assets/images/svg/check_in/points.svg"
            ></v-img>
          </v-btn>
          <!--其他状态，或者已经过了签到时间-->
          <v-btn
            class="check_in_btn not_started"
            height="42"
            readonly
            v-else
            :elevation="8"
          >
            <countDown
              class="finished"
              v-slot="timeObj"
              @onEnd="fetchChallengeDetail(false)"
              :time="getCountDown(isNotStart)"
              v-if="isLastDay"
            >
              {{
                `Next check-in start in ${timeObj.hh}:${timeObj.mm}:${timeObj.ss}`
              }}
            </countDown>
            <span v-else class="finished"
              >Challenge complete, reward coming soon.</span
            >
          </v-btn>
        </template>
        <!-- 失败 -->
        <template v-else-if="challengeInfo?.userStatus == 3">
          <v-btn class="check_in_btn failed" readonly :elevation="8">
            <span class="finished">Why this is failed</span>
          </v-btn>
        </template>
        <!--结束，领取奖励-->
        <template v-else-if="challengeInfo?.userStatus > 3">
          <v-btn
            v-if="challengeInfo?.userStatus == 4"
            class="check_in_btn"
            @click="claimBonus()"
            :loading="claimLoading"
            :elevation="8"
          >
            <span class="finished">{{
              `Claim +${Number(challengeInfo?.rewardAmount).toLocaleString()}`
            }}</span>
            <v-img
              :width="24"
              cover
              src="@/assets/images/svg/check_in/gm_coin.svg"
            ></v-img>
          </v-btn>
          <v-btn
            v-if="challengeInfo?.userStatus == 5"
            class="check_in_btn not_started"
            :loading="claimLoading"
            :elevation="8"
          >
            <span class="finished">{{
              `${Number(
                challengeInfo?.rewardAmount
              ).toLocaleString()} $GMC Claimed`
            }}</span>
          </v-btn>
        </template>
      </div>
      <div class="interval"></div>
    </div>
    <div class="rankings_panel">
      <div class="leaderboard_title">
        <div class="title">GM Leaderboard</div>
        <div class="val">
          <v-img
            :width="16"
            src="@/assets/images/svg/check_in/user.svg"
          ></v-img>
          <span>
            {{
              challengeInfo?.notEliminatedNumber
                ? Number(challengeInfo?.notEliminatedNumber).toLocaleString()
                : 0
            }}
          </span>
          <span>/</span>
          <span style="color: #c3c0c0">
            {{
              challengeInfo?.totalNumber
                ? Number(challengeInfo?.totalNumber).toLocaleString()
                : 0
            }}
          </span>
        </div>
      </div>
      <div class="ranking_box">
        <div
          class="leaderboard_item"
          v-for="(item, index) in challengeInfo?.cpRankingVOs"
          :key="index"
        >
          <div class="ranking">
            <v-img
              :width="30"
              v-if="index == 0"
              src="@/assets/images/svg/check_in/leaderboard_0.svg"
            ></v-img>
            <v-img
              :width="30"
              v-else-if="index == 1"
              src="@/assets/images/svg/check_in/leaderboard_1.svg"
            ></v-img>
            <v-img
              :width="30"
              v-else-if="index == 2"
              src="@/assets/images/svg/check_in/leaderboard_2.svg"
            ></v-img>
            <div v-else class="ranking_num">{{ index + 1 }}</div>
            <div class="user">
              <v-avatar
                v-if="item.avatar"
                size="30"
                :image="item.avatar"
              ></v-avatar>
              <img
                v-else
                width="30"
                height="30"
                :avatar="item.userName"
                color="#3D3D3D"
                class="avatar"
              />
              <div class="user_name">
                {{ item.userName }}
              </div>
            </div>
            <div class="bonus" v-if="index < 3">
              <v-img
                :width="24"
                cover
                src="@/assets/images/svg/check_in/gm_coin.svg"
              ></v-img>
              <div class="val">
                {{ `+${Number(item.winAmount).toLocaleString()}` }}
              </div>
            </div>
          </div>
          <div class="points">
            <div>
              {{
                item.points ? Number(item.points || 0).toLocaleString() : "--"
              }}
            </div>
            <v-img
              :width="16"
              cover
              src="@/assets/images/svg/check_in/points.svg"
            ></v-img>
          </div>
        </div>
      </div>
      <div
        class="leaderboard_item you"
        v-if="challengeInfo?.userStatus && challengeInfo?.userStatus != 2"
      >
        <div class="ranking">
          <v-img
            :width="30"
            v-if="challengeInfo?.ranking - 1 == 0"
            src="@/assets/images/svg/check_in/leaderboard_0.svg"
          ></v-img>
          <v-img
            :width="30"
            v-else-if="challengeInfo?.ranking - 1 == 1"
            src="@/assets/images/svg/check_in/leaderboard_1.svg"
          ></v-img>
          <v-img
            :width="30"
            v-else-if="challengeInfo?.ranking - 1 == 2"
            src="@/assets/images/svg/check_in/leaderboard_2.svg"
          ></v-img>
          <div v-else class="ranking_num">
            {{ challengeInfo?.ranking || "--" }}
          </div>
          <div class="user">
            <v-avatar
              v-if="challengeInfo?.avatar"
              size="30"
              :image="userInfo.avatar"
            ></v-avatar>
            <img
              v-else
              width="30"
              height="30"
              :avatar="challengeInfo?.userName"
              color="#3D3D3D"
              class="avatar"
            />
            <div class="user_name">YOU</div>
          </div>
          <div
            class="bonus"
            v-if="
              challengeInfo?.ranking && challengeInfo?.ranking < 4 && winBonus
            "
          >
            <v-img
              :width="24"
              cover
              src="@/assets/images/svg/check_in/gm_coin.svg"
            ></v-img>
            <div class="val">
              {{ `+${Number(winBonus || 0).toLocaleString()}` }}
            </div>
          </div>
        </div>
        <div class="points">
          <div>
            {{
              challengeInfo?.totalPoints
                ? Number(challengeInfo?.totalPoints || 0).toLocaleString()
                : "--"
            }}
          </div>
          <v-img
            :width="16"
            cover
            src="@/assets/images/svg/check_in/points.svg"
          ></v-img>
        </div>
      </div>
    </div>
    <div
      v-if="challengeInfo?.userStatus == 3"
      class="try_again"
      @click="currentIndex = 0"
    >
      <span>Try Again?</span>
    </div>
    <div class="rules_btn" @click="handleRules()">
      <span class="help">?</span>
      <span class="rules_text">RULE</span>
    </div>
    <!--参加弹窗-->
    <v-dialog v-model="showJoin" width="100%" :opacity="0.8">
      <div class="join_dialog_panel">
        <div class="join_title">Join To Split Bonus.</div>
        <div class="bonus_img">
          <v-img
            :width="120"
            cover
            src="@/assets/images/svg/check_in/gm_coin.svg"
          ></v-img>
        </div>
        <div class="join_quantity_box">
          <div class="join_quantity">
            <v-btn
              color="#49B6F6"
              height="40"
              width="40"
              density="compact"
              @click="handleQuantityChange(1)"
              border
              variant="flat"
              :disabled="bonusNum <= userInfo?.minAmount"
              size="x-small"
            >
              <span class="operating_text">-</span>
            </v-btn>
            <div class="quantity">{{ Number(bonusNum).toLocaleString() }}</div>
            <v-btn
              color="#49B6F6"
              height="40"
              width="40"
              density="compact"
              @click="handleQuantityChange(2)"
              variant="flat"
              size="x-small"
            >
              <span class="operating_text">+</span>
            </v-btn>
          </div>
          <div class="expected_revenue">
            <div class="expected_revenue_title">Expected Returns:</div>
            <div class="expected_revenue_val">
              <span>{{ unitConversion(bonusNum * expectedReturn) }}</span>
              <v-img
                :width="24"
                cover
                src="@/assets/images/svg/check_in/gm_coin.svg"
              ></v-img>
            </div>
          </div>
          <div class="approximately_val">
            <span> ≈ $</span>
            <span>
              {{ calculateReturn(bonusNum) }}
            </span>
          </div>
        </div>
        <div class="join_btns">
          <v-btn
            color="#49B6F6"
            height="40"
            density="compact"
            @click="handleRegistration()"
            variant="flat"
            :elevation="8"
            :loading="joinLoading"
            size="x-small"
          >
            <span class="btn_text">CHECK-IN NOW</span>
          </v-btn>
        </div>
      </div>
    </v-dialog>
    <!--广告弹窗-->
    <v-dialog v-model="showAdvertise" width="auto">
      <div class="advertise_box">
        <div class="advertise_img">
          <v-img
            :width="280"
            cover
            src="@/assets/images/check_in/double.png"
          ></v-img>
        </div>
        <div class="advertise_description">
          <span>
            Awesome, Self-discipline acquires wealth! You have earned
          </span>
          <span style="font-size: 20px; font-weight: bold; color: #fdefd6">
            {{ Number(createPoints.time).toLocaleString() }}
          </span>
          <span> points. Watch ads to get more to win super prizes.</span>
        </div>
        <v-btn class="advertise_btn" @click="toAdController()">
          <div class="advertise_text">
            <v-img
              :width="32"
              cover
              src="@/assets/images/svg/check_in/icon_AD.svg"
            ></v-img>
            <span style="padding: 0 4px">GET</span>
            <v-img
              :width="24"
              cover
              src="@/assets/images/svg/check_in/points.svg"
            ></v-img>
            <span style="font-size: 24px; font-weight: bold">
              {{ Number(createPoints.time * 2).toLocaleString() }}
            </span>
          </div>
        </v-btn>
        <div class="not_advertise" @click="handleCheckIn(false)">
          <span>{{ Number(createPoints.time).toLocaleString() }}</span>
          <span>Points is ok</span>
        </div>
      </div>
    </v-dialog>
    <!--邀请弹窗-->
    <v-dialog v-model="showInvite" min-width="200">
      <div class="dialog_box">
        <div class="dialog_text">
          <template v-if="currentSignType">
            <span>Bingo! You have earned </span>
            <span style="font-size: 24px; font-weight: 700; color: #fdefd6">
              {{ Number(getPoints).toLocaleString() }}
            </span>
            <span> points.</span>
            <br />
          </template>
          <span>Invite Friends. Split </span>
          <br />
          <span style="font-size: 24px; font-weight: 700; color: #fd516c">
            $1M $GMC !
          </span>
        </div>
        <v-btn class="invite" @click="inviteToTelegram()">
          <v-img
            :width="24"
            cover
            src="@/assets/images/svg/check_in/telegram.svg"
          ></v-img>
          <span class="finished">Invite Now</span>
        </v-btn>
      </div>
    </v-dialog>
    <!--升级提示弹窗-->
    <v-dialog v-model="showUpgrade" width="auto">
      <div class="dialog_box">
        <div class="dialog_text">
          <span>Level up to unlock higher benefits.</span>
        </div>
        <v-btn class="invite" @click="toMine()">
          <span class="finished">LEVEL UP</span>
        </v-btn>
      </div>
    </v-dialog>
    <!--补签弹窗-->
    <v-dialog v-model="showReCheckin" width="auto">
      <div class="dialog_box">
        <div class="dialog_text">Re-check in will cost energy.</div>
        <div class="energy_box">
          <span class="finished">{{
            `- ${challengeInfo?.supplementaryEnergy}`
          }}</span>
          <v-icon color="#FFF100" :size="16" icon="mdi-lightning-bolt"></v-icon>
        </div>
        <v-btn
          class="re_check_in"
          @click="handleReCheckin()"
          :loading="reCheckinLoading"
        >
          <span class="finished">Re-Check In</span>
        </v-btn>
      </div>
    </v-dialog>
    <!--充值弹窗-->
    <v-dialog v-model="showRecharge" width="auto">
      <div class="dialog_box">
        <div class="dialog_text">
          Opps, You $GMC is not enough! You have three ways to get more.
        </div>
        <div class="recharge_btns">
          <v-btn class="recharge_item gift" @click="toRecharge()">
            <v-img
              :width="24"
              cover
              src="@/assets/images/svg/check_in/icon_gift.svg"
            ></v-img>
            <span class="finished">Get Bonus $GMC</span>
          </v-btn>
          <v-btn class="recharge_item" @click="toFrens()">
            <v-img
              :width="24"
              cover
              src="@/assets/images/svg/check_in/icon_invite.svg"
            ></v-img>
            <span class="finished">Invite Friend</span>
          </v-btn>
          <v-btn class="recharge_item" @click="toEarn()">
            <v-img
              :width="24"
              cover
              src="@/assets/images/svg/check_in/icon_task.svg"
            ></v-img>
            <span class="finished">Daily Task</span>
          </v-btn>
        </div>
      </div>
    </v-dialog>
    <!--规则弹窗-->
    <rules></rules>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  getChallengeNav,
  getChallengeDetails,
  challengeRegistration,
  challengeCheckIn,
  challengeReCheckin,
  challengePickUp,
} from "@/services/api/challenge";
import { useUserStore } from "@/store/user.js";
import { useCheckInStore } from "@/store/check_in.js";
import { useMessageStore } from "@/store/message.js";
import { timeForStr, shareOnTelegram, unitConversion } from "@/utils";
import TWEEN from "@tweenjs/tween.js";

import countDown from "@/components/countDown/index.vue";
import rules from "@/components/rules/index.vue";

import GM from "@/assets/images/svg/check_in/GM.svg";
import BREAKFAST from "@/assets/images/svg/check_in/BREAKFAST.svg";
import LUNCH from "@/assets/images/svg/check_in/LUNCH.svg";
import SUPPER from "@/assets/images/svg/check_in/SUPPER.svg";
import GN from "@/assets/images/svg/check_in/GN.svg";
import bigNumber from "bignumber.js";

interface ucCheckInVOs {
  challengeId: number; // 挑战ID
  signType: string; // 签到类型(GM-起床，BREAKFAST-早饭、LUNCH-午饭、SUPPER-晚饭、 GN-睡觉)
  startDate: string; // 开始时间
  endDate: string; // 结束时间
  pointValue: number; // 积分价值（1秒几积分）
  userStatus: number; // 用户签到状态（1：未开始，2：未签到，3：已签到，4：待补签，5：失败）
  points: number | any; // 所得积分
  [x: string]: string | number | any;
}

interface cpRankingVOs {
  challengeId: number; //挑战ID
  userId: number; //用户ID
  userName: string | any; //用户名
  avatar: string | any; //头像
  winAmount: number; //奖励金额
  points: number; //总积分
  [x: string]: string | number | any;
}

interface showPromiseResult {
  done: boolean; // true if user watch till the end, otherwise false
  description: string; // event description
  state: "load" | "render" | "playing" | "destroy"; // banner state
  error: boolean; // true if event was emitted due to error, otherwise false
}

interface challenge {
  challengeId: number;
  signType: string;
  [x: string]: string | number | any;
}

interface challengeDetails {
  stage: string;
  prizePool: number;
  winAmount: number | string | any;
  rewardAmount: number | string | any;
  supplementaryEnergy: number | string | any;
  ucCheckInVOs: Array<ucCheckInVOs>;
  cpRankingVOs: Array<cpRankingVOs>;
  [x: string]: string | number | any;
}

export default defineComponent({
  data() {
    return {
      challengeList: [] as Array<challenge>,
      challengeInfo: {
        winAmount: 0,
        prizePool: 0,
      } as challengeDetails,
      currentIndex: 0,
      bonusNum: 0,
      prizePoolNum: 0,
      winBonuNum: 0,
      page: 1,
      size: 10,
      project: {
        GM,
        BREAKFAST,
        LUNCH,
        SUPPER,
        GN,
      },
      createPoints: {
        time: 1800,
        timer: null as number | any,
      },
      showJoin: false, // 参加弹窗
      showAdvertise: false, // 广告弹窗
      currentSignType: null as ucCheckInVOs["signType"] | any, // 签到类型
      showInvite: false, // 邀请弹窗
      showReCheckin: false, // 补签弹窗
      showRecharge: false, // 充值弹窗
      reCheckinInfo: {} as ucCheckInVOs,
      claimLoading: false, // 领取加载
      joinLoading: false, // 报名加载
      reCheckinLoading: false, // 补签加载
      isLoad: true, // 是否第一次加载
      showUpgrade: false, // 升级提示
    };
  },
  components: {
    countDown,
    rules,
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    timeZoneNum() {
      const { timeZoneNum } = useUserStore();
      return timeZoneNum;
    },
    gmtConvertUsd() {
      const { gmtConvertUsd } = useUserStore();
      return gmtConvertUsd;
    },
    expectedReturn() {
      const { expectedReturn } = useCheckInStore();
      return expectedReturn;
    },
    isLogin() {
      const { isLogin } = useUserStore();
      return isLogin;
    },
    currentChallenge() {
      const { currentIndex, challengeList } = this;
      return challengeList[currentIndex];
    },
    challengeId() {
      const { challengeId } = useCheckInStore();
      return challengeId;
    },
    // 输入框提示
    formatPlaceholder() {
      const { challengeInfo } = this;

      if (challengeInfo.stage == "SIGNIN") {
        return "The challenge is locked.";
      }

      return "The challenge is closed.";
    },
    // 获胜额外奖励
    winBonus() {
      const {
        challengeInfo: { cpRankingVOs },
        userInfo: { userId },
      } = this;
      const ranking = cpRankingVOs.find((e) => e.userId == userId);
      return ranking ? ranking.winAmount : 0;
    },
    // 失败提示
    reSigning() {
      const {
        challengeInfo: { ucCheckInVOs },
      } = this;
      const checkIn = ucCheckInVOs.find((e) => e.userStatus == 5);

      if (checkIn) {
        if (checkIn.signType == "GM") {
          return "You didn't get up today?";
        } else if (checkIn.signType == "BREAKFAST") {
          return "You didn't have breakfast today?";
        } else if (checkIn.signType == "LUNCH") {
          return "You didn't have lunch today?";
        } else if (checkIn.signType == "SUPPER") {
          return "You didn't have supper today?";
        } else {
          return "You didn't sleep today?";
        }
      }

      return false;
    },
    // 第一个未开始的进入倒计时
    isNotStart() {
      const {
        challengeInfo: { ucCheckInVOs },
      } = this;

      const checkIn = ucCheckInVOs.find(
        (e) => e.userStatus == 1
      ) as ucCheckInVOs;
      return checkIn;
    },
    // 第一个已开始的进入倒计时
    checkStart() {
      const {
        challengeInfo: { ucCheckInVOs },
      } = this;
      const checkIn = ucCheckInVOs.findIndex((e) => e.userStatus == 2) > -1;
      return checkIn;
    },
    // 是否有补签项
    isreCheckin() {
      const {
        challengeInfo: { ucCheckInVOs },
      } = this;
      const checkIn = ucCheckInVOs.findIndex((e) => e.userStatus == 4) > -1;
      return checkIn;
    },
    // 获取第一个挑战
    firstStart() {
      const {
        challengeInfo: { ucCheckInVOs },
      } = this;
      if (ucCheckInVOs.length > 0) {
        return ucCheckInVOs[0];
      }

      return {} as ucCheckInVOs;
    },
    // 是否最后一天，并且所有签到已完成
    isLastDay() {
      const {
        challengeInfo: { ucCheckInVOs, endDate },
      } = this;

      const { currentTime } = useUserStore();
      const endTime = new Date(timeForStr(endDate, "YYYY/MM/DD"));
      const currentDate = new Date(timeForStr(currentTime, "YYYY/MM/DD"));

      if (currentDate >= endTime) {
        // 当天是否所有挑战已完成或已超时
        const checkIn = ucCheckInVOs.findIndex((e) => e.userStatus > 2) > -1;
        return checkIn;
      } else {
        return true;
      }
    },
    // 本次获得的积分
    getPoints() {
      const { currentSignType, challengeInfo } = this;
      //  当前是否可签到
      const checkIn = challengeInfo?.ucCheckInVOs.find(
        (e) => e.signType == currentSignType
      );

      if (checkIn) {
        return checkIn.points;
      }

      return 3600;
    },
  },
  async created() {
    this.fetchChallengeList();
  },
  methods: {
    unitConversion: unitConversion,
    // 获取挑战列表
    async fetchChallengeList(isInvite = false) {
      const res = await getChallengeNav({});
      if (res.code == 200) {
        this.challengeList = res.data;
        if (this.challengeId) {
          const index = this.challengeList.findIndex(
            (e) => e.challengeId == this.challengeId
          );

          if (index > -1) {
            this.currentIndex = index;
            const { setChallengeId } = useCheckInStore();
            setChallengeId(this.challengeList[index].challengeId);
          }

          this.fetchChallengeDetail(isInvite);
          return;
        }

        const isSignUp = this.challengeList.findIndex((e) => e.userStatus == 1);
        if (isSignUp > -1) {
          this.currentIndex = isSignUp;
          const { setChallengeId } = useCheckInStore();
          setChallengeId(this.challengeList[isSignUp].challengeId);
        }

        this.$forceUpdate();
        this.fetchChallengeDetail(isInvite);
      }
    },
    // 获取挑战详情
    async fetchChallengeDetail(isInvite: boolean) {
      this.isLoad = false; // 是否第一次加载
      const { currentChallenge } = this;
      if (!currentChallenge) return;
      const { challengeId } = currentChallenge;

      const res = await getChallengeDetails({
        challengeId,
      });

      if (res.code == 200) {
        this.challengeInfo = res.data;
        this.$forceUpdate();
        this.timerFun();

        this.showInvite = isInvite;

        this.$nextTick(() => {
          (window as any).LetterAvatar.transform();
        });
      }
    },
    // 打开参加弹窗
    handleOpenJoin() {
      const {
        userInfo: { minAmount },
      } = this;

      // 获取收益率
      const { fetchExpectedReturn } = useCheckInStore();
      fetchExpectedReturn();

      // 获取 GMT > U 汇率
      const { fetchCoinExchange } = useUserStore();
      fetchCoinExchange("GMT");

      this.bonusNum = minAmount;
      this.showJoin = true;
    },
    // 参加代币数量
    handleQuantityChange(type: number) {
      const {
        userInfo: { minAmount, maxAmount },
      } = this;

      if (type == 1) {
        this.bonusNum -= minAmount;
        return;
      }
      if (this.bonusNum == maxAmount) {
        this.showUpgrade = true;
        return;
      }
      this.bonusNum += minAmount;
    },
    // 挑战报名
    async handleRegistration() {
      const { bonusNum, currentChallenge, userInfo } = this;
      const { setMessageText } = useMessageStore();

      if (!bonusNum || Number(bonusNum) < 1) {
        setMessageText("Please enter the GMC quantity!");
        return;
      }

      if (userInfo.gmcAmount < bonusNum) {
        this.showRecharge = true;
        return;
      }

      this.joinLoading = true;
      const res = await challengeRegistration({
        challengeId: currentChallenge?.challengeId,
        amount: Math.floor(bonusNum),
      });

      this.joinLoading = false;
      if (res.code == 200) {
        this.showJoin = false;
        this.bonusNum = userInfo?.minAmount;
        this.showInvite = true;
        const userStore = useUserStore();
        userStore.fetchUserInfo();
        this.fetchChallengeList();
      }
    },
    // 挑战广告
    handleAdvertise() {
      const { createPoints } = this;

      // 如果剩余奖励时间大于30秒，则显示广告弹窗
      if (createPoints.time > 30) {
        this.showAdvertise = true;
      } else {
        this.handleCheckIn(false);
      }
    },
    // 挑战签到
    async handleCheckIn(isAdvertise: boolean) {
      const { challengeInfo } = this;
      if (challengeInfo?.ucCheckInVOs.length > 0) {
        //  当前是否可签到
        const checkIn = challengeInfo?.ucCheckInVOs.find(
          (e) => e.userStatus == 2
        );

        if (checkIn) {
          this.showAdvertise = false;

          const res = await challengeCheckIn({
            challengeId: challengeInfo?.challengeId,
            signType: checkIn?.signType,
            isWatchAd: isAdvertise,
          });

          if (res.code == 200) {
            this.currentSignType = checkIn?.signType;
            this.showInvite = true;
            const userStore = useUserStore();
            userStore.fetchUserInfo();
            this.fetchChallengeList(true);
          }
        }
      }
    },
    // 补签，打开补签弹窗
    openReCheckin(item: ucCheckInVOs) {
      const {
        userInfo: { energyAmount },
      } = this;
      if (energyAmount > 0) {
        this.reCheckinInfo = item;
        this.showReCheckin = true;
      } else {
        const { setShowRecharge } = useUserStore();
        setShowRecharge(true);
      }
    },
    // 补签
    async handleReCheckin() {
      this.reCheckinLoading = true;
      const { reCheckinInfo } = this;
      const { setMessageText } = useMessageStore();

      const res = await challengeReCheckin({
        challengeId: reCheckinInfo.challengeId,
        signType: reCheckinInfo.signType,
      });

      this.reCheckinLoading = false;
      if (res.code == 200) {
        this.showReCheckin = false;

        setMessageText("Re-check in successfully");
        const userStore = useUserStore();
        userStore.fetchUserInfo();
        this.fetchChallengeList();
      }
    },
    // 领取奖金
    async claimBonus() {
      const {
        currentChallenge: { challengeId },
      } = this;
      this.claimLoading = true;
      const res = await challengePickUp({
        challengeId,
      });

      this.claimLoading = false;
      if (res.code == 200) {
        const { setMessageText } = useMessageStore();
        setMessageText("Received successfully");
        const userStore = useUserStore();
        userStore.fetchUserInfo();
        this.fetchChallengeList();
      }
    },
    //上一项
    handlePrev() {
      const { currentIndex } = this;
      if (currentIndex > 0) {
        this.currentIndex--;
      } else {
        // 返回列表
        this.$router.push("/activity");
      }
    },
    // 下一项
    handleNext() {
      const { challengeList, currentIndex } = this;
      if (challengeList.length - 1 > currentIndex) {
        this.currentIndex++;
      } else {
        // 返回列表
        this.$router.push("/activity");
      }
    },
    // 显示规则
    handleRules() {
      const { setShowRules } = useCheckInStore();
      setShowRules(true);
    },
    // 邀请
    inviteToTelegram() {
      const { inviteCode } = this.userInfo;
      let inviteUrl = "";
      if (import.meta.env.MODE == "prod") {
        inviteUrl = `https://t.me/theGMCoinBot/GMCoin?startapp=${inviteCode}`;
      } else {
        inviteUrl = `https://t.me/gm_coin_test_bot/checking?startapp=${inviteCode}`;
      }

      this.showInvite = false;
      shareOnTelegram(inviteUrl);
    },
    // 根据当前状态获取样式
    challengeStatus(event: ucCheckInVOs) {
      const { challengeInfo } = this;
      if (challengeInfo?.userStatus != 2) {
        const { userStatus } = event;

        if (userStatus == 3) {
          return "signed_in";
        } else if (challengeInfo?.stage == "SIGNIN" && userStatus == 4) {
          return "re_checkin";
        } else {
          return "";
        }
      }

      // 未报名
      return "";
    },
    // 项目名称
    getProject(event: any) {
      const { signType } = event;
      if (signType == "GM") {
        return "GM";
      } else if (signType == "BREAKFAST") {
        return "Breakfast";
      } else if (signType == "LUNCH") {
        return "Lunch";
      } else if (signType == "SUPPER") {
        return "Dinner";
      } else if (signType == "GN") {
        return "GN";
      }
    },
    // 时间格式化
    formatTime(event: any) {
      return timeForStr("2001-01-01T" + event, "HH:mm");
    },
    // 获取倒计时时间
    getCountDown(event: ucCheckInVOs, type = 1) {
      const { firstStart } = this;
      const { startDate, endDate } = event || firstStart;
      const { currentTime } = useUserStore();
      const startTime = new Date(currentTime).setDate(
        new Date(currentTime).getDate() + 1
      );

      // 未开始就用创建时间
      const current = new Date(event ? currentTime : startTime);
      const yyyy = current.getFullYear();
      const MM =
        current.getMonth() + 1 >= 10
          ? current.getMonth() + 1
          : `0${current.getMonth() + 1}`;
      const dd =
        current.getDate() >= 10 ? current.getDate() : `0${current.getDate()}`;
      const endTime = new Date(
        `${yyyy}-${MM}-${dd}T${type == 1 ? startDate : endDate}`
      ).toString();

      return endTime;
    },
    // 倒计时
    timerFun() {
      let that = this;
      const {
        challengeInfo: { ucCheckInVOs },
      } = this;

      // 已报名
      if (this.challengeInfo?.userStatus != 1) return;

      // 有可签到项
      const checkIn = ucCheckInVOs.find((e) => e.userStatus == 2);
      if (checkIn) {
        that.createPoints.time = this.dateDiff(this.getCountDown(checkIn, 2));
      } else return;

      if (that.createPoints.timer) this.clearTimerFun();
      that.createPoints.timer = setInterval(() => {
        that.createPoints.time--;
        if (that.createPoints.time < 1) {
          this.clearTimerFun();
          that.fetchChallengeList();
        }
      }, 1000);
    },
    // 清除计时器
    clearTimerFun() {
      const {
        createPoints: { timer },
      } = this;
      clearInterval(timer);
      this.createPoints.timer = null;
    },
    // 获取秒差值
    dateDiff(event: string) {
      if (!event) return 0;

      const setTime = new Date(event).getTime();

      const { currentTime } = useUserStore();
      const nowTime = new Date(currentTime || "").getTime();
      if (nowTime >= setTime) return 0;

      // 按照传入的格式生成一个simpledateformate对象
      // let nd = 1000 * 24 * 60 * 60; // 一天的毫秒数
      // let nh = 1000 * 60 * 60; // 一小时的毫秒数
      // let nm = 1000 * 60; // 一分钟的毫秒数
      let ns = 1000; // 一秒钟的毫秒数;

      // 获得两个时间的毫秒时间差异
      let diff;
      diff = Math.floor(Number(new bigNumber(setTime).minus(nowTime)));

      // let day = diff / nd; // 计算差多少天
      // let hour = (diff % nd) / nh; // 计算差多少小时
      // let min = ((diff % nd) % nh) / nm; // 计算差多少分钟

      return Math.floor(diff / ns);
    },
    // 计算收益
    calculateReturn(event: number) {
      const { expectedReturn, gmtConvertUsd } = this;

      const returnVal = new bigNumber(event)
        .multipliedBy(expectedReturn)
        .dividedBy(10000)
        .multipliedBy(gmtConvertUsd)
        .toNumber();

      const index = this.getNonZeroDecimalIndex(returnVal);

      return returnVal.toFixed(index > 1 ? index + 1 : 2);
    },
    // 去充值
    toRecharge() {
      this.showRecharge = false;
      const { setShowRecharge } = useUserStore();
      setShowRecharge(true);
    },
    // 去邀请
    toFrens() {
      this.$router.push("/frens");
    },
    // 去做任务
    toEarn() {
      this.$router.push("/earn");
    },
    // 去升级
    toMine() {
      this.$router.push("/mine");
    },
    // 获取当前时区
    fetchTimeZone(event: string) {
      const { currentTime } = useUserStore();
      const timeZone = new Date(currentTime).getTimezoneOffset() / 60;

      let current = new Date("2001-01-01T" + event);
      current.setHours(current.getHours() - timeZone);
      return timeForStr(current, "HH:mm");
    },
    // 根据时区偏移手动调整时间
    setTimeZone(dateString: string, targetOffset: number) {
      const date = new Date(dateString); // 将时间字符串转换为 Date 对象

      // 获取当前时间的 UTC 时间戳（以毫秒为单位）
      const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;

      // 将 UTC 时间加上目标时区的偏移量（分钟）
      const targetTime = utcTime + targetOffset * 60 * 60000;

      // 创建新的 Date 对象
      return new Date(targetTime);
    },
    // 获取小数点后第一个非0的索引
    getNonZeroDecimalIndex(number: number) {
      const decimalPart = number.toString().split(".")[1];
      if (!decimalPart) return -1; // 如果没有小数部分，返回 -1

      for (let i = 0; i < decimalPart.length; i++) {
        if (decimalPart[i] !== "0") {
          return i; // 返回第一个不为 0 的索引
        }
      }
      return -1; // 如果全部为 0，返回 -1
    },
    // 广告
    toAdController() {
      // 看广告
      const AdController = (window as any).Adsgram.init({
        blockId: "4488",
      });

      // 显示广告横幅
      AdController.show()
        .then(async (result: showPromiseResult) => {
          // user watch ad till the end
          if (result.done) {
            this.handleCheckIn(true);
          }
          // your code to reward user
        })
        .catch((result: showPromiseResult) => {
          // user skipped video or get error during playing ad
          console.log(result);
          // do nothing or whatever you want
          this.handleCheckIn(false);
        });
    },
  },
  watch: {
    currentIndex(val, old) {
      if (this.isLoad) return;
      const {
        challengeList,
        userInfo: { minAmount },
      } = this;
      this.bonusNum = minAmount;
      const { setChallengeId } = useCheckInStore();
      setChallengeId(challengeList[val].challengeId);

      if (this.challengeList.length > 0) {
        // 每次更新重新获取排行榜
        const userStore = useUserStore();
        if (userStore.isLogin) {
          this.fetchChallengeList();
        }
      }
    },
    "challengeInfo.winAmount"(newValue, oldValue) {
      new TWEEN.Tween({
        number: oldValue,
      })
        .to(
          {
            number: newValue,
          },
          300
        )
        .onUpdate((tween) => {
          this.winBonuNum = tween.number.toFixed(0);
        })
        .start();

      function animate() {
        if (TWEEN.update()) {
          requestAnimationFrame(animate);
        }
      }

      animate();
    },
    "challengeInfo.prizePool"(newValue, oldValue) {
      new TWEEN.Tween({
        number: oldValue,
      })
        .to(
          {
            number: newValue,
          },
          300
        )
        .onUpdate((tween) => {
          this.prizePoolNum = tween.number.toFixed(0);
        })
        .start();

      function animate() {
        if (TWEEN.update()) {
          requestAnimationFrame(animate);
        }
      }

      animate();
    },
    // 关闭弹窗时，清除本次签到类型
    showInvite(newV: boolean) {
      if (!newV) {
        this.currentSignType = null;
      }
    },
  },
  beforeUnmount() {
    this.clearTimerFun();
  },
});
</script>
<style lang="scss" scoped>
.check_in_wrapper {
  padding: 8px 0 16px;
}

.activity_info {
  margin: 0 8px 8px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(6, 4, 4, 0.6);
  overflow: hidden;

  .left_btn,
  .right_btn {
    width: 30px;
    height: 70px;
    background-color: rgba(255, 255, 255, 0.5);

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .center_box {
    flex: 1;
    height: 70px;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    .activity_time {
      font-size: 18px;
      text-align: center;
      font-weight: bold;
      color: #fbb11b;
    }

    .prize_pool {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
      color: #fdefd6;

      .v-img {
        margin-right: 4px;
      }
    }
  }
}

.check_in_panel {
  min-height: 200px;
  margin: 8px;
  background-color: rgba(255, 255, 255, 1);
  border: none;
  border-radius: 14px;
  padding: 8px;
}

.check_in_hint {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #fe2e75;
  text-align: center;
}

.check_in_items {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;

  & > .check_in_item + .check_in_item {
    margin-left: 8px;
  }

  & > .check_in_item:nth-child(3) {
    margin-left: 0;
  }
}

.check_in_item {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.check_in_item:nth-child(1) {
  min-width: 40%;
  justify-content: flex-end;
}

.check_in_item:nth-child(2) {
  justify-content: flex-start;
  min-width: 40%;
}

.check_in_main {
  width: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(249, 248, 248, 1);
  border-radius: 8px;
  border: 2px solid transparent;
  box-sizing: border-box;

  &.signed_in {
    border-color: #fb81a2;
  }

  &.re_checkin {
    animation-name: light;
    animation-duration: 1s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }

  .check_in_title {
    width: 100%;
    text-align: center;
    background-color: rgba(243, 242, 243, 1);
    border-radius: 5px;
    color: #6f6f6f;
    font-size: 14px;
    padding: 2px 4px;
  }

  .v-img {
    margin: 2px 0;
  }

  .check_in_time {
    height: 30px;
    line-height: 30px;
    font-size: 18px;
    color: #6f6f6f;
    font-weight: bold;

    &.re_checkin {
      color: #fe2e75;
      font-size: 14px;
    }

    &.fail {
      color: #b7b6b4;
      font-size: 14px;
    }

    .utc_time {
      line-height: 1;
    }

    .current_time {
      text-align: center;
      line-height: 1;
      font-size: 12px;
    }
  }

  .points {
    height: 100%;
    margin-left: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    line-height: 1;
    color: #ffad2e;

    span {
      margin-bottom: -2px;
    }

    .v-img {
      margin-left: 4px;
    }
  }

  .count_down_box {
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-size: 12px;
    line-height: 1.2;
  }

  .check_in {
    font-size: 14px;
    font-weight: bold;
    color: #fe2e75;
  }
}

.interval_panel {
  margin: -16px 8px -16px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .interval {
    width: 6px;
    height: 80px;
    background: linear-gradient(
      90deg,
      rgba(251, 234, 203, 1) 0%,
      rgba(253, 190, 175, 1) 103%
    );
    border-radius: 10px;
  }
}

.rankings_panel {
  margin: 8px 8px 4px;
  background-color: rgba(243, 59, 89, 1);
  border-radius: 14px;
  padding: 8px 0 8px;
  box-sizing: border-box;
}

.ranking_box {
  margin-top: 8px;
  min-height: 96px;
}

.leaderboard_title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  font-size: 16px;
  padding: 0 8px;

  .val {
    display: flex;
    align-items: center;

    .v-img {
      margin-right: 4px;
    }
  }
}

.leaderboard_item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;

  &.you {
    background-color: #fe5f6d;
  }
}

.ranking {
  display: flex;
  align-items: center;

  .ranking_num {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    font-size: 14px;
  }

  .user {
    margin-left: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #fff;
    margin-right: 4px;

    img {
      margin-right: 4px;
    }

    .user_name {
      width: 60px;
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.bonus {
  margin-left: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
  color: #fff;

  .v-img {
    margin-right: 4px;
  }
}

.points {
  margin-left: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
  color: #ffad2e;

  .v-img {
    margin-left: 4px;
    flex: none;
  }
}

.join_panel {
  flex: 1;
  margin: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .v-input {
    width: 100%;
    box-sizing: border-box;
  }

  .join_btn {
    width: 100%;
    padding: 0 24px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      90deg,
      rgba(253, 239, 213, 1) 0%,
      rgba(248, 215, 156, 1) 101%
    );
    color: #fe2e75;
    font-size: 16px;
    border-radius: 4px;
    box-sizing: border-box;

    &.disabled {
      background: linear-gradient(
        90deg,
        rgba(155, 154, 153, 1) 0%,
        rgba(113, 113, 113, 1) 101%
      );
      color: #c8c1c1;
    }
  }

  :deep(.v-field--appended) {
    padding-inline-end: 4px;
  }

  :deep(.v-input__details) {
    display: none;
  }
}

.check_in_btn {
  width: 100%;
  background: linear-gradient(
    90deg,
    rgba(253, 239, 213, 1) 0%,
    rgba(248, 215, 156, 1) 101%
  );
  border-radius: 10px;
  font-weight: bold;
  font-size: 16px;
  color: #fe2e75;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0;

  .v-img {
    margin-left: 4px;
    flex: none;
  }

  &.not_started {
    background: linear-gradient(
      90deg,
      rgba(155, 154, 153, 1) 0%,
      rgba(113, 113, 113, 1) 101%
    );
    font-weight: 400;
    color: #c8c1c1;
  }

  &.failed {
    background: linear-gradient(
      90deg,
      rgba(155, 154, 153, 1) 0%,
      rgba(113, 113, 113, 1) 101%
    );
    color: #c8c1c1;
  }
}

.try_again {
  display: block;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  & > span {
    display: inline-block;
    padding: 4px 16px;
    font-size: 16px;
    color: #ffffff;
    text-align: center;
  }
}

@keyframes light {
  from {
    border-color: #fb81a2;
  }

  to {
    border-color: rgba(251, 129, 162, 0.1);
  }
}

.rules_btn {
  position: fixed;
  top: 200px;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 8px 0 0 8px;

  .help {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    border-radius: 50%;
    background-color: white;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 4px;
  }

  .rules_text {
    display: block;
    word-wrap: break-word;
    width: 14px;
    font-weight: bold;
    font-size: 14px;
    line-height: 1;
    text-align: center;
    color: white;
  }
}

.dialog_box {
  background-color: #000;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  align-items: center;
  flex-direction: column;
  color: #fff;
  text-align: center;
  font-size: 20px;
  line-height: 1.2;

  .dialog_text {
    margin-bottom: 24px;

    &.rules_title {
      font-size: 18px;
      color: #fdefd6;
    }
  }

  .energy_box {
    margin: 4px 0;
    display: flex;
    align-items: center;

    .finished {
      color: #fe2e75;
      font-size: 24px;
      font-weight: bold;
    }
  }

  & > .v-btn {
    font-size: 14px;
    border-radius: 8px;
    color: #fff;
    margin-top: 12px;
  }

  .invite {
    background-color: #49b6f6;

    .v-img {
      margin-right: 4px;
    }
  }

  .re_check_in {
    background: linear-gradient(
      90deg,
      rgba(253, 239, 213, 1) 0%,
      rgba(248, 215, 156, 1) 101%
    );
    color: #fe2e75;
    font-weight: bold;
  }

  .recharge_btns {
    display: flex;
    flex-direction: column;
  }

  .recharge_item + .recharge_item {
    margin-top: 8px;
  }

  .recharge_item {
    background-color: #49b6f6;
    font-size: 16px;

    &.gift {
      background-color: #f33b59;
    }

    .v-img {
      margin-right: 4px;
    }

    .finished {
      color: #fff;
    }
  }
}

.rules_panel {
  max-height: 300px;
  overflow-y: scroll;
  font-size: 14px;
  text-align: left;
}

.join_dialog_panel {
  background-color: #fd516c;
  border-radius: 16px;
  padding: 16px 16px 32px;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  color: #fff;
  text-align: center;
  font-size: 20px;
  line-height: 1.2;

  .join_title {
    font-weight: 700;
    font-style: normal;
    font-size: 24px;
    color: #fdefd6;
  }

  .bonus_img {
    margin: 24px 0 16px;

    .v-img {
      flex: none;
    }
  }

  .join_quantity_box {
    width: 100%;
    padding: 16px 8px;
    border-radius: 8px;
    background-color: rgba(17, 16, 16, 0.5);
  }

  .join_quantity {
    width: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(49, 49, 49, 0.9);
    border-radius: 16px;
    margin: 0 auto;

    .v-btn {
      border: 2px solid #000;
      border-radius: 12px;
      box-sizing: border-box;

      &.v-btn--disabled {
        background-color: #b7b6b4 !important;
        color: #c8c1c1;
      }

      :deep(.v-btn__overlay) {
        opacity: 0 !important;
      }
    }

    .operating_text {
      color: #fff;
      font-weight: bold;
      font-size: 30px;
      line-height: 1;
    }

    .quantity {
      color: #fdefd6;
      flex: 1;
    }
  }

  .expected_revenue {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0 4px;

    .expected_revenue_title {
      font-size: 16px;
      color: #fdefd6;
    }

    .expected_revenue_val {
      display: flex;
      align-items: center;
      color: white;
      font-size: 16px;
      color: #fdefd6;
      font-weight: bold;

      .v-img {
        flex: none;
        margin-left: 4px;
      }
    }
  }

  .approximately_val {
    text-align: right;
    color: #55e60c;
    font-size: 16px;
    font-weight: bold;
  }

  .join_btns {
    width: 100%;
    padding-top: 16px;

    .v-btn {
      width: 100%;
      border-radius: 10px;
      background: linear-gradient(
        90deg,
        rgba(253, 239, 213, 1) 0%,
        rgba(248, 215, 156, 1) 101%
      );
      box-shadow: none;
      color: #fe2e75;
    }

    .btn_text {
      font-size: 18px;
      color: #fe2e75;
      letter-spacing: 0;
    }
  }
}

.advertise_box {
  background: #fd516c;
  border-radius: 8px;
  padding: 16px;

  .v-img {
    flex: none;
  }
}

.advertise_img {
  display: flex;
  align-items: center;
  justify-content: center;
}

.advertise_description {
  color: white;
  font-size: 16px;
  text-align: center;
  padding-bottom: 14px;
}

.advertise_btn {
  width: 100%;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgba(253, 239, 213, 1) 0%,
    rgba(248, 215, 156, 1) 101%
  );
  color: #fe2e75;
  font-size: 20px;
}

.advertise_text {
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0;
  text-transform: none;
}

.not_advertise {
  text-align: center;
  color: white;
  font-size: 16px;
  margin-top: 14px;
  text-decoration: underline;
  cursor: pointer;
}

.finished {
  text-transform: none;
  letter-spacing: 0;
}

.avatar {
  border: 4px solid #ffad2e;
  border-radius: 50%;
}
</style>