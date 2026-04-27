<template>
  <div class="relative group h-full flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden focus-within:border-primary/50 transition-all">
    <!-- Toolbar -->
    <div class="flex items-center justify-between px-4 py-2 bg-gray-950/50 border-b border-gray-800 flex-none">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500/30"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-yellow-500/30"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-green-500/30"></span>
        </div>
        <div class="h-4 w-px bg-gray-800"></div>
        <div class="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
          <component :is="languageIcon" class="w-3 h-3" />
          {{ language || 'Text' }}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button 
          @click="formatCode"
          class="flex items-center gap-1.5 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border border-gray-700 active:scale-95"
          title="Format Code (Alt+Shift+F)"
        >
          <Zap class="w-3 h-3 text-yellow-500" />
          Format
        </button>
      </div>
    </div>
    
    <!-- Monaco Container -->
    <div ref="editorContainer" class="flex-1 min-h-0"></div>
    
    <!-- Footer / Status Bar -->
    <div class="flex items-center justify-between px-4 py-1.5 bg-gray-950/30 border-t border-gray-800/50 flex-none text-[9px] font-medium text-gray-600">
      <div class="flex items-center gap-4">
        <span>Line {{ cursorPosition.line }}, Col {{ cursorPosition.column }}</span>
        <span>Spaces: 2</span>
      </div>
      <div>Monaco Engine</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, shallowRef } from 'vue'
import * as monaco from 'monaco-editor'
import { Zap, FileCode, Braces } from 'lucide-vue-next'
import * as prettier from 'prettier/standalone'
import * as prettierPluginHtml from 'prettier/plugins/html'
import * as prettierPluginBabel from 'prettier/plugins/babel'
import * as prettierPluginEstree from 'prettier/plugins/estree'

const props = defineProps<{
  modelValue: string | undefined
  language?: 'html' | 'json' | string
}>()

const emit = defineEmits(['update:modelValue'])

const editorContainer = ref<HTMLElement | null>(null)
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | null>(null)
const cursorPosition = ref({ line: 1, column: 1 })

const languageIcon = computed(() => {
  return props.language === 'json' ? Braces : FileCode
})

// Initialize Monaco
onMounted(() => {
  if (!editorContainer.value) return

  editor.value = monaco.editor.create(editorContainer.value, {
    value: props.modelValue || '',
    language: props.language || 'html',
    theme: 'vs-dark',
    automaticLayout: true,
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    lineNumbers: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    padding: { top: 16, bottom: 16 },
    tabSize: 2,
    insertSpaces: true,
    cursorSmoothCaretAnimation: 'on',
    smoothScrolling: true,
    roundedSelection: true,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      useShadows: false,
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8
    }
  })

  // Value update from editor to parent
  editor.value.onDidChangeModelContent(() => {
    const value = editor.value?.getValue()
    if (value !== props.modelValue) {
      emit('update:modelValue', value)
    }
  })

  // Track cursor position
  editor.value.onDidChangeCursorPosition((e) => {
    cursorPosition.value = {
      line: e.position.lineNumber,
      column: e.position.column
    }
  })

  // Add format shortcut
  editor.value.addCommand(monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
    formatCode()
  })
})

// Sync value from parent to editor
watch(() => props.modelValue, (newVal) => {
  if (editor.value && newVal !== editor.value.getValue()) {
    editor.value.setValue(newVal || '')
  }
})

// Sync language
watch(() => props.language, (newLang) => {
  if (editor.value && newLang) {
    monaco.editor.setModelLanguage(editor.value.getModel()!, newLang)
  }
})

// Format Logic
const formatCode = async () => {
  if (!editor.value) return
  const currentContent = editor.value.getValue()
  
  try {
    const formatted = await prettier.format(currentContent, {
      parser: props.language === 'json' ? 'json' : 'html',
      plugins: [prettierPluginHtml, prettierPluginBabel, prettierPluginEstree],
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: false,
    })
    
    editor.value.setValue(formatted)
  } catch (error) {
    console.error('Format failed:', error)
    // Optional: Show a toast or notification
  }
}

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.dispose()
  }
})
</script>

<style>
/* Monaco Theme Overrides */
.monaco-editor {
  padding-top: 4px;
}
.monaco-editor .margin {
  background-color: transparent !important;
}
/* Ensure dark mode look */
.vs-dark .monaco-scrollable-element {
  background-color: #030712 !important; /* gray-950 */
}
</style>
