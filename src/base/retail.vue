<!-- 零售 -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
// --- 注入：引入你的组件 ---
import print from '../components/print.vue'
import goods from '../components/goods_list.vue'

interface RowItem {
  xh: number; gjypbm: string; ypbm: string; tym: string; jx: string; gg: string; 
  sccj: string; hj: string; sl: number; dw: string; dj: number; zkl: number; 
  sj: number; zz: number; je: number; dqkc: number; xsgr: string; hw: string; yxq: string;
}

// --- 注入：窗口控制变量 ---
const win_print = ref(0);
const win_goods = ref(0);

const memberId = ref('');
const memberName = ref('');
const cusName = ref('');
const points = ref('0');
const note = ref('');
const allergy = ref('');
const history = ref('');
const doctor = ref('');
const searchKey = ref(''); // 对应销售输入框
const returnKey = ref('');
const tableList = ref<RowItem[]>([]);

const saleInputRef = ref<HTMLInputElement | null>(null);

// --- 注入：处理商品选择逻辑 ---
const handleSelect = (sn: any) => {
  // 将子窗口返回的 sn 转换为表格行
  const newRow: RowItem = {
    xh: tableList.value.length + 1,
    gjypbm: '', ypbm: sn.HH, tym: sn.PM, jx: '', gg: sn.GG,
    sccj: '', hj: '', sl: 1, dw: sn.DW, dj: sn.Price, zkl: 100,
    sj: sn.Price, zz: 0, je: sn.Price, dqkc: sn.KC, xsgr: '管理员', hw: '', yxq: sn.YXP
  };
  tableList.value.push(newRow);
  searchKey.value = ''; // 清空搜索词
  win_goods.value = 0;   // 关闭窗口
  nextTick(() => saleInputRef.value?.focus()); // 重新聚焦
};

const handleReceipt = () => { alert('[F1] 收款'); };
const handlePrint = () => { win_print.value = 1; }; // 改为打开窗口
const close_win=()=>{ win_goods.value=0;win_print.value=0;}//关闭所有窗口

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key.startsWith('F')) e.preventDefault();
  switch (e.key) {
    case 'F1': handleReceipt(); break;
    case 'F6': handlePrint(); break;
    case 'Escape': close_win();break;
    case 'Enter': 
      if (document.activeElement === saleInputRef.value && searchKey.value != '') {
        win_goods.value = 1; // 触发弹窗逻辑
      }
      break;
  }
};

onMounted(() => {
  nextTick(() => saleInputRef.value?.focus());
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="retail_container page_container">
    <div class="wait" v-show="win_print">
      <div class="msg"><i class="close" @click="win_print=0">关闭</i> <print /></div>
    </div>
    <div class="wait goods" v-if="win_goods">
      <div class="msg"><i class="close" @click="win_goods=0">关闭</i><goods :sch="searchKey" @select="handleSelect" /></div>
    </div>

    <header class="fun_tool">
      <div class="shortcut_group">
        <button class="bt1" @click="handleReceipt">[F1] 收款</button>
        
        <button class="bt1">[F2] 议价</button>
        <button class="bt1">[F3] 拆零</button>
        <button class="bt1">[G] 挂单</button>
        <button class="bt1">[Alt+G] 挂单提取</button>
        <button class="bt1">单据查询</button>
        <div class="divider"></div>
        <button class="bt1" @click="handlePrint">[F6] 打印设置</button>
        <button class="bt1 danger">[Alt+T] 整单退货</button>
        <button class="bt1 danger">[Del] 删除</button>
      </div>
      <div class="sys_info">预留</div>
    </header>

    <section class="info_header">
      <div class="info_group">
        <div class="form_item required"><label>会员卡:</label><input v-model="memberId" type="text" class="input_mid"></div>
        <div class="form_item"><label>姓名:</label><input v-model="memberName" type="text" class="input_sm"></div>
        <div class="form_item highlight"><label>积分:</label><span class="points_val">{{points}}</span></div>
        <div class="form_item "><label>顾客名:</label><input v-model="cusName" type="text" class="input_sm"></div>
        <div class="form_item"><label>备注:</label><input v-model="note" type="text" class="input_full"></div>
      </div>
      <div class="allergy_group">
        
        <div class="form_item full warning"><label>药物过敏:</label><input v-model="allergy" type="text" class="input_full"></div>
        <div class="form_item"><label>病史:</label><input v-model="history" type="text" class="input_full"></div>
        <div class="form_item"><label>医生:</label><input v-model="doctor" type="text" class="input_sm"></div>
      </div>
    </section>

    <section class="sale_body">
      <div class="search_bar">
        <div class="search_item sale_action" style="flex: 3;">
          <i class="ift ift-sch"></i>
          <input ref="saleInputRef" v-model="searchKey" type="text" placeholder="商品销售/拼音简码 [Enter]" class="in main_input">
        </div>
        <div class="search_item return_action" style="flex: 1;">
          <i class="ift ift-return"></i>
          <input v-model="returnKey" type="text" placeholder="商品退货 [Esc]" class="in sub_input">
        </div>
      </div>
      
      <div class="table_box">
        <table class="main_table pos_table">
          <thead>
            <tr>
              <th width="40">序号</th>
              <th width="120">国家药品编码</th>
              <th width="100">商品编码</th>
              <th>通用名</th>
              <th width="80">剂型</th>
              <th width="100">规格</th>
              <th>生产厂家</th>
              <th width="80">含兴药制</th>
              <th width="60">数量</th>
              <th width="50">单位</th>
              <th width="70">定价</th>
              <th width="60">折扣%</th>
              <th width="70">实价</th>
              <th width="60">赠送</th>
              <th width="90">金额</th>
              <th width="70">当前库存</th>
              <th width="70">销售员</th>
              <th width="60">货位</th>
              <th width="100">有效期</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in tableList" :key="item.xh">
              <td>{{item.xh}}</td>
              <td>{{item.gjypbm}}</td>
              <td>{{item.ypbm}}</td>
              <td>{{item.tym}}</td>
              <td>{{item.jx}}</td>
              <td>{{item.gg}}</td>
              <td>{{item.sccj}}</td>
              <td>{{item.hj}}</td>
              <td>{{item.sl}}</td>
              <td>{{item.dw}}</td>
              <td>{{item.dj}}</td>
              <td>{{item.zkl}}</td>
              <td>{{item.sj}}</td>
              <td>{{item.zz}}</td>
              <td>{{item.je}}</td>
              <td>{{item.dqkc}}</td>
              <td>{{item.xsgr}}</td>
              <td>{{item.hw}}</td>
              <td>{{item.yxq}}</td>
            </tr>
            <tr v-for="i in 20" :key="'empty'+i" class="empty_row">
              <td v-for="j in 19" :key="j"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
$primary: #1890ff; $warning: #faad14; $danger: #f5222d; $border: #e8e8e8; $bg-header: #f8faff;

/* 注入：弹窗基本样式 */
.goods .msg{width: 80vw; height: 80vh;}

.retail_container { padding: 15px; display: flex; flex-direction: column; height: 100%; }
.info_header {
   border-radius: 4px;  display: flex; gap: 20px; margin-bottom: 15px;
  .info_group, .allergy_group { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px 15px; }
  .info_group { flex: 4; grid-template-columns: repeat(3, 1fr); border-right: 1px solid $border; padding-right: 20px; }
  .allergy_group { flex: 5; }
  .form_item { display: flex; align-items: center; font-size: 13px; label { width: 65px; text-align: right; color: #666; margin-right: 8px; flex-shrink: 0; } input { flex: 1; border: 1px solid $border; padding: 3px 6px; border-radius: 2px; &:focus { border-color: $primary; outline: none; } } &.required label { color: $danger; &:before { content: '*'; } } &.warning input { border-color: $warning; background: rgba($warning, 0.05); } &.full { grid-column: span 4; } &.highlight .points_val { font-size: 16px; font-weight: bold; color: $warning; } }
}

.sale_body {
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
  .search_bar { display: flex; gap: 15px; margin-bottom: 15px; .search_item { position: relative; i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #aaa; font-size: 18px; z-index: 1; } input { width: 100%; border: 1px solid $border; border-radius: 4px; font-size: 14px; } } .sale_action input { border: 2px solid $primary; font-size: 16px; font-weight: 500; &:focus { box-shadow: 0 0 5px rgba($primary, 0.2); } } }
  .main_input{ padding-left:40px;}
  
  .table_box {
  flex: 1; 
  overflow: auto; // 保持 overflow: auto 确保滚动条出现
  border: 1px solid $border;
  background: #fff; 
  .pos_table {
    // 关键改动 1：不要用 100%，要让内容决定宽度
    width: max-content !important; 
    min-width: 100%; // 如果列数少，依然撑满全屏
    // 关键改动 2：去掉 fixed 布局（如果之前有设置的话），改为自动布局
    table-layout: auto !important; 
    border-collapse: collapse;
    th { 
      height: 38px !important;
      padding: 8px 4px !important;
      background: #f4f7f9; 
      border: 1px solid $border; 
      font-size: 13px; 
      color: #333;
      position: sticky; 
      top: 0; 
      z-index: 2;
      // 关键改动 3：强制标题文字不换行，防止高度被撑开
      white-space: nowrap !important; 
    }
    td { 
      padding: 6px 4px; 
      border: 1px solid #f0f0f0; 
      text-align: center; 
      font-size: 13px;
      // 关键改动 4：内容过长也不要折行
      white-space: nowrap !important; 
    }
    .empty_row td { height: 32px; border-bottom: 1px solid #f0f0f0; }
  }
}
}
</style>