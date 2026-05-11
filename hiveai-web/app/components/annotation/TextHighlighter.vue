<template>
  <div class="text-highlighter">
    <div class="flex flex-wrap items-center gap-2 mb-3">
      <span class="text-xs text-gray-500 dark:text-gray-400">Entity type:</span>
      <button
        v-for="entity in entities"
        :key="entity"
        @click="activeEntity = entity"
        class="px-3 py-1 text-xs rounded-full border transition-colors"
        :class="activeEntity === entity ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
      >
        {{ entity }}
      </button>
    </div>

    <div
      class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm leading-relaxed select-text cursor-text relative"
      ref="textContainer"
      @mouseup="onSelection"
    >
      <span
        v-for="(segment, idx) in renderedSegments"
        :key="idx"
        :class="segment.entity ? `highlighted-entity entity-${entities.indexOf(segment.entity) % 6}` : ''"
        :title="segment.entity || undefined"
      >{{ segment.text }}<span
          v-if="segment.entity"
          class="entity-badge"
          @click.stop="removeHighlight(idx)"
        >{{ segment.entity }} ×</span></span>
    </div>

    <div class="mt-3 flex items-center justify-between">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ highlights.length }} highlight{{ highlights.length !== 1 ? 's' : '' }}. Select text to annotate. Click badge to remove.
      </p>
      <button @click="undoLast" :disabled="highlights.length === 0" class="text-xs text-indigo-600 hover:underline disabled:opacity-40">
        <i class="pi pi-undo mr-1"></i>Undo
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Highlight {
  start: number
  end: number
  entity: string
  text: string
}

interface Segment {
  text: string
  entity?: string
  highlightIdx?: number
}

const props = defineProps<{
  text: string
  entities: string[]
}>()

const emit = defineEmits<{
  (e: 'update', highlights: Highlight[]): void
}>()

const textContainer = ref<HTMLDivElement>()
const activeEntity = ref(props.entities[0] || 'ENTITY')
const highlights = ref<Highlight[]>([])

const renderedSegments = computed<Segment[]>(() => {
  if (highlights.value.length === 0) return [{ text: props.text }]

  const sorted = [...highlights.value].sort((a, b) => a.start - b.start)
  const segments: Segment[] = []
  let lastEnd = 0

  for (let i = 0; i < sorted.length; i++) {
    const h = sorted[i]
    if (!h) continue
    if (h.start > lastEnd) {
      segments.push({ text: props.text.slice(lastEnd, h.start) })
    }
    segments.push({ text: h.text, entity: h.entity, highlightIdx: i })
    lastEnd = h.end
  }

  if (lastEnd < props.text.length) {
    segments.push({ text: props.text.slice(lastEnd) })
  }

  return segments
})

const onSelection = () => {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || !textContainer.value) return

  const range = sel.getRangeAt(0)
  const selectedText = sel.toString().trim()
  if (!selectedText) return

  // Calculate offset within the full text
  const fullText = props.text
  const startIdx = fullText.indexOf(selectedText)
  if (startIdx === -1) return

  // Check for overlap
  const endIdx = startIdx + selectedText.length
  const overlaps = highlights.value.some(
    h => (startIdx < h.end && endIdx > h.start)
  )
  if (overlaps) {
    sel.removeAllRanges()
    return
  }

  highlights.value.push({
    start: startIdx,
    end: endIdx,
    entity: activeEntity.value,
    text: selectedText,
  })

  emit('update', [...highlights.value])
  sel.removeAllRanges()
}

const removeHighlight = (segIdx: number) => {
  // Find which highlight corresponds to this segment
  const segment = renderedSegments.value[segIdx]
  if (!segment || segment.highlightIdx === undefined) return
  highlights.value.splice(segment.highlightIdx, 1)
  emit('update', [...highlights.value])
}

const undoLast = () => {
  highlights.value.pop()
  emit('update', [...highlights.value])
}
</script>

<style scoped>
.highlighted-entity {
  border-radius: 3px;
  padding: 1px 2px;
}
.entity-badge {
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
  margin-left: 2px;
  cursor: pointer;
  vertical-align: super;
  opacity: 0.9;
}
.entity-0 { background: rgba(79, 70, 229, 0.15); }
.entity-0 .entity-badge { background: rgba(79, 70, 229, 0.3); }
.entity-1 { background: rgba(5, 150, 105, 0.15); }
.entity-1 .entity-badge { background: rgba(5, 150, 105, 0.3); }
.entity-2 { background: rgba(217, 119, 6, 0.15); }
.entity-2 .entity-badge { background: rgba(217, 119, 6, 0.3); }
.entity-3 { background: rgba(220, 38, 38, 0.15); }
.entity-3 .entity-badge { background: rgba(220, 38, 38, 0.3); }
.entity-4 { background: rgba(124, 58, 237, 0.15); }
.entity-4 .entity-badge { background: rgba(124, 58, 237, 0.3); }
.entity-5 { background: rgba(8, 145, 178, 0.15); }
.entity-5 .entity-badge { background: rgba(8, 145, 178, 0.3); }
</style>
