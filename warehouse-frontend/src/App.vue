<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const displayName = computed(() => auth.user?.name || auth.user?.email || 'User')

function doLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="appShell">
    <header class="topbar">
      <div class="brand">Warehouse</div>

      <nav class="nav">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/products">Products</RouterLink>
        <RouterLink to="/suppliers">Suppliers</RouterLink>
        <RouterLink to="/customers">Customers</RouterLink>
      </nav>

      <div class="auth">
        <template v-if="auth.isAuthed">
          <span class="user">{{ displayName }}</span>
          <button class="btn" type="button" @click="doLogout">Logout</button>
        </template>
        <template v-else>
          <RouterLink class="btnLink" to="/login">Login</RouterLink>
        </template>
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.appShell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
  position: sticky;
  top: 0;
}

.brand {
  font-weight: 700;
  letter-spacing: 0.2px;
}

.nav {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.nav a {
  padding: 6px 10px;
  border-radius: 8px;
  text-decoration: none;
}

.nav a.router-link-exact-active {
  background: rgba(65, 184, 131, 0.15);
}

.auth {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user {
  opacity: 0.85;
  font-size: 0.95rem;
}

.btn,
.btnLink {
  border: 1px solid var(--color-border);
  background: transparent;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.btn:hover,
.btnLink:hover {
  border-color: rgba(65, 184, 131, 0.6);
}

.content {
  width: min(1100px, 100%);
  margin: 0 auto;
  padding: 18px 16px;
  flex: 1;
}
</style>
