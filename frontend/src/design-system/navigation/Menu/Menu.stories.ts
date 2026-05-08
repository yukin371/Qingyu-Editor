import type { Meta, StoryObj } from '@storybook/vue3'
import { Menu, MenuItem, MenuSub, MenuItemGroup } from './index'

/**
 * Menu 组件 Storybook 故事
 *
 * 展示菜单的各种模式和状态
 */

const meta = {
  title: 'Design System/Navigation/Menu',
  component: Menu,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: '菜单模式',
    },
    defaultActive: {
      control: 'text',
      description: '默认激活菜单',
    },
    collapse: {
      control: 'boolean',
      description: '折叠模式（仅垂直）',
    },
    uniqueOpened: {
      control: 'boolean',
      description: '只保持一个子菜单展开',
    },
    backgroundColor: {
      control: 'color',
      description: '背景色',
    },
    textColor: {
      control: 'color',
      description: '文字颜色',
    },
    activeTextColor: {
      control: 'color',
      description: '激活文字颜色',
    },
  },
  args: {
    mode: 'vertical',
    defaultActive: '',
    collapse: false,
    uniqueOpened: false,
    backgroundColor: undefined,
    textColor: undefined,
    activeTextColor: undefined,
  },
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

// 图标组件
const HomeIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  `,
}

const UserIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  `,
}

const SettingsIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  `,
}

const DocumentIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  `,
}

const FolderIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  `,
}

const ChevronRightIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  `,
}

// 1. Default - 基础菜单
export const Default: Story = {
  render: () => ({
    components: { Menu, MenuItem },
    template: `
      <div class="p-8 w-64">
        <Menu default-active="1">
          <MenuItem index="1">首页</MenuItem>
          <MenuItem index="2">用户管理</MenuItem>
          <MenuItem index="3">系统设置</MenuItem>
          <MenuItem index="4">帮助中心</MenuItem>
        </Menu>
      </div>
    `,
  }),
}

// 2. Horizontal - 水平菜单
export const Horizontal: Story = {
  render: () => ({
    components: { Menu, MenuItem },
    template: `
      <div class="p-8">
        <Menu mode="horizontal" default-active="1">
          <MenuItem index="1">首页</MenuItem>
          <MenuItem index="2">产品中心</MenuItem>
          <MenuItem index="3">解决方案</MenuItem>
          <MenuItem index="4">关于我们</MenuItem>
        </Menu>
      </div>
    `,
  }),
}

// 3. Vertical - 垂直菜单
export const Vertical: Story = {
  render: () => ({
    components: { Menu, MenuItem },
    template: `
      <div class="p-8 w-64">
        <Menu mode="vertical" default-active="2">
          <MenuItem index="1">导航一</MenuItem>
          <MenuItem index="2">导航二</MenuItem>
          <MenuItem index="3">导航三</MenuItem>
          <MenuItem index="4">导航四</MenuItem>
        </Menu>
      </div>
    `,
  }),
}

// 4. WithIcons - 带图标
export const WithIcons: Story = {
  render: () => ({
    components: { Menu, MenuItem, HomeIcon, UserIcon, SettingsIcon, DocumentIcon },
    template: `
      <div class="p-8 w-64">
        <Menu default-active="1">
          <MenuItem index="1">
            <template #icon>
              <HomeIcon />
            </template>
            首页
          </MenuItem>
          <MenuItem index="2">
            <template #icon>
              <UserIcon />
            </template>
            用户管理
          </MenuItem>
          <MenuItem index="3">
            <template #icon>
              <DocumentIcon />
            </template>
            文档中心
          </MenuItem>
          <MenuItem index="4">
            <template #icon>
              <SettingsIcon />
            </template>
            系统设置
          </MenuItem>
        </Menu>
      </div>
    `,
  }),
}

// 5. Submenu - 子菜单
export const Submenu: Story = {
  render: () => ({
    components: { Menu, MenuItem, MenuSub, FolderIcon, ChevronRightIcon },
    template: `
      <div class="p-8 w-64">
        <Menu default-active="1" default-openeds=["2"]>
          <MenuItem index="1">首页</MenuItem>
          <MenuSub index="2">
            <template #icon>
              <FolderIcon />
            </template>
            <template #title>产品中心</template>
            <MenuItem index="2-1">产品列表</MenuItem>
            <MenuItem index="2-2">产品分类</MenuItem>
            <MenuItem index="2-3">产品标签</MenuItem>
          </MenuSub>
          <MenuItem index="3">系统设置</MenuItem>
        </Menu>
      </div>
    `,
  }),
}

// 6. Nested - 多级嵌套
export const Nested: Story = {
  render: () => ({
    components: { Menu, MenuItem, MenuSub, FolderIcon },
    template: `
      <div class="p-8 w-64">
        <Menu default-active="1">
          <MenuItem index="1">首页</MenuItem>
          <MenuSub index="2">
            <template #icon>
              <FolderIcon />
            </template>
            <template #title>系统管理</template>
            <MenuItem index="2-1">用户管理</MenuItem>
            <MenuSub index="2-2">
              <template #title>权限管理</template>
              <MenuItem index="2-2-1">角色管理</MenuItem>
              <MenuItem index="2-2-2">权限分配</MenuItem>
            </MenuSub>
          </MenuSub>
          <MenuSub index="3">
            <template #icon>
              <FolderIcon />
            </template>
            <template #title>业务管理</template>
            <MenuItem index="3-1">订单管理</MenuItem>
            <MenuItem index="3-2">客户管理</MenuItem>
          </MenuSub>
        </Menu>
      </div>
    `,
  }),
}

// 7. Collapsed - 折叠模式
export const Collapsed: Story = {
  render: () => ({
    components: { Menu, MenuItem, MenuSub, HomeIcon, UserIcon, SettingsIcon },
    template: `
      <div class="p-8">
        <Menu mode="vertical" collapse>
          <MenuItem index="1">
            <template #icon>
              <HomeIcon />
            </template>
            首页
          </MenuItem>
          <MenuItem index="2">
            <template #icon>
              <UserIcon />
            </template>
            用户管理
          </MenuItem>
          <MenuSub index="3">
            <template #icon>
              <SettingsIcon />
            </template>
            <template #title>设置</template>
            <MenuItem index="3-1">基本设置</MenuItem>
            <MenuItem index="3-2">高级设置</MenuItem>
          </MenuSub>
        </Menu>
      </div>
    `,
  }),
}

// 8. Disabled - 禁用项
export const Disabled: Story = {
  render: () => ({
    components: { Menu, MenuItem },
    template: `
      <div class="p-8 w-64">
        <Menu default-active="1">
          <MenuItem index="1">正常菜单项</MenuItem>
          <MenuItem index="2" :disabled="true">禁用菜单项</MenuItem>
          <MenuItem index="3">正常菜单项</MenuItem>
          <MenuItem index="4" :disabled="true">另一个禁用项</MenuItem>
        </Menu>
      </div>
    `,
  }),
}

// 9. Grouped - 菜单分组
export const Grouped: Story = {
  render: () => ({
    components: { Menu, MenuItem, MenuItemGroup },
    template: `
      <div class="p-8 w-64">
        <Menu default-active="1">
          <MenuItem index="1">首页</MenuItem>
          <MenuItemGroup title="系统管理">
            <MenuItem index="2-1">用户管理</MenuItem>
            <MenuItem index="2-2">角色管理</MenuItem>
            <MenuItem index="2-3">权限管理</MenuItem>
          </MenuItemGroup>
          <MenuItemGroup title="业务管理">
            <MenuItem index="3-1">订单管理</MenuItem>
            <MenuItem index="3-2">客户管理</MenuItem>
          </MenuItemGroup>
        </Menu>
      </div>
    `,
  }),
}

// 10. CustomTheme - 自定义主题
export const CustomTheme: Story = {
  render: () => ({
    components: { Menu, MenuItem },
    template: `
      <div class="p-8 w-64">
        <Menu
          default-active="1"
          background-color="#1e293b"
          text-color="#f1f5f9"
          active-text-color="#60a5fa"
        >
          <MenuItem index="1">深色主题菜单</MenuItem>
          <MenuItem index="2">用户管理</MenuItem>
          <MenuItem index="3">系统设置</MenuItem>
          <MenuItem index="4">帮助中心</MenuItem>
        </Menu>
      </div>
    `,
  }),
}

// 11. UniqueOpened - 手风琴模式
export const UniqueOpened: Story = {
  render: () => ({
    components: { Menu, MenuItem, MenuSub, FolderIcon },
    template: `
      <div class="p-8 w-64">
        <Menu unique-opened>
          <MenuItem index="1">首页</MenuItem>
          <MenuSub index="2">
            <template #icon>
              <FolderIcon />
            </template>
            <template #title>系统管理</template>
            <MenuItem index="2-1">用户管理</MenuItem>
            <MenuItem index="2-2">角色管理</MenuItem>
          </MenuSub>
          <MenuSub index="3">
            <template #icon>
              <FolderIcon />
            </template>
            <template #title>业务管理</template>
            <MenuItem index="3-1">订单管理</MenuItem>
            <MenuItem index="3-2">客户管理</MenuItem>
          </MenuSub>
          <MenuSub index="4">
            <template #icon>
              <FolderIcon />
            </template>
            <template #title>数据统计</template>
            <MenuItem index="4-1">销售统计</MenuItem>
            <MenuItem index="4-2">访问统计</MenuItem>
          </MenuSub>
        </Menu>
      </div>
    `,
  }),
}

// 12. ActiveState - 激活状态
export const ActiveState: Story = {
  render: () => ({
    components: { Menu, MenuItem, MenuSub, FolderIcon },
    setup() {
      const activeIndex = '2-2'
      return { activeIndex }
    },
    template: `
      <div class="p-8 w-64">
        <Menu :default-active="activeIndex">
          <MenuItem index="1">首页</MenuItem>
          <MenuSub index="2">
            <template #icon>
              <FolderIcon />
            </template>
            <template #title>系统管理</template>
            <MenuItem index="2-1">用户管理</MenuItem>
            <MenuItem index="2-2">角色管理（激活）</MenuItem>
            <MenuItem index="2-3">权限管理</MenuItem>
          </MenuSub>
          <MenuItem index="3">系统设置</MenuItem>
        </Menu>
      </div>
    `,
  }),
}

// 13. Interactive - 交互测试
export const Interactive: Story = {
  render: () => ({
    components: { Menu, MenuItem, MenuSub, FolderIcon },
    setup() {
      const handleSelect = (index: string) => {
        console.log('Selected:', index)
        alert(`选中菜单: ${index}`)
      }
      const handleOpen = (index: string) => {
        console.log('Opened:', index)
      }
      const handleClose = (index: string) => {
        console.log('Closed:', index)
      }
      return { handleSelect, handleOpen, handleClose }
    },
    template: `
      <div class="p-8 w-64">
        <Menu
          @select="handleSelect"
          @open="handleOpen"
          @close="handleClose"
        >
          <MenuItem index="1">点击测试</MenuItem>
          <MenuSub index="2">
            <template #icon>
              <FolderIcon />
            </template>
            <template #title>展开/收起测试</template>
            <MenuItem index="2-1">子菜单项 1</MenuItem>
            <MenuItem index="2-2">子菜单项 2</MenuItem>
          </MenuSub>
        </Menu>
        <p class="mt-4 text-sm text-slate-500">点击菜单项查看控制台输出和弹窗</p>
      </div>
    `,
  }),
}
