<template>
  <div class="gd_page">

    <!-- 挂单列表 -->
    <div class="top_box">
      <div class="title_bar">挂单列表</div>
      <div class="table_box">
        <table class="list_table">
          <thead>
            <tr>
              <th width="50">序号</th>
              <th width="180">挂单号</th>
              <th width="180">挂单时间</th>
              <th width="120">顾客</th>
              <th width="80">商品数</th>
              <th width="100">金额合计</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item,index) in gdList"
              :key="item.LsdId"
              :class="{ slt : selectId === item.LsdId }"
              @click="selectRow(item)"
              @dblclick="emit('select', mxList)">
              <td align="center">{{ index + 1 }}</td>
              <td>{{ item.LsdId }}</td>
              <td>{{ item.LsDate }}</td>
              <td>{{ item.Khxm || '-' }}</td>
              <td align="center">{{ item.spCount }}</td>
              <td align="right">{{ money(item.hjje) }}</td>
              <td>{{ item.Remark }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 明细 -->
    <div class="bottom_box">
      <div class="title_bar">挂单明细</div>
      <div class="table_box">
        <table class="list_table">
          <thead>
            <tr>
              <th width="40">序号</th>
              <th width="120">通用名</th>
              <th width="80">规格</th>
              <th width="100">生产厂家</th>
              <th width="60">数量</th>
              <th width="50">单位</th>
              <th width="70">定价</th>
              <th width="60">折扣%</th>
              <th width="70">实价</th>
              <th width="90">金额</th>
              <th width="100">有效期</th>
              <th width="100">货号</th>
              <th width="120">批准文号</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item,index) in mxList" :key="item.JlId">
              <td align="center">{{ index + 1 }}</td>
              <td>{{ item.tym }}</td>
              <td>{{ item.gg }}</td>
              <td>{{ item.sccj }}</td>
              <td align="center">{{ item.qty }}</td>
              <td align="center">{{ item.dw }}</td>
              <td align="right">{{ money(item.price) }}</td>
              <td align="center">100</td>
              <td align="right">{{ money(item.price) }}</td>
              <td align="right">{{ money(item.je) }}</td>
              <td>{{ item.yxq }}</td>
              <td>{{ item.ypbm }}</td>
              <td>{{ item.pzwh }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const gdList = ref([])
const mxList = ref([])
const selectId = ref('')
const emit = defineEmits(['select'])
// 获取挂单列表
async function loadList() {
  const sql = `
    SELECT g.LsdId, g.LsDate, g.Khxm, g.Remark,
           COUNT(mx.JlId) AS spCount,
           SUM(ISNULL(mx.je,0)) AS hjje
    FROM d_lsgd g
    LEFT JOIN d_lsgdmx mx ON g.LsdId = mx.LsdId
    GROUP BY g.LsdId, g.LsDate, g.Khxm, g.Remark
    ORDER BY g.LsDate DESC
  `
  gdList.value = await window.db.query(sql)
  if(gdList.value.length) selectRow(gdList.value[0])
}

// 点击选择挂单
async function selectRow(row){
  selectId.value = row.LsdId

  const sql = `
    SELECT mx.JlId,
           p.PxName AS tym,
           p.pxGg AS gg,
           cj.SccjName AS sccj,
           mx.qty, mx.price, mx.je,
           p.Unit AS dw,
           p.Pxno AS ypbm,
           p.pzwh,
           pc.yxqFormat AS yxq
    FROM d_lsgdmx mx
    INNER JOIN b_pxmx p ON mx.PxId = p.pxid
    LEFT JOIN b_sccj cj ON p.sccjId = cj.SccjId
    LEFT JOIN d_rkpc pc ON mx.RkPcId = pc.rkpcid
    WHERE mx.LsdId = @LsdId
    ORDER BY mx.LsSort ASC, mx.JlId ASC
  `
  mxList.value = await window.db.query(sql, { LsdId: selectId.value })
}

function money(v){ return Number(v||0).toFixed(2) }

onMounted(loadList)
</script>

<style scoped lang="scss">
.gd_page{height:100%; display:flex; flex-direction:column; background:#f5f7fa; overflow: auto;}
.top_box{height:260px; display:flex; flex-direction:column; background:#fff; margin-bottom:8px;}
.bottom_box{flex:1; height: 300px; display:flex; flex-direction:column; background:#fff;}
.title_bar{height:40px; display:flex; align-items:center; padding:0 12px; border-bottom:1px solid #eee; font-size:13px; font-weight:600; color:#333;}
.table_box{flex:1; overflow:auto;}
.list_table{width:100%; border-collapse:collapse; font-size:12px; table-layout:fixed;}
.list_table th{position:sticky; top:0; z-index:2; padding:8px; background:#f5f7fa; border:1px solid #ddd; color:#333; font-weight:600;}
.list_table td{padding:6px; border:1px solid #eee; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
.list_table tbody{height:auto;}
.list_table tbody tr:hover{background:#f5faff; cursor:pointer;}
.list_table .slt{background:#d6eaff !important;}
</style>