<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const openTabs = ref<{ title: string; path: string; icon: string }[]>([]);

// 路由监听
watch(route, (newRoute) => {
  // 如果是首页，不加入动态标签数组，因为我们要把它固定在左边
  if (newRoute.path === '/' || !newRoute.meta.title) return;
  
  const exists = openTabs.value.some(t => t.path === newRoute.path);
  if (!exists) {
    openTabs.value.push({ 
      title: newRoute.meta.title as string, 
      path: newRoute.path,
      icon: newRoute.meta.icon as string // 假设路由里定义了图标
    });
  }
}, { immediate: true });

const closeTab = (path: string) => {
  const index = openTabs.value.findIndex(t => t.path === path);
  openTabs.value.splice(index, 1);
  if (route.path === path) {
    const next = openTabs.value[openTabs.value.length - 1];
    router.push(next ? next.path : '/');
  }
};
</script>

<template>
  <div class="app_wrap">
    <header class="top_status_bar">
      <div class="sys_name">操作员: 管理员</div>
      <div class="user_info">宣汉本草堂民升大药房</div>
    </header>

    <nav class="tab_nav">
      <div 
        class="tab_item fixed_home" 
        :class="{ active: route.path === '/' }"
        @click="router.push('/')"
      >
        <i class="ift ift-hm"></i>
        <span>系统首页</span>
      </div>

      <div 
        v-for="tab in openTabs" 
        :key="tab.path"
        class="tab_item"
        :class="{ active: route.path === tab.path }"
        @click="router.push(tab.path)"
      >
        <span class="tab_text">{{ tab.title }}</span>
        <span class="tab_close" @click.stop="closeTab(tab.path)">×</span>
      </div>
    </nav>

    <main class="page_content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>
  </div>
</template>

<style scoped lang="scss">
$primary-blue: #1890ff;
$border-color: #d9e7ff;

.app_wrap { display: flex; flex-direction: column; height: 100vh; background: #fff; }

.top_status_bar {
  height: 32px; display: flex; justify-content: space-between; align-items: center;
  padding: 0 15px; background: #f8faff; font-size: 12px; color: #99a9bf;
  border-bottom: 1px solid #edf2f9;
}

.tab_nav {
  display: flex; align-items: flex-end; height: 46px; background: #fff;
  border-bottom: 1px solid $border-color; padding: 0 5px; gap: 4px;

  .tab_item {
    height: 36px; padding: 0 18px; display: flex; align-items: center;
    background: #f0f4fa; border: 1px solid $border-color; border-bottom: none;
    border-radius: 6px 6px 0 0; cursor: pointer; color: #667c99; transition: all 0.2s;
    font-size: 14px;

    &.active {
      height: 38px; background: #fff; color: $primary-blue; font-weight: bold;
      margin-bottom: -1px; z-index: 10; border: 1px solid $primary-blue; border-bottom:none;
      .tab_text { font-size: 15px; }
    }

    // 首页固定标签的特殊样式
    &.fixed_home {
      padding: 0 22px;
      i { font-size: 18px; margin-right: 8px; }
    }

    .tab_close {
      margin-left: 10px; font-size: 18px; color: #ccc;
      &:hover { color: #ff4d4f; }
    }
  }
}

.page_content {
  flex: 1; background: #fff; position: relative; overflow: hidden;
}
</style>