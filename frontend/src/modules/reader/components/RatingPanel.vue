<template>
    <div class="rating-panel">
        <div class="rating-summary">
            <div class="average-rating">
                <div class="rating-number">{{ averageRating.toFixed(1) }}</div>
                <el-rate v-model="averageRating" disabled show-score text-color="#ff9900"
                    :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :max="5" />
                <div class="rating-count">{{ totalRatings }} 人评分</div>
            </div>

            <div class="rating-distribution">
                <div v-for="star in 5" :key="star" class="distribution-item">
                    <span class="star-label">{{ 6 - star }}星</span>
                    <el-progress :percentage="getPercentage(6 - star)" :stroke-width="8" :show-text="false"
                        color="#F7BA2A" />
                    <span class="star-count">{{ getRatingCount(6 - star) }}</span>
                </div>
            </div>
        </div>

        <el-divider />

        <div class="my-rating">
            <h4>我的评分</h4>
            <el-rate v-model="myRating" :disabled="disabled" @change="handleRatingChange" size="large"
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :max="5" :min="1" />
            <el-button v-if="myRating > 0 && !disabled" type="primary" @click="handleSubmit" :loading="submitting">
                提交评分
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from '@/design-system/services'
interface Props {
    averageRating: number
    totalRatings: number
    ratingDistribution: Record<number, number>
    userRating?: number
    disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    userRating: 0,
    disabled: false
})

const emit = defineEmits<{
    submit: [rating: number]
}>()

const myRating = ref(props.userRating)
const submitting = ref(false)

function getPercentage(star: number): number {
    if (props.totalRatings === 0) return 0
    const count = props.ratingDistribution[star] || 0
    return Math.round((count / props.totalRatings) * 100)
}

function getRatingCount(star: number): number {
    return props.ratingDistribution[star] || 0
}

function handleRatingChange(value: number): void {
    console.log('Rating changed:', value)
}

async function handleSubmit(): Promise<void> {
    if (myRating.value === 0) {
        message.warning('请先选择评分')
        return
    }

    submitting.value = true
    try {
        emit('submit', myRating.value)
        message.success('评分提交成功')
    } catch (error) {
        message.error('评分提交失败')
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped lang="scss">
.rating-panel {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .rating-summary {
        display: flex;
        gap: 40px;

        .average-rating {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;

            .rating-number {
                font-size: 48px;
                font-weight: bold;
                color: #FF9900;
            }

            .rating-count {
                font-size: 14px;
                color: #909399;
            }
        }

        .rating-distribution {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;

            .distribution-item {
                display: flex;
                align-items: center;
                gap: 12px;

                .star-label {
                    width: 40px;
                    font-size: 14px;
                    color: #606266;
                }

                .el-progress {
                    flex: 1;
                }

                .star-count {
                    width: 40px;
                    text-align: right;
                    font-size: 14px;
                    color: #909399;
                }
            }
        }
    }

    .my-rating {
        text-align: center;

        h4 {
            margin: 0 0 16px;
            font-size: 16px;
            font-weight: 500;
            color: #303133;
        }

        .el-rate {
            margin-bottom: 16px;
        }
    }
}
</style>
