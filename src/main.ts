import { createApp } from 'vue'
import './style.scss'

import * as tool from './tool/base'
//把tool解释为全局函数
(window as any).tool = tool

import App from './App.vue'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'
import router from './router'

const capp=createApp(App)
  .use(router)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })

  //挂载路由

