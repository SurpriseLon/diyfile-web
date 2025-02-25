<script setup lang="ts">
import type { FormInst, FormRules, SelectGroupOption, SelectOption } from 'naive-ui'
import type { Storage } from '~/api/interface/storage'
import { getAwsRegions, storageAdd } from '~/api/modules/storage'
import { ResultEnum } from '~/enums/httpEnum'

const { t } = useI18n()
const router = useRouter()
const { isMobile } = useDevice()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref<boolean>(false)
const regionList = ref<Array<SelectOption | SelectGroupOption>>([])
const addStorageForm = reactive({
  /** 存储名称 */
  name: '',
  /** 存储 key */
  storageKey: '',
  /** 备注 */
  remark: '',
  endpoint: '',
  region: '',
  accessKey: '',
  secretKey: '',
  bucketName: '',
  mount_path: '',
})
const addStorageData = ref<Storage.AddStorageRequestData>({
  /** 存储名称 */
  name: '',
  /** 存储类型 */
  type: 3,
  /** 存储 key */
  storageKey: '',
  /** 备注 */
  remark: '',
  configList: [],
})

const rules: FormRules = {
  name: [
    { required: true, message: '存储名称不能为空！', trigger: 'blur' },
    { max: 20, message: '存储名称长度不能大于 20', trigger: 'blur' },
  ],
  storageKey: [
    { required: true, message: '存储 key 不能为空！', trigger: 'blur' },
    { max: 20, message: '存储 key长度不能大于 20', trigger: 'blur' },
  ],
  endpoint: [
    { required: true, message: 'Endpoint 不能为空！', trigger: 'blur' },
  ],
  region: [
    { required: true, message: 'Region 不能为空！', trigger: 'blur' },
  ],
  accessKey: [
    { required: true, message: 'AccessKey 不能为空！', trigger: 'blur' },
  ],
  secretKey: [
    { required: true, message: 'SecretKey 不能为空！', trigger: 'blur' },
  ],
  bucketName: [
    { required: true, message: 'BucketName 不能为空！', trigger: 'blur' },
  ],
  mount_path: [
    { required: true, message: '挂载路径不能为空！', trigger: 'blur' },
  ],
}

const list = ref<Array<Storage.StorageConfig>>([])
const endpoint = ref<Storage.StorageConfig>({
  id: undefined,
  storageId: undefined,
  name: 'Endpoint',
  configKey: 'endpoint',
  configValue: '',
  description: '填写Bucket所在地域对应的Endpoint。',
})
const region = ref<Storage.StorageConfig>({
  id: undefined,
  storageId: undefined,
  name: 'Region',
  configKey: 'region',
  configValue: '',
  description: '填写Bucket所在地域对应的Region。',
})
const accessKey = ref<Storage.StorageConfig>({
  id: undefined,
  storageId: undefined,
  name: 'AccessKey',
  configKey: 'accessKey',
  configValue: '',
  description: 'AWS 账号 AccessKey',
})
const secretKey = ref<Storage.StorageConfig>({
  id: undefined,
  storageId: undefined,
  name: 'SecretKey',
  configKey: 'secretKey',
  configValue: '',
  description: 'AWS 账号 SecretKey',
})
const bucketName = ref<Storage.StorageConfig>({
  id: undefined,
  storageId: undefined,
  name: 'BucketName',
  configKey: 'bucketName',
  configValue: '',
  description: 'AWS S3 Bucket 名称',
})
const mount_path = ref<Storage.StorageConfig>({
  id: undefined,
  storageId: undefined,
  name: '挂载路径',
  configKey: 'mount_path',
  configValue: '',
  description: 'AWS S3 挂载路径',
})

const handleFormData = () => {
  list.value = []
  endpoint.value.configValue = addStorageForm.endpoint
  region.value.configValue = addStorageForm.region
  accessKey.value.configValue = addStorageForm.accessKey
  secretKey.value.configValue = addStorageForm.secretKey
  bucketName.value.configValue = addStorageForm.bucketName
  mount_path.value.configValue = addStorageForm.mount_path
  list.value.push(endpoint.value)
  list.value.push(region.value)
  list.value.push(accessKey.value)
  list.value.push(secretKey.value)
  list.value.push(bucketName.value)
  list.value.push(mount_path.value)
  addStorageData.value.configList = list.value
}

const handleSubmit = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      addStorageData.value.name = addStorageForm.name
      addStorageData.value.storageKey = addStorageForm.storageKey
      addStorageData.value.remark = addStorageForm.remark
      handleFormData()
      storageAdd(addStorageData.value).then((res) => {
        if (res.code === ResultEnum.SUCCESS) {
          message.success(res.message)
          router.push('/@admin/setting/storage')
        }
      }).catch((err) => {
        message.error(err.message)
      })
    } else {
      console.log(errors)
      message.error('请检查您的内容！')
    }
  })
}

onMounted(() => {
  loading.value = true
  getAwsRegions().then((res) => {
    if (res.code === ResultEnum.SUCCESS && Array.isArray(res.data)) {
      for (const item of res.data) {
        regionList.value.push({
          label: item,
          value: item,
        })
      }
    }
    loading.value = false
  }).catch((err) => {
    message.error(err.message)
    loading.value = false
  })
})
</script>

<template>
  <n-card content-style="padding: 0;" class="my-0.5">
    <n-page-header :title="t('tip.cardTitle')" class="mx-0.5" @back="router.back()">
      <template #extra>
        <div class="flex items-center">
          <v-btn icon="done" variant="text" size="x-small" @click="handleSubmit" />
        </div>
      </template>
    </n-page-header>
  </n-card>
  <n-card content-style="padding: 0.5rem;" class="box-card overflow-auto no-scrollbar" style="height: calc(100% - 4rem); -ms-overflow-style: none;">
    <n-grid cols="5" item-responsive responsive="screen">
      <n-grid-item offset="0 m:1 l:1" span="5 m:3 l:3">
        <n-form ref="formRef" :model="addStorageForm" :rules="rules">
          <n-form-item :label="t('storage.name')" path="name" required>
            <n-input v-model:value="addStorageForm.name" placeholder="请输入存储名称" clearable show-count :maxlength="20" />
          </n-form-item>
          <n-form-item label="storageKey" path="storageKey" required>
            <n-input v-model:value="addStorageForm.storageKey" placeholder="请输入 storageKey" clearable show-count :maxlength="20" />
          </n-form-item>
          <n-form-item label="BucketName" path="bucketName" required>
            <n-input v-model:value="addStorageForm.bucketName" :placeholder="bucketName.description" clearable />
          </n-form-item>
          <n-form-item label="Endpoint" path="endpoint" required>
            <n-input v-model:value="addStorageForm.endpoint" :placeholder="endpoint.description" clearable />
          </n-form-item>
          <n-form-item label="Region" path="region" required>
            <n-select v-model:value="addStorageForm.region" :options="regionList" />
          </n-form-item>
          <n-form-item label="AccessKey" path="accessKey" required>
            <n-input v-model:value="addStorageForm.accessKey" :placeholder="accessKey.description" clearable />
          </n-form-item>
          <n-form-item label="SecretKey" path="secretKey" required>
            <n-input v-model:value="addStorageForm.secretKey" :placeholder="secretKey.description" clearable />
          </n-form-item>
          <n-form-item label="挂载路径" path="mount_path" required>
            <n-input v-model:value="addStorageForm.mount_path" :placeholder="mount_path.description" clearable />
          </n-form-item>
          <n-form-item :label="t('storage.remark')" path="remark">
            <n-input v-model:value="addStorageForm.remark" type="textarea" placeholder="请输入备注" maxlength="160" show-count />
          </n-form-item>
        </n-form>
      </n-grid-item>
    </n-grid>
  </n-card>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
