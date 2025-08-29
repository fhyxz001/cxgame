<script setup>
import {onMounted, ref} from "vue";
import { users } from "@/assets/user";
import {useRouter} from "vue-router";

const selectedUserId = ref(null);
const router = useRouter();
const handleSelect = (id) => {
  selectedUserId.value = id;
};

const startGame = () => {
  const user = users.find(u => u.id === selectedUserId.value);
  localStorage.setItem('user', JSON.stringify(user));
  if (user) {
    console.log("开始游戏，选择角色：", user);
    //跳转到game页面
    router.push('/game');
  }
};
const clearCache = ()=>{
  console.log(localStorage.getItem("user"));
}

onMounted(()=>{
  localStorage.setItem('user',null);
})
</script>

<template>
  <div class="character-select">
    <el-row :gutter="12">
      <el-col
          v-for="user in users"
          :key="user.id"
          :span="6"
      >
        <div
            class="character-card"
            :class="{ active: selectedUserId === user.id }"
            @click="handleSelect(user.id)"
        >
          <div class="card-inner">
            <img :src="user.url" class="avatar"/>
          </div>
        </div>
        <div class="character-name">
          {{ user.name }}
        </div>
      </el-col>
    </el-row>

    <div class="start-btn">
      <el-button size="large" :disabled="!selectedUserId" @click="startGame">开始游戏</el-button>
      <el-button size="large" @click="clearCache">清除缓存</el-button>
    </div>
  </div>
</template>

<style scoped>
.character-select {
  padding-top: 15vh;
  padding-left: 1vw;
  padding-right: 1vw;
}

/* 保证正方形 */
.character-card {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 高度等于宽度 */
  cursor: pointer;
}

.card-inner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.character-card.active .card-inner {
  border: 2px solid #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.start-btn {
  margin-top: 20px;
  text-align: center;
}
.character-name {
  text-align: center;
  margin-top: 1px;
  color: #959595;
  font-size: 14px;
}
</style>
