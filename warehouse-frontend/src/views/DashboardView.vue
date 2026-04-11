<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import DataTable from '@/components/DataTable.vue'

const auth = useAuthStore()

const loading = ref(false)
const error = ref('')
const summary = ref(null)

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const formattedRevenue = computed(() => {
  if (!summary.value || auth.isAdmin !== true) return ''
  return money.format(Number(summary.value.totalSales) || 0)
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    if (auth.isAdmin) {
      const { data } = await api.get('/dashboard/summary')
      summary.value = { ...data, _variant: 'admin' }
    } else {
      const { data } = await api.get('/dashboard/staff-summary')
      summary.value = { ...data, _variant: 'staff' }
    }
  } catch (e) {
    summary.value = null
    error.value = e?.response?.data?.message || e?.message || 'Failed to load dashboard'
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
        <h1 class="page-title">Dashboard</h1>
        <p class="page-desc">
          <template v-if="auth.isAdmin">
            Snapshot of inventory, partners, and sales. Refresh to pull the latest numbers from the server.
          </template>
          <template v-else>
            Operational snapshot for warehouse staff: catalog size, open orders, and reorder alerts. Revenue totals are
            visible to administrators only.
          </template>
        </p>
      </div>
      <div class="page-actions">
        <button class="btn" type="button" @click="load" :disabled="loading">
          {{ loading ? 'Refreshing…' : 'Refresh' }}
        </button>
      </div>
    </header>

    <p v-if="loading && !summary" class="alert alert--note" role="status">Loading dashboard…</p>

    <p v-if="error" class="alert alert--error" role="alert">{{ error }}</p>

    <div v-if="summary && summary._variant === 'admin'" class="kpi-grid" role="list">
      <article class="kpi-card" role="listitem">
        <div class="kpi-card__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
          </svg>
        </div>
        <div class="kpi-card__label">Products</div>
        <div class="kpi-card__value">{{ summary.totalProducts }}</div>
      </article>
      <article class="kpi-card" role="listitem">
        <div class="kpi-card__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
            <path d="M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
            <circle cx="17" cy="18" r="2" />
            <circle cx="7" cy="18" r="2" />
          </svg>
        </div>
        <div class="kpi-card__label">Suppliers</div>
        <div class="kpi-card__value">{{ summary.totalSuppliers }}</div>
      </article>
      <article class="kpi-card" role="listitem">
        <div class="kpi-card__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div class="kpi-card__label">Customers</div>
        <div class="kpi-card__value">{{ summary.totalCustomers }}</div>
      </article>
      <article class="kpi-card" role="listitem">
        <div class="kpi-card__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div class="kpi-card__label">Total sales (completed)</div>
        <div class="kpi-card__value kpi-card__value--money">{{ formattedRevenue }}</div>
      </article>
    </div>

    <div v-if="summary && summary._variant === 'staff'" class="kpi-grid kpi-grid--staff" role="list">
      <article class="kpi-card" role="listitem">
        <div class="kpi-card__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
          </svg>
        </div>
        <div class="kpi-card__label">Products in catalog</div>
        <div class="kpi-card__value">{{ summary.totalProducts }}</div>
      </article>
      <article class="kpi-card" role="listitem">
        <div class="kpi-card__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 16h6M19 13v6" />
            <path d="M8 21H4a2 2 0 0 1-2-2V7l8-4 8 4v5" />
            <rect x="2" y="7" width="20" height="14" rx="2" />
          </svg>
        </div>
        <div class="kpi-card__label">Pending purchases</div>
        <div class="kpi-card__value">{{ summary.pendingPurchases }}</div>
      </article>
      <article class="kpi-card" role="listitem">
        <div class="kpi-card__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <div class="kpi-card__label">Pending sales</div>
        <div class="kpi-card__value">{{ summary.pendingSales }}</div>
      </article>
    </div>

    <section v-if="summary" class="low-stock">
      <h2 class="panel__title">Low stock (≤ 5)</h2>
      <p v-if="!summary.lowStock?.length" class="alert alert--note" role="status">
        No SKUs are at or below the threshold. Nice work keeping shelves full.
      </p>
      <DataTable
        v-else
        caption="Products at or below reorder threshold"
        :rows="summary.lowStock || []"
        :columns="[
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
          { key: 'sku', label: 'SKU' },
          { key: 'quantity', label: 'Qty' },
        ]"
      />
    </section>
  </div>
</template>

<style scoped>
.low-stock {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.low-stock :deep(.table-card) {
  border-radius: var(--radius-lg);
}

.kpi-grid--staff {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 900px) {
  .kpi-grid--staff {
    grid-template-columns: 1fr;
  }
}

.kpi-card__value--money {
  font-size: 1.375rem;
}

.kpi-card__icon svg {
  width: 1.125rem;
  height: 1.125rem;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
