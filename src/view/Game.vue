<script setup>
import {ref, computed, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {events} from '@/assets/event';
import {users} from '@/assets/user';

const router = useRouter();

// 常量
const MAX_DICE = 6;
const MAX_HEALTH = 3;

// 响应式数据
const logMessages = ref([]);
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));
const health = ref(3);
const duelState = ref(false);
const gameOver = ref(false);
const newUsers = users.filter(u => u.id !== user.value.id);
const newEvents = events.filter(e => e.rela !== user.value.id);
const pkUser = ref(null);
const pkUserRoll = ref(0);
const userRoll = ref(0);
const eventNow = ref({});
const eroImgShow = ref(false);
const eroImg = ref('');

// 新增：事件记录数组
const eventHistory = ref([]);
const round = ref(0); // 轮次

// 游戏总结对话框
const summaryVisible = ref(false);
const summaryStats = ref({
  totalRounds: 0,
  totalEvents: 0,
  totalDuels: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  finalHealth: 0,
});

// 计算属性：血量点数组
const healthDots = computed(() => Array.from({length: health.value}));

// 公共方法：推送日志
const pushLog = (msg) => {
  const newLog = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logMessages.value.unshift(newLog);
};

// 方法
const restartGame = () => {
  localStorage.removeItem('user');
  router.push('/');
};

const singlePull = () => {
  if (gameOver.value) return;
  round.value++;
  eventNow.value = newEvents[Math.floor(Math.random() * newEvents.length)];
  if (eventNow.value.roll!=null) {
    pkUserRoll.value = 0;
    userRoll.value = 0;
    const randomUser = newUsers[Math.floor(Math.random() * newUsers.length)];
    pkUser.value  = randomUser;
    let output = eventNow.value.content.replace('{name}', randomUser.name);
    pushLog(output);

    userRoll.value = Math.floor(Math.random() * 6) + 1;
    pushLog(`${randomUser.name} 掷出了 ${userRoll.value},轮到你了`);
    duelState.value = true;

    // 记录事件
    eventHistory.value.push({
      round: round.value,
      type: 'duel',
      opponent: randomUser.name,
      opponentRoll: userRoll.value,
      result: 'pending'
    });
  } else {
    health.value = Math.max(0, Math.min(MAX_HEALTH, health.value + eventNow.value.type));
    pushLog(eventNow.value.content);
    // 记录事件
    eventHistory.value.push({
      round: round.value,
      type: 'event',
      content: eventNow.value.content,
      health: health.value
    });
  }
  checkGameOver();
};
const getEroApi=()=>{
  return new Promise((resolve, reject) => {
    fetch('https://lolisuki.cn/api/setu/v1',{
      method: 'GET',
      headers: {
        'r18':1,
        'num':1,
        'level':3
      }
    })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        reject(error);
      });
  });
}

const rollTheDice = () => {
  if (gameOver.value) return;
  const diceValue = Math.floor(Math.random() * MAX_DICE) + 1;
  pushLog(`投掷出了: ${diceValue}`);

  let result;
  if (diceValue > userRoll.value) {
    result = 'win';
    pushLog('自古对波左边赢吗？恭喜你');
  } else if (diceValue === userRoll.value) {
    result = 'draw';
    pushLog('竟然平局了吗，哈基人，你这家伙');
  } else {
    result = 'lose';
    health.value--;
    pushLog('你输给了'+pkUser.value.name);
  }

  // 更新最后一次对战的结果
  const lastDuel = eventHistory.value.findLast(e => e.type === 'duel' && e.result === 'pending');
  if (lastDuel) {
    lastDuel.playerRoll = diceValue;
    lastDuel.result = result;
    lastDuel.health = health.value;
  }

  duelState.value = false;
  checkGameOver();
};

// 判断游戏是否结束
const checkGameOver = () => {
  if (health.value <= 0) {
    health.value = 0;
    gameOver.value = true;
    pushLog('💀 游戏结束！请点击重开按钮重新开始。');
    generateSummary();
  }
};

// 生成总结数据
const generateSummary = () => {
  const duels = eventHistory.value.filter(e => e.type === 'duel');
  const wins = duels.filter(d => d.result === 'win').length;
  const losses = duels.filter(d => d.result === 'lose').length;
  const draws = duels.filter(d => d.result === 'draw').length;

  summaryStats.value = {
    totalRounds: round.value,
    totalEvents: eventHistory.value.filter(e => e.type === 'event').length,
    totalDuels: duels.length,
    wins,
    losses,
    draws,
    finalHealth: health.value,
  };

  summaryVisible.value = true;
};

// 初始化
onMounted(() => {
  if (user.value?.tips) {
    pushLog(user.value.tips);
  }
});
</script>

<template>
  <div class="game-container">
    <!-- 顶部信息栏 -->
    <div class="top-panel">
      <div class="avatar-placeholder">
        <img v-if="user?.url" :src="user.url" class="avatar"/>
      </div>
      <div class="info-area">
        <div class="player-name">{{ user?.name || '未知玩家' }}</div>
        <div class="health-bar">
          <img
              v-for="(dot, idx) in healthDots"
              :key="idx"
              src="@/assets/health-dot.png"
              class="health-dot"
          />
        </div>
      </div>
      <el-button type="danger" plain @click="restartGame">重开</el-button>
    </div>

    <!-- 日志面板 -->
    <div class="log-panel" ref="logPanel">
      <div v-if="logMessages.length === 0" class="log-placeholder">暂无日志</div>
      <p v-else v-for="(msg, index) in logMessages" :key="index">{{ msg }}</p>
    </div>

    <!-- 操作面板 -->
    <div class="action-panel">
      <el-button :disabled="duelState || gameOver" type="danger" plain @click="singlePull">抽取</el-button>
      <el-button :disabled="!duelState || gameOver" type="danger" plain @click="rollTheDice">投掷骰子</el-button>
    </div>
    <div class="bottom-panel" v-if="duelState">
      <div class="avatar-placeholder">
        <img v-if="user?.url" :src="user.url" class="avatar"/>
      </div>
      <div class="avatar-placeholder">
        <img src="@/assets/vs.png" class="avatar"/>
      </div>
      <div class="avatar-placeholder">
        <img v-if="user?.url" :src="pkUser.url" class="avatar"/>
      </div>
    </div>
    <div class="bottom-panel" v-if="eventNow.img!=null">
      <div class="event-img">
        <img :src="eventNow.img" class="avatar"/>
      </div>
    </div>

    <!-- 游戏总结弹窗 -->
    <el-dialog v-model="summaryVisible" title="游戏总结" width="400px" align-center>
      <div class="summary-content">
        <p>总轮次：{{ summaryStats.totalRounds }}</p>
        <p>事件数：{{ summaryStats.totalEvents }}</p>
        <p>对战次数：{{ summaryStats.totalDuels }}</p>
        <p>胜利：{{ summaryStats.wins }} | 失败：{{ summaryStats.losses }} | 平局：{{ summaryStats.draws }}</p>
        <p>最终血量：{{ summaryStats.finalHealth }}</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="summaryVisible=false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 颜色变量 */
:root {
  --main-border-color: #f56c6c;
  --main-text-color: #f56c6c;
  --background-color: #f0f2f5;
  --health-filled-color: #f56c6c;
}

.game-container {
  width: 100%;
  height: 70vh;
  background-color: var(--background-color);
  padding: 15px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
  'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  color: var(--main-text-color);
}

/* 顶部面板 */
.top-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3vh;
}
.bottom-panel{
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 10vh;
  width: 86%;
  padding-left: 10px;
  padding-right: 10px;
}


.avatar-placeholder {
  width: 80px;
  height: 80px;
  border: 2px solid var(--main-border-color);
  display: flex;
  justify-content: center;
  align-items: center;
}

.info-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.player-name {
  font-size: 20px;
  font-weight: bold;
}

.health-bar {
  display: flex;
  align-items: center;
}

.health-dot {
  width: 18px;
  height: 18px;
  margin: 0 4px;
}

/* 日志面板 */
.log-panel {
  flex-grow: 1;
  border: 2px solid var(--main-border-color);
  padding: 10px;
  overflow-y: auto;
  margin-bottom: 15px;
  background-color: white;
}

.log-placeholder {
  font-size: 16px;
  color: #aaa;
}

.log-panel p {
  margin: 0 0 5px 0;
  font-size: 14px;
}

/* 操作面板 */
.action-panel {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

/* Element Plus 按钮 */
.el-button {
  width: 120px;
  height: 45px;
  font-size: 18px;
  border-width: 2px;
}

.el-button.is-plain {
  color: var(--main-text-color);
  border-color: var(--main-border-color);
  background-color: transparent;
}

.el-button.is-plain:hover,
.el-button.is-plain:focus {
  background-color: #fef0f0;
  color: var(--main-text-color);
  border-color: var(--main-border-color);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.summary-content {
  font-size: 16px;
  line-height: 1.8;
}
.event-img{
  position: fixed;
  height: 25vh;
  left: 11vw;
  bottom: 0;
}
</style>
