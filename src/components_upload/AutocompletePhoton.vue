<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const query = ref(props.modelValue)
const suggestions = ref<any[]>([])
let timeoutId: number

watch(
  () => props.modelValue,
  (newVal) => {
    query.value = newVal
  }
)

async function searchPhoton(q: string) {
  if (!q) {
    suggestions.value = []
    return
  }

  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5`
  const res = await fetch(url)
  const data = await res.json()
  suggestions.value = data.features.map((f: any) => ({
    name: f.properties.name || '',
    city: f.properties.city || f.properties.locality || '',
    country: f.properties.country || '',
    coords: f.geometry.coordinates
  }))
}

function handleInput() {
  clearTimeout(timeoutId)
  timeoutId = window.setTimeout(() => {
    searchPhoton(query.value)
    emit('update:modelValue', query.value)
  }, 300)
}

function selectSuggestion(s: any) {
  const formatted = `${s.name}, ${s.city}, ${s.country}`
  query.value = formatted
  emit('update:modelValue', formatted)
  suggestions.value = []
}

const isDisabled = computed(() => props.disabled ?? false)
</script>

<template>
  <div class="autocomplete">
    <input
      type="text"
      v-model="query"
      @input="handleInput"
      placeholder="Enter location"
      :disabled="isDisabled "
    />
    <ul v-if="suggestions.length">
      <li
        v-for="(s, i) in suggestions"
        :key="i"
        @click="selectSuggestion(s)"
      >
        {{ s.name }} <span v-if="s.city">({{ s.city }})</span>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
input {
  width: 100%;
  padding: 0.5vw 1vw;
  border-radius: 20px;
  border: 1px solid lightgray;
}
.autocomplete {
  width: 100%;
  position: relative;
}
ul {
  position: absolute;
  background: $color-background;
  border: 1px solid $color-background-tertiary;
  width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 999;
}
li {
  padding: 8px;
  cursor: pointer;
}
li:hover {
  background: $color-primary;
  color: white;
}
@media screen and (min-width: 1025px) {
  input {
    font-size: px-to-vw(15);
  }
}
@media screen and (max-width: 1025px) {
  input {
    font-size: px-to-vw(20);
  }
}
@media screen and (max-width: 950px) {
  input {
    font-size: px-to-vw(30);
  }
}
@media screen and (max-width: 550px) {
  input {
    font-size: px-to-vw(50);
  }
}
</style>
