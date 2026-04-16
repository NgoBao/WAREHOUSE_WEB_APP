<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api/axios'
import DataTable from '@/components/DataTable.vue'
import StatusChip from '@/components/StatusChip.vue'

const loading = ref(false)
const error = ref('')
const rows = ref([])

const suppliers = ref([])
const products = ref([])

const showCreate = ref(false)
const showDetail = ref(false)
const submitting = ref(false)
const formError = ref('')
const detailLoading = ref(false)
const actionBusy = ref(false)

const detail = ref(null)

const createForm = ref({
  supplier_id: '',
})

const lineItems = ref([{ product_id: '', quantity: '', price: '' }])

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function getProductById(id) {
  const n = Number(id)
  if (!n || Number.isNaN(n)) return null
  return products.value.find((p) => Number(p?.id) === n) ?? null
}

function applyDefaultUnitPrice(it) {
  const p = getProductById(it?.product_id)
  if (!p) return
  // Purchase orders should default to the product's buying cost.
  const unit = Number(p.cost)
  if (Number.isNaN(unit)) return
  it.price = String(unit)
}

function lineTotal(it) {
  const qty = Number(it?.quantity)
  const unit = Number(it?.price)
  if (!qty || Number.isNaN(qty) || qty < 0) return 0
  if (Number.isNaN(unit) || unit < 0) return 0
  return qty * unit
}

function formatMoney(v) {
  return money.format(Number(v) || 0)
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString()
  } catch {
    return String(iso)
  }
}

const listRows = computed(() =>
  rows.value.map((r) => ({
    id: r.id,
    supplier_name: r.supplier_name ?? '—',
    status: r.status,
    total_amount: formatMoney(r.total_amount),
    created_at: formatDate(r.created_at),
    _raw: r,
  })),
)

async function loadRefs() {
  const [supRes, prodRes] = await Promise.all([api.get('/suppliers'), api.get('/products')])
  suppliers.value = Array.isArray(supRes.data) ? supRes.data : []
  products.value = Array.isArray(prodRes.data) ? prodRes.data : []
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    await loadRefs()
    const { data } = await api.get('/purchases')
    rows.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Failed to load purchase orders'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  formError.value = ''
  createForm.value = { supplier_id: '' }
  lineItems.value = [{ product_id: '', quantity: '', price: '' }]
  showCreate.value = true
}

function closeCreate() {
  if (submitting.value) return
  showCreate.value = false
}

function addLine() {
  lineItems.value.push({ product_id: '', quantity: '', price: '' })
}

function removeLine(i) {
  if (lineItems.value.length <= 1) return
  lineItems.value.splice(i, 1)
}

async function openDetail(row) {
  const id = row?._raw?.id ?? row?.id
  if (!id) return
  showDetail.value = true
  detail.value = null
  detailLoading.value = true
  try {
    const { data } = await api.get(`/purchases/${id}`)
    detail.value = data
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Failed to load purchase detail'
    showDetail.value = false
  } finally {
    detailLoading.value = false
  }
}

function closeDetail() {
  if (actionBusy.value) return
  showDetail.value = false
  detail.value = null
}

async function submitCreate() {
  formError.value = ''
  const sid = Number(createForm.value.supplier_id)
  if (!sid || Number.isNaN(sid)) {
    formError.value = 'Select a supplier.'
    return
  }
  const items = []
  for (const it of lineItems.value) {
    const product_id = Number(it.product_id)
    const quantity = Number(it.quantity)
    if (!product_id || Number.isNaN(product_id)) {
      formError.value = 'Each line needs a product.'
      return
    }
    if (!quantity || Number.isNaN(quantity) || quantity < 1) {
      formError.value = 'Each line needs a quantity of at least 1.'
      return
    }
    let price = Number(it.price)
    if (!it.price || Number.isNaN(price)) {
      // If user didn't enter a price, use the product's cost.
      const p = getProductById(product_id)
      price = Number(p?.cost)
      if (!Number.isNaN(price)) it.price = String(price)
    }
    if (Number.isNaN(price) || price < 0) {
      formError.value = 'Each line needs a valid unit price.'
      return
    }
    items.push({ product_id, quantity, price })
  }
  if (items.length === 0) {
    formError.value = 'Add at least one line item.'
    return
  }

  submitting.value = true
  try {
    await api.post('/purchases', { supplier_id: sid, items })
    showCreate.value = false
    await load()
  } catch (e) {
    formError.value = e?.response?.data?.message || e?.message || 'Could not create purchase order'
  } finally {
    submitting.value = false
  }
}

async function doReceive() {
  const id = detail.value?.id
  if (!id) return
  const ok = window.confirm('Receive this purchase? On-hand stock will increase for each line item.')
  if (!ok) return
  actionBusy.value = true
  error.value = ''
  try {
    await api.put(`/purchases/${id}/receive`)
    await load()
    const { data } = await api.get(`/purchases/${id}`)
    detail.value = data
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Receive failed'
  } finally {
    actionBusy.value = false
  }
}

const detailLineRows = computed(() => {
  const items = detail.value?.items
  if (!Array.isArray(items)) return []
  return items.map((it) => ({
    id: it.id,
    product_name: it.product_name ?? it.product_id,
    quantity: it.quantity,
    price: formatMoney(it.price),
    line_total: formatMoney(Number(it.quantity) * Number(it.price)),
  }))
})

onMounted(load)
</script>

<template>
  <div class="page-shell">
    <header class="page-head">
      <div class="page-head__text">
        <h1 class="page-title">Purchase orders</h1>
        <p class="page-desc">
          Create inbound POs from suppliers, then receive them to increase inventory. Staff and administrators can use
          this workflow.
        </p>
      </div>
      <div class="page-actions">
        <button class="btn" type="button" @click="load" :disabled="loading">
          {{ loading ? 'Loading…' : 'Refresh' }}
        </button>
        <button class="btn btn-primary" type="button" @click="openCreate">New purchase order</button>
      </div>
    </header>

    <p v-if="loading && rows.length === 0" class="alert alert--note" role="status">Loading purchase orders…</p>
    <p v-else-if="!loading && rows.length === 0" class="alert alert--note" role="status">
      No purchase orders yet. Create one above, or run <code class="inline-code">node seed.js</code> in the backend for
      sample data.
    </p>

    <p v-if="error" class="alert alert--error" role="alert">{{ error }}</p>

    <div class="table-card">
      <div class="table-scroll" role="region" aria-label="Purchase orders" tabindex="0">
        <table>
          <caption class="sr-only">Purchase orders</caption>
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Supplier</th>
              <th scope="col">Status</th>
              <th scope="col">Total</th>
              <th scope="col">Created</th>
              <th scope="col" class="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in listRows" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ r.supplier_name }}</td>
              <td><StatusChip :status="r.status" /></td>
              <td>{{ r.total_amount }}</td>
              <td>{{ r.created_at }}</td>
              <td class="td-actions">
                <button class="btn btn-sm" type="button" @click="openDetail(r)">View</button>
              </td>
            </tr>
            <tr v-if="rows.length === 0 && !loading">
              <td class="empty" colspan="6">No results</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create modal -->
    <div
      v-if="showCreate"
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="New purchase order"
      @click.self="closeCreate"
    >
      <div class="modal__card modal__card--wide">
        <header class="modal__head">
          <h2 class="modal__title">New purchase order</h2>
          <button class="btn btn-sm" type="button" @click="closeCreate" :disabled="submitting">Close</button>
        </header>

        <div class="modal__body">
          <div class="field field--full">
            <label class="field__label" for="po-supplier">Supplier *</label>
            <select id="po-supplier" v-model="createForm.supplier_id" class="field__input">
              <option disabled value="">Select supplier</option>
              <option v-for="s in suppliers" :key="s.id" :value="String(s.id)">{{ s.name }}</option>
            </select>
          </div>

          <p class="lines-heading">Line items</p>
          <div v-for="(it, idx) in lineItems" :key="idx" class="line-row">
            <div class="field">
              <label class="field__label" :for="`po-prod-${idx}`">Product</label>
              <select
                :id="`po-prod-${idx}`"
                v-model="it.product_id"
                class="field__input"
                @change="applyDefaultUnitPrice(it)"
              >
                <option disabled value="">Select</option>
                <option v-for="p in products" :key="p.id" :value="String(p.id)">{{ p.name }} (#{{ p.id }})</option>
              </select>
            </div>
            <div class="field">
              <label class="field__label" :for="`po-qty-${idx}`">Qty</label>
              <input
                :id="`po-qty-${idx}`"
                v-model="it.quantity"
                type="number"
                min="1"
                step="1"
                class="field__input"
                @change="applyDefaultUnitPrice(it)"
              />
            </div>
            <div class="field">
              <label class="field__label" :for="`po-price-${idx}`">Unit price</label>
              <input
                :id="`po-price-${idx}`"
                v-model="it.price"
                type="number"
                min="0"
                step="0.01"
                class="field__input"
              />
            </div>
            <div class="field">
              <label class="field__label" :for="`po-total-${idx}`">Line total</label>
              <input
                :id="`po-total-${idx}`"
                :value="formatMoney(lineTotal(it))"
                class="field__input"
                readonly
                tabindex="-1"
              />
            </div>
            <button
              v-if="lineItems.length > 1"
              class="btn btn-sm btn-ghost line-remove"
              type="button"
              @click="removeLine(idx)"
              :disabled="submitting"
            >
              Remove
            </button>
          </div>

          <button class="btn btn-sm" type="button" @click="addLine" :disabled="submitting">Add line</button>

          <p v-if="formError" class="alert alert--error" role="alert">{{ formError }}</p>

          <div class="modal__actions">
            <button class="btn btn-primary" type="button" :disabled="submitting" @click="submitCreate">
              {{ submitting ? 'Creating…' : 'Create order' }}
            </button>
            <button class="btn" type="button" @click="closeCreate" :disabled="submitting">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail modal -->
    <div
      v-if="showDetail"
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Purchase order detail"
      @click.self="closeDetail"
    >
      <div class="modal__card modal__card--wide">
        <header class="modal__head">
          <h2 class="modal__title">Purchase #{{ detail?.id ?? '…' }}</h2>
          <button class="btn btn-sm" type="button" @click="closeDetail" :disabled="actionBusy">Close</button>
        </header>

        <div class="modal__body">
          <p v-if="detailLoading" class="alert alert--note" role="status">Loading…</p>
          <template v-else-if="detail">
            <div class="detail-meta">
              <div>
                <span class="meta-label">Supplier</span>
                <span class="meta-value">{{ detail.supplier_name ?? detail.supplier_id }}</span>
              </div>
              <div>
                <span class="meta-label">Status</span>
                <StatusChip :status="detail.status" />
              </div>
              <div>
                <span class="meta-label">Total</span>
                <span class="meta-value">{{ formatMoney(detail.total_amount) }}</span>
              </div>
              <div>
                <span class="meta-label">Created</span>
                <span class="meta-value">{{ formatDate(detail.created_at) }}</span>
              </div>
            </div>

            <h3 class="subhead">Line items</h3>
            <DataTable
              caption="Purchase line items"
              :rows="detailLineRows"
              :columns="[
                { key: 'product_name', label: 'Product' },
                { key: 'quantity', label: 'Qty' },
                { key: 'price', label: 'Unit' },
                { key: 'line_total', label: 'Line total' },
              ]"
            />

            <div v-if="detail.status === 'pending'" class="detail-actions">
              <button class="btn btn-primary" type="button" :disabled="actionBusy" @click="doReceive">
                {{ actionBusy ? 'Receiving…' : 'Receive & update stock' }}
              </button>
            </div>
          </template>
        </div>
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

.btn-sm {
  padding: 0.35rem 0.6rem;
  font-size: 0.8125rem;
}

.empty {
  text-align: center;
  padding: 1.5rem 1rem;
  color: var(--text-muted);
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

.inline-code {
  font-family: ui-monospace, monospace;
  font-size: 0.85em;
  padding: 0.1rem 0.35rem;
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
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
  width: min(640px, 100%);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-subtle);
  background: var(--surface-elevated);
  box-shadow: var(--shadow-md);
  padding: 1rem;
  max-height: min(90vh, 900px);
  display: flex;
  flex-direction: column;
}

.modal__card--wide {
  width: min(820px, 100%);
}

.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.modal__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
}

.modal__body {
  padding-top: 0.875rem;
  overflow: auto;
  flex: 1;
  min-height: 0;
}

.field {
  display: grid;
  gap: 0.375rem;
}

.field--full {
  margin-bottom: 0.75rem;
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

.lines-heading {
  font-size: 0.8125rem;
  font-weight: 650;
  color: var(--text-secondary);
  margin: 0.5rem 0 0.5rem;
}

.line-row {
  display: grid;
  grid-template-columns: 1fr 100px 120px 140px auto;
  gap: 0.65rem;
  align-items: end;
  margin-bottom: 0.65rem;
}

.line-remove {
  margin-bottom: 0.15rem;
}

.btn-ghost {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
  color: var(--text-muted);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.modal__actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-subtle);
}

.detail-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.meta-label {
  display: block;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.meta-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.subhead {
  font-size: 0.9375rem;
  font-weight: 650;
  margin: 0 0 0.5rem;
  color: var(--text-primary);
}

.detail-actions {
  margin-top: 1rem;
}

@media (max-width: 720px) {
  .line-row {
    grid-template-columns: 1fr;
  }

  .line-remove {
    justify-self: start;
  }
}
</style>
