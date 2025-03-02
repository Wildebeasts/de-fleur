import {
  Form,
  Input,
  Button,
  message,
  ConfigProvider,
  Switch,
  Upload
} from 'antd'
import type { UploadFile } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import userApi from '@/lib/services/userService'
import { useAuth } from '@/lib/context/AuthContext'
import { useBreadcrumb } from '@/lib/context/BreadcrumbContext'
import { Skeleton } from 'antd'
import { format } from 'date-fns'
import { UploadOutlined } from '@ant-design/icons'

interface UserFormData {
  username: string
  emailConfirmed: boolean
  createdDate: string
  avatar?: {
    fileList: UploadFile[]
  }
  avatarUrl?: string
  password?: string
  email?: string
  firstName?: string
  lastName?: string
  gender?: boolean
}

export default function UserForm() {
  const [form] = Form.useForm<UserFormData>()
  const navigate = useNavigate()
  const { id } = useParams()
  const { updateBreadcrumb } = useBreadcrumb()
  const [loading, setLoading] = useState(true)
  const { login } = useAuth()

  useEffect(() => {
    if (id) {
      updateBreadcrumb('Admin Dashboard', 'Users', 'Edit User')
    } else {
      updateBreadcrumb('Admin Dashboard', 'Users', 'Add User')
    }

    return () => {
      updateBreadcrumb('Admin Dashboard', 'Users')
    }
  }, [updateBreadcrumb, id])

  useEffect(() => {
    const fetchUser = async () => {
      if (id) {
        setLoading(true)
        try {
          const user = await userApi.getUserById(id)
          if (user) {
            form.setFieldsValue({
              username: user.username,
              emailConfirmed: user.emailConfirmed,
              createdDate: format(new Date(user.createdDate), 'PPp'),
              avatarUrl: user.avatarUrl
            })
          }
        } catch (error) {
          console.error('Error fetching user:', error)
          message.error('Failed to fetch user details')
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchUser()
  }, [id, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (id) {
        // Update existing user
        const userData: Partial<UserFormData> = {
          username: values.username,
          emailConfirmed: values.emailConfirmed
        }
        await userApi.updateUser(userData)
        message.success('User details updated successfully')

        if (values.avatar?.fileList?.[0]?.originFileObj) {
          const formData = new FormData()
          formData.append(
            'file',
            values.avatar.fileList[0].originFileObj as Blob
          )
          await userApi.updateUserAvatar(formData)
          message.success('Avatar updated successfully')
        }
      } else {
        // Create new user using login from AuthContext
        await login({
          userName: values.username!,
          password: values.password!
        })
        message.success('User created successfully')
      }

      navigate('/admin/users')
    } catch (error) {
      console.error('Error submitting form:', error)
      message.error('Failed to save user')
    }
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            labelColor: '#ffffff',
            colorText: '#ffffff',
            colorError: '#ef4444',
            colorErrorBorder: '#ef4444',
            colorErrorOutline: '#ef4444'
          },
          Input: {
            colorBgContainer: '#282d35',
            colorBorder: '#363b42',
            colorText: '#ffffff',
            colorTextPlaceholder: '#8b949e'
          },
          Button: {
            colorBgContainer: '#282d35',
            colorBorder: '#363b42',
            colorText: '#ffffff',
            colorPrimary: '#3b82f6'
          },
          Switch: {
            colorPrimary: '#3b82f6',
            colorTextQuaternary: '#ffffff',
            colorTextTertiary: '#ffffff'
          },
          Badge: {
            dotSize: 16,
            statusSize: 16
          }
        },
        token: {
          colorBgContainer: '#282d35',
          colorText: '#ffffff',
          borderRadius: 8,
          padding: 24,
          colorBgElevated: '#282d35',
          colorTextDisabled: '#8b949e'
        }
      }}
    >
      <div className="mx-auto mt-32 w-[70%]">
        <div className="rounded-lg bg-[#282d35] p-6">
          <h2 className="mb-6 text-2xl text-white">
            {id ? 'Edit User' : 'Add User'}
          </h2>

          {loading ? (
            <div className="space-y-6">
              <div>
                <Skeleton.Input
                  active={true}
                  block
                  className="mb-2 !h-4 !w-24 !bg-[#31383d]"
                />
                <Skeleton.Input
                  active={true}
                  block
                  className="!h-[32px] !bg-[#31383d]"
                />
              </div>

              <div>
                <Skeleton.Input
                  active={true}
                  block
                  className="mb-2 !h-4 !w-32 !bg-[#31383d]"
                />
                <Skeleton.Input
                  active={true}
                  size="small"
                  className="!h-[22px] !w-[44px] !bg-[#31383d]"
                />
              </div>

              {id && (
                <div>
                  <Skeleton.Input
                    active={true}
                    block
                    className="mb-2 !h-4 !w-28 !bg-[#31383d]"
                  />
                  <Skeleton.Input
                    active={true}
                    block
                    className="!h-[32px] !bg-[#31383d]"
                  />
                </div>
              )}

              <div className="flex justify-end gap-4">
                <Skeleton.Button
                  active={true}
                  className="!h-[32px] !w-[70px] !bg-[#31383d]"
                />
                <Skeleton.Button
                  active={true}
                  className="!h-[32px] !w-[70px] !bg-[#31383d]"
                />
              </div>
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Form.Item
                name="username"
                label="Username"
                rules={[
                  { required: true, message: 'Please input username!' },
                  { max: 50, message: 'Username cannot exceed 50 characters!' },
                  {
                    pattern: /^\S*$/,
                    message: 'Username cannot contain spaces!'
                  }
                ]}
              >
                <Input
                  placeholder="Enter username"
                  disabled={!!id}
                  autoComplete="off"
                />
              </Form.Item>

              <Form.Item
                name="emailConfirmed"
                label="Email Confirmed"
                valuePropName="checked"
              >
                <Switch disabled={!id} />
              </Form.Item>

              {id && (
                <Form.Item name="createdDate" label="Created Date">
                  <Input disabled />
                </Form.Item>
              )}

              {id && (
                <Form.Item
                  name="avatar"
                  label="Avatar"
                  extra={
                    <div className="mt-2 flex items-start gap-8">
                      {form.getFieldValue('avatarUrl') && (
                        <div>
                          <p className="mb-2 text-sm text-gray-400">
                            Current Avatar:
                          </p>
                          <img
                            src={form.getFieldValue('avatarUrl')}
                            alt="Current avatar"
                            className="size-20 rounded-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="mb-2 text-sm text-gray-400">
                          New Avatar Preview:
                        </p>
                        <div className="size-20 overflow-hidden rounded-full">
                          {form.getFieldValue('avatar')?.fileList?.[0]
                            ?.originFileObj && (
                            <img
                              src={URL.createObjectURL(
                                form.getFieldValue('avatar').fileList[0]
                                  .originFileObj
                              )}
                              alt="New avatar preview"
                              className="size-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  }
                >
                  <Upload
                    maxCount={1}
                    beforeUpload={() => false}
                    accept="image/*"
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />}>Select New Avatar</Button>
                  </Upload>
                </Form.Item>
              )}

              {!id && (
                <>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      { required: true, message: 'Please input password!' },
                      {
                        min: 6,
                        message: 'Password must be at least 6 characters!'
                      }
                    ]}
                  >
                    <Input.Password
                      placeholder="Enter password"
                      autoComplete="new-password"
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please input email!' },
                      { type: 'email', message: 'Please enter a valid email!' }
                    ]}
                  >
                    <Input placeholder="Enter email" autoComplete="off" />
                  </Form.Item>

                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[
                      { required: true, message: 'Please input first name!' }
                    ]}
                  >
                    <Input placeholder="Enter first name" autoComplete="off" />
                  </Form.Item>

                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[
                      { required: true, message: 'Please input last name!' }
                    ]}
                  >
                    <Input placeholder="Enter last name" autoComplete="off" />
                  </Form.Item>

                  <Form.Item name="gender" label="Gender" initialValue={true}>
                    <Switch
                      checkedChildren="Male"
                      unCheckedChildren="Female"
                      defaultChecked
                      className="!text-gray-300"
                      style={{ backgroundColor: '#363b42' }}
                    />
                  </Form.Item>
                </>
              )}

              <div className="mt-6 flex justify-end gap-4">
                <Button onClick={() => navigate('/admin/users')}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  {id ? 'Update' : 'Create'}
                </Button>
              </div>
            </Form>
          )}
        </div>
      </div>
    </ConfigProvider>
  )
}
