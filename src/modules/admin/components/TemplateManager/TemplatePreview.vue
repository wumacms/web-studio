<template>
  <div class="h-full overflow-y-auto bg-white">
    <div v-html="renderedHtml"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Handlebars from 'handlebars'

const props = defineProps<{
  html: string | undefined
  props: Record<string, any>
}>()

const renderedHtml = computed(() => {
  try {
    if (!props.html) return ''
    const template = Handlebars.compile(props.html)
    return template(props.props)
  } catch (error) {
    console.error('Render error:', error)
    return `<div class="p-8 text-red-500 font-mono text-xs bg-red-50">
      <div class="font-bold mb-2">Compilation Error:</div>
      \${(error as Error).message}
    </div>`
  }
})
</script>
