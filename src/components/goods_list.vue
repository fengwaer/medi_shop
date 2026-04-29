<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

interface Good {}

// 接收父级传来的初始关键词
const props = defineProps<{ sch?: string }>();
const emit = defineEmits<{ (e: 'select', row: Good): void }>();

const list = ref<Good[]>([]);
const localSch = ref(''); // 子组件内部维护的搜索词


// 核心查询逻辑
const fetchData = async () => {
  const k = `%${localSch.value.trim()}%`;
  let sql = `SELECT top 50
        p.PxName AS [品名],
        p.Pxno AS [货号],
        p.pxGg AS [规格],
        p.Unit AS [单位],
        cj.SccjName AS [厂家],            
        p.Price AS [零售价],
        pc.Price AS [进价],               
        pc.scph AS [批次号],
        pc.yxqFormat AS [有效期],
        pc.RkDate AS [入库日期],
        kc.qty AS [库存数量],
        p.gjypbm AS [医保编码],        
        p.zycf AS [处方药标志],        
        p.splx AS [商品类型],             
        p.tsypflid AS [特殊药分类ID],
        p.Py AS [拼音简码]
    FROM 
        D_PxKc kc
    INNER JOIN 
        B_Pxmx p ON kc.pxid = p.pxid
    INNER JOIN 
        D_RkPc pc ON kc.rkpcid = pc.rkpcid
    LEFT JOIN 
        B_Sccj cj ON p.sccjId = cj.SccjId   
    WHERE 
        kc.qty > 0 AND
        (p.pxno LIKE @k OR p.pxname LIKE @k OR p.barcode LIKE @k)
    ORDER BY 
        pc.yxqFormat asc;`;

    // 传参改为对象形式，key 对应 SQL 里的 @k
    const params = { k: k }; 
    list.value = await db.query(sql, params);
}

onMounted(()=>{
  localSch.value=props.sch||'';
  fetchData()
})
</script>

<template>
  <div class="list_wrap">
    <div class="inner_search">
      <input v-model="localSch" @keyup.enter="fetchData" placeholder="输入货号/品名/条码..." class="sch_in">
    </div>
    <div class="table_box">
      <table class="list_table">
        <thead>
          <tr><th width="60">货号</th><th>品名</th><th>规格</th><th>厂家</th><th width="80">库存数量</th><th width="50">单位</th>
            <th width="60">零售价</th><th width="60">进价</th><th>有效期</th></tr>
        </thead>
        <tbody>
          <tr v-for="g in list" :key="g.Id" @click="emit('select', g)" class="row">
            <td>{{g.货号}}</td><td>{{g.品名}}</td><td>{{g.规格}}</td><td>{{g.厂家}}</td><td>{{g.库存数量}}</td><td>{{g.单位}}</td>
            <td>{{g.零售价}}</td><td>{{g.进价}}</td><td>{{g.有效期}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.list_wrap {
  height: 100%; display: flex; flex-direction: column; border: 1px solid #ddd;
  .inner_search {
    padding: 8px; background: #f9f9f9; display: flex; gap: 5px; border-bottom: 1px solid #eee;
    .sch_in { flex: 1; padding: 4px 8px; border: 1px solid #ccc; outline: none; &:focus { border-color: #1890ff; } }
    .q_btn { background: #1890ff; color: #fff; border: none; padding: 0 15px; cursor: pointer; border-radius: 2px; }
  }
  .table_box { flex: 1; overflow: auto; 
    .list_table {
      width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed;
      th { position: sticky; top: 0;z-index: 3; padding: 8px; border: 1px solid #ddd; }
      td { padding: 6px; border: 1px solid #eee; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .row:hover { background: #e6f7ff; cursor: pointer; }
      .s_btn { background: #52c41a; color: #fff; border: none; padding: 2px 8px; cursor: pointer; border-radius: 2px; }
    }
  }
}
</style>