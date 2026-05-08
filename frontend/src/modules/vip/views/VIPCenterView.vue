<template>
  <div class="vip-center-view">
    <div class="container">
      <!-- VIP卡片 -->
      <div class="vip-card">
        <div class="vip-badge">
          <el-icon :size="48"><QyIcon name="Crown"  /></el-icon>
        </div>
        <h2 class="vip-title">VIP会员中心</h2>
        <p class="vip-subtitle">尊享特权，畅读无限</p>

        <!-- 会员等级 -->
        <div class="vip-levels">
          <div
            v-for="level in levels"
            :key="level.key"
            class="level-item"
            :class="{ active: selectedLevel === level.key }"
            @click="selectedLevel = level.key"
          >
            <div class="level-label">{{ level.label }}</div>
            <div class="level-price">{{ level.price }}</div>
          </div>
        </div>

        <!-- 购买按钮 -->
        <el-button type="primary" size="large" class="purchase-btn">
          立即开通
        </el-button>
      </div>

      <!-- 权益说明 -->
      <div class="benefits-section">
        <h3>会员权益</h3>
        <div class="benefits-placeholder">
          <el-empty description="会员权益展示开发中...">
            <template #image>
              <el-icon :size="100" color="#ddd">
                <QyIcon name="Present"  />
              </el-icon>
            </template>
          </el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyIcon } from '@/design-system/components'
const selectedLevel = ref('monthly')

const levels = [
  { key: 'monthly', label: '月卡', price: '¥19' },
  { key: 'quarterly', label: '季卡', price: '¥49' },
  { key: 'yearly', label: '年卡', price: '¥149' }
]
</script>

<style scoped lang="scss">
.vip-center-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.vip-card {
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.2);

  .vip-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    border-radius: 50%;
    color: #8B4513;
    margin-bottom: 20px;
  }

  .vip-title {
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    margin: 0 0 8px 0;
  }

  .vip-subtitle {
    font-size: 16px;
    color: #666;
    margin: 0 0 32px 0;
  }

  .vip-levels {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 32px;

    .level-item {
      flex: 1;
      max-width: 140px;
      padding: 16px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #667eea;
        background: #f8f9ff;
      }

      &.active {
        border-color: #667eea;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
      }

      .level-label {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .level-price {
        font-size: 20px;
        font-weight: 700;
      }
    }
  }

  .purchase-btn {
    width: 200px;
    height: 48px;
    font-size: 18px;
    font-weight: 600;
  }
}

.benefits-section {
  margin-top: 24px;
  background: #fff;
  border-radius: 20px;
  padding: 24px;

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 20px 0;
  }

  .benefits-placeholder {
    padding: 20px;
    text-align: center;
  }
}
</style>
