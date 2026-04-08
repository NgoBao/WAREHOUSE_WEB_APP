<script setup>
defineProps({
  rows: { type: Array, required: true },
  columns: { type: Array, required: true }, // [{ key, label }]
  keyField: { type: String, default: 'id' },
  caption: { type: String, default: '' },
})
</script>

<template>
  <div class="table-card">
    <div class="table-scroll" role="region" :aria-label="caption || 'Data table'" tabindex="0">
      <table>
        <caption v-if="caption" class="sr-only">{{ caption }}</caption>
        <thead>
          <tr>
            <th v-for="c in columns" :key="c.key" scope="col">{{ c.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r[keyField] ?? JSON.stringify(r)">
            <td v-for="c in columns" :key="c.key">
              {{ r?.[c.key] ?? '' }}
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td class="empty" :colspan="columns.length">No results</td>
          </tr>
        </tbody>
      </table>
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

.table-scroll:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

table {
  width: 100%;
  min-width: 640px;
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

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr {
  transition: background-color var(--motion-duration-fast) var(--motion-ease-out);
}

tbody tr:hover {
  background: #f9fafb;
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
</style>
