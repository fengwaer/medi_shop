<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();

// 功能模块配置
const menuItems = [
  { title: '零售出库', icon: 'ift-ls', color: '#1890ff', path: '/retail', desc: '快速收银/药品销售' },
  { title: '收货入库', icon: 'ift-sh', color: '#52c41a', path: '/stock-in', desc: '采购进货/入库验收' },
  { title: '药品养护', icon: 'ift-yh', color: '#faad14', path: '/maintenance', desc: '一般养护/重点养护' },
  { title: '库存盘点', icon: 'ift-pd', color: '#722ed1', path: '/inventory', desc: '实物盘点/损益处理' },
  { title: '会员管理', icon: 'ift-hy', color: '#eb2f96', path: '/member', desc: '档案管理/积分查询' },
  { title: '人员管理', icon: 'ift-gl', color: '#13c2c2', path: '/staff', desc: '权限设置/账号管理' }
];

const navTo = (path: string) => {
  router.push(path);
};
</script>

<template>
  <router-view />
  <div class="home_container">
    <header class="home_header">
      <h1>系统功能</h1>
      <div class="user_info">当前用户：管理员 | {{ new Date().toLocaleDateString() }}</div>
    </header>

    <div class="menu_grid">
      <div 
        v-for="item in menuItems" 
        :key="item.title" 
        class="menu_card"
        :style="{ '--brand-color': item.color }"
        @click="navTo(item.path)"
      >
      <div class="icon_box"><i :class="['ift', item.icon]"></i></div>
        <div class="text_box">
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </div>
        <div class="arrow">→</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home_container {
  padding: 40px;
  background: #f0f2f5;
  min-height: 100vh;

  .home_header {
    margin-bottom: 40px;
    border-left: 5px solid #1890ff;
    padding-left: 15px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    
    h1 { margin: 0; color: #262626; font-size: 24px; }
    .user_info { color: #8c8c8c; font-size: 14px; }
  }

  .menu_grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;

    .menu_card {
      background: #fff;
      padding: 24px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      position: relative;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid transparent;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        border-color: var(--brand-color);
        
        .icon_box { transform: scale(1.1); background: var(--brand-color); color: #fff; }
        .arrow { opacity: 1; transform: translateX(0); }
      }

      .icon_box {
        width: 60px;
        height: 60px;
        background: #f5f5f5;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        margin-right: 20px;
        transition: all 0.3s;
        color: var(--brand-color);
        .ift{font-size: 40px;}
      }

      .text_box {
        h3 { margin: 0 0 5px 0; color: #262626; font-size: 18px; }
        p { margin: 0; color: #8c8c8c; font-size: 13px; }
      }

      .arrow {
        position: absolute;
        right: 20px;
        font-size: 20px;
        color: var(--brand-color);
        opacity: 0;
        transform: translateX(-10px);
        transition: all 0.3s;
      }
    }
  }
}
</style>