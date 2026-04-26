<template>
  <button
    :class="[
      'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:pointer-events-none',
      variantClasses[variant],
      sizeClasses[size]
    ]"
    :disabled="loading || disabled"
  >
    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false
})

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20',
  secondary: 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700',
  outline: 'bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white',
  ghost: 'bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
}
</script>
