<!-- 人员管理 -->
<script setup lang="ts">
import { ref } from 'vue'

var win_print=ref(0)
var win_goods=ref(0)
const sch = ref('');


</script>

<template>
  <div>
   人员管理
  </div>
  
  <div class="wait" v-if="win_goods">
    
  </div>
  
</template>

<style lang="scss">
.wait{.msg{width: 80%; height:60vh; align-items: flex-start;}}
</style>
