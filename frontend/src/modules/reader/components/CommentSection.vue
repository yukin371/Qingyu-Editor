<template>
    <div class="comment-section">
        <div class="section-header">
            <h3>评论 ({{ total }})</h3>
            <el-button @click="showCommentDialog = true">
                <QyIcon name="Edit"  />
                发表评论
            </el-button>
        </div>

        <div class="comment-sort">
            <el-radio-group v-model="sortType" @change="handleSortChange">
                <el-radio-button label="latest">最新</el-radio-button>
                <el-radio-button label="hot">最热</el-radio-button>
            </el-radio-group>
        </div>

        <el-skeleton :loading="loading" :rows="3" animated>
            <div class="comment-list">
                <el-empty v-if="comments.length === 0" description="暂无评论" />

                <div v-for="comment in comments" :key="comment.id" class="comment-item">
                    <Avatar :src="comment.user.avatar" :alt="comment.user.nickname || comment.user.username" size="lg" />

                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="user-name">{{ comment.user.nickname || comment.user.username }}</span>
                            <span class="comment-time">{{ formatTime(comment.createdAt || comment.createTime) }}</span>
                        </div>

                        <div class="comment-text">{{ comment.content }}</div>

                        <div class="comment-actions">
                            <el-button text size="small" @click="handleLike(comment)"
                                :type="comment.isLiked ? 'primary' : 'default'">
                                <QyIcon name="Star" :filled="comment.isLiked"  />
                                {{ comment.likeCount }}
                            </el-button>
                            <el-button text size="small" @click="handleReply(comment)">
                                <QyIcon name="ChatDotRound"  />
                                回复
                            </el-button>
                        </div>

                        <!-- 回复列表 -->
                        <div v-if="comment.replies && comment.replies.length > 0" class="reply-list">
                            <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                                <span class="reply-user">{{ reply.user.nickname || reply.user.username }}</span>
                                <span class="reply-text">: {{ reply.content }}</span>
                                <span class="reply-time">{{ formatTime(reply.createdAt || reply.createTime) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </el-skeleton>

        <!-- 分页 -->
        <el-pagination v-if="total > pageSize" v-model:current-page="currentPage" v-model:page-size="pageSize"
            :total="total" layout="prev, pager, next" @current-change="handlePageChange"
            style="margin-top: 20px; justify-content: center" />

        <!-- 评论对话框 -->
        <el-dialog v-model="showCommentDialog" title="发表评论" width="500px">
            <el-input v-model="commentContent" type="textarea" :rows="4" placeholder="请输入评论内容..." maxlength="500"
                show-word-limit />
            <template #footer>
                <el-button @click="showCommentDialog = false">取消</el-button>
                <el-button type="primary" @click="handleSubmitComment" :loading="submitting">
                    发表
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyIcon } from '@/design-system/components'
import { Avatar } from '@/design-system/base'
import { formatDate } from '@/utils/format'
import { message } from '@/design-system/services'
import { commentsAPI as commentAPI } from '@/modules/reader/api/manual/comments'
import type { Comment } from '@/types/reader/index'

/**
 * 评论组件 Props (v1.3)
 */
interface Props {
    bookId: string // v1.3新增：需要传入bookId
    comments: Comment[]
    total: number
    loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    loading: false
})

const emit = defineEmits<{
    loadMore: [page: number, sortType: string]
    submit: [content: string, replyTo?: string]
    refresh: [] // 刷新评论列表
}>()

const sortType = ref('time')
const currentPage = ref(1)
const pageSize = ref(10)
const showCommentDialog = ref(false)
const commentContent = ref('')
const submitting = ref(false)
const replyToComment = ref<Comment | null>(null)

function formatTime(time: string | undefined): string {
    if (!time) return ''
    return formatDate(time, 'YYYY-MM-DD HH:mm')
}

function handleSortChange(type: string): void {
    currentPage.value = 1
    emit('loadMore', currentPage.value, type)
}

function handlePageChange(page: number): void {
    emit('loadMore', page, sortType.value)
}

async function handleSubmitComment(): Promise<void> {
    if (!commentContent.value.trim()) {
        message.warning('请输入评论内容')
        return
    }

    submitting.value = true
    try {
        emit('submit', commentContent.value, replyToComment.value?.id)
        commentContent.value = ''
        showCommentDialog.value = false
        replyToComment.value = null
        message.success('评论发表成功')
    } catch (error) {
        message.error('评论发表失败')
    } finally {
        submitting.value = false
    }
}

/**
 * 点赞/取消点赞 (v1.3新功能)
 */
async function handleLike(comment: Comment): Promise<void> {
    try {
        if (comment.isLiked) {
            // 取消点赞
            await commentAPI.unlikeComment(comment.id!)
            message.success('已取消点赞')
        } else {
            // 点赞
            await commentAPI.likeComment(comment.id!)
            message.success('点赞成功')
        }
        // 刷新评论列表以更新点赞状态
        emit('refresh')
    } catch (error: any) {
        message.error(error.message || '操作失败')
    }
}

function handleReply(comment: Comment): void {
    replyToComment.value = comment
    showCommentDialog.value = true
}
</script>

<style scoped lang="scss">
.comment-section {
    padding: 20px;
    background: #fff;
    border-radius: 8px;

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
            color: #303133;
        }
    }

    .comment-sort {
        margin-bottom: 20px;
    }

    .comment-list {
        .comment-item {
            display: flex;
            gap: 12px;
            padding: 16px 0;
            border-bottom: 1px solid #ebeef5;

            &:last-child {
                border-bottom: none;
            }

            .comment-content {
                flex: 1;

                .comment-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;

                    .user-name {
                        font-size: 14px;
                        font-weight: 500;
                        color: #303133;
                    }

                    .comment-time {
                        font-size: 12px;
                        color: #909399;
                    }
                }

                .comment-text {
                    font-size: 14px;
                    color: #606266;
                    line-height: 1.6;
                    margin-bottom: 8px;
                }

                .comment-actions {
                    display: flex;
                    gap: 16px;
                }

                .reply-list {
                    margin-top: 12px;
                    padding-left: 16px;
                    border-left: 2px solid #e4e7ed;

                    .reply-item {
                        font-size: 13px;
                        color: #606266;
                        line-height: 1.8;

                        .reply-user {
                            font-weight: 500;
                            color: #409EFF;
                        }

                        .reply-time {
                            margin-left: 8px;
                            font-size: 12px;
                            color: #909399;
                        }
                    }
                }
            }
        }
    }
}
</style>
