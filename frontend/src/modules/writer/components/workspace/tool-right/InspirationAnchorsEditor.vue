<template>
  <section class="inspiration-anchors-editor">
    <section class="inspiration-anchors-editor__compact">
      <div class="inspiration-anchors-editor__section-head"><h4>定位声明</h4></div>
      <textarea
        :value="pitchLine"
        rows="3"
        placeholder="例如：一个被流放的调查员，要在会吃人的规则副本里查清自己的父亲为什么消失。"
        @input="$emit('update:pitch-line', getValue($event))"
      ></textarea>
    </section>

    <section class="inspiration-anchors-editor__anchors">
      <div class="inspiration-anchors-editor__section-head"><h4>创作锚点</h4></div>

      <div class="inspiration-anchors-editor__grid">
        <section class="inspiration-anchors-editor__block">
          <h5>目标读者</h5>
          <div class="inspiration-anchors-editor__token-entry">
            <input
              :value="audienceDraft"
              type="text"
              placeholder="输入一个读者偏好，例如：喜欢高压反转"
              @input="$emit('update:audience-draft', getValue($event))"
              @keydown.enter.prevent="$emit('append-token', 'audience')"
            />
            <button type="button" @click="$emit('append-token', 'audience')">添加</button>
          </div>

          <div class="inspiration-anchors-editor__token-list">
            <span
              v-for="audience in targetAudience"
              :key="audience"
              class="inspiration-anchors-editor__token"
            >
              {{ audience }}
              <button type="button" @click="$emit('remove-token', 'audience', audience)">×</button>
            </span>
          </div>
        </section>

        <section class="inspiration-anchors-editor__block">
          <h5>核心承诺</h5>
          <div class="inspiration-anchors-editor__token-entry">
            <input
              :value="promiseDraft"
              type="text"
              placeholder="输入一个承诺，例如：第三章先兑现一次打脸"
              @input="$emit('update:promise-draft', getValue($event))"
              @keydown.enter.prevent="$emit('append-token', 'promise')"
            />
            <button type="button" @click="$emit('append-token', 'promise')">添加</button>
          </div>

          <div class="inspiration-anchors-editor__token-list">
            <span
              v-for="promise in corePromises"
              :key="promise"
              class="inspiration-anchors-editor__token inspiration-anchors-editor__token--promise"
            >
              {{ promise }}
              <button type="button" @click="$emit('remove-token', 'promise', promise)">×</button>
            </span>
          </div>
        </section>
      </div>

      <section class="inspiration-anchors-editor__block inspiration-anchors-editor__block--full">
        <h5>节奏合约</h5>
        <textarea
          :value="paceContract"
          rows="3"
          placeholder="例如：前 3000 字建立压制，第三章必须完成第一次反击兑现。"
          @input="$emit('update:pace-contract', getValue($event))"
        ></textarea>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  pitchLine: string
  audienceDraft: string
  promiseDraft: string
  targetAudience: string[]
  corePromises: string[]
  paceContract: string
}>()

defineEmits<{
  (e: 'update:pitch-line', value: string): void
  (e: 'update:audience-draft', value: string): void
  (e: 'update:promise-draft', value: string): void
  (e: 'update:pace-contract', value: string): void
  (e: 'append-token', kind: 'audience' | 'promise'): void
  (e: 'remove-token', kind: 'audience' | 'promise', value: string): void
}>()

const getValue = (event: Event) =>
  ((event.target as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? '').trim()
</script>

<style scoped lang="scss">
.inspiration-anchors-editor {
  display: grid;
  gap: 16px;
}

.inspiration-anchors-editor__compact,
.inspiration-anchors-editor__anchors,
.inspiration-anchors-editor__block {
  display: grid;
  gap: 10px;
}

.inspiration-anchors-editor__section-head {
  display: flex;
  align-items: center;
  gap: 12px;

  h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: var(--editor-text-primary, #0f172a);
  }
}

.inspiration-anchors-editor__block h5 {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--editor-text-primary, #0f172a);
}

.inspiration-anchors-editor__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.inspiration-anchors-editor__block--full {
  padding-top: 2px;
}

.inspiration-anchors-editor__token-entry {
  display: flex;
  align-items: center;
  gap: 12px;

  input {
    flex: 1;
  }

  button {
    height: 34px;
    padding: 0 12px;
    border-radius: 12px;
    border: 1px solid rgba(251, 191, 36, 0.28);
    background: rgba(255, 255, 255, 0.94);
    color: #b45309;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
}

.inspiration-anchors-editor__compact textarea,
.inspiration-anchors-editor__compact input,
.inspiration-anchors-editor__block textarea,
.inspiration-anchors-editor__token-entry input {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 12px;
  padding: 10px 12px;
  outline: none;
  resize: vertical;
  background: rgba(255, 255, 255, 0.94);
  color: var(--editor-text-primary, #0f172a);
  font: inherit;
}

.inspiration-anchors-editor__token-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.inspiration-anchors-editor__token {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 247, 237, 0.94);
  color: #9a3412;
  font-size: 12px;
  font-weight: 600;

  button {
    border: none;
    background: transparent;
    padding: 0;
    color: inherit;
    cursor: pointer;
  }
}

.inspiration-anchors-editor__token--promise {
  background: rgba(254, 242, 242, 0.94);
  color: #b91c1c;
}

@media (max-width: 1200px) {
  .inspiration-anchors-editor__grid {
    grid-template-columns: 1fr;
  }
}
</style>
