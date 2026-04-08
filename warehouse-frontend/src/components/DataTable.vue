<script setup>
defineProps({
  rows: { type: Array, required: true },
  columns: { type: Array, required: true }, // [{ key, label }]
  keyField: { type: String, default: 'id' },
})
</script>

<template>
  <div class="tableWrap">
    <table>
      <thead>
        <tr>
          <th v-for="c in columns" :key="c.key">{{ c.label }}</th>
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
</template>

<style scoped>
.tableWrap {
  width: 100%;
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

th,
td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

th {
  text-align: left;
  font-weight: 650;
  background: rgba(127, 127, 127, 0.06);
}

.empty {
  opacity: 0.75;
}
</style>