<template>
  <div class="qy-tiptap-toolbar">
    <button type="button" @click="run('toggleBold')" :class="{ active: isActive('bold') }"><strong>B</strong></button>
    <button type="button" @click="run('toggleItalic')" :class="{ active: isActive('italic') }"><em>I</em></button>
    <button type="button" @click="run('toggleUnderline')" :class="{ active: isActive('underline') }"><u>U</u></button>
    <span class="sep" />
    <button type="button" @click="run('toggleHeading', { level: 1 })" :class="{ active: isActive('heading', { level: 1 }) }">H1</button>
    <button type="button" @click="run('toggleHeading', { level: 2 })" :class="{ active: isActive('heading', { level: 2 }) }">H2</button>
    <button type="button" @click="run('toggleHeading', { level: 3 })" :class="{ active: isActive('heading', { level: 3 }) }">H3</button>
    <button type="button" @click="run('toggleBlockquote')" :class="{ active: isActive('blockquote') }">引用</button>
    <button type="button" @click="run('toggleCodeBlock')" :class="{ active: isActive('codeBlock') }">代码</button>
    <span class="sep" />
    <button type="button" @click="run('toggleBulletList')" :class="{ active: isActive('bulletList') }">无序</button>
    <button type="button" @click="run('toggleOrderedList')" :class="{ active: isActive('orderedList') }">有序</button>
    <span class="sep" />
    <button type="button" @click="run('undo')">撤销</button>
    <button type="button" @click="run('redo')">重做</button>
  </div>
</template>

<script setup lang="ts">
import type { Editor } from '@tiptap/core'

const props = defineProps<{
  editor?: Editor | null
}>()

function run(command: string, attrs?: Record<string, unknown>) {
  if (!props.editor) return
  const chain = props.editor.chain().focus() as any
  if (attrs) {
    chain[command](attrs).run()
    return
  }
  chain[command]().run()
}

function isActive(name: string, attrs?: Record<string, unknown>) {
  if (!props.editor) return false
  return attrs ? props.editor.isActive(name, attrs) : props.editor.isActive(name)
}
</script>

<style scoped>
.qy-tiptap-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
}
.qy-tiptap-toolbar button {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
}
.qy-tiptap-toolbar button.active {
  color: #fff;
  background: #409eff;
  border-color: #409eff;
}
.sep {
  width: 1px;
  height: 20px;
  background: #e4e7ed;
}
</style>
