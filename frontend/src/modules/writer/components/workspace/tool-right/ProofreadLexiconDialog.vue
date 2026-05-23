<template>
  <QyModal
    :visible="visible"
    title="校对词库"
    width="680px"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="proofread-lexicon-dialog">
      <section class="proofread-lexicon-dialog__section">
        <div class="proofread-lexicon-dialog__section-head">
          <h4>白名单</h4>
          <span>{{ ignoredTerms.length }}</span>
        </div>
        <div v-if="ignoredTerms.length" class="proofread-lexicon-dialog__chips">
          <button
            v-for="term in ignoredTerms"
            :key="term"
            type="button"
            class="proofread-lexicon-dialog__chip"
            @click="removeIgnored(term)"
          >
            {{ term }}
            <span>×</span>
          </button>
        </div>
        <p v-else class="proofread-lexicon-dialog__empty">暂无白名单词。</p>
      </section>

      <section class="proofread-lexicon-dialog__section">
        <div class="proofread-lexicon-dialog__section-head">
          <h4>自定义错词</h4>
          <span>{{ customEntries.length }}</span>
        </div>

        <form class="proofread-lexicon-dialog__form" @submit.prevent="addEntry">
          <QyInput v-model="form.wrong" placeholder="错词，如：在接在厉" />
          <QyInput v-model="form.suggestion" placeholder="建议，如：再接再厉" />
          <button type="submit">添加</button>
        </form>

        <div v-if="customEntries.length" class="proofread-lexicon-dialog__entries">
          <article
            v-for="entry in customEntries"
            :key="entry.wrong"
            class="proofread-lexicon-dialog__entry"
          >
            <div>
              <strong>{{ entry.wrong }}</strong>
              <small>{{ entry.suggestions[0] || '无建议' }}</small>
            </div>
            <button type="button" @click="removeEntry(entry.wrong)">删除</button>
          </article>
        </div>
        <p v-else class="proofread-lexicon-dialog__empty">暂无自定义错词。</p>
      </section>

      <section class="proofread-lexicon-dialog__section">
        <div class="proofread-lexicon-dialog__section-head">
          <h4>导入 / 导出</h4>
          <span>JSON</span>
        </div>
        <div class="proofread-lexicon-dialog__import-actions">
          <button type="button" @click="prepareExport">导出</button>
          <button type="button" @click="importJson">导入</button>
        </div>
        <textarea
          v-model="lexiconJson"
          class="proofread-lexicon-dialog__textarea"
          rows="6"
          spellcheck="false"
          placeholder='{"ignoredTerms":["青羽城"],"entries":[{"wrong":"因该","suggestions":["应该"]}]}'
        ></textarea>
        <p v-if="importNotice" class="proofread-lexicon-dialog__notice">{{ importNotice }}</p>
        <p v-if="importError" class="proofread-lexicon-dialog__error">{{ importError }}</p>
      </section>
    </div>
  </QyModal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { QyInput, QyModal } from '@/design-system/components'
import {
  exportUserProofreadLexiconState,
  getUserProofreadIgnoredTerms,
  getUserProofreadLexicon,
  importUserProofreadLexicon,
  importUserProofreadLexiconState,
  removeUserProofreadIgnoredTerm,
  removeUserProofreadLexiconEntry,
  type ProofreadLexiconEntry,
  type UserProofreadLexiconState,
} from '@/modules/writer/services/proofreadLexicon.service'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'changed'): void
}>()

const ignoredTerms = ref<string[]>([])
const customEntries = ref<ProofreadLexiconEntry[]>([])
const form = reactive({
  wrong: '',
  suggestion: '',
})
const lexiconJson = ref('')
const importNotice = ref('')
const importError = ref('')

function refresh() {
  ignoredTerms.value = getUserProofreadIgnoredTerms()
  customEntries.value = getUserProofreadLexicon().entries
}

function notifyChanged() {
  refresh()
  emit('changed')
}

function prepareExport() {
  lexiconJson.value = JSON.stringify(exportUserProofreadLexiconState(), null, 2)
  importNotice.value = '已生成当前词库 JSON。'
  importError.value = ''
}

function importJson() {
  importNotice.value = ''
  importError.value = ''

  try {
    const parsed = JSON.parse(lexiconJson.value || '{}') as Partial<UserProofreadLexiconState>
    const result = importUserProofreadLexiconState(parsed)
    notifyChanged()
    importNotice.value = `已导入 ${result.ignoredTermCount} 个白名单词、${result.entryCount} 条错词。`
  } catch {
    importError.value = 'JSON 格式不正确，无法导入。'
  }
}

function removeIgnored(term: string) {
  removeUserProofreadIgnoredTerm(term)
  notifyChanged()
}

function removeEntry(wrong: string) {
  removeUserProofreadLexiconEntry(wrong)
  notifyChanged()
}

function addEntry() {
  const wrong = form.wrong.trim()
  const suggestion = form.suggestion.trim()
  if (!wrong) return

  importUserProofreadLexicon([
    {
      wrong,
      suggestions: suggestion ? [suggestion] : [],
      category: 'user_typo',
      severity: 'warning',
      message: suggestion
        ? `检测到自定义错词“${wrong}”，可改为“${suggestion}”。`
        : `检测到自定义错词“${wrong}”。`,
    },
  ])
  form.wrong = ''
  form.suggestion = ''
  notifyChanged()
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) refresh()
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.proofread-lexicon-dialog {
  display: grid;
  gap: 18px;
}

.proofread-lexicon-dialog__section {
  display: grid;
  gap: 10px;
}

.proofread-lexicon-dialog__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  h4 {
    margin: 0;
    color: var(--editor-text-primary, #0f172a);
    font-size: 14px;
  }

  span {
    color: var(--editor-text-secondary, #64748b);
    font-size: 12px;
  }
}

.proofread-lexicon-dialog__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.proofread-lexicon-dialog__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  border: 1px solid var(--editor-border, #d9dee6);
  border-radius: 999px;
  background: transparent;
  color: var(--editor-text-secondary, #475569);
  padding: 0 10px;
  cursor: pointer;
}

.proofread-lexicon-dialog__form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 8px;

  button {
    height: 36px;
    padding: 0 14px;
    border: 1px solid rgba(14, 165, 233, 0.28);
    border-radius: 8px;
    background: transparent;
    color: var(--editor-accent, #0284c7);
    font-weight: 700;
    cursor: pointer;
  }
}

.proofread-lexicon-dialog__entries {
  display: grid;
  gap: 8px;
}

.proofread-lexicon-dialog__entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid var(--editor-border, #e2e8f0);
  padding: 8px 0 0;

  div {
    display: grid;
    gap: 3px;
  }

  strong {
    color: var(--editor-text-primary, #0f172a);
    font-size: 13px;
  }

  small {
    color: var(--editor-text-secondary, #64748b);
  }

  button {
    border: 1px solid var(--editor-border, #d9dee6);
    border-radius: 8px;
    background: transparent;
    color: var(--editor-text-secondary, #475569);
    padding: 6px 10px;
    cursor: pointer;
  }
}

.proofread-lexicon-dialog__empty {
  margin: 0;
  color: var(--editor-text-secondary, #64748b);
  font-size: 12px;
}

.proofread-lexicon-dialog__import-actions {
  display: flex;
  gap: 8px;

  button {
    height: 32px;
    padding: 0 12px;
    border: 1px solid rgba(14, 165, 233, 0.28);
    border-radius: 8px;
    background: transparent;
    color: var(--editor-accent, #0284c7);
    font-weight: 700;
    cursor: pointer;
  }
}

.proofread-lexicon-dialog__textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid var(--editor-border, #d9dee6);
  border-radius: 8px;
  padding: 10px;
  color: var(--editor-text-primary, #0f172a);
  background: var(--editor-layer-panel, #fff);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
}

.proofread-lexicon-dialog__notice,
.proofread-lexicon-dialog__error {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
}

.proofread-lexicon-dialog__notice {
  color: var(--color-success-700, #15803d);
}

.proofread-lexicon-dialog__error {
  color: var(--color-danger-700, #b91c1c);
}
</style>
