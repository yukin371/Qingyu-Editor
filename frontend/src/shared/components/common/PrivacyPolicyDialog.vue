<template>
  <el-dialog v-model="dialogVisible" title="隐私政策" width="800px" :close-on-click-modal="false">
    <div class="privacy-content">
      <h3>一、引言</h3>
      <p>
        青羽写作平台（以下简称"我们"）非常重视用户的隐私保护。本隐私政策旨在向您说明我们如何收集、使用、存储、保护和共享您的个人信息，以及您享有的相关权利。
      </p>

      <h3>二、我们收集的信息</h3>
      <p>
        2.1
        <strong>账户信息</strong
        >：当您注册账户时，我们会收集您的用户名、电子邮箱、手机号码（可选）等信息。
      </p>
      <p>2.2 <strong>个人资料</strong>：您可以选择提供个人简介、头像、性别等个人资料信息。</p>
      <p>2.3 <strong>内容信息</strong>：您在平台上创作、发布的文章、评论、点赞等内容信息。</p>
      <p>
        2.4
        <strong>使用信息</strong>：您使用我们服务时产生的信息，如访问日志、浏览记录、阅读历史等。
      </p>
      <p>2.5 <strong>设备信息</strong>：设备型号、操作系统版本、设备标识符、IP地址等技术信息。</p>
      <p>2.6 <strong>位置信息</strong>：在您授权的情况下，我们可能收集您的地理位置信息。</p>

      <h3>三、我们如何使用您的信息</h3>
      <p>3.1 <strong>提供服务</strong>：向您提供创作、阅读、社交等核心功能服务。</p>
      <p>3.2 <strong>改进服务</strong>：分析用户行为，优化产品功能和用户体验。</p>
      <p>3.3 <strong>个性化推荐</strong>：根据您的兴趣和行为，为您推荐相关内容。</p>
      <p>3.4 <strong>安全保障</strong>：检测、预防和处理安全事件，保护平台和用户安全。</p>
      <p>3.5 <strong>客户服务</strong>：处理您的咨询、投诉和建议，提供客户支持。</p>
      <p>3.6 <strong>通知发送</strong>：向您发送重要通知、系统消息和营销信息（您可以选择退订）。</p>

      <h3>四、信息的存储与保护</h3>
      <p>4.1 <strong>存储地点</strong>：您的个人信息将存储在中华人民共和国境内的服务器上。</p>
      <p>
        4.2
        <strong>存储期限</strong
        >：我们仅在实现目的所必需的期限内保留您的个人信息。账户注销后，我们将在合理时间内删除或匿名化处理您的个人信息。
      </p>
      <p>
        4.3
        <strong>安全措施</strong
        >：我们采用行业标准的安全技术和措施保护您的个人信息，包括加密存储、访问控制、安全审计等。
      </p>
      <p>
        4.4
        <strong>数据备份</strong
        >：我们会定期备份数据以防止数据丢失，但备份数据同样受到严格的安全保护。
      </p>

      <h3>五、信息的共享与披露</h3>
      <p>5.1 我们不会向第三方出售您的个人信息。</p>
      <p>5.2 <strong>授权共享</strong>：经您明确同意，我们可能与第三方共享您的个人信息。</p>
      <p>
        5.3
        <strong>服务提供商</strong
        >：我们可能委托第三方服务提供商处理您的个人信息，如云存储、数据分析等，但他们仅能按照我们的指示处理信息。
      </p>
      <p>
        5.4
        <strong>法律要求</strong>：根据法律法规、诉讼、政府要求等，我们可能需要披露您的个人信息。
      </p>
      <p>
        5.5
        <strong>关联公司</strong>：我们可能与关联公司共享您的个人信息，但用途仅限于本政策所述目的。
      </p>

      <h3>六、您的权利</h3>
      <p>6.1 <strong>访问权</strong>：您有权访问您的个人信息。</p>
      <p>6.2 <strong>更正权</strong>：如果您发现个人信息有误，您有权要求我们更正。</p>
      <p>6.3 <strong>删除权</strong>：在特定情况下，您有权要求我们删除您的个人信息。</p>
      <p>6.4 <strong>撤回同意</strong>：您有权撤回对个人信息处理的同意。</p>
      <p>
        6.5
        <strong>注销账户</strong
        >：您可以随时申请注销账户，注销后我们将停止为您提供服务并删除您的个人信息。
      </p>
      <p>
        6.6
        <strong>投诉举报</strong
        >：如果您认为我们违反了隐私保护规定，您可以向我们投诉或向监管机构举报。
      </p>

      <h3>七、Cookie和类似技术</h3>
      <p>7.1 我们使用Cookie和类似技术来提供、维护和改进服务，以及为您提供更好的用户体验。</p>
      <p>7.2 您可以通过浏览器设置管理或删除Cookie，但这可能影响您使用我们服务的某些功能。</p>

      <h3>八、第三方链接</h3>
      <p>8.1 我们的服务可能包含第三方网站或服务的链接，这些第三方有自己的隐私政策。</p>
      <p>8.2 我们不对第三方的隐私保护行为负责，建议您查阅他们的隐私政策。</p>

      <h3>九、未成年人保护</h3>
      <p>9.1 我们非常重视未成年人的个人信息保护。</p>
      <p>
        9.2
        如果您是未成年人，请在监护人的陪同下阅读本政策，并确保在监护人同意的情况下使用我们的服务。
      </p>
      <p>
        9.3 如果我们发现在未获得监护人同意的情况下收集了未成年人的个人信息，我们将尽快删除该信息。
      </p>

      <h3>十、本政策的更新</h3>
      <p>10.1 我们可能不时更新本隐私政策。</p>
      <p>10.2 重大变更时，我们会通过显著方式通知您，并可能要求您重新同意。</p>
      <p>10.3 您继续使用我们的服务即表示您接受更新后的隐私政策。</p>

      <h3>十一、联系我们</h3>
      <p>如果您对本隐私政策有任何疑问、意见或建议，或需要行使您的权利，请通过以下方式联系我们：</p>
      <p>
        <strong>邮箱</strong>：privacy@qingyu.com<br />
        <strong>地址</strong>：[公司注册地址]<br />
        <strong>电话</strong>：[联系电话]
      </p>

      <div class="privacy-footer">
        <p><strong>本隐私政策自发布之日起生效。</strong></p>
        <p>最后更新日期：2026年4月4日</p>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleAgree" v-if="showAgreeButton"> 同意并继续 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  visible?: boolean
  showAgreeButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  showAgreeButton: false,
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  agree: []
  close: []
}>()

const dialogVisible = ref(props.visible)

watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val
  },
)

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

const handleClose = () => {
  dialogVisible.value = false
  emit('close')
}

const handleAgree = () => {
  emit('agree')
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.privacy-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 1rem;

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #212121;
    margin: 1.5rem 0 1rem 0;

    &:first-child {
      margin-top: 0;
    }
  }

  p {
    font-size: 0.875rem;
    line-height: 1.75;
    color: #616161;
    margin: 0.75rem 0;

    strong {
      color: #212121;
      font-weight: 500;
    }
  }

  .privacy-footer {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e0e0e0;

    p {
      color: #757575;
      font-size: 0.8125rem;

      &:first-child {
        color: #212121;
        font-weight: 500;
      }
    }
  }
}

:deep(.el-dialog__body) {
  padding: 1.5rem;
}
</style>
