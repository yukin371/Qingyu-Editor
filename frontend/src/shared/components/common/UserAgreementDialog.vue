<template>
  <el-dialog
    v-model="dialogVisible"
    title="用户服务协议"
    width="800px"
    :close-on-click-modal="false"
  >
    <div class="agreement-content">
      <h3>一、服务条款的接受与修改</h3>
      <p>1.1 用户在使用青羽写作平台（以下简称"本平台"）提供的各项服务前，应仔细阅读本协议。用户点击"同意"按钮即表示完全接受本协议的全部条款。</p>
      <p>1.2 本平台有权根据需要不时修改本协议或根据本协议制定、修改各项具体规则并在相关页面公布，无需另行单独通知用户。</p>

      <h3>二、用户注册与账号管理</h3>
      <p>2.1 用户承诺以其真实身份注册成为本平台用户，并保证所提供的个人身份资料信息真实、完整、有效。</p>
      <p>2.2 用户注册成功后，本平台将给予每个用户一个用户账号及相应的密码，该用户账号和密码由用户负责保管。</p>
      <p>2.3 用户应对以其用户账号进行的所有活动和事件负法律责任。</p>

      <h3>三、用户行为规范</h3>
      <p>3.1 用户在使用本平台服务时，必须遵守中华人民共和国相关法律法规，不得利用本平台从事违法违规行为。</p>
      <p>3.2 用户不得发布任何侵犯他人知识产权、隐私权、名誉权等合法权益的内容。</p>
      <p>3.3 用户不得发布任何违背社会公德、扰乱社会秩序的不良信息。</p>

      <h3>四、知识产权</h3>
      <p>4.1 用户在本平台上发表的原创内容，其知识产权归用户所有。</p>
      <p>4.2 用户同意授予本平台在全球范围内免费的、非独家的许可使用权，本平台有权将该内容用于本平台各种形式的产品和服务，包括但不限于网站、手机应用等。</p>
      <p>4.3 本平台所有的产品、技术、软件、程序、数据及其他信息（包括文字、图标、图片、照片、音频、视频、图表、色彩组合、版面设计等）的所有权利（包括版权、商标权、专利权、商业秘密及其他相关权利）均归本平台所有。</p>

      <h3>五、隐私保护</h3>
      <p>5.1 本平台重视用户隐私保护，将按照《隐私政策》的规定收集、使用、存储和保护用户个人信息。</p>
      <p>5.2 除法律法规规定的情形外，未经用户许可，本平台不会向第三方公开、透露用户个人信息。</p>

      <h3>六、服务的变更、中断或终止</h3>
      <p>6.1 本平台可能会对服务内容进行变更，也可能会中断、中止或终止服务。</p>
      <p>6.2 用户理解并同意，本平台需要定期或不定期地对提供服务的平台或相关设备进行检修或维护，如因此类情况而造成服务在合理时间内的中断，本平台无需承担任何责任。</p>

      <h3>七、免责声明</h3>
      <p>7.1 用户明确同意其使用本平台服务所存在的风险将完全由其自己承担。</p>
      <p>7.2 本平台不保证服务一定能满足用户的要求，也不保证服务不会中断，对服务的及时性、安全性、准确性也都不作保证。</p>

      <h3>八、法律适用与争议解决</h3>
      <p>8.1 本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律。</p>
      <p>8.2 如双方就本协议内容或其执行发生任何争议，双方应尽力友好协商解决；协商不成时，任何一方均可向本平台所在地的人民法院提起诉讼。</p>

      <div class="agreement-footer">
        <p><strong>本协议自用户点击同意之日起生效。</strong></p>
        <p>最后更新日期：2025年10月29日</p>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleAgree" v-if="showAgreeButton">
        同意并继续
      </el-button>
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
  showAgreeButton: false
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  agree: []
  close: []
}>()

const dialogVisible = ref(props.visible)

watch(() => props.visible, (val) => {
  dialogVisible.value = val
})

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
.agreement-content {
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
  }

  .agreement-footer {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #E0E0E0;

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

