<template>
  <div class="user-form-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>{{ isEdit ? '编辑用户' : '新增用户' }}</h2>
      <el-button @click="goBack">
        <el-icon><back /></el-icon>返回列表
      </el-button>
    </div>

    <!-- 表单区域 -->
    <el-card class="form-card">
      <el-form
        ref="formRef"
        :model="userForm"
        :rules="rules"
        label-width="100px"
        label-position="right"
        status-icon
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="userForm.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="userForm.gender" placeholder="请选择性别" style="width: 100%">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input-number v-model="userForm.age" :min="1" :max="120" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入电话号码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" placeholder="请输入邮箱地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="userForm.status"
                :active-value="1"
                :inactive-value="0"
                active-text="启用"
                inactive-text="禁用"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="地址" prop="address">
          <el-input v-model="userForm.address" placeholder="请输入地址" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            保存
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/userStore'
import { ElMessage } from 'element-plus'
import { Back } from '@element-plus/icons-vue'

// 路由
const route = useRoute()
const router = useRouter()

// 用户状态管理
const userStore = useUserStore()

// 表单引用
const formRef = ref(null)

// 判断是编辑还是新增模式
const isEdit = computed(() => route.meta.mode === 'edit')
const userId = computed(() => route.params.id)

// 提交状态
const submitting = ref(false)

// 用户表单数据
const userForm = reactive({
  name: '',
  gender: '',
  age: 18,
  phone: '',
  email: '',
  address: '',
  status: 1
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  age: [
    { type: 'number', message: '年龄必须为数字', trigger: 'blur' },
    { required: true, message: '请输入年龄', trigger: 'blur' }
  ]
}

// 方法：返回列表页
const goBack = () => {
  router.push('/users')
}

// 方法：提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      submitting.value = true
      
      try {
        if (isEdit.value) {
          // 编辑用户
          userStore.updateUser(userId.value, userForm)
          ElMessage.success('用户信息更新成功')
        } else {
          // 新增用户
          userStore.addUser(userForm)
          ElMessage.success('用户添加成功')
        }
        
        // 返回列表页
        router.push('/users')
      } catch (error) {
        ElMessage.error('操作失败：' + error.message)
      } finally {
        submitting.value = false
      }
    } else {
      ElMessage.error('请正确填写表单内容')
      console.log('验证失败字段:', fields)
    }
  })
}

// 方法：重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 生命周期钩子：组件挂载时加载数据
onMounted(() => {
  if (isEdit.value && userId.value) {
    // 编辑模式，加载用户数据
    const user = userStore.getUserById(userId.value)
    if (user) {
      // 填充表单数据
      Object.assign(userForm, user)
    } else {
      ElMessage.error('未找到用户信息')
      router.push('/users')
    }
  }
})
</script>

<style scoped>
.user-form-container {
  padding-bottom: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-card {
  margin-bottom: 20px;
}
</style>
