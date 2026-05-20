<script setup lang="ts">
const props = defineProps<{
  list: any[];
  labelKey: string;
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'onSelect', index: number): void; // 明确回传类型为数字索引
}>();
const sltIdx = ref(0)//当前选择
//键盘事件
const slt_keyup = (e:any) => {
  if (props.list.length === 0) return

  // 向下
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    sltIdx.value++
    if (sltIdx.value >= props.list.length) {
      sltIdx.value = 0
    }
  }

  // 向上
  else if (e.key === 'ArrowUp') {
    e.preventDefault()
    sltIdx.value--
    if (sltIdx.value < 0) {
      sltIdx.value = props.list.length - 1
    }
  }

  // 回车确认
  else if (e.key === 'Enter') {
    e.preventDefault()
    if (sltIdx.value >= 0 && sltIdx.value < props.list.length) {
      emit('onSelect', sltIdx.value)
    }
  }
}
onMounted(()=>{
   window.addEventListener('keydown', slt_keyup)
})
</script>

<template>
  <ul v-if="show && list.length" class="simple_dropdown">
    <li v-for="(item, i) in list" :key="i" @click="emit('onSelect', i)" :class="{slt:sltIdx==i}" >
      {{ item[labelKey] }}
    </li>
  </ul>
</template>

<style scoped lang="scss">
.simple_dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 99;
  margin: 2px 0 0 0;
  padding: 0;
  background: #def;
  border: 1px solid #ddd;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-height: 200px;
  overflow-y: auto;
  list-style: none;

  li {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover,&.slt{
      background-color: #fff;
      color: #1890ff;
    }
  }
}
</style>