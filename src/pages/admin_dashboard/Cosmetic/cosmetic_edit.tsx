/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Form,
  InputNumber,
  Select,
  Button,
  Card,
  ConfigProvider,
  message,
  Divider,
  Spin
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import cosmeticApi from '@/lib/services/cosmeticApi'
import brandApi from '@/lib/services/brandApi'
import skinTypeApi from '@/lib/services/skinTypeApi'
import cosmeticTypeApi from '@/lib/services/cosmeticTypeApi'
import TextArea from 'antd/es/input/TextArea'

const { Option } = Select

// Volume unit enum values matching your API
const VolumeUnitEnum = {
  ML: 0,
  L: 1,
  G: 2
}

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

export default function EditCosmetic() {
  const navigate = useNavigate()
  const params = useParams({ from: '/admin/cosmetics/$cosmeticId/edit' })
  const cosmeticId = params.cosmeticId
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialValues, setInitialValues] = useState<any>(null)
  const queryClient = useQueryClient()

  // Fetch cosmetic data
  const { data: cosmetic, isLoading: isLoadingCosmetic } = useQuery({
    queryKey: ['cosmetic', cosmeticId],
    queryFn: async () => {
      const response = await cosmeticApi.getCosmeticById(cosmeticId)
      return response.data.data
    },
    enabled: !!cosmeticId
  })

  // Fetch brands
  const { data: brands = [], isLoading: isLoadingBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await brandApi.getBrands()
      return response.data.data || []
    }
  })

  // Fetch skin types
  const { data: skinTypes = [], isLoading: isLoadingSkinTypes } = useQuery({
    queryKey: ['skinTypes'],
    queryFn: async () => {
      const response = await skinTypeApi.getSkinTypes()
      return response.data.data || []
    }
  })

  // Fetch cosmetic types
  const { data: cosmeticTypes = [], isLoading: isLoadingCosmeticTypes } =
    useQuery({
      queryKey: ['cosmeticTypes'],
      queryFn: async () => {
        const response = await cosmeticTypeApi.getCosmeticTypes()
        return response.data.data || []
      }
    })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (values: {
      price: number
      mainUsage?: string
      instructions?: string
    }) => {
      return cosmeticApi.updateCosmetic(cosmeticId, values)
    },
    onSuccess: () => {
      message.success('Cosmetic updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['cosmetics'] })
      queryClient.invalidateQueries({ queryKey: ['cosmetic', cosmeticId] })
      navigate({ to: '/admin/cosmetics' })
    },
    onError: (error) => {
      console.error('Error updating cosmetic:', error)
      message.error('Failed to update cosmetic')
    },
    onSettled: () => {
      setIsSubmitting(false)
    }
  })

  // Set form values when cosmetic data is loaded
  useEffect(() => {
    if (cosmetic) {
      const formValues = {
        price: cosmetic.price,
        mainUsage: cosmetic.mainUsage,
        instructions: cosmetic.instructions
      }

      setInitialValues(formValues)
      form.setFieldsValue(formValues)
    }
  }, [cosmetic, form])

  const onFinish = async (values: any) => {
    try {
      setIsSubmitting(true)
      await updateMutation.mutateAsync(values)
    } catch (error) {
      console.error('Error updating cosmetic:', error)
      setIsSubmitting(false)
    }
  }

  // Style theme for the form (same as create form)
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
      InputNumber: {
        colorText: '#e5e7eb',
        colorBgContainer: '#1f1f1f',
        colorBorder: '#303030'
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
      Switch: {
        colorPrimary: '#3b82f6',
        colorPrimaryHover: '#2563eb'
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
      controlHeight: 36
    }
  }

  const additionalStyles = `
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

  // Show loading state while fetching initial data
  if (isLoadingCosmetic || !initialValues) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <ConfigProvider theme={tableTheme}>
      <style>{additionalStyles}</style>
      <BreadcrumbUpdater
        items={['Admin Dashboard', 'Cosmetics', 'Edit Cosmetic']}
        previousItems={['Admin Dashboard', 'Cosmetics']}
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
                  onClick={() => navigate({ to: '/admin/cosmetics' })}
                />
                <span className="text-lg font-semibold">
                  Edit Cosmetic: {cosmetic?.name}
                </span>
              </div>
            </motion.div>
          }
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={initialValues}
            >
              <div className="space-y-6">
                {cosmetic && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-blue-400">
                      {cosmetic.name}
                    </h2>
                    <p className="text-gray-400">ID: {cosmetic.id}</p>
                  </div>
                )}

                <Divider orientation="left" className="text-gray-400">
                  Editable Fields
                </Divider>

                <Form.Item
                  label="Price"
                  name="price"
                  rules={[{ required: true, message: 'Please enter price' }]}
                >
                  <InputNumber<number>
                    min={0}
                    style={{ width: '100%' }}
                    placeholder="Enter price"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ₫'
                    }
                    parser={(value) => {
                      const parsed = value
                        ? parseFloat(value.replace(/[\s₫,]/g, ''))
                        : 0
                      return isNaN(parsed) ? 0 : parsed
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="Main Usage"
                  name="mainUsage"
                  rules={[
                    { required: true, message: 'Please enter main usage' }
                  ]}
                >
                  <TextArea
                    placeholder="Enter main usage"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                  />
                </Form.Item>

                <Form.Item
                  label="Instructions"
                  name="instructions"
                  rules={[
                    { required: true, message: 'Please enter instructions' }
                  ]}
                >
                  <TextArea
                    placeholder="Enter usage instructions"
                    autoSize={{ minRows: 3, maxRows: 6 }}
                  />
                </Form.Item>
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-end">
                <Button
                  type="default"
                  className="mr-4"
                  onClick={() => navigate({ to: '/admin/cosmetics' })}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  style={{ backgroundColor: '#3b82f6' }}
                >
                  Update Cosmetic
                </Button>
              </div>
            </Form>
          </motion.div>
        </MotionCard>
      </motion.div>
    </ConfigProvider>
  )
}
