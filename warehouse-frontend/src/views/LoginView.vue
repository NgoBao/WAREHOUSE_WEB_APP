<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
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
  <div class="auth-layout">
    <div class="auth-card" role="region" aria-labelledby="sign-in-heading">
      <div class="auth-card__brand" aria-hidden="true">
        <div class="auth-card__logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 3L4 8v8l8 5 8-5V8l-8-5z"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linejoin="round"
            />
            <path d="M12 12v10" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
          </svg>
        </div>
        <div>
          <div class="auth-card__product">Warehouse</div>
          <div class="auth-card__tagline">Operations console</div>
        </div>
      </div>

      <h1 id="sign-in-heading" class="auth-card__title">Sign in</h1>
      <p class="auth-card__hint">
        Demo accounts: <strong>admin@test.com</strong> or <strong>staff1@test.com</strong> — password
        <strong>123456</strong>. The API seeds this data automatically the first time it starts with an empty database.
      </p>

      <form class="form" @submit.prevent="submit" novalidate>
        <div class="field">
          <label class="field__label" for="login-email">Email</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="field__input"
            placeholder="you@company.com"
          />
        </div>

        <div class="field">
          <label class="field__label" for="login-password">Password</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="field__input"
            placeholder="••••••••"
          />
        </div>

        <p v-if="error" class="alert alert--error" role="alert">{{ error }}</p>

        <button class="btn btn-primary auth-card__submit" type="submit" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem 1rem;
  background: linear-gradient(180deg, var(--surface-canvas) 0%, #e5e7eb 100%);
}

.auth-card {
  width: min(420px, 100%);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-subtle);
  background: var(--surface-elevated);
  padding: 1.75rem 1.75rem 1.5rem;
  box-shadow: var(--shadow-md);
}

@media (prefers-reduced-motion: no-preference) {
  .auth-card {
    animation: auth-card-enter 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
}

@keyframes auth-card-enter {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.auth-card__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.auth-card__logo {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-md);
  background: var(--accent-muted);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card__product {
  font-weight: 700;
  font-size: 1.0625rem;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.auth-card__tagline {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 0.125rem;
}

.auth-card__title {
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

.auth-card__hint {
  margin-top: 0.35rem;
  font-size: 0.9375rem;
  color: var(--text-muted);
  line-height: 1.45;
}

.hint-code {
  font-family: ui-monospace, monospace;
  font-size: 0.85em;
  padding: 0.08rem 0.3rem;
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
  color: var(--text-secondary);
}

.form {
  display: grid;
  gap: 1rem;
  margin-top: 1.25rem;
}

.field {
  display: grid;
  gap: 0.375rem;
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
  transition:
    border-color var(--motion-duration-fast) var(--motion-ease-out),
    box-shadow var(--motion-duration-fast) var(--motion-ease-out);
}

.field__input:hover {
  border-color: var(--border-strong);
}

.field__input:focus {
  outline: none;
}

.field__input:focus-visible {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-muted);
}

.auth-card__submit {
  width: 100%;
  justify-content: center;
  padding-top: 0.65rem;
  padding-bottom: 0.65rem;
  margin-top: 0.25rem;
}

.alert {
  margin: 0;
}
</style>
