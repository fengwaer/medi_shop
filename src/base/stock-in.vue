<script setup lang="ts">
import { ref } from 'vue'
import print from '../components/print.vue'
import goods from '../components/goods_list.vue'

var win_print=ref(0)
var win_goods=ref(0)
const sch = ref('');
const handleSelect = (sn: any) => {
  console.log(sn.HH)
  sch.value='';
  win_goods.value=0
}

</script>

<template>
  <div>
    入库验收
  </div>
  
  
  
</template>

<style lang="scss">
.wait{.msg{width: 80%; height:60vh; align-items: flex-start;}}
</style>
