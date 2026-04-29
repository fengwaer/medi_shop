import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

// 1. 定义路由映射
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    // 假设你的主页按钮界面写在 App.vue 或者单独的 Home.vue
    // 这里建议指向包含刚才那六个按钮的组件
    component: () => import('../home.vue'), 
  },
  {
    path: '/retail',
    name: 'Retail',
    component: () => import('../base/retail.vue'),
    meta: { title: '零售' }
  },
  {
    path: '/stock-in',
    name: 'StockIn',
    component: () => import('../base/stock-in.vue'),
    meta: { title: '收货' }
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('../base/maintenance.vue'),
    meta: { title: '养护' }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('../base/inventory.vue'),
    meta: { title: '盘点' }
  },
  {
    path: '/member',
    name: 'Member',
    component: () => import('../base/member.vue'),
    meta: { title: '会员管理' }
  },
  {
    path: '/staff',
    name: 'Staff',
    component: () => import('../base/staff.vue'),
    meta: { title: '账号管理' }
  }
];

// 2. 创建路由实例
const router = createRouter({
  // Electron 环境下必须使用 Hash 模式，否则打包后刷新页面会白屏
  history: createWebHashHistory(),
  routes
});

export default router;