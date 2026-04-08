<script setup>
import { onMounted, ref } from 'vue'
import api from '@/api/axios'
import DataTable from '@/components/DataTable.vue'

const loading = ref(false)
const error = ref('')
const rows = ref([])

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/customers')
    rows.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Failed to load customers'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section>
    <header class="header">
      <h1>Customers</h1>
      <button class="btn" type="button" @click="load" :disabled="loading">
        {{ loading ? 'Loading…' : 'Refresh' }}
      </button>
    </header>

    <p v-if="error" class="error">{{ error }}</p>

    <DataTable
      :rows="rows"
      :columns="[
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'address', label: 'Address' },
      ]"
    />
  </section>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.btn {
  border: 1px solid var(--color-border);
  background: transparent;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
}

.error {
  color: #d94848;
}
</style>