<!-- 库存盘点 -->
<script setup lang="ts">
import { ref } from 'vue'
import print from '../components/print.vue'
import goods from '../components/goods_list.vue'

var win_print=ref(0)
var win_goods=ref(0)
const sch = ref('');


</script>

<template>
  <div>
    库存盘点
  </div>
  <div class="wait" v-show="win_print">
    
  </div>
  <div class="wait" v-if="win_goods">
    
  </div>
  
</template>

<style lang="scss">
.wait{.msg{width: 80%; height:60vh; align-items: flex-start;}}
</style>
