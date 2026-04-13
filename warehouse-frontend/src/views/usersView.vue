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

const form = ref({
  name: '',
  email: '',
  password: '',
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/users')
    rows.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  formError.value = ''
  form.value = { name: '', email: '', password: '' }
  showForm.value = true
}

function closeForm() {
  if (submitting.value) return
  showForm.value = false
}

async function submit() {
  formError.value = ''
  submitting.value = true
  try {
    const name = String(form.value.name || '').trim()
    const email = String(form.value.email || '').trim()
    const password = String(form.value.password || '')
    if (!name || !email || !password) {
      formError.value = 'Name, email, and password are required.'
      return
    }
    await api.post('/users', { name, email, password })
    showForm.value = false
    await load()
  } catch (e) {
    formError.value = e?.response?.data?.message || e?.message || 'Save failed'
  } finally {
    submitting.value = false
  }
}

async function removeUser(row) {
  error.value = ''
  const id = row?.id
  if (!id || id === auth.user?.id) return
  const label = row?.name || row?.email || id
  const ok = window.confirm(
    `Remove user "${label}"? They will no longer be able to sign in.`
  )
  if (!ok) return
  try {
    await api.delete(`/users/${id}`)
    await load()
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Remove failed'
  }
}

function roleClass(role) {
  if (role === 'admin') return 'role-pill role-pill--admin'
  return 'role-pill role-pill--staff'
}

onMounted(load)
</script>

<template>
  <div class="page-shell">
    <header class="page-head">
      <div class="page-head__text">
        <h1 class="page-title">Team</h1>
        <p class="page-desc">Add staff accounts or remove access. Only administrators can manage users.</p>
      </div>
      <div class="page-actions">
        <button class="btn" type="button" @click="load" :disabled="loading">
          {{ loading ? 'Loading…' : 'Refresh' }}
        </button>
        <button class="btn btn-primary" type="button" @click="openCreate">Add staff</button>
      </div>
    </header>

    <p v-if="loading && rows.length === 0" class="alert alert--note" role="status">Loading team…</p>
    <p v-else-if="!loading && rows.length === 0" class="alert alert--note" role="status">
      No users found.
    </p>

    <p v-if="error" class="alert alert--error" role="alert">{{ error }}</p>

    <div class="table-card">
      <div class="table-scroll" role="region" aria-label="Users table" tabindex="0">
        <table>
          <caption class="sr-only">Team members</caption>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Created</th>
              <th scope="col" class="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id">
              <td>{{ r?.id ?? '' }}</td>
              <td>{{ r?.name ?? '' }}</td>
              <td>{{ r?.email ?? '' }}</td>
              <td>
                <span :class="roleClass(r?.role)">{{ r?.role ?? '' }}</span>
              </td>
              <td>{{ r?.created_at ?? '' }}</td>
              <td class="td-actions">
                <button
                  v-if="r?.id !== auth.user?.id"
                  class="btn btn-sm btn-danger"
                  type="button"
                  @click="removeUser(r)"
                >
                  Remove
                </button>
                <span v-else class="td-actions__self">You</span>
              </td>
            </tr>
            <tr v-if="rows.length === 0 && !loading">
              <td class="empty" colspan="6">No results</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="showForm"
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Add staff"
      @click.self="closeForm"
    >
      <div class="modal__card">
        <header class="modal__head">
          <h2 class="modal__title">Add staff</h2>
          <button class="btn btn-sm" type="button" @click="closeForm" :disabled="submitting">Close</button>
        </header>

        <form class="form-grid" @submit.prevent="submit" novalidate>
          <div class="field field--full">
            <label class="field__label" for="u-name">Name *</label>
            <input id="u-name" v-model="form.name" class="field__input" autocomplete="name" required />
          </div>
          <div class="field field--full">
            <label class="field__label" for="u-email">Email *</label>
            <input id="u-email" v-model="form.email" class="field__input" type="email" autocomplete="email" required />
          </div>
          <div class="field field--full">
            <label class="field__label" for="u-password">Temporary password *</label>
            <input
              id="u-password"
              v-model="form.password"
              class="field__input"
              type="password"
              autocomplete="new-password"
              required
            />
          </div>

          <p v-if="formError" class="alert alert--error" role="alert">{{ formError }}</p>

          <div class="modal__actions">
            <button class="btn btn-primary" type="submit" :disabled="submitting">
              {{ submitting ? 'Creating…' : 'Create staff' }}
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
  min-width: 720px;
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
  white-space: nowrap;
}

.td-actions__self {
  font-size: 0.8125rem;
  color: var(--text-muted);
  font-weight: 500;
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

.role-pill {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.role-pill--admin {
  background: var(--accent-muted);
  color: var(--accent);
}

.role-pill--staff {
  background: var(--surface-muted);
  color: var(--text-secondary);
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
  width: min(520px, 100%);
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
  grid-template-columns: 1fr;
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

.modal__actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding-top: 0.25rem;
}
</style>
