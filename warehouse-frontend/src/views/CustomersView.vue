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
  <div class="page-shell">
    <header class="page-head">
      <div class="page-head__text">
        <h1 class="page-title">Customers</h1>
        <p class="page-desc">Contact directory for buyers and delivery points connected to your warehouse.</p>
      </div>
      <div class="page-actions">
        <button class="btn" type="button" @click="load" :disabled="loading">
          {{ loading ? 'Loading…' : 'Refresh' }}
        </button>
      </div>
    </header>

    <p v-if="error" class="alert alert--error" role="alert">{{ error }}</p>

    <DataTable
      caption="Customers"
      :rows="rows"
      :columns="[
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'address', label: 'Address' },
      ]"
    />
  </div>
</template>
