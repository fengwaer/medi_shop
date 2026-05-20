<!-- 零售 -->
<script setup lang="ts">
import { ref,computed, onMounted, onUnmounted, nextTick } from 'vue';
// --- 注入：引入你的组件 ---
import print from '../components/print.vue'
import goods from '../components/goods_list.vue'
import gd from '../components/g_order.vue'
import slt from '../components/select.vue'
import { Item, MenuItem } from 'electron';
import { table } from 'node:console';

interface RowItem {
  xh: number; gjypbm: string; ypbm: string; tym: string; gg: string; 
  sccj: string; hj: string; sl: number; dw: string; dj: number; zkl: number; 
  sj: number; zz: number; je: number; dqkc: number; xsgr: string; hw: string; yxq: string;
}

// --- 注入：窗口控制变量 ---
const win_print = ref(0);
const win_goods = ref(0);
const win_gd = ref(0);


const cusName = ref('');
const points = ref('0');
const note = ref('');
const allergy = ref('');
const history = ref('');
const doctor = ref('');
const searchKey = ref(''); // 对应销售输入框
const returnKey = ref('');
const tableList = ref<RowItem[]>([]);//销售列表
const sltIdx = ref(0)//当前选择
const slt_is=ref(0);//会员下拉框显示
const memberList=ref([]);//会员列表
const memberNo = ref('');
const memberName = ref('');

//挂单
const gd_fn = async () => {
  if(tableList.value.length===0){console.log('当前没有商品');return;}
  try{
    // 生成挂单号
    const LsdId = 'GD' + Date.now()
    // =========================
    // 1.写入挂单主表
    // =========================
    const headSql = `
      INSERT INTO d_lsgd (LsdId,LsDate,Khxm,Remark,djstatus)
      VALUES (@LsdId,GETDATE(),@Khxm,@Remark,'N')
    `
    await db.query(headSql,{
      LsdId,
      Khxm:cusName.value || '',
      Remark:note.value || ''
    })
    // =========================
    // 2.写入挂单明细
    // =========================
    for(let i=0;i<tableList.value.length;i++){
      const item:any = tableList.value[i]
      const mxSql = `
        INSERT INTO d_lsgdmx (LsdId,PxId,dwType,qty,price,je,RkPcId,DjType,LsSort)
        VALUES (@LsdId,@PxId,'销售',@qty,@price,@je,@RkPcId,'销售',@LsSort)
      `
      await db.query(mxSql,{
        LsdId,PxId:item.pxid,qty:item.sl,price:item.sj,je:item.je,RkPcId:item.rkpcid,LsSort:i+1
      })
    }
    // =========================
    // 3.清空零售界面
    // =========================
    tableList.value=[]
    cusName.value=''
    note.value=''
    allergy.value=''
    history.value=''
    doctor.value=''
    memberNo.value=''
    memberName.value=''
    total_is.value=1;
    console.log('挂单成功')

  }catch(err){
    console.log(err)
  }
}
//提取挂单
const gd_select=(arr:any)=>{
  console.log(arr)
}

//会员查询
const schMember = async () => {
  let sql=`select top 5 * from b_vip where xm like @schmb or tel like @schmb or sfzno like @schmb`;
  const res = await db.query(sql, { schmb:`%${memberNo.value.trim()}%`});
  slt_is.value=res.length>0?1:0;
  memberList.value=res;
}
//选择会员后回填
const sltmember=(idx:number)=>{
  slt_is.value=0;
  memberNo.value=memberList.value[idx].VipNo;
  memberName.value=memberList.value[idx].Xm;
}

//总价计算
const total = computed(() => {
  return tableList.value.reduce((sum, row) => {
    // 乘以 100 转整数计算 → 彻底解决浮点误差
    return sum + Math.round(Number(row.sj || 0) * 100);
  }, 0) / 100; // 最后除100变回元
});
var total_is=ref(1);//是否允许议价
//议价功能
const yj_fn=()=>{
  total_is.value=0;
  let dom=document.querySelector('.total') as HTMLInputElement;
  dom?.focus();dom?.select();
}
//总价防错
const bd_zj=(e:Event)=>{
  let val = e.target as HTMLInputElement;
  if(!val ||val.value=='.'|| Number(val.value)<= 0){ total_is.value=total;}
  total_is.value=1
}

const saleInputRef = ref<HTMLInputElement | null>(null);
var num_in:any;

// --- 注入：处理商品选择逻辑 ---
const handleSelect = async(sn: any) => {
  const checkSql = `
    SELECT 
        p.pxid, pc.rkpcid, p.gjypbm, p.Pxno as ypbm, p.PxName as tym, 
        p.pxGg as gg, cj.SccjName as sccj, p.Price as dj,p.pxno,p.pzwh,
        kc.qty as dqkc, pc.yxqFormat as yxq, p.Unit as dw
    FROM d_pxkc kc
    INNER JOIN b_pxmx p ON kc.pxid = p.pxid
    INNER JOIN d_rkpc pc ON kc.rkpcid = pc.rkpcid
    LEFT JOIN b_sccj cj ON p.sccjId = cj.SccjId
    WHERE kc.rkpcid = @rkpcid AND kc.pxid = @pxid`;

  const res = await db.query(checkSql, { rkpcid: sn.rkpcid, pxid: sn.pxid });
  
  if (!res || res.length === 0) {
    alert('该批次库存可能已被其他柜台售罄或已被封存！');
    return;
  }

  const freshData = res[0];
  const isExist= tableList.value.some(item => item.pxno === freshData.pxno)
  // 这里的逻辑严格对应你原有的 RowItem 结构
  const newRow: RowItem = {
    pxid: freshData.pxid,
    rkpcid: freshData.rkpcid,
    gjypbm: freshData.gjypbm || '',
    pxno: freshData.pxno,
    tym: freshData.tym,
    gg: freshData.gg,
    sccj: freshData.sccj || '',
    pzwh:freshData.pzwh||'',
    hj: '',            // 含兴药制
    sl: 1,             // 初始数量
    dw: freshData.dw,
    dj: freshData.dj,  // 实时定价
    zkl: 100,
    sj: freshData.dj,  // 实价
    je: freshData.dj,  // 金额
    dqkc: freshData.dqkc, // 这一秒的最准库存
    hw: '',            // 货位
    yxq: freshData.yxq
  };  
  // 恢复你的原始状态控制
  searchKey.value = ''; 
  win_goods.value = 0;   
  if(isExist){saleInputRef.value?.focus();return;}
  tableList.value.push(newRow);
  nextTick(() => {
  num_in= document.querySelectorAll('.num')
  num_in[num_in.length - 2]?.focus()
});
};

const handleReceipt = () => { alert('[F1] 收款'); };
const handlePrint = () => { win_print.value = 1; }; // 改为打开窗口
const close_win=()=>{ win_goods.value=0;win_print.value=0;win_gd.value=0; }//关闭所有窗口
const del_fn=()=>{tableList.value.splice(sltIdx.value, 1);}//删除选定

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key.startsWith('F')) e.preventDefault();
  switch (e.key) {
    case 'F1': handleReceipt(); break;
    case 'F2': yj_fn(); break;
    case 'F6': handlePrint(); break;
    case 'Escape': close_win();break;
    case 'Delete':del_fn();break;
    case 'ArrowDown':if(sltIdx.value<tableList.value.length-1){sltIdx.value+=1};break;
    case 'ArrowUp':if(sltIdx.value>0){sltIdx.value-=1};break;
    case 'Enter': 
      if (document.activeElement === saleInputRef.value && searchKey.value != '') {
        win_goods.value = 1; // 触发弹窗逻辑
      }
      break;
  }
  if (e.altKey && (e.key == 'g'||e.key == 'G')) {win_gd.value=1}//挂单窗口
  if (e.ctrlKey && (e.key == 'g'||e.key == 'G')) {gd_fn()}//执行挂单
};
//实价计算
const sj_count=(item:any)=>{item.sj=parseFloat((item.dj * item.sl * (item.zkl / 100)).toFixed(2))}

//绑定数量
const bd_sl=(item:any,e:Event)=>{
  let val = e.target as HTMLInputElement;
  if(val.value===''||Number(val.value)===0){item.sl=1}
}
//实价防错
const bd_sj=(item:any,e:Event)=>{
  let val = e.target as HTMLInputElement;
  if(!val ||val.value=='.'|| Number(val.value)<= 0){sj_count(item)}
}
//必须输入数字
const no_str=(e:Event)=>{
  let val = e.target as HTMLInputElement;
  val.value = val.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
}
//跳到下一步
const go_next=(idx:number)=>{
  console.log(idx)
  if(idx===-1){saleInputRef.value?.focus();}
  else{num_in[idx*2+1]?.focus();}
   
}
//选择商品
const in_select = (e: FocusEvent) => {
  const input = e.target as HTMLInputElement
  input?.select();
}
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
    <!-- 选择打印机 -->    
    <div class="wait" v-show="win_print">
      <div class="msg"><i class="close" @click="win_print=0">关闭</i> <print /></div>
    </div>
    <!-- 库存列表 -->
    <div class="wait goods" v-if="win_goods">
      <div class="msg"><i class="close" @click="win_goods=0">关闭</i><goods :sch="searchKey" @select="handleSelect" /></div>
    </div>
    <!-- 挂单列表 -->
    <div class="wait goods" v-if="win_gd">
      <div class="msg"><i class="close" @click="win_gd=0">关闭</i><gd @select="gd_select" /></div>
    </div>
    
    <header class="fun_tool">
      <div class="shortcut_group">
        <button class="bt1" @click="handleReceipt">[F1] 收款</button>
        
        <button class="bt1" @click="yj_fn()">[F2] 议价</button>
        <button class="bt1">[F3] 拆零</button>
        <button class="bt1" @click="gd_fn()">[Ctrl+G]挂单</button>
        <button class="bt1" @click="win_gd=1">[Alt+G] 挂单提取</button>
        <button class="bt1">单据查询</button>
        <div class="divider"></div>
        <button class="bt1" @click="handlePrint">[F6] 打印设置</button>
        <button class="bt1 danger">[Alt+T] 整单退货</button>
        <button class="bt1 danger" @click="del_fn()">[Del] 删除</button>
      </div>
      <div class="sys_info">总价：<input @input="no_str" class="total" type="text" v-model="total" :readonly="total_is" @blur="bd_zj"></div>
    </header>

    <section class="info_header">
      <div class="info_group">
        <div class="form_item required"><label>会员卡:</label>
          <div style="position:relative;">
          <input @input="schMember" v-model="memberNo" type="text" class="input_mid">
          <slt :list="memberList" labelKey="Xm" :show="slt_is" @onSelect="sltmember"/>
          </div>
        </div>
        <div class="form_item"><label>姓名:</label><input readonly :value="memberName" type="text" class="input_sm"></div>
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
              <th>通用名</th>
              <th width="100">规格</th>
              <th>生产厂家</th>
              <th width="100">有效期</th>
              <th width="60">数量</th>
              <th width="50">单位</th>
              <th width="70">定价</th>
              <th width="60">折扣%</th>
              <th width="70">实价</th>
              <th width="90">金额</th>
              <th width="70">当前库存</th>
              <th width="100">货号</th>
              <th width="120">批准文号</th>
              <th width="60">货位</th>
              <th width="80">含兴药制</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item,idx) in tableList" :key="item.xh" :class="{slt:sltIdx==idx}" @click="sltIdx=idx">
              <td>{{idx+1}}</td>
              <td>{{item.tym}}</td>
              <td>{{item.gg}}</td>
              <td>{{item.sccj}}</td>
              <td>{{item.yxq}}</td>
              <td><input class="num" type="text" @input="no_str,sj_count(item)" @keydown.enter="go_next(idx)" @focus="in_select" v-model="item.sl" @blur="bd_sl(item,$event)" ></td>
              <td>{{item.dw}}</td>
              <td>{{item.dj}}</td>
              <td>{{item.zkl}}</td>
              <td><input class="num" type="text" @input="no_str" @keydown.enter="go_next(-1)" @focus="in_select" v-model="item.sj" @blur="bd_sj(item,$event)"></td>
              <td>{{item.je}}</td>
              <td>{{item.dqkc}}</td>
              <td>{{item.pxno}}</td>
              <td>{{item.pzwh}}</td>
              <td>{{item.hw}}</td>
              <td>{{item.hj}}</td>
              
            </tr>
            <tr v-for="i in 3" :key="'empty'+i" class="empty_row">
              <td v-for="j in 3" :key="j"></td>
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
.slt{ background: #6bd;}
.retail_container { padding: 15px; display: flex; flex-direction: column; height: 100%; }
.info_header {
   border-radius: 4px;  display: flex; gap: 20px; margin-bottom: 15px;
  .info_group, .allergy_group { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px 15px; }
  .info_group { flex: 4; grid-template-columns: repeat(3, 1fr); border-right: 1px solid $border; padding-right: 20px; }
  .allergy_group { flex: 5; }
  .form_item { display: flex; align-items: center; font-size: 13px; label { width: 65px; text-align: right; color: #666; margin-right: 8px; flex-shrink: 0; } input { flex: 1; border: 1px solid $border; padding: 3px 6px; border-radius: 2px; &:focus { border-color: $primary; outline: none; } } &.required label { color: $danger; &:before { content: '*'; } } &.warning input { border-color: $warning; background: rgba($warning, 0.05); } &.full { grid-column: span 4; } &.highlight .points_val { font-size: 16px; font-weight: bold; color: $warning; } }
}
.total{ border:1px solid #ddd; border-radius:5px; padding:2px 5px; width:80px; text-align: right;}
input.num{ width:40px; border:none; color:#d33; text-align: center;}
.sale_body {
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
  .search_bar { display: flex; gap: 15px; margin-bottom: 15px; .search_item { position: relative; i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #aaa; font-size: 18px; z-index: 1; } input { width: 100%; border: 1px solid $border; border-radius: 4px; font-size: 14px; } } .sale_action input { border: 2px solid $primary; font-size: 16px; font-weight: 500; &:focus { box-shadow: 0 0 5px rgba($primary, 0.2); } } }
  .main_input{ padding-left:40px;}
  
  .table_box {
    cursor:pointer;
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