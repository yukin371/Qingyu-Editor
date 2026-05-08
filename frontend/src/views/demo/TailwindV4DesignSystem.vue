<!--
  Tailwind v4 组件库展示页面

  展示基于 Tailwind v4 CSS-First 配置的新一代组件库
  包含完整的设计令牌系统和自定义工具类
-->
<template>
  <div class="min-h-screen" style="background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 25%, #e0e7ff 50%, #fae8ff 75%, #fce7f3 100%);">
    <!-- 添加更多装饰性背景元素，增强玻璃拟态效果 -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div class="absolute top-20 left-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
      <div class="absolute top-40 right-20 w-[500px] h-[500px] bg-blue-400/25 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 left-1/3 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-40 right-1/4 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-300/15 rounded-full blur-3xl"></div>
    </div>
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20 px-4">
      <!-- 背景光晕效果 -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-[float-complex_10s_ease-in-out_infinite]"></div>
        <div class="absolute top-40 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-[float-complex_15s_ease-in-out_infinite_2000]"></div>
      </div>

      <div class="container mx-auto relative z-10">
        <div class="text-center">
          <!-- 徽章 -->
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
            <QyIcon name="sparkles" size="sm" />
            <span class="text-sm font-medium">Tailwind v4 CSS-First</span>
          </div>

          <!-- 标题 -->
          <h1 class="text-5xl md:text-6xl font-bold mb-4">
            新一代组件库
          </h1>
          <p class="text-xl md:text-2xl text-white/90 mb-2">
            基于 Tailwind v4 CSS-First 配置
          </p>
          <p class="text-white/70 max-w-2xl mx-auto">
            完整的设计令牌系统 + CVA 变体管理 + Apple 风格美学
          </p>

          <!-- 统计数据 -->
          <div class="flex justify-center gap-8 mt-10">
            <div class="text-center">
              <div class="text-4xl font-bold">50+</div>
              <div class="text-sm text-white/70">组件</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold">100%</div>
              <div class="text-sm text-white/70">类型安全</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold">3</div>
              <div class="text-sm text-white/70">主题</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="container mx-auto px-4 py-12">
      <!-- 主题切换 -->
      <section class="mb-12">
        <div class="glass-card p-6">
          <h2 class="text-2xl font-bold text-slate-800 mb-4">主题系统</h2>
          <p class="text-slate-600 mb-6">选择一个主题，体验完整的设计令牌系统</p>

          <div class="flex flex-wrap gap-4">
            <button
              v-for="theme in themes"
              :key="theme.key"
              @click="switchTheme(theme.key)"
              :class="[
                'px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center gap-3',
                currentTheme === theme.key
                  ? 'ring-4 ring-offset-2 scale-105'
                  : 'hover:scale-105'
              ]"
              :style="getThemeButtonStyle(theme.key)"
            >
              <div class="w-8 h-8 rounded-full flex items-center justify-center" :style="{ background: theme.preview }"></div>
              <span>{{ theme.name }}</span>
              <span v-if="currentTheme === theme.key" class="ml-2">✓</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 设计令牌展示 -->
      <section class="mb-12">
        <h2 class="text-3xl font-bold text-slate-800 mb-6">设计令牌系统</h2>

        <!-- 颜色系统 -->
        <div class="glass-card p-6 mb-6">
          <h3 class="text-xl font-semibold text-slate-800 mb-4">品牌色</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div v-for="shade in primaryShades" :key="shade.value"
                 class="group">
              <div class="aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                   :style="{ backgroundColor: `var(--color-primary-${shade.value})`, color: shade.text }">
                {{ shade.label }}
              </div>
              <p class="text-xs text-center mt-2 text-slate-500">{{ shade.hex }}</p>
            </div>
          </div>
        </div>

        <!-- 辅助色 -->
        <div class="glass-card p-6 mb-6">
          <h3 class="text-xl font-semibold text-slate-800 mb-4">辅助色</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div v-for="shade in secondaryShades" :key="shade.value"
                 class="group">
              <div class="aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                   :style="{ backgroundColor: `var(--color-secondary-${shade.value})`, color: shade.text }">
                {{ shade.label }}
              </div>
              <p class="text-xs text-center mt-2 text-slate-500">{{ shade.hex }}</p>
            </div>
          </div>
        </div>

        <!-- 功能色 -->
        <div class="glass-card p-6">
          <h3 class="text-xl font-semibold text-slate-800 mb-4">功能色</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div v-for="type in functionalColors" :key="type.key">
              <p class="text-sm font-medium text-slate-700 mb-2 capitalize">{{ type.key }}</p>
              <div class="flex gap-2">
                <div v-for="shade in type.shades" :key="shade.value"
                     class="flex-1 aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                     :style="{ backgroundColor: `var(--color-${type.key}-${shade.value})`, color: shade.text }">
                  {{ shade.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 自定义工具类 -->
      <section class="mb-12">
        <h2 class="text-3xl font-bold text-slate-800 mb-6">自定义工具类</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- 玻璃拟态效果 -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-semibold text-slate-800 mb-4">玻璃拟态效果</h3>
            <div class="space-y-3">
              <div class="glass-card p-4 rounded-xl">
                <p class="text-sm text-slate-700">glass-card</p>
                <p class="text-xs text-slate-500">标准玻璃卡片</p>
              </div>
              <div class="glass-card-light p-4 rounded-xl">
                <p class="text-sm text-slate-700">glass-card-light</p>
                <p class="text-xs text-slate-500">轻量玻璃效果</p>
              </div>
              <div class="glass-nav p-4 rounded-xl">
                <p class="text-sm text-slate-700">glass-nav</p>
                <p class="text-xs text-slate-500">导航栏玻璃效果</p>
              </div>
            </div>
          </div>

          <!-- 按钮样式 -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-semibold text-slate-800 mb-4">按钮样式</h3>
            <div class="space-y-3">
              <button class="btn-primary w-full">
                主要按钮
              </button>
              <button class="btn-secondary w-full">
                次要按钮
              </button>
              <div class="flex gap-2">
                <button class="btn-primary flex-1 hover-lift">
                  上浮
                </button>
                <button class="btn-primary flex-1 hover-scale">
                  放大
                </button>
              </div>
            </div>
          </div>

          <!-- 渐变效果 -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-semibold text-slate-800 mb-4">渐变效果</h3>
            <div class="space-y-3">
              <div class="gradient-primary h-16 rounded-xl flex items-center justify-center text-white font-medium">
                gradient-primary
              </div>
              <div class="gradient-soft h-16 rounded-xl flex items-center justify-center text-white font-medium">
                gradient-soft
              </div>
              <div class="bg-slate-100 h-16 rounded-xl flex items-center justify-center font-medium gradient-text">
                gradient-text
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 圆角和阴影 -->
      <section class="mb-12">
        <h2 class="text-3xl font-bold text-slate-800 mb-6">圆角 & 阴影</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 圆角系统 -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-semibold text-slate-800 mb-4">圆角系统</h3>
            <div class="flex flex-wrap items-end gap-4">
              <div v-for="radius in borderRadius" :key="radius.value" class="text-center">
                <div class="w-16 h-16 bg-primary-500 flex items-center justify-center text-white text-xs mb-2"
                     :style="{ borderRadius: radius.value === 'full' ? '9999px' : `var(--radius-${radius.value})` }">
                  {{ radius.label }}
                </div>
                <p class="text-xs text-slate-500">{{ radius.size }}</p>
              </div>
            </div>
          </div>

          <!-- 阴影系统 -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-semibold text-slate-800 mb-4">阴影系统</h3>
            <div class="flex flex-wrap gap-4">
              <div v-for="shadow in shadows" :key="shadow.value" class="text-center">
                <div class="w-24 h-24 bg-white rounded-xl p-3 flex items-center justify-center text-xs text-slate-600"
                     :class="`shadow-${shadow.value}`">
                  {{ shadow.label }}
                </div>
              </div>
              <div class="text-center">
                <div class="w-24 h-24 bg-white rounded-xl p-3 flex items-center justify-center text-xs text-slate-600 shadow-glow">
                  glow
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 动画效果 -->
      <section class="mb-12">
        <h2 class="text-3xl font-bold text-slate-800 mb-6">动画效果</h2>

        <div class="glass-card p-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="text-center">
              <div class="w-20 h-20 mx-auto mb-3 bg-primary-500 rounded-xl flex items-center justify-center text-white animate-[float_3s_ease-in-out_infinite]">
                float
              </div>
              <p class="text-sm text-slate-600">浮动动画</p>
            </div>
            <div class="text-center">
              <div class="w-20 h-20 mx-auto mb-3 bg-secondary-500 rounded-xl flex items-center justify-center text-white hover-lift cursor-pointer">
                hover
              </div>
              <p class="text-sm text-slate-600">悬停上浮</p>
            </div>
            <div class="text-center">
              <div class="w-20 h-20 mx-auto mb-3 bg-success-500 rounded-xl flex items-center justify-center text-white hover-scale cursor-pointer">
                scale
              </div>
              <p class="text-sm text-slate-600">悬停放大</p>
            </div>
            <div class="text-center">
              <div class="w-20 h-20 mx-auto mb-3 bg-warning-500 rounded-xl flex items-center justify-center text-white hover:shadow-glow transition-all duration-300 cursor-pointer">
                glow
              </div>
              <p class="text-sm text-slate-600">光晕效果</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CSS 变量展示 -->
      <section class="mb-12">
        <h2 class="text-3xl font-bold text-slate-800 mb-6">CSS 变量</h2>

        <div class="glass-card p-6">
          <p class="text-slate-600 mb-4">所有设计令牌都自动转换为 CSS 变量，可在运行时动态访问</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
            <div v-for="variable in cssVariables" :key="variable.name" class="flex items-center gap-3">
              <code class="flex-1 bg-slate-100 px-3 py-2 rounded-lg text-slate-700">{{ variable.name }}</code>
              <div class="w-8 h-8 rounded flex-shrink-0" :style="{ background: `var(${variable.name})` }"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 技术栈 -->
      <section class="mb-12">
        <h2 class="text-3xl font-bold text-slate-800 mb-6">技术栈</h2>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-card p-6 text-center">
            <div class="text-4xl mb-2">🎨</div>
            <h3 class="font-semibold text-slate-800">Tailwind v4</h3>
            <p class="text-sm text-slate-500">CSS-First 配置</p>
          </div>
          <div class="glass-card p-6 text-center">
            <div class="text-4xl mb-2">⚡</div>
            <h3 class="font-semibold text-slate-800">Oxide 引擎</h3>
            <p class="text-sm text-slate-500">100x 更快构建</p>
          </div>
          <div class="glass-card p-6 text-center">
            <div class="text-4xl mb-2">🔷</div>
            <h3 class="font-semibold text-slate-800">CVA</h3>
            <p class="text-sm text-slate-500">类型安全变体</p>
          </div>
          <div class="glass-card p-6 text-center">
            <div class="text-4xl mb-2">🍎</div>
            <h3 class="font-semibold text-slate-800">Apple 风格</h3>
            <p class="text-sm text-slate-500">玻璃拟态美学</p>
          </div>
        </div>
      </section>

      <!-- 基础组件展示 -->
      <section class="mb-12">
        <h2 class="text-3xl font-bold text-slate-800 mb-6">基础组件</h2>

        <div class="grid grid-cols-1 gap-8">
          <!-- Button 组件 -->
          <div class="glass-card p-6">
            <h3 class="text-xl font-semibold text-slate-800 mb-4">Button 按钮</h3>
            <div class="space-y-4">
              <!-- 变体 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">变体 (Variant)</p>
                <div class="flex flex-wrap gap-2">
                  <QyButton variant="primary">Primary</QyButton>
                  <QyButton variant="secondary">Secondary</QyButton>
                  <QyButton variant="danger">Danger</QyButton>
                  <QyButton variant="ghost">Ghost</QyButton>
                  <QyButton variant="outline">Outline</QyButton>
                  <QyButton variant="text">Text</QyButton>
                </div>
              </div>

              <!-- 尺寸 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">尺寸 (Size)</p>
                <div class="flex flex-wrap items-center gap-2">
                  <QyButton size="xs">Extra Small</QyButton>
                  <QyButton size="sm">Small</QyButton>
                  <QyButton size="md">Medium</QyButton>
                  <QyButton size="lg">Large</QyButton>
                  <QyButton size="xl">Extra Large</QyButton>
                </div>
              </div>

              <!-- 状态 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">状态 (State)</p>
                <div class="flex flex-wrap gap-2">
                  <QyButton>Normal</QyButton>
                  <QyButton disabled>Disabled</QyButton>
                  <QyButton :loading="true">Loading</QyButton>
                </div>
              </div>
            </div>
          </div>

          <!-- Input 组件 -->
          <div class="glass-card p-6">
            <h3 class="text-xl font-semibold text-slate-800 mb-4">Input 输入框</h3>
            <div class="space-y-4 max-w-md">
              <!-- 基础输入 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">基础输入</p>
                <QyInput v-model="inputValue" placeholder="请输入内容" />
              </div>

              <!-- 尺寸 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">尺寸 (Size)</p>
                <div class="space-y-2">
                  <QyInput size="sm" placeholder="Small" />
                  <QyInput size="md" placeholder="Medium" />
                  <QyInput size="lg" placeholder="Large" />
                </div>
              </div>

              <!-- 状态 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">状态 (State)</p>
                <div class="space-y-2">
                  <QyInput state="default" placeholder="Default" />
                  <QyInput state="error" placeholder="Error" />
                  <QyInput state="success" placeholder="Success" />
                  <QyInput state="warning" placeholder="Warning" />
                </div>
              </div>

              <!-- 可清空 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">可清空 (Clearable)</p>
                <QyInput v-model="clearableInputValue" clearable placeholder="输入后可清空" />
              </div>

              <!-- 密码输入 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">密码输入</p>
                <QyInput type="password" show-password placeholder="请输入密码" />
              </div>
            </div>
          </div>

          <!-- Textarea 组件 -->
          <div class="glass-card p-6">
            <h3 class="text-xl font-semibold text-slate-800 mb-4">Textarea 文本域</h3>
            <div class="space-y-4 max-w-md">
              <!-- 基础文本域 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">基础文本域</p>
                <QyTextarea v-model="textareaValue" placeholder="请输入多行文本" />
              </div>

              <!-- 尺寸 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">尺寸 (Size)</p>
                <div class="space-y-2">
                  <QyTextarea size="sm" placeholder="Small" />
                  <QyTextarea size="md" placeholder="Medium" />
                  <QyTextarea size="lg" placeholder="Large" />
                </div>
              </div>

              <!-- 字数统计 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">字数统计</p>
                <QyTextarea
                  v-model="countTextareaValue"
                  :maxlength="100"
                  show-count
                  placeholder="限制100字"
                />
              </div>

              <!-- 调整大小 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">调整大小 (Resize)</p>
                <div class="space-y-2">
                  <QyTextarea resize="none" placeholder="不可调整大小" />
                  <QyTextarea resize="vertical" placeholder="垂直调整" />
                  <QyTextarea resize="both" placeholder="自由调整" />
                </div>
              </div>
            </div>
          </div>

          <!-- Select 组件 -->
          <div class="glass-card p-6">
            <h3 class="text-xl font-semibold text-slate-800 mb-4">Select 选择器</h3>
            <div class="space-y-4 max-w-md">
              <!-- 基础选择器 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">基础选择器</p>
                <QySelect
                  v-model="selectValue"
                  :options="selectOptions"
                  placeholder="请选择"
                />
              </div>

              <!-- 尺寸 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">尺寸 (Size)</p>
                <div class="space-y-2">
                  <QySelect size="sm" :options="selectOptions" placeholder="Small" />
                  <QySelect size="md" :options="selectOptions" placeholder="Medium" />
                  <QySelect size="lg" :options="selectOptions" placeholder="Large" />
                </div>
              </div>

              <!-- 可清空 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">可清空 (Clearable)</p>
                <QySelect
                  v-model="clearableSelectValue"
                  :options="selectOptions"
                  clearable
                  placeholder="选择后可清空"
                />
              </div>

              <!-- 可搜索 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">可搜索 (Filterable)</p>
                <QySelect
                  :options="selectOptions"
                  filterable
                  placeholder="输入关键字搜索"
                />
              </div>
            </div>
          </div>

          <!-- Card 组件 -->
          <div class="glass-card p-6">
            <h3 class="text-xl font-semibold text-slate-800 mb-4">Card 卡片</h3>
            <div class="space-y-4">
              <!-- 变体 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">变体 (Variant)</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QyCard variant="default">
                    <template #header>
                      <h4 class="text-lg font-semibold text-slate-800">默认卡片</h4>
                    </template>
                    <p class="text-slate-600">这是默认样式的卡片，使用白色背景和圆角设计。</p>
                    <template #footer>
                      <QyButton size="sm">查看详情</QyButton>
                    </template>
                  </QyCard>

                  <QyCard variant="glass">
                    <template #header>
                      <h4 class="text-lg font-semibold text-slate-800">玻璃卡片</h4>
                    </template>
                    <p class="text-slate-600">这是玻璃拟态效果的卡片，具有半透明背景和模糊效果。</p>
                    <template #footer>
                      <QyButton size="sm" variant="secondary">查看详情</QyButton>
                    </template>
                  </QyCard>

                  <QyCard variant="outlined">
                    <template #header>
                      <h4 class="text-lg font-semibold text-slate-800">轮廓卡片</h4>
                    </template>
                    <p class="text-slate-600">这是轮廓样式的卡片，使用边框而不是阴影来突出显示。</p>
                    <template #footer>
                      <QyButton size="sm" variant="outline">查看详情</QyButton>
                    </template>
                  </QyCard>

                  <QyCard variant="elevated">
                    <template #header>
                      <h4 class="text-lg font-semibold text-slate-800">提升卡片</h4>
                    </template>
                    <p class="text-slate-600">这是提升效果的卡片，具有更明显的阴影效果和立体感。</p>
                    <template #footer>
                      <QyButton size="sm" variant="primary">查看详情</QyButton>
                    </template>
                  </QyCard>
                </div>
              </div>

              <!-- 阴影 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">阴影 (Shadow)</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <QyCard shadow="always">
                    <div class="text-center">
                      <p class="font-semibold text-slate-800 mb-1">Always</p>
                      <p class="text-sm text-slate-600">始终显示阴影</p>
                    </div>
                  </QyCard>

                  <QyCard shadow="hover">
                    <div class="text-center">
                      <p class="font-semibold text-slate-800 mb-1">Hover</p>
                      <p class="text-sm text-slate-600">悬停显示阴影</p>
                    </div>
                  </QyCard>

                  <QyCard shadow="never">
                    <div class="text-center">
                      <p class="font-semibold text-slate-800 mb-1">Never</p>
                      <p class="text-sm text-slate-600">从不显示阴影</p>
                    </div>
                  </QyCard>
                </div>
              </div>

              <!-- 内边距 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">内边距 (Padding)</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QyCard padding="sm">
                    <div class="text-center">
                      <p class="font-semibold text-slate-800">Small Padding</p>
                    </div>
                  </QyCard>

                  <QyCard padding="md">
                    <div class="text-center">
                      <p class="font-semibold text-slate-800">Medium Padding</p>
                    </div>
                  </QyCard>

                  <QyCard padding="lg">
                    <div class="text-center">
                      <p class="font-semibold text-slate-800">Large Padding</p>
                    </div>
                  </QyCard>

                  <QyCard padding="none">
                    <div class="p-4 text-center bg-slate-50 rounded-lg">
                      <p class="font-semibold text-slate-800">No Padding</p>
                    </div>
                  </QyCard>
                </div>
              </div>

              <!-- 悬停效果 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">悬停效果 (Hoverable)</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QyCard hoverable>
                    <div class="text-center">
                      <QyIcon name="cursor-click" size="lg" class="text-primary-500 mb-2" />
                      <p class="font-semibold text-slate-800">可点击卡片</p>
                      <p class="text-sm text-slate-600">悬停时会上浮并增强阴影</p>
                    </div>
                  </QyCard>

                  <QyCard hoverable variant="glass">
                    <div class="text-center">
                      <QyIcon name="hand-pointer" size="lg" class="text-secondary-500 mb-2" />
                      <p class="font-semibold text-slate-800">玻璃可点击卡片</p>
                      <p class="text-sm text-slate-600">玻璃拟态 + 悬停效果</p>
                    </div>
                  </QyCard>
                </div>
              </div>

              <!-- 仅内容 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">仅内容卡片</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <QyCard>
                    <div class="text-center">
                      <QyIcon name="sparkles" size="md" class="text-amber-500 mb-2" />
                      <p class="text-sm text-slate-600">简单卡片</p>
                    </div>
                  </QyCard>

                  <QyCard variant="glass">
                    <div class="text-center">
                      <QyIcon name="star" size="md" class="text-purple-500 mb-2" />
                      <p class="text-sm text-slate-600">玻璃卡片</p>
                    </div>
                  </QyCard>

                  <QyCard variant="outlined">
                    <div class="text-center">
                      <QyIcon name="heart" size="md" class="text-rose-500 mb-2" />
                      <p class="text-sm text-slate-600">轮廓卡片</p>
                    </div>
                  </QyCard>
                </div>
              </div>
            </div>
          </div>

          <!-- Icon 组件 -->
          <div class="glass-card p-6">
            <h3 class="text-xl font-semibold text-slate-800 mb-4">Icon 图标</h3>
            <div class="space-y-4">
              <!-- 尺寸展示 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">尺寸 (Size)</p>
                <div class="flex items-center gap-4">
                  <QyIcon name="Star" :size="16" />
                  <QyIcon name="Star" :size="20" />
                  <QyIcon name="Star" :size="24" />
                  <QyIcon name="Star" :size="32" />
                  <QyIcon name="Star" :size="48" />
                </div>
              </div>

              <!-- 颜色展示 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">颜色 (Color)</p>
                <div class="flex items-center gap-4">
                  <QyIcon name="CircleCheck" color="var(--color-primary-500)" :size="24" />
                  <QyIcon name="CircleClose" color="var(--color-danger-500)" :size="24" />
                  <QyIcon name="SuccessFilled" color="var(--color-success-500)" :size="24" />
                  <QyIcon name="Warning" color="var(--color-warning-500)" :size="24" />
                </div>
              </div>

              <!-- 常用图标展示 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">常用图标</p>
                <div class="flex flex-wrap gap-3">
                  <QyIcon name="Search" :size="20" class="text-slate-600" />
                  <QyIcon name="Edit" :size="20" class="text-slate-600" />
                  <QyIcon name="Delete" :size="20" class="text-slate-600" />
                  <QyIcon name="Check" :size="20" class="text-slate-600" />
                  <QyIcon name="Close" :size="20" class="text-slate-600" />
                  <QyIcon name="Refresh" :size="20" class="text-slate-600" />
                  <QyIcon name="Share" :size="20" class="text-slate-600" />
                  <QyIcon name="Upload" :size="20" class="text-slate-600" />
                  <QyIcon name="Download" :size="20" class="text-slate-600" />
                  <QyIcon name="Setting" :size="20" class="text-slate-600" />
                  <QyIcon name="User" :size="20" class="text-slate-600" />
                  <QyIcon name="Document" :size="20" class="text-slate-600" />
                </div>
              </div>

              <!-- 图书相关图标 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">图书图标</p>
                <div class="flex flex-wrap gap-3">
                  <QyIcon name="BookOpen" :size="20" class="text-slate-600" />
                  <QyIcon name="BookClosed" :size="20" class="text-slate-600" />
                  <QyIcon name="Bookmark" :size="20" class="text-slate-600" />
                  <QyIcon name="BookmarkFilled" :size="20" class="text-slate-600" />
                  <QyIcon name="Library" :size="20" class="text-slate-600" />
                  <QyIcon name="Bookshelf" :size="20" class="text-slate-600" />
                  <QyIcon name="Reading" :size="20" class="text-slate-600" />
                  <QyIcon name="Collection" :size="20" class="text-slate-600" />
                </div>
              </div>

              <!-- 空状态图标 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">空状态图标</p>
                <div class="flex flex-wrap gap-3">
                  <QyIcon name="BookNotFound" :size="20" class="text-slate-600" />
                  <QyIcon name="Empty" :size="20" class="text-slate-600" />
                  <QyIcon name="EmptyFolder" :size="20" class="text-slate-600" />
                  <QyIcon name="NoData" :size="20" class="text-slate-600" />
                  <QyIcon name="FileSearch" :size="20" class="text-slate-600" />
                  <QyIcon name="IllustrationPlaceholder" :size="20" class="text-slate-600" />
                </div>
              </div>

              <!-- AI功能图标 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">AI功能图标</p>
                <div class="flex flex-wrap gap-3">
                  <QyIcon name="Sparkles" :size="20" class="text-slate-600" />
                  <QyIcon name="Robot" :size="20" class="text-slate-600" />
                  <QyIcon name="Bot" :size="20" class="text-slate-600" />
                  <QyIcon name="Microphone" :size="20" class="text-slate-600" />
                  <QyIcon name="VoiceInput" :size="20" class="text-slate-600" />
                  <QyIcon name="Lightbulb" :size="20" class="text-slate-600" />
                  <QyIcon name="Idea" :size="20" class="text-slate-600" />
                  <QyIcon name="Brain" :size="20" class="text-slate-600" />
                  <QyIcon name="NeuralNetwork" :size="20" class="text-slate-600" />
                  <QyIcon name="MagicStick" :size="20" class="text-slate-600" />
                </div>
              </div>
            </div>
          </div>

          <!-- Rate 组件 -->
          <div class="glass-card p-6">
            <h3 class="text-xl font-semibold text-slate-800 mb-4">Rate 评分</h3>
            <div class="space-y-4">
              <!-- 基础评分 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">基础评分</p>
                <QyRate v-model="rateValue" />
              </div>

              <!-- 只读模式 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">只读模式</p>
                <QyRate :model-value="3.5" readonly />
              </div>

              <!-- 不同尺寸 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">不同尺寸</p>
                <div class="flex items-center gap-6">
                  <div class="flex items-center gap-2">
                    <QyRate :model-value="4" size="sm" />
                    <span class="text-xs text-slate-500">Small</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <QyRate :model-value="4" size="md" />
                    <span class="text-xs text-slate-500">Medium</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <QyRate :model-value="4" size="lg" />
                    <span class="text-xs text-slate-500">Large</span>
                  </div>
                </div>
              </div>

              <!-- 半星支持 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">半星支持</p>
                <QyRate :model-value="3.5" allow-half />
              </div>

              <!-- 显示分数 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">显示分数</p>
                <QyRate :model-value="4.5" show-score allow-half />
              </div>

              <!-- 带文字 -->
              <div>
                <p class="text-sm text-slate-600 mb-2">带辅助文字</p>
                <QyRate :model-value="4" :texts="['极差', '失望', '一般', '满意', '惊喜']" show-score />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 使用指南 -->
      <section class="mb-12">
        <h2 class="text-3xl font-bold text-slate-800 mb-6">使用指南</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="glass-card p-6">
            <div class="text-3xl mb-3">1️⃣</div>
            <h3 class="font-semibold text-slate-800 mb-2">导入设计令牌</h3>
            <pre class="bg-slate-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto"><code>@import './design-system/tokens/theme.css'</code></pre>
          </div>
          <div class="glass-card p-6">
            <div class="text-3xl mb-3">2️⃣</div>
            <h3 class="font-semibold text-slate-800 mb-2">使用工具类</h3>
            <pre class="bg-slate-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto"><code>&lt;div class="glass-card"&gt;</code></pre>
          </div>
          <div class="glass-card p-6">
            <div class="text-3xl mb-3">3️⃣</div>
            <h3 class="font-semibold text-slate-800 mb-2">访问 CSS 变量</h3>
            <pre class="bg-slate-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto"><code>var(--color-primary-500)</code></pre>
          </div>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-8">
      <div class="container mx-auto px-4 text-center text-slate-600">
        <p class="mb-2">Tailwind v4 组件库 - 青羽 Qingyu Design System</p>
        <p class="text-sm">Built with Vue 3 + TypeScript + Tailwind CSS v4</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyIcon } from '@/design-system/components'
import {
  QyButton,
  QyInput,
  QyTextarea,
  QySelect,
  // QyCheckbox,  // 暂未在模板中使用
  // QyCheckboxGroup,  // 暂未在模板中使用
  // QyRadio,  // 暂未在模板中使用
  // QyRadioGroup,  // 暂未在模板中使用
  // QySwitch,  // 暂未在模板中使用
  // QySlider,  // 暂未在模板中使用
  QyCard,
  QyRate,
  type QySelectOption
} from '@/design-system/components'
import { setTheme as setThemeSystem, type ThemeName } from '@/design-system/tokens/theme'

// Input 绑定值
const inputValue = ref('')
const clearableInputValue = ref('')

// Textarea 绑定值
const textareaValue = ref('')
const countTextareaValue = ref('')

// Select 绑定值
const selectValue = ref<string>()
const clearableSelectValue = ref<string>()

// Select 选项
const selectOptions: QySelectOption[] = [
  { label: '选项一', value: '1' },
  { label: '选项二', value: '2' },
  { label: '选项三', value: '3' },
  { label: '选项四', value: '4' },
  { label: '选项五', value: '5' }
]

// Rate 绑定值
const rateValue = ref(0)

// Checkbox 绑定值（预留，暂未在模板中使用）
// const checkboxValue1 = ref(false)
// const checkboxValue2 = ref(false)
// const checkboxValue3 = ref(false)

// Checkbox 尺寸（预留，暂未在模板中使用）
// const checkboxSizeSm = ref(false)
// const checkboxSizeMd = ref(false)
// const checkboxSizeLg = ref(false)

// Checkbox 颜色（预留，暂未在模板中使用）
// const checkboxColorPrimary = ref(false)
// const checkboxColorSuccess = ref(false)
// const checkboxColorWarning = ref(false)
// const checkboxColorDanger = ref(false)

// Checkbox 变体（预留，暂未在模板中使用）
// const checkboxVariantDefault = ref(false)
// const checkboxVariantButton = ref(false)
// const checkboxVariantBorder = ref(false)

// Checkbox 半选状态（预留，暂未在模板中使用）
// const checkboxIndeterminate = ref(false)

// Checkbox 组（预留，暂未在模板中使用）
// const checkboxGroupValue = ref<string[]>([])

// Radio 绑定值（预留，暂未在模板中使用）
// const radioValue = ref('1')

// Radio 尺寸（预留，暂未在模板中使用）
// const radioSizeSm = ref('sm')
// const radioSizeMd = ref('md')
// const radioSizeLg = ref('lg')

// Radio 颜色（预留，暂未在模板中使用）
// const radioColorPrimary = ref('primary')
// const radioColorSuccess = ref('success')
// const radioColorWarning = ref('warning')
// const radioColorDanger = ref('danger')

// Radio 变体（预留，暂未在模板中使用）
// const radioVariantDefault = ref('default')
// const radioVariantButton = ref('button')
// const radioVariantBorder = ref('border')

// Radio 组（预留，暂未在模板中使用）
// const radioGroupValue = ref('option1')

// Switch 绑定值（预留，暂未在模板中使用）
// const switchValue1 = ref(false)
// const switchValue2 = ref(false)
// const switchValue3 = ref(false)

// Switch 尺寸（预留，暂未在模板中使用）
// const switchSizeSm = ref(false)
// const switchSizeMd = ref(false)
// const switchSizeLg = ref(false)

// Switch 颜色（预留，暂未在模板中使用）
// const switchColorPrimary = ref(false)
// const switchColorSuccess = ref(false)
// const switchColorWarning = ref(false)
// const switchColorDanger = ref(false)

// Switch 带文本（预留，暂未在模板中使用）
// const switchWithText = ref(false)

// Switch 加载状态（预留，暂未在模板中使用）
// const switchLoading = ref(false)

// Slider 绑定值（预留，暂未在模板中使用）
// const sliderValue = ref(50)

// Slider 尺寸（预留，暂未在模板中使用）
// const sliderSizeSm = ref(50)
// const sliderSizeMd = ref(50)
// const sliderSizeLg = ref(50)

// Slider 颜色（预留，暂未在模板中使用）
// const sliderColorPrimary = ref(50)
// const sliderColorSuccess = ref(50)
// const sliderColorWarning = ref(50)
// const sliderColorDanger = ref(50)

// Slider 范围（预留，暂未在模板中使用）
// const rangeValue = ref([20, 80])

// Slider 垂直（预留，暂未在模板中使用）
// const sliderVertical = ref(50)

// Slider 步长（预留，暂未在模板中使用）
// const sliderStep = ref(50)

// Slider 不显示提示（预留，暂未在模板中使用）
// const sliderNoTooltip = ref(50)

// 主题配置
const themes = [
  {
    key: 'qingyu' as ThemeName,
    name: '青羽主题',
    preview: 'linear-gradient(135deg, #06b6d4, #2563eb)'
  },
  {
    key: 'berry' as ThemeName,
    name: '紫粉主题',
    preview: 'linear-gradient(135deg, #a855f7, #ec4899)'
  },
  {
    key: 'forest' as ThemeName,
    name: '森林主题',
    preview: 'linear-gradient(135deg, #22c55e, #06b6d4)'
  }
]

const currentTheme = ref<ThemeName>('qingyu')

// 颜色数据
const primaryShades = [
  { value: 400, label: '400', hex: '#22d3ee', text: '#fff' },
  { value: 500, label: '500', hex: '#06b6d4', text: '#fff' },
  { value: 600, label: '600', hex: '#0891b2', text: '#fff' },
  { value: 700, label: '700', hex: '#0e7490', text: '#fff' },
  { value: 800, label: '800', hex: '#155e75', text: '#fff' }
]

const secondaryShades = [
  { value: 400, label: '400', hex: '#60a5fa', text: '#fff' },
  { value: 500, label: '500', hex: '#3b82f6', text: '#fff' },
  { value: 600, label: '600', hex: '#2563eb', text: '#fff' },
  { value: 700, label: '700', hex: '#1d4ed8', text: '#fff' },
  { value: 800, label: '800', hex: '#1e40af', text: '#fff' }
]

const functionalColors = [
  {
    key: 'success',
    shades: [
      { value: 100, label: '100', text: '#065f46' },
      { value: 500, label: '500', text: '#fff' },
      { value: 700, label: '700', text: '#fff' }
    ]
  },
  {
    key: 'warning',
    shades: [
      { value: 100, label: '100', text: '#92400e' },
      { value: 500, label: '500', text: '#fff' },
      { value: 700, label: '700', text: '#fff' }
    ]
  },
  {
    key: 'danger',
    shades: [
      { value: 100, label: '100', text: '#b91c1c' },
      { value: 500, label: '500', text: '#fff' },
      { value: 700, label: '700', text: '#fff' }
    ]
  },
  {
    key: 'info',
    shades: [
      { value: 100, label: '100', text: '#075985' },
      { value: 500, label: '500', text: '#fff' },
      { value: 700, label: '700', text: '#fff' }
    ]
  }
]

const borderRadius = [
  { value: 'sm', label: 'SM', size: '2px' },
  { value: 'md', label: 'MD', size: '6px' },
  { value: 'lg', label: 'LG', size: '8px' },
  { value: 'xl', label: 'XL', size: '12px' },
  { value: '2xl', label: '2XL', size: '16px' },
  { value: '3xl', label: '3XL', size: '24px' }
]

const shadows = [
  { value: 'sm', label: 'SM' },
  { value: 'md', label: 'MD' },
  { value: 'lg', label: 'LG' },
  { value: 'xl', label: 'XL' },
  { value: '2xl', label: '2XL' }
]

const cssVariables = [
  { name: '--color-primary-500' },
  { name: '--color-secondary-500' },
  { name: '--radius-xl' },
  { name: '--shadow-glow' },
  { name: '--duration-normal' },
  { name: '--ease-ios' }
]

// 方法
function switchTheme(theme: ThemeName) {
  currentTheme.value = theme
  setThemeSystem(theme)
}

function getThemeButtonStyle(theme: ThemeName) {
  const isActive = currentTheme.value === theme
  if (isActive) {
    return {
      background: themes.find(t => t.key === theme)?.preview,
      color: '#fff',
      borderColor: 'rgba(255,255,255,0.3)'
    }
  }
  return {
    background: '#fff',
    color: '#334155',
    borderColor: '#e2e8f0'
  }
}
</script>

<style scoped>
/* 自定义样式补充 */
.container {
  max-width: 1280px;
}
</style>
