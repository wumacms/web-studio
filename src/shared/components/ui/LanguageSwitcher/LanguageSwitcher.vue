<template>
  <div class="relative inline-block text-left">
    <button
      @click="isOpen = !isOpen"
      class="inline-flex items-center justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      {{ currentLanguageLabel }}
      <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>

    <div
      v-if="isOpen"
      class="origin-top-right absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
    >
      <div class="py-1">
        <a
          v-for="lang in languages"
          :key="lang.code"
          href="#"
          @click.prevent="selectLanguage(lang.code)"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          :class="{ 'bg-gray-100 font-bold': appStore.locale === lang.code }"
        >
          {{ lang.label }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/modules/app/stores/appStore'

const appStore = useAppStore()
const isOpen = ref(false)

const languages = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'en-US', label: 'English' }
]

const currentLanguageLabel = computed(() => {
  return languages.find(l => l.code === appStore.locale)?.label || 'Language'
})

const selectLanguage = (code: string) => {
  appStore.setLocale(code)
  isOpen.value = false
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>
