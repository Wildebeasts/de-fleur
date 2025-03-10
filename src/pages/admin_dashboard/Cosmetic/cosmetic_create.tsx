/* eslint-disable tailwindcss/no-custom-classname */
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Card,
  ConfigProvider,
  message,
  Upload,
  Divider
} from 'antd'
import { InboxOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import cosmeticApi from '@/lib/services/cosmeticApi'
import brandApi from '@/lib/services/brandApi'
import skinTypeApi from '@/lib/services/skinTypeApi'
import cosmeticTypeApi from '@/lib/services/cosmeticTypeApi'
import { RcFile, UploadFile } from 'antd/es/upload/interface'
import TextArea from 'antd/es/input/TextArea'

const { Dragger } = Upload
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

export default function CreateCosmetic() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

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

  const handleUploadChange = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList)
  }

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('You can only upload image files!')
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!')
    }
    return false // Prevent auto upload
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (values: any) => {
    try {
      setIsSubmitting(true)
      console.log('Form values:', values)

      // Get the first image as thumbnail if available
      const thumbnailFile =
        fileList.length > 0 ? (fileList[0].originFileObj as File) : null
      console.log('Thumbnail file:', thumbnailFile ? 'Selected' : 'None')
      console.log('Total files:', fileList.length)

      // Create cosmetic with thumbnail
      const cosmeticPayload = {
        brandId: values.brandId,
        skinTypeId: values.skinTypeId,
        cosmeticTypeId: values.cosmeticTypeId,
        name: values.name,
        price: values.price,
        gender: values.gender,
        notice: values.notice || null,
        ingredients: values.ingredients,
        mainUsage: values.mainUsage,
        texture: values.texture || null,
        origin: values.origin,
        instructions: values.instructions,
        size: values.size,
        volumeUnit: values.volumeUnit,
        thumbnail: thumbnailFile
      }
      console.log('Sending payload:', {
        ...cosmeticPayload,
        thumbnail: thumbnailFile ? 'File present' : 'No file'
      })

      // Create cosmetic
      console.log('Calling API...')
      const response = await cosmeticApi.createCosmetic(cosmeticPayload)
      console.log('API Response:', response)
      console.log('Response data:', response.data)

      if (response.data.isSuccess) {
        console.log('Creation successful, checking for data.id...')

        // Only try to upload additional images if we have a cosmeticId
        if (
          response.data.data &&
          response.data.data.id &&
          fileList.length > 1
        ) {
          const cosmeticId = response.data.data.id
          console.log('Found cosmeticId:', cosmeticId)

          // Skip the first image (thumbnail) and upload the rest
          const additionalImages = fileList
            .slice(1)
            .map((file) => file.originFileObj as File)
          console.log('Uploading additional images:', additionalImages.length)

          await cosmeticApi.uploadCosmeticImages({
            cosmeticId,
            images: additionalImages
          })
          console.log('Additional images uploaded successfully')
        } else {
          console.log('No additional images to upload or missing cosmeticId')
          console.log('data field:', response.data.data)
          console.log('fileList length:', fileList.length)
        }

        message.success(
          response.data.message || 'Cosmetic created successfully!'
        )
        console.log('Invalidating queries and navigating back...')
        queryClient.invalidateQueries({ queryKey: ['cosmetics'] })
        navigate({ to: '/admin/cosmetics' })
      } else {
        console.error('API returned isSuccess: false', response.data)
        message.error(response.data.message || 'Failed to create cosmetic')
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error creating cosmetic:', error)
      if (error.response) {
        console.error('Error response:', error.response.data)
        console.error('Status code:', error.response.status)
        console.error('Headers:', error.response.headers)
      }
      message.error('Failed to create cosmetic')
    } finally {
      setIsSubmitting(false)
    }
  }

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
        items={['Admin Dashboard', 'Cosmetics', 'Create Cosmetic']}
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
                  Create New Cosmetic
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
              initialValues={{
                gender: true,
                volumeUnit: VolumeUnitEnum.ML
              }}
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <div className="space-y-4">
                  <Divider orientation="left" className="text-gray-400">
                    Basic Information
                  </Divider>

                  <Form.Item
                    label="Name"
                    name="name"
                    rules={[
                      { required: true, message: 'Please enter cosmetic name' }
                    ]}
                  >
                    <Input placeholder="Enter cosmetic name" />
                  </Form.Item>

                  <Form.Item
                    label="Brand"
                    name="brandId"
                    rules={[
                      { required: true, message: 'Please select a brand' }
                    ]}
                  >
                    <Select
                      placeholder="Select brand"
                      loading={isLoadingBrands}
                      showSearch
                      optionFilterProp="children"
                    >
                      {brands.map((brand) => (
                        <Option key={brand.id} value={brand.id}>
                          {brand.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Skin Type"
                    name="skinTypeId"
                    rules={[
                      { required: true, message: 'Please select a skin type' }
                    ]}
                  >
                    <Select
                      placeholder="Select skin type"
                      loading={isLoadingSkinTypes}
                      showSearch
                      optionFilterProp="children"
                    >
                      {skinTypes.map((skinType) => (
                        <Option key={skinType.id} value={skinType.id}>
                          {skinType.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Cosmetic Type"
                    name="cosmeticTypeId"
                    rules={[
                      {
                        required: true,
                        message: 'Please select a cosmetic type'
                      }
                    ]}
                  >
                    <Select
                      placeholder="Select cosmetic type"
                      loading={isLoadingCosmeticTypes}
                      showSearch
                      optionFilterProp="children"
                    >
                      {cosmeticTypes.map((type) => (
                        <Option key={type.id} value={type.id}>
                          {type.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Price"
                    name="price"
                    rules={[{ required: true, message: 'Please enter price' }]}
                  >
                    <InputNumber<number>
                      min={0}
                      step={0.01}
                      style={{ width: '100%' }}
                      placeholder="Enter price"
                      formatter={(value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      parser={(value) => {
                        const parsed = value
                          ? parseFloat(value.replace(/\$\s?|(,*)/g, ''))
                          : 0
                        return isNaN(parsed) ? 0 : parsed
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Gender"
                    name="gender"
                    valuePropName="checked"
                    tooltip="Toggle for gender-specific products (ON = Female, OFF = Male)"
                  >
                    <Switch checkedChildren="Female" unCheckedChildren="Male" />
                  </Form.Item>
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <Divider orientation="left" className="text-gray-400">
                    Product Details
                  </Divider>

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
                    label="Ingredients"
                    name="ingredients"
                    rules={[
                      { required: true, message: 'Please enter ingredients' }
                    ]}
                  >
                    <TextArea
                      placeholder="Enter ingredients"
                      autoSize={{ minRows: 2, maxRows: 4 }}
                    />
                  </Form.Item>

                  <Form.Item label="Texture" name="texture">
                    <Input placeholder="Enter texture (optional)" />
                  </Form.Item>

                  <Form.Item
                    label="Origin"
                    name="origin"
                    rules={[{ required: true, message: 'Please enter origin' }]}
                  >
                    <Input placeholder="Enter origin" />
                  </Form.Item>

                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      label="Size"
                      name="size"
                      rules={[{ required: true, message: 'Please enter size' }]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="Enter size"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Volume Unit"
                      name="volumeUnit"
                      rules={[
                        { required: true, message: 'Please select volume unit' }
                      ]}
                    >
                      <Select placeholder="Select unit">
                        <Option value={VolumeUnitEnum.ML}>ML</Option>
                        <Option value={VolumeUnitEnum.L}>L</Option>
                        <Option value={VolumeUnitEnum.G}>G</Option>
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-6">
                <Divider orientation="left" className="text-gray-400">
                  Additional Information
                </Divider>

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

                <Form.Item label="Notice" name="notice">
                  <TextArea
                    placeholder="Enter notice or warnings (optional)"
                    autoSize={{ minRows: 3, maxRows: 6 }}
                  />
                </Form.Item>
              </div>

              {/* Image Upload */}
              <div className="mt-6">
                <Divider orientation="left" className="text-gray-400">
                  Product Images
                </Divider>

                <Form.Item
                  label="Upload Images"
                  name="images"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e && e.fileList}
                >
                  <Dragger
                    name="files"
                    multiple
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    onChange={handleUploadChange}
                    showUploadList={{
                      showPreviewIcon: true,
                      showRemoveIcon: true
                    }}
                    accept="image/*"
                    customRequest={({ onSuccess }) => {
                      if (onSuccess) onSuccess('ok')
                    }}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined style={{ color: '#3b82f6' }} />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag files to upload
                    </p>
                    <p className="ant-upload-hint">
                      Support for single or bulk upload. Strictly prohibited
                      from uploading company data or other banned files.
                    </p>
                  </Dragger>
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
                  Create Cosmetic
                </Button>
              </div>
            </Form>
          </motion.div>
        </MotionCard>
      </motion.div>
    </ConfigProvider>
  )
}
