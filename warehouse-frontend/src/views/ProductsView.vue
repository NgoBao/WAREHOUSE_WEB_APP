<script setup>
import { onMounted, ref } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import DataTable from '@/components/DataTable.vue'

const auth = useAuthStore()

const loading = ref(false)
const error = ref('')
const rows = ref([])

const showForm = ref(false)
const submitting = ref(false)
const formError = ref('')
const mode = ref('create') // create | edit
const editingId = ref(null)

const form = ref({
  name: '',
  sku: '',
  description: '',
  price: '',
  cost: '',
  quantity: '',
  supplier_id: '',
})

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

function openCreate() {
  formError.value = ''
  mode.value = 'create'
  editingId.value = null
  form.value = {
    name: '',
    sku: '',
    description: '',
    price: '',
    cost: '',
    quantity: '',
    supplier_id: '',
  }
  showForm.value = true
}

function openEdit(row) {
  formError.value = ''
  mode.value = 'edit'
  editingId.value = row?.id ?? null
  form.value = {
    name: row?.name ?? '',
    sku: row?.sku ?? '',
    description: row?.description ?? '',
    price: row?.price ?? '',
    cost: row?.cost ?? '',
    quantity: row?.quantity ?? '',
    supplier_id: row?.supplier_id ?? '',
  }
  showForm.value = true
}

function closeForm() {
  if (submitting.value) return
  showForm.value = false
}

function normalizePayload() {
  const payload = {
    name: String(form.value.name || '').trim(),
    sku: String(form.value.sku || '').trim() || null,
    description: String(form.value.description || '').trim() || null,
    price: form.value.price === '' ? null : Number(form.value.price),
    cost: form.value.cost === '' ? null : Number(form.value.cost),
    quantity: form.value.quantity === '' ? 0 : Number(form.value.quantity),
    supplier_id: String(form.value.supplier_id || '').trim() === '' ? null : Number(form.value.supplier_id),
  }
  return payload
}

async function submit() {
  formError.value = ''
  submitting.value = true
  try {
    const payload = normalizePayload()
    if (!payload.name || payload.price == null || Number.isNaN(payload.price) || payload.cost == null || Number.isNaN(payload.cost)) {
      formError.value = 'Name, price, and cost are required.'
      return
    }
    if (payload.quantity == null || Number.isNaN(payload.quantity) || payload.quantity < 0) {
      formError.value = 'Quantity must be 0 or greater.'
      return
    }

    if (mode.value === 'create') {
      await api.post('/products', payload)
    } else {
      await api.put(`/products/${editingId.value}`, payload)
    }
    showForm.value = false
    await load()
  } catch (e) {
    formError.value = e?.response?.data?.message || e?.message || 'Save failed'
  } finally {
    submitting.value = false
  }
}

async function remove(row) {
  error.value = ''
  const id = row?.id
  if (!id) return
  const ok = window.confirm(`Delete product "${row?.name ?? id}"? This is a soft delete and can’t be undone from the UI.`)
  if (!ok) return
  try {
    await api.delete(`/products/${id}`)
    await load()
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Delete failed'
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
        <button v-if="auth.isAdmin" class="btn btn-primary" type="button" @click="openCreate">Add product</button>
      </div>
    </header>

    <p v-if="loading && rows.length === 0" class="alert alert--note" role="status">Loading products…</p>
    <p v-else-if="!loading && rows.length === 0" class="alert alert--note" role="status">
      No products yet. Admins can add SKUs here, or run the backend seeder for demo inventory.
    </p>

    <p v-if="error" class="alert alert--error" role="alert">{{ error }}</p>

    <DataTable
      v-if="rows.length > 0 || loading"
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
      :show-actions="auth.isAdmin"
    >
      <template #actions="{ row: r }">
        <button class="btn btn-sm" type="button" @click="openEdit(r)">Edit</button>
        <button class="btn btn-sm btn-danger" type="button" @click="remove(r)">Delete</button>
      </template>
    </DataTable>

    <div v-if="showForm" class="modal" role="dialog" aria-modal="true" aria-label="Product form" @click.self="closeForm">
      <div class="modal__card">
        <header class="modal__head">
          <h2 class="modal__title">{{ mode === 'create' ? 'Add product' : 'Edit product' }}</h2>
          <button class="btn btn-sm" type="button" @click="closeForm" :disabled="submitting">Close</button>
        </header>

        <form class="form-grid" @submit.prevent="submit" novalidate>
          <div class="field">
            <label class="field__label" for="p-name">Name *</label>
            <input id="p-name" v-model="form.name" class="field__input" required />
          </div>
          <div class="field">
            <label class="field__label" for="p-sku">SKU</label>
            <input id="p-sku" v-model="form.sku" class="field__input" />
          </div>
          <div class="field field--full">
            <label class="field__label" for="p-desc">Description</label>
            <textarea id="p-desc" v-model="form.description" class="field__input field__textarea" rows="3" />
          </div>
          <div class="field">
            <label class="field__label" for="p-price">Price *</label>
            <input id="p-price" v-model="form.price" type="number" step="0.01" min="0" class="field__input" required />
          </div>
          <div class="field">
            <label class="field__label" for="p-cost">Cost *</label>
            <input id="p-cost" v-model="form.cost" type="number" step="0.01" min="0" class="field__input" required />
          </div>
          <div class="field">
            <label class="field__label" for="p-qty">Quantity</label>
            <input id="p-qty" v-model="form.quantity" type="number" step="1" min="0" class="field__input" />
          </div>
          <div class="field">
            <label class="field__label" for="p-supplier">Supplier ID</label>
            <input id="p-supplier" v-model="form.supplier_id" type="number" step="1" min="1" class="field__input" />
          </div>

          <p v-if="formError" class="alert alert--error" role="alert">{{ formError }}</p>

          <div class="modal__actions">
            <button class="btn btn-primary" type="submit" :disabled="submitting">
              {{ submitting ? 'Saving…' : 'Save' }}
            </button>
            <button class="btn" type="button" @click="closeForm" :disabled="submitting">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-sm {
  padding: 0.35rem 0.6rem;
  font-size: 0.8125rem;
}

.btn-danger {
  border-color: #fecaca;
  background: var(--danger-muted);
  color: #991b1b;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  padding: 1.25rem;
  z-index: 50;
}

.modal__card {
  width: min(720px, 100%);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-subtle);
  background: var(--surface-elevated);
  box-shadow: var(--shadow-md);
  padding: 1rem;
}

.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
}

.modal__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.875rem;
  padding-top: 0.875rem;
}

.field {
  display: grid;
  gap: 0.375rem;
}

.field--full {
  grid-column: 1 / -1;
}

.field__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.field__input {
  width: 100%;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.625rem 0.75rem;
  font: inherit;
  color: var(--text-primary);
  background: var(--surface-elevated);
}

.field__textarea {
  resize: vertical;
}

.modal__actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding-top: 0.25rem;
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
