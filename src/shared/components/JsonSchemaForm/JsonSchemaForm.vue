<template>
  <div class="space-y-6">
    <div v-for="(prop, key) in schema?.properties" :key="key" class="group">
      <!-- Field Label -->
      <label :for="String(key)" class="flex items-center justify-between mb-2">
        <span class="text-xs font-black uppercase tracking-widest text-gray-500 group-focus-within:text-primary transition-colors">
          {{ prop.title || key }}
          <span v-if="schema.required?.includes(String(key))" class="text-red-500 ml-1">*</span>
        </span>
        <span v-if="prop.type === 'array'" class="text-[9px] font-bold text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded uppercase tracking-tighter">List</span>
        <span v-if="prop.type === 'object' && !prop.properties" class="text-[9px] font-bold text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded uppercase tracking-tighter">Object</span>
      </label>

      <!-- Nested Object -->
      <template v-if="prop.type === 'object' && prop.properties">
        <div class="p-4 rounded-xl border border-gray-800 bg-gray-900/20 space-y-4">
          <JsonSchemaForm 
            v-model="internalValue[key]"
            :schema="prop"
          />
        </div>
      </template>

      <!-- Enum / Select -->
      <template v-else-if="prop.enum">
        <select
          :id="String(key)"
          v-model="internalValue[key]"
          @change="update"
          class="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-sm appearance-none"
        >
          <option v-for="opt in prop.enum" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </template>

      <!-- String Variants -->
      <template v-else-if="prop.type === 'string'">
        <!-- Color -->
        <div v-if="prop.format === 'color'" class="flex gap-3">
          <input
            type="color"
            v-model="internalValue[key]"
            @input="update"
            class="h-11 w-11 bg-gray-950 border border-gray-800 rounded-xl cursor-pointer"
          />
          <input
            type="text"
            v-model="internalValue[key]"
            @input="update"
            class="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-sm font-mono uppercase"
          />
        </div>
        
        <!-- Textarea -->
        <textarea
          v-else-if="prop.format === 'textarea'"
          :id="String(key)"
          v-model="internalValue[key]"
          @input="update"
          class="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-sm min-h-[100px] leading-relaxed"
          :placeholder="prop.description"
        ></textarea>

        <!-- URI / URL -->
        <div v-else-if="prop.format === 'uri'" class="relative">
          <input
            :id="String(key)"
            type="url"
            v-model="internalValue[key]"
            @input="update"
            class="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-primary transition-all text-sm"
            :placeholder="prop.description || 'https://...'"
          />
          <Link class="absolute left-3 top-3.5 w-4 h-4 text-gray-600" />
        </div>

        <!-- Default Input -->
        <input
          v-else
          :id="String(key)"
          type="text"
          v-model="internalValue[key]"
          @input="update"
          class="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-sm"
          :placeholder="prop.description"
        />
      </template>

      <!-- Number -->
      <template v-else-if="prop.type === 'number' || prop.type === 'integer'">
        <input
          :id="String(key)"
          type="number"
          v-model.number="internalValue[key]"
          @input="update"
          :min="prop.minimum"
          :max="prop.maximum"
          class="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all text-sm font-mono"
        />
      </template>

      <!-- Boolean -->
      <template v-else-if="prop.type === 'boolean'">
        <div class="flex items-center gap-3">
          <button 
            @click="internalValue[key] = !internalValue[key]; update()"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
            :class="internalValue[key] ? 'bg-primary' : 'bg-gray-800'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-lg"
              :class="internalValue[key] ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
          <span class="text-xs font-bold uppercase tracking-tight" :class="internalValue[key] ? 'text-primary' : 'text-gray-600'">
            {{ internalValue[key] ? 'Enabled' : 'Disabled' }}
          </span>
        </div>
      </template>

      <!-- Array -->
      <template v-else-if="prop.type === 'array'">
        <div class="space-y-4">
           <div v-for="(_, index) in internalValue[key]" :key="index" class="relative">
              <div class="p-4 rounded-xl border border-gray-800 bg-gray-900/40 group/item transition-all hover:border-gray-700">
                <div class="flex items-center justify-between mb-3 flex-none">
                  <span class="text-[10px] font-black text-gray-700 uppercase tracking-tighter">Item #{{ (index as number) + 1 }}</span>
                  <button @click="removeItem(key, index as number)" class="p-1 text-gray-600 hover:text-red-500 transition-colors">
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <!-- If item is object, recursive call -->
                <template v-if="prop.items?.type === 'object'">
                  <JsonSchemaForm 
                    v-model="internalValue[key][index]"
                    :schema="prop.items"
                  />
                </template>
                <!-- Else, simple input -->
                <template v-else>
                  <input 
                    v-model="internalValue[key][index]" 
                    @input="update"
                    class="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </template>
              </div>
           </div>

           <button 
             @click="addItem(key, prop.items)" 
             class="w-full py-3 border-2 border-dashed border-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
           >
             <Plus class="w-3 h-3" /> Add New Item
           </button>
        </div>
      </template>

      <p v-if="prop.description" class="mt-2 text-[10px] text-gray-600 italic leading-relaxed">
        {{ prop.description }}
      </p>
    </div>

    <!-- Empty State -->
    <div v-if="!schema?.properties || Object.keys(schema.properties).length === 0" class="text-center py-12 bg-gray-900/30 rounded-2xl border border-gray-800/50 border-dashed">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 mb-4">
        <Braces class="w-6 h-6 text-gray-600" />
      </div>
      <p class="text-gray-600 text-xs font-bold uppercase tracking-widest">No properties defined</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Link, Plus, Trash2, Braces } from 'lucide-vue-next'

const props = defineProps<{
  schema: any
  modelValue: Record<string, any>
}>()

const emit = defineEmits(['update:modelValue'])

const internalValue = ref({ ...props.modelValue })

watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(internalValue.value)) {
    internalValue.value = JSON.parse(JSON.stringify(newVal || {}))
  }
}, { deep: true })

const update = () => {
  emit('update:modelValue', { ...internalValue.value })
}

const addItem = (key: string | number, itemsSchema: any) => {
  if (!internalValue.value[key]) internalValue.value[key] = []
  
  let newItem: any = ''
  if (itemsSchema?.type === 'object') {
     newItem = {}
     Object.keys(itemsSchema.properties || {}).forEach(pk => {
       newItem[pk] = itemsSchema.properties[pk].default || ''
     })
  } else if (itemsSchema?.type === 'number') {
    newItem = 0
  } else if (itemsSchema?.type === 'boolean') {
    newItem = false
  }
  
  internalValue.value[key].push(newItem)
  update()
}

const removeItem = (key: string | number, index: number) => {
  internalValue.value[key].splice(index, 1)
  update()
}
</script>

<style scoped>
/* Ensure sub-forms are slightly tighter */
:deep(.space-y-6 > .group) {
  margin-top: 1rem;
}
</style>
