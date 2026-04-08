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
    const { data } = await api.get('/products')
    rows.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Failed to load products'
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
        <h1 class="page-title">Products</h1>
        <p class="page-desc">Browse SKUs, on-hand quantity, and pricing. Data loads from your warehouse API.</p>
      </div>
      <div class="page-actions">
        <button class="btn" type="button" @click="load" :disabled="loading">
          {{ loading ? 'Loading…' : 'Refresh' }}
        </button>
      </div>
    </header>

    <p v-if="error" class="alert alert--error" role="alert">{{ error }}</p>

    <DataTable
      caption="Product catalog"
      :rows="rows"
      :columns="[
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'sku', label: 'SKU' },
        { key: 'quantity', label: 'Qty' },
        { key: 'price', label: 'Price' },
        { key: 'cost', label: 'Cost' },
      ]"
    />
  </div>
</template>
