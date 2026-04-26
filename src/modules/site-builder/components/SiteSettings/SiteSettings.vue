<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <div class="mb-12 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white mb-2">Site Settings</h1>
        <p class="text-gray-400 text-sm">Configure global elements, SEO, and localization.</p>
      </div>
      <div class="flex items-center gap-4">
        <!-- Locale Switcher -->
        <div v-if="i18nConfig.enabled.length > 1" class="flex items-center bg-gray-900 border border-gray-800 rounded-xl p-1 shadow-inner">
          <button 
            v-for="lang in i18nConfig.enabled" 
            :key="lang"
            @click="currentEditLocale = lang"
            :class="[
              'px-4 py-1.5 text-xs font-black uppercase rounded-lg transition-all',
              currentEditLocale === lang ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'
            ]"
          >
            {{ lang }}
          </button>
        </div>

        <button 
          @click="handleSave"
          :disabled="loading"
          class="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
        >
          <Save v-if="!loading" class="w-4 h-4" />
          <Loader2 v-else class="w-4 h-4 animate-spin" />
          {{ loading ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </div>

    <div class="space-y-8">
      <!-- Locale Indicator -->
      <div v-if="!isPrimaryLocale" class="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Languages class="w-5 h-5 text-primary" />
          <div>
            <p class="text-sm font-bold text-primary">Translation Mode: {{ currentEditLocale.toUpperCase() }}</p>
            <p class="text-[10px] text-primary/70">You are currently translating global elements. Primary language values are used as fallbacks.</p>
          </div>
        </div>
      </div>

      <!-- Navigation Config -->
      <section class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden transition-all" :class="{ 'ring-1 ring-primary/30 shadow-2xl shadow-primary/5': !isPrimaryLocale }">
        <div class="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <LayoutTemplate class="w-5 h-5 text-primary" />
            Global Navigation
          </h3>
          <span v-if="!isPrimaryLocale" class="text-[10px] font-black text-primary uppercase px-2 py-1 bg-primary/10 rounded">Translating</span>
        </div>
        <div class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Site Logo URL</label>
              <input :value="displayNavConfig.logo" @input="updateNav('logo', ($event.target as HTMLInputElement).value)" type="text" class="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Display Name</label>
              <input :value="displayNavConfig.site_name" @input="updateNav('site_name', ($event.target as HTMLInputElement).value)" type="text" class="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none" />
            </div>
          </div>
        </div>
      </section>

      <!-- Localization (i18n) -->
      <section v-if="isPrimaryLocale" class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-gray-800">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <Languages class="w-5 h-5 text-primary" />
            Localization (i18n) Settings
          </h3>
        </div>
        <div class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Primary Language</label>
              <select v-model="i18nConfig.primary" class="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none">
                <option value="en">English (en)</option>
                <option value="zh">Chinese (zh)</option>
                <option value="ja">Japanese (ja)</option>
                <option value="fr">French (fr)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Enabled Languages</label>
              <div class="flex flex-wrap gap-3">
                <label v-for="lang in ['en', 'zh', 'ja', 'fr', 'es', 'de']" :key="lang" class="flex items-center gap-2 bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <input type="checkbox" :value="lang" v-model="i18nConfig.enabled" class="w-4 h-4 rounded border-gray-700 bg-gray-900 text-primary" />
                  <span class="text-sm text-gray-300 uppercase">{{ lang }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer Config -->
      <section class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden transition-all" :class="{ 'ring-1 ring-primary/30 shadow-2xl shadow-primary/5': !isPrimaryLocale }">
        <div class="p-6 border-b border-gray-800 flex items-center justify-between">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <PanelBottom class="w-5 h-5 text-primary" />
            Global Footer
          </h3>
          <span v-if="!isPrimaryLocale" class="text-[10px] font-black text-primary uppercase px-2 py-1 bg-primary/10 rounded">Translating</span>
        </div>
        <div class="p-6 space-y-6">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Copyright Text</label>
            <input :value="displayFooterConfig.copyright" @input="updateFooter('copyright', ($event.target as HTMLInputElement).value)" type="text" class="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteStore } from '../../stores/siteStore'
import { Save, Loader2, LayoutTemplate, PanelBottom, Languages } from 'lucide-vue-next'

const route = useRoute()
const siteStore = useSiteStore()
const siteId = route.params.siteId as string
const loading = ref(false)

const navConfig = ref({
  logo: '',
  site_name: '',
  cta_button: { text: '', link: '' }
})

const footerConfig = ref({
  copyright: '© 2024 Web Studio'
})

const i18nConfig = ref({
  primary: 'en',
  enabled: ['en']
})

const currentEditLocale = ref('en')
const translations = ref<Record<string, any>>({})

const isPrimaryLocale = computed(() => currentEditLocale.value === i18nConfig.value.primary)

onMounted(async () => {
  await siteStore.fetchSiteDetails(siteId)
  if (siteStore.currentGlobals) {
    if (siteStore.currentGlobals.nav_config) navConfig.value = { ...navConfig.value, ...siteStore.currentGlobals.nav_config }
    if (siteStore.currentGlobals.footer_config) footerConfig.value = { ...footerConfig.value, ...siteStore.currentGlobals.footer_config }
    if (siteStore.currentGlobals.i18n_config) {
      i18nConfig.value = { ...i18nConfig.value, ...siteStore.currentGlobals.i18n_config }
      currentEditLocale.value = i18nConfig.value.primary || 'en'
    }
    if (siteStore.currentGlobals.translations) {
      translations.value = { ...siteStore.currentGlobals.translations }
    }
  }
})

// Current display data based on locale
const displayNavConfig = computed(() => {
  if (isPrimaryLocale.value) return navConfig.value
  return translations.value[currentEditLocale.value]?.nav_config || { ...navConfig.value }
})

const displayFooterConfig = computed(() => {
  if (isPrimaryLocale.value) return footerConfig.value
  return translations.value[currentEditLocale.value]?.footer_config || { ...footerConfig.value }
})

const updateNav = (key: string, value: any) => {
  if (isPrimaryLocale.value) {
    navConfig.value[key as keyof typeof navConfig.value] = value
  } else {
    if (!translations.value[currentEditLocale.value]) translations.value[currentEditLocale.value] = {}
    if (!translations.value[currentEditLocale.value].nav_config) {
      translations.value[currentEditLocale.value].nav_config = { ...navConfig.value }
    }
    translations.value[currentEditLocale.value].nav_config[key] = value
  }
}

const updateFooter = (key: string, value: any) => {
  if (isPrimaryLocale.value) {
    footerConfig.value[key as keyof typeof footerConfig.value] = value
  } else {
    if (!translations.value[currentEditLocale.value]) translations.value[currentEditLocale.value] = {}
    if (!translations.value[currentEditLocale.value].footer_config) {
      translations.value[currentEditLocale.value].footer_config = { ...footerConfig.value }
    }
    translations.value[currentEditLocale.value].footer_config[key] = value
  }
}

const handleSave = async () => {
  loading.value = true
  try {
    await siteStore.saveGlobals({
      nav_config: navConfig.value,
      footer_config: footerConfig.value,
      i18n_config: i18nConfig.value,
      translations: translations.value
    })
    alert('Settings saved successfully!')
  } catch (error) {
    alert('Failed to save settings.')
  } finally {
    loading.value = false
  }
}
</script>
