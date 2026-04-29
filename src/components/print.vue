<script setup lang="ts">
const print_ls=ref([]);
const print_slt=ref('选择打印机')
const ls_is=ref(0)
// 获取打印机列表
const getprint = async () => {
  // 通过 ipcRenderer 调用主进程方法获取列表
  print_ls.value= await window.ipcRenderer.invoke('get-print-ls')
}
const change_print=async(name:any)=>{
  ls_is.value=0;print_slt.value=name;
  
  tool.cache_fn('pos_print',name);

}
onMounted(()=>{
  print_slt.value=tool.cache_fn('pos_print')
  getprint()
})

</script>

<template>
  <div class="slt_ul" @click="ls_is=1">{{ print_slt }}
    <h2>选择打印机</h2>
    <ul class="ul" v-show="ls_is">
      <li class="li" v-for="i of print_ls" @click.stop="change_print(i.name)">{{i.name }}</li>
    </ul>
  </div>
</template>
