<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isPublicLayout = computed(() => Boolean(route.meta.public))

const displayName = computed(() => auth.user?.name || auth.user?.email || 'User')

const roleLabel = computed(() => {
  const r = auth.user?.role
  if (!r) return 'Team member'
  return r.charAt(0).toUpperCase() + r.slice(1)
})

const pageTitle = computed(() => {
  const n = route.name
  if (n === 'dashboard') return 'Dashboard'
  if (n === 'products') return 'Products'
  if (n === 'suppliers') return 'Suppliers'
  if (n === 'customers') return 'Customers'
  return 'Warehouse'
})

function doLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <template v-if="isPublicLayout">
    <transition name="fade" mode="out-in">
      <RouterView :key="route.fullPath" />
    </transition>
  </template>

  <div v-else class="app-layout" :class="{ 'app-layout--authed': auth.isAuthed }">
    <aside v-if="auth.isAuthed" class="sidebar" aria-label="Primary navigation">
      <div class="sidebar__brand">
        <div class="sidebar__logo" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 3L4 8v8l8 5 8-5V8l-8-5z"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linejoin="round"
            />
            <path d="M12 12v10" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
          </svg>
        </div>
        <div class="sidebar__brand-text">
          <div class="sidebar__product">Warehouse</div>
          <div class="sidebar__role">{{ roleLabel }}</div>
        </div>
      </div>

      <nav class="sidebar__nav" aria-label="Main menu">
        <p class="sidebar__section-label">Main menu</p>
        <ul class="sidebar__list">
          <li>
            <RouterLink class="sidebar__link" to="/dashboard" active-class="sidebar__link--active">
              <span class="sidebar__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="9" rx="1" />
                  <rect x="14" y="3" width="7" height="5" rx="1" />
                  <rect x="14" y="12" width="7" height="9" rx="1" />
                  <rect x="3" y="16" width="7" height="5" rx="1" />
                </svg>
              </span>
              <span>Dashboard</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink class="sidebar__link" to="/products" active-class="sidebar__link--active">
              <span class="sidebar__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
                </svg>
              </span>
              <span>Products</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink class="sidebar__link" to="/suppliers" active-class="sidebar__link--active">
              <span class="sidebar__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                  <path d="M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                  <circle cx="17" cy="18" r="2" />
                  <circle cx="7" cy="18" r="2" />
                </svg>
              </span>
              <span>Suppliers</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink class="sidebar__link" to="/customers" active-class="sidebar__link--active">
              <span class="sidebar__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <span>Customers</span>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="sidebar__footer">
        <div class="sidebar__user">
          <div class="sidebar__avatar" aria-hidden="true">{{ displayName.charAt(0).toUpperCase() }}</div>
          <div class="sidebar__user-meta">
            <div class="sidebar__user-name">{{ displayName }}</div>
            <div class="sidebar__user-role">{{ roleLabel }}</div>
          </div>
        </div>
        <button type="button" class="sidebar__logout btn" @click="doLogout">Sign out</button>
      </div>
    </aside>

    <div class="main-column">
      <header v-if="auth.isAuthed" class="topbar">
        <div class="topbar__left">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <ol class="breadcrumb__list">
              <li class="breadcrumb__item">
                <RouterLink to="/dashboard">Home</RouterLink>
              </li>
              <li class="breadcrumb__item breadcrumb__item--current" aria-current="page">
                {{ pageTitle }}
              </li>
            </ol>
          </nav>
        </div>
        <div class="topbar__right">
          <span class="topbar__page-label">{{ pageTitle }}</span>
        </div>
      </header>

      <main id="main-content" class="main-content" tabindex="-1">
        <transition name="page" mode="out-in">
          <RouterView :key="route.fullPath" />
        </transition>
      </main>
    </div>
  </div>
</template>

<style scoped>
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0.75rem;
  z-index: 100;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  background: var(--surface-elevated);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  font-weight: 600;
  box-shadow: var(--shadow-md);
}

.skip-link:focus {
  left: 0.75rem;
  outline: none;
}

.skip-link:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.app-layout {
  min-height: 100vh;
  display: flex;
  background: var(--surface-canvas);
}

.main-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--surface-sidebar);
  border-right: 1px solid var(--border-subtle);
  min-height: 100vh;
}

.sidebar__brand {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.25rem 1.125rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
}

.sidebar__logo {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-md);
  background: var(--accent-muted);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar__product {
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  line-height: 1.2;
}

.sidebar__role {
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.sidebar__nav {
  flex: 1;
  padding: 1rem 0.75rem;
  overflow-y: auto;
}

.sidebar__section-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0 0.5rem 0.5rem;
}

.sidebar__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.55rem 0.625rem;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9375rem;
  border-left: 3px solid transparent;
  transition:
    background var(--motion-duration-fast) var(--motion-ease-out),
    color var(--motion-duration-fast) var(--motion-ease-out),
    border-color var(--motion-duration-fast) var(--motion-ease-out),
    transform var(--motion-duration-fast) var(--motion-ease-out);
}

@media (hover: hover) {
  .sidebar__link:hover {
    background: var(--surface-muted);
    color: var(--text-primary);
  }
}

@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .sidebar__link:hover {
    transform: translateX(2px);
  }
}

.sidebar__link--active {
  background: var(--accent-muted);
  color: var(--accent);
  border-left-color: var(--accent);
}

.sidebar__link--active .sidebar__icon {
  color: var(--accent);
}

.sidebar__icon {
  flex-shrink: 0;
  display: flex;
  color: var(--text-muted);
}

.sidebar__footer {
  margin-top: auto;
  padding: 0.875rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  position: sticky;
  bottom: 0;
  background: var(--surface-sidebar);
}

.sidebar__user {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.sidebar__avatar {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  background: var(--accent-muted);
  color: var(--accent);
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar__user-meta {
  min-width: 0;
}

.sidebar__user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.sidebar__logout {
  width: 100%;
  justify-content: center;
  font-size: 0.8125rem;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--surface-elevated);
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 10;
  transition:
    border-color var(--motion-duration-fast) var(--motion-ease-out),
    box-shadow var(--motion-duration-fast) var(--motion-ease-out);
}

.breadcrumb__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.breadcrumb__item:not(:last-child)::after {
  content: '/';
  margin-left: 0.35rem;
  color: var(--border-strong);
  pointer-events: none;
}

.breadcrumb__item a {
  color: var(--text-muted);
  font-weight: 500;
}

.breadcrumb__item a:hover {
  color: var(--accent);
}

.breadcrumb__item--current {
  color: var(--text-primary);
  font-weight: 600;
}

.topbar__page-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-muted);
}

.main-content {
  flex: 1;
  padding: 1.25rem 1.5rem 2rem;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .app-layout--authed {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    min-height: unset;
    border-right: none;
    border-bottom: 1px solid var(--border-subtle);
  }

  .sidebar__nav {
    max-height: none;
  }

  .sidebar__list {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sidebar__section-label {
    width: 100%;
  }

  .topbar__page-label {
    display: none;
  }
}
</style>
