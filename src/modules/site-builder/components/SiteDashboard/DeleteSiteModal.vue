<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" @click="$emit('close')"></div>
    <div class="bg-gray-900 border border-red-500/30 w-full max-w-md rounded-3xl p-8 relative shadow-2xl shadow-red-500/10">
      <div class="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
        <Trash2 class="w-8 h-8 text-red-500" />
      </div>
      
      <h2 class="text-2xl font-bold text-white mb-2">Delete site?</h2>
      <p class="text-gray-400 mb-6 text-sm leading-relaxed">
        This action is <span class="text-red-400 font-bold uppercase tracking-tighter">irreversible</span>. 
        It will permanently delete the site <span class="text-white font-semibold">"{{ siteName }}"</span> 
        and all its content, including the associated GitHub repository.
      </p>

      <div class="space-y-3">
        <label class="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Type <span class="text-white select-all">{{ siteName }}</span> to confirm:
        </label>
        <input 
          v-model="confirmationInput" 
          type="text"
          autofocus
          class="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors placeholder:text-gray-700"
          :placeholder="siteName"
          @keyup.enter="handleDelete"
        />
      </div>

      <div class="flex gap-4 mt-8">
        <button 
          @click="$emit('close')" 
          class="flex-1 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="handleDelete" 
          :disabled="confirmationInput !== siteName || deleting"
          class="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed hover:bg-red-500 transition-all active:scale-95"
        >
          <span v-if="deleting" class="flex items-center justify-center gap-2">
            <Loader2 class="w-4 h-4 animate-spin" />
            Deleting...
          </span>
          <span v-else>Delete Forever</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Trash2, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  siteName: string
  deleting: boolean
}>()

const emit = defineEmits(['close', 'confirm'])

const confirmationInput = ref('')

const handleDelete = () => {
  if (confirmationInput.value === props.siteName && !props.deleting) {
    emit('confirm')
  }
}
</script>
