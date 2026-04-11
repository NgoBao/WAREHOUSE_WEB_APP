<script setup>
import { onMounted, ref } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'

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
  phone: '',
  email: '',
  address: '',
})

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

function openCreate() {
  formError.value = ''
  mode.value = 'create'
  editingId.value = null
  form.value = { name: '', phone: '', email: '', address: '' }
  showForm.value = true
}

function openEdit(row) {
  formError.value = ''
  mode.value = 'edit'
  editingId.value = row?.id ?? null
  form.value = {
    name: row?.name ?? '',
    phone: row?.phone ?? '',
    email: row?.email ?? '',
    address: row?.address ?? '',
  }
  showForm.value = true
}

function closeForm() {
  if (submitting.value) return
  showForm.value = false
}

function normalizePayload() {
  return {
    name: String(form.value.name || '').trim(),
    phone: String(form.value.phone || '').trim() || null,
    email: String(form.value.email || '').trim() || null,
    address: String(form.value.address || '').trim() || null,
  }
}

async function submit() {
  formError.value = ''
  submitting.value = true
  try {
    const payload = normalizePayload()
    if (!payload.name) {
      formError.value = 'Name is required.'
      return
    }
    if (mode.value === 'create') {
      await api.post('/customers', payload)
    } else {
      await api.put(`/customers/${editingId.value}`, payload)
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
  const ok = window.confirm(
    `Delete customer "${row?.name ?? id}"? This is a soft delete and can’t be undone from the UI.`
  )
  if (!ok) return
  try {
    await api.delete(`/customers/${id}`)
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
        <h1 class="page-title">Customers</h1>
        <p class="page-desc">Contact directory for buyers and delivery points connected to your warehouse.</p>
      </div>
      <div class="page-actions">
        <button class="btn" type="button" @click="load" :disabled="loading">
          {{ loading ? 'Loading…' : 'Refresh' }}
        </button>
        <button class="btn btn-primary" type="button" @click="openCreate">Add customer</button>
      </div>
    </header>

    <p v-if="loading && rows.length === 0" class="alert alert--note" role="status">Loading customers…</p>
    <p v-else-if="!loading && rows.length === 0" class="alert alert--note" role="status">
      No customers yet. Add a record or run the backend seeder for sample buyers.
    </p>

    <p v-if="error" class="alert alert--error" role="alert">{{ error }}</p>

    <div class="table-card">
      <div class="table-scroll" role="region" aria-label="Customers table" tabindex="0">
        <table>
          <caption class="sr-only">Customers</caption>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name</th>
              <th scope="col">Phone</th>
              <th scope="col">Email</th>
              <th scope="col">Address</th>
              <th scope="col" class="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id">
              <td>{{ r?.id ?? '' }}</td>
              <td>{{ r?.name ?? '' }}</td>
              <td>{{ r?.phone ?? '' }}</td>
              <td>{{ r?.email ?? '' }}</td>
              <td>{{ r?.address ?? '' }}</td>
              <td class="td-actions">
                <button class="btn btn-sm" type="button" @click="openEdit(r)">Edit</button>
                <button v-if="auth.isAdmin" class="btn btn-sm btn-danger" type="button" @click="remove(r)">
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="rows.length === 0 && !loading">
              <td class="empty" colspan="6">No results</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showForm" class="modal" role="dialog" aria-modal="true" aria-label="Customer form" @click.self="closeForm">
      <div class="modal__card">
        <header class="modal__head">
          <h2 class="modal__title">{{ mode === 'create' ? 'Add customer' : 'Edit customer' }}</h2>
          <button class="btn btn-sm" type="button" @click="closeForm" :disabled="submitting">Close</button>
        </header>

        <form class="form-grid" @submit.prevent="submit" novalidate>
          <div class="field field--full">
            <label class="field__label" for="c-name">Name *</label>
            <input id="c-name" v-model="form.name" class="field__input" required />
          </div>
          <div class="field">
            <label class="field__label" for="c-phone">Phone</label>
            <input id="c-phone" v-model="form.phone" class="field__input" />
          </div>
          <div class="field">
            <label class="field__label" for="c-email">Email</label>
            <input id="c-email" v-model="form.email" type="email" class="field__input" />
          </div>
          <div class="field field--full">
            <label class="field__label" for="c-address">Address</label>
            <textarea id="c-address" v-model="form.address" class="field__input field__textarea" rows="3" />
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
.table-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  background: var(--surface-elevated);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.table-scroll {
  width: 100%;
  overflow: auto;
  max-width: 100%;
}

table {
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;
  font-size: 0.875rem;
}

th,
td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
  text-align: left;
  vertical-align: middle;
  color: var(--text-primary);
}

th {
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--text-muted);
  background: var(--surface-muted);
  white-space: nowrap;
}

.th-actions {
  width: 1%;
}

.td-actions {
  display: flex;
  gap: 0.5rem;
  white-space: nowrap;
}

.btn-sm {
  padding: 0.35rem 0.6rem;
  font-size: 0.8125rem;
}

.btn-danger {
  border-color: #fecaca;
  background: var(--danger-muted);
  color: #991b1b;
}

.empty {
  text-align: center;
  padding: 1.5rem 1rem;
  color: var(--text-muted);
  font-size: 0.9375rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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
  width: min(680px, 100%);
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
