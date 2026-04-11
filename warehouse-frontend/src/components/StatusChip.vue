<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: '' },
})

const variant = computed(() => {
  const s = String(props.status || '').toLowerCase()
  if (s === 'pending') return 'pending'
  if (s === 'received' || s === 'completed') return 'success'
  return 'neutral'
})

const label = computed(() => {
  const s = String(props.status || '').trim()
  if (!s) return '—'
  return s.charAt(0).toUpperCase() + s.slice(1)
})
</script>

<template>
  <span class="status-chip" :class="`status-chip--${variant}`">{{ label }}</span>
</template>
