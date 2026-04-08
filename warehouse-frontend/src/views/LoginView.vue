<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const email = ref('admin@test.com')
const password = ref('123456')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
    const next = typeof route.query.next === 'string' ? route.query.next : '/dashboard'
    await router.replace(next)
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <h1>Sign in</h1>
      <p class="hint">Use a seeded account if you ran the backend seeder.</p>

      <form class="form" @submit.prevent="submit">
        <label>
          <span>Email</span>
          <input v-model="email" type="email" autocomplete="email" required />
        </label>

        <label>
          <span>Password</span>
          <input v-model="password" type="password" autocomplete="current-password" required />
        </label>

        <p v-if="error" class="error">{{ error }}</p>

        <button class="btn" type="submit" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  place-items: center;
  padding: 24px 0;
}

.card {
  width: min(460px, 100%);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  background: var(--color-background);
}

.hint {
  opacity: 0.75;
  margin-top: 6px;
}

.form {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

label {
  display: grid;
  gap: 6px;
}

input {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 10px 12px;
  background: transparent;
  color: inherit;
}

.error {
  color: #d94848;
  margin: 0;
}

.btn {
  border: 1px solid rgba(65, 184, 131, 0.5);
  background: rgba(65, 184, 131, 0.12);
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  color: inherit;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>

