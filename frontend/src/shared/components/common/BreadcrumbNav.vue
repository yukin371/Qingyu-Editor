<template>
  <div class="breadcrumb-nav">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbs"
        :key="index"
        :to="item.path ? { path: item.path } : undefined"
      >
        <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.title }}</span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled, Reading, Edit, User, Setting } from '@element-plus/icons-vue'

interface Breadcrumb {
  title: string
  path?: string
  icon?: any
}

interface Props {
  items?: Breadcrumb[]
  autoGenerate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoGenerate: true
})

const route = useRoute()

// 路由标题映射
const routeTitleMap: Record<string, string> = {
  '/bookstore': '首页',
  '/bookstore/books': '书库',
  '/bookstore/categories': '分类',
  '/bookstore/rankings': '榜单',
  '/writer': '创作中心',
  '/writer/dashboard': '工作台',
  '/writer/projects': '我的项目',
  '/writer/publish': '发布管理',
  '/writer/statistics': '数据统计',
  '/reading/bookshelf': '我的书架',
  '/reading/history': '阅读历史',
  '/account/profile': '个人中心',
  '/admin': '管理后台'
}

// 路由图标映射
const routeIconMap: Record<string, any> = {
  '/bookstore': HomeFilled,
  '/bookstore/books': Reading,
  '/writer': Edit,
  '/account/profile': User,
  '/admin': Setting
}

// 自动生成面包屑
const breadcrumbs = computed<Breadcrumb[]>(() => {
  if (props.items) {
    return props.items
  }

  if (!props.autoGenerate) {
    return []
  }

  const paths = route.path.split('/').filter(Boolean)
  const result: Breadcrumb[] = [
    { title: '首页', path: '/bookstore', icon: HomeFilled }
  ]

  let currentPath = ''
  paths.forEach((segment, index) => {
    currentPath += `/${segment}`
    const title = route.matched[index + 1]?.meta?.title as string || routeTitleMap[currentPath] || segment
    const icon = routeIconMap[currentPath]

    // 最后一项不添加路径（当前页面）
    if (index === paths.length - 1) {
      result.push({ title, icon })
    } else {
      result.push({ title, path: currentPath, icon })
    }
  })

  return result
})
</script>

<style scoped lang="scss">
.breadcrumb-nav {
  padding: 16px 0;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;

  :deep(.el-breadcrumb) {
    font-size: 14px;
  }

  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #606266;
      transition: color 0.3s;

      &:hover {
        color: #409eff;
      }
    }

    &:last-child .el-breadcrumb__inner {
      color: #303133;
      font-weight: 500;
    }
  }
}

@media (max-width: 768px) {
  .breadcrumb-nav {
    padding: 12px 0;

    :deep(.el-breadcrumb) {
      font-size: 13px;
    }
  }
}
</style>


