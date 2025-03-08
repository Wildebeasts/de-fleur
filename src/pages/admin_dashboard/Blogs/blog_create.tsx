import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  ConfigProvider,
  message,
  Upload,
  Divider
} from 'antd'
import { InboxOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import blogApi from '@/lib/services/blogApi'
import { UploadFile } from 'antd/es/upload/interface'
import TextArea from 'antd/es/input/TextArea'
import {
  BeakerIcon,
  ShieldExclamationIcon,
  AcademicCapIcon,
  ClockIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'
import { BlogCreateDto } from '@/lib/types/Blog'

const { Dragger } = Upload
const { Option } = Select

// Define tag options matching your existing tag configuration
const tagOptions = [
  {
    value: 'Ingredient Guide',
    label: 'Ingredient Guide',
    icon: <BeakerIcon className="size-4 text-emerald-500" />
  },
  {
    value: 'Skin Concerns',
    label: 'Skin Concerns',
    icon: <ShieldExclamationIcon className="size-4 text-purple-500" />
  },
  {
    value: 'Skincare Education',
    label: 'Skincare Education',
    icon: <AcademicCapIcon className="size-4 text-blue-500" />
  },
  {
    value: 'Routine Building',
    label: 'Routine Building',
    icon: <ClockIcon className="size-4 text-amber-500" />
  },
  {
    value: 'Expert Advice',
    label: 'Expert Advice',
    icon: <LightBulbIcon className="size-4 text-rose-500" />
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const MotionCard = motion(Card)

export default function CreateBlog() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // Handle file upload
  const handleFileChange = useCallback(
    ({ fileList }: { fileList: UploadFile[] }) => {
      setFileList(fileList)
    },
    []
  )

  // Create blog mutation
  const createBlogMutation = useMutation({
    mutationFn: (values: BlogCreateDto) => blogApi.createBlog(values),
    onSuccess: () => {
      message.success('Blog post created successfully')
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
      navigate({ to: '/admin/blogs' })
    },
    onError: (error) => {
      console.error('Error creating blog post:', error)
      message.error('Failed to create blog post')
      setIsSubmitting(false)
    }
  })

  // Handle form submission
  const handleSubmit = useCallback(
    async (values: any) => {
      setIsSubmitting(true)
      try {
        // Simplify the data to match API requirements
        const blogData = {
          title: values.title,
          content: values.content
        }

        // Submit to API
        createBlogMutation.mutate(blogData)
      } catch (error) {
        console.error('Error submitting form:', error)
        message.error('Failed to create blog post')
        setIsSubmitting(false)
      }
    },
    [createBlogMutation]
  )

  // Theme configuration to match existing admin pages
  const tableTheme = {
    components: {
      Card: {
        colorBgContainer: '#141414',
        colorBorderSecondary: '#303030',
        colorText: '#e5e7eb',
        colorTextHeading: '#e5e7eb'
      },
      Form: {
        colorText: '#e5e7eb',
        colorTextSecondary: '#9ca3af',
        colorBgContainer: '#141414',
        colorBorder: '#303030'
      },
      Input: {
        colorText: '#e5e7eb',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030',
        colorPrimaryHover: '#3b82f6'
      },
      Select: {
        colorText: '#e5e7eb',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030',
        colorPrimaryHover: '#3b82f6',
        colorTextPlaceholder: '#6b7280',
        optionSelectedBg: '#3b82f620'
      },
      Button: {
        colorText: '#e5e7eb',
        colorPrimary: '#3b82f6',
        colorPrimaryHover: '#2563eb',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030'
      },
      Upload: {
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030',
        colorText: '#e5e7eb',
        colorTextSecondary: '#9ca3af'
      }
    },
    token: {
      colorText: '#e5e7eb',
      colorTextSecondary: '#9ca3af',
      colorTextTertiary: '#6b7280',
      colorBgContainer: '#141414',
      colorBorder: '#303030',
      borderRadius: 6,
      controlHeight: 32
    }
  }

  // Additional styles for components that need extra customization
  const additionalStyles = `
    .ant-upload-drag {
      background-color: #1f1f1f !important;
      border: 1px dashed #303030 !important;
    }
    
    .ant-upload-drag:hover {
      border-color: #3b82f6 !important;
    }
    
    .ant-upload-drag p.ant-upload-text,
    .ant-upload-drag p.ant-upload-hint {
      color: #9ca3af !important;
    }
    
    .ant-upload-list-item {
      color: #e5e7eb !important;
    }
    
    .ant-upload-list-item-name {
      color: #e5e7eb !important;
    }
    
    .ant-form-item-label > label {
      color: #e5e7eb !important;
    }
    
    .ant-select-selection-placeholder {
      color: #6b7280 !important;
    }
    
    .ant-select-item {
      color: #e5e7eb !important;
      background-color: #1f1f1f !important;
    }
    
    .ant-select-item-option-selected {
      background-color: #3b82f620 !important;
    }
    
    .ant-select-item-option-active {
      background-color: #1f2937 !important;
    }
    
    .ant-select-dropdown {
      background-color: #1f1f1f !important;
      border: 1px solid #303030 !important;
    }
  `

  return (
    <ConfigProvider theme={tableTheme}>
      <style>{additionalStyles}</style>
      <BreadcrumbUpdater
        items={['Admin Dashboard', 'Blogs', 'Create Blog']}
        previousItems={['Admin Dashboard', 'Blogs']}
      />
      <motion.div
        className="mx-auto mt-32 w-4/5"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <MotionCard
          variants={itemVariants}
          title={
            <motion.div
              className="flex items-center justify-between"
              variants={itemVariants}
            >
              <div className="flex items-center gap-3">
                <Button
                  icon={<ArrowLeftOutlined />}
                  type="text"
                  onClick={() => navigate({ to: '/admin/blogs' })}
                />
                <span className="text-lg font-semibold">
                  Create New Blog Post
                </span>
              </div>
            </motion.div>
          }
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              {/* Blog Title */}
              <Form.Item
                name="title"
                label="Blog Title"
                rules={[
                  {
                    required: true,
                    message: 'Please enter a title for your blog post'
                  }
                ]}
              >
                <Input placeholder="Enter blog title" />
              </Form.Item>

              {/* Full Content */}
              <Form.Item
                name="content"
                label="Blog Content"
                rules={[
                  {
                    required: true,
                    message: 'Please enter the content for your blog post'
                  }
                ]}
              >
                <TextArea
                  placeholder="Enter the full content of your blog post"
                  rows={10}
                />
              </Form.Item>

              <div className="mt-8 flex justify-end">
                <Button
                  type="default"
                  className="mr-4"
                  onClick={() => navigate({ to: '/admin/blogs' })}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  style={{ backgroundColor: '#3b82f6' }}
                >
                  Create Blog Post
                </Button>
              </div>
            </Form>
          </motion.div>
        </MotionCard>
      </motion.div>
    </ConfigProvider>
  )
}
