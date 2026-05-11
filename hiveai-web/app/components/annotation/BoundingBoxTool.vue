<template>
  <div class="bounding-box-tool">
    <div class="flex items-center gap-2 mb-3">
      <button
        v-for="label in labels"
        :key="label"
        @click="activeLabel = label"
        class="px-3 py-1 text-xs rounded-full border transition-colors"
        :class="activeLabel === label ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
      >
        {{ label }}
      </button>
    </div>

    <div class="relative inline-block select-none" ref="containerRef">
      <img
        :src="imageUrl"
        alt="Annotation image"
        class="max-w-full rounded-lg"
        ref="imgRef"
        @load="onImageLoad"
        draggable="false"
      />
      <svg
        class="absolute inset-0 w-full h-full cursor-crosshair"
        @mousedown="startDraw"
        @mousemove="onDraw"
        @mouseup="endDraw"
        @mouseleave="endDraw"
      >
        <!-- Existing boxes -->
        <rect
          v-for="(box, idx) in boxes"
          :key="idx"
          :x="box.x"
          :y="box.y"
          :width="box.width"
          :height="box.height"
          fill="transparent"
          :stroke="labelColors[box.label] || '#4f46e5'"
          stroke-width="2"
          class="cursor-pointer"
          @click.stop="removeBox(idx)"
        />
        <text
          v-for="(box, idx) in boxes"
          :key="'lbl-' + idx"
          :x="box.x + 4"
          :y="box.y + 14"
          fill="white"
          font-size="12"
          class="pointer-events-none"
        >
          {{ box.label }}
        </text>
        <!-- Current drawing -->
        <rect
          v-if="drawing && currentBox"
          :x="currentBox.x"
          :y="currentBox.y"
          :width="currentBox.width"
          :height="currentBox.height"
          fill="rgba(79, 70, 229, 0.1)"
          stroke="#4f46e5"
          stroke-width="2"
          stroke-dasharray="4"
        />
      </svg>
    </div>

    <div class="flex items-center justify-between mt-3">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ boxes.length }} box{{ boxes.length !== 1 ? 'es' : '' }} drawn. Click a box to remove it.
      </p>
      <button @click="undoLast" :disabled="boxes.length === 0" class="text-xs text-indigo-600 hover:underline disabled:opacity-40">
        <i class="pi pi-undo mr-1"></i>Undo
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BBox {
  x: number
  y: number
  width: number
  height: number
  label: string
}

const props = defineProps<{
  imageUrl: string
  labels: string[]
}>()

const emit = defineEmits<{
  (e: 'update', boxes: BBox[]): void
}>()

const containerRef = ref<HTMLDivElement>()
const imgRef = ref<HTMLImageElement>()
const boxes = ref<BBox[]>([])
const activeLabel = ref(props.labels[0] || 'object')
const drawing = ref(false)
const startPos = ref({ x: 0, y: 0 })
const currentBox = ref<BBox | null>(null)

const labelColors: Record<string, string> = {}
const colors = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2']
props.labels.forEach((l, i) => {
  labelColors[l] = colors[i % colors.length] ?? '#4f46e5'
})

const onImageLoad = () => {}

const getRelativePos = (e: MouseEvent) => {
  const rect = containerRef.value!.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

const startDraw = (e: MouseEvent) => {
  drawing.value = true
  const pos = getRelativePos(e)
  startPos.value = pos
  currentBox.value = { x: pos.x, y: pos.y, width: 0, height: 0, label: activeLabel.value }
}

const onDraw = (e: MouseEvent) => {
  if (!drawing.value) return
  const pos = getRelativePos(e)
  const x = Math.min(startPos.value.x, pos.x)
  const y = Math.min(startPos.value.y, pos.y)
  const width = Math.abs(pos.x - startPos.value.x)
  const height = Math.abs(pos.y - startPos.value.y)
  currentBox.value = { x, y, width, height, label: activeLabel.value }
}

const endDraw = () => {
  if (!drawing.value || !currentBox.value) return
  drawing.value = false
  if (currentBox.value.width > 5 && currentBox.value.height > 5) {
    boxes.value.push({ ...currentBox.value })
    emit('update', [...boxes.value])
  }
  currentBox.value = null
}

const removeBox = (idx: number) => {
  boxes.value.splice(idx, 1)
  emit('update', [...boxes.value])
}

const undoLast = () => {
  boxes.value.pop()
  emit('update', [...boxes.value])
}
</script>
