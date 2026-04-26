import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '@/plugins/i18n'

export const useAppStore = defineStore('app', () => {
  const locale = ref(localStorage.getItem('locale') || 'zh-CN')

  const setLocale = (newLocale: string) => {
    locale.value = newLocale
    localStorage.setItem('locale', newLocale)
    // @ts-ignore
    i18n.global.locale.value = newLocale
  }

  return {
    locale,
    setLocale
  }
})
