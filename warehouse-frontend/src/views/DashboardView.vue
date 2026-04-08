<script setup>
import { onMounted, ref } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import DataTable from '@/components/DataTable.vue'

const auth = useAuthStore()

const loading = ref(false)
const error = ref('')
const summary = ref(null)

async function load() {
  loading.value = true
  error.value = ''
  try {
    // Admin-only endpoint
    if (!auth.isAdmin) {
      summary.value = null
      return
    }
    const { data } = await api.get('/dashboard/summary')
    summary.value = data
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="page">
    <header class="header">
      <h1>Dashboard</h1>
      <button class="btn" type="button" @click="load" :disabled="loading">
        {{ loading ? 'Refreshing…' : 'Refresh' }}
      </button>
    </header>

    <p v-if="!auth.isAdmin" class="note">
      You’re signed in as <strong>{{ auth.user?.role }}</strong>. Dashboard summary is admin-only.
    </p>

    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="auth.isAdmin && summary" class="cards">
      <div class="card">
        <div class="label">Products</div>
        <div class="value">{{ summary.totalProducts }}</div>
      </div>
      <div class="card">
        <div class="label">Suppliers</div>
        <div class="value">{{ summary.totalSuppliers }}</div>
      </div>
      <div class="card">
        <div class="label">Customers</div>
        <div class="value">{{ summary.totalCustomers }}</div>
      </div>
      <div class="card">
        <div class="label">Total sales</div>
        <div class="value">{{ summary.totalSales }}</div>
      </div>
    </div>

    <div v-if="auth.isAdmin && summary" class="block">
      <h2>Low stock (≤ 5)</h2>
      <DataTable
        :rows="summary.lowStock || []"
        :columns="[
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
          { key: 'sku', label: 'SKU' },
          { key: 'quantity', label: 'Qty' },
        ]"
      />
    </div>
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

.note {
  opacity: 0.8;
}

.cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 14px 0;
}

.card {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 12px;
}

.label {
  opacity: 0.7;
  font-size: 0.9rem;
}

.value {
  font-size: 1.6rem;
  font-weight: 700;
  margin-top: 6px;
}

.block {
  margin-top: 16px;
}

@media (max-width: 900px) {
  .cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>