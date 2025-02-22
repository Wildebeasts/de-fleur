// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
//import courseApi from '@/utils/services/CoursesService'
//import categoryApi from '@/utils/services/CategoryService'
//import { BreadcrumbUpdater } from '@/components/BreadcrumbUpdater'
import { UploadFile } from 'antd/es/upload/interface'

// Add this enum for status values
const CourseStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const

// Add these interfaces
interface SectionDto {
  sectionId: string
  courseId: string
  sectionName: string
  sectionNumber: number
  summary: string
  content: string
  deadline: string
  createdDate: string
  updatedDate: string
  isDeleted: boolean
  steps?: StepDto[]
}

interface StepDto {
  stepId: string
  sectionId: string
  stepNumber: number
  stepName: string
  summary: string
  videoUrl: string
  deadline: string
  stepResources: {
    resourceId: string
    stepId: string
    resourceName: string
    resourceUrl: string
    resourceType: string
  }[]
}

export default function CourseForm() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [sections, setSections] = useState<SectionDto[]>([])
  const [expandedSections, setExpandedSections] = useState<
    Record<string, SectionDto>
  >({})

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getCategories(0, 1000)
        const categoryOptions = response.items.map((category) => ({
          label: category.cateName,
          value: category.cateName
        }))
        setCategories(categoryOptions)
      } catch (error) {
        console.error('Error fetching categories:', error)
        message.error('Failed to fetch categories')
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchCourse = async () => {
      if (id) {
        setLoading(true)
        try {
          const course = await courseApi.getCourseById(id)
          const courseSections = await courseApi.getCourseSections(id)
          setSections(courseSections)
          // Set existing thumbnail if available
          if (course.thumbnailUrl) {
            setFileList([
              {
                uid: '-1',
                name: 'Current Thumbnail',
                status: 'done',
                url: course.thumbnailUrl,
                thumbUrl: course.thumbnailUrl // Add thumbUrl for preview
              }
            ])
          }

          form.setFieldsValue({
            courseName: course.courseName,
            summary: course.summary,
            price: parseFloat(course.price),
            attendance: parseInt(course.attendance),
            totalDuration: parseInt(course.totalDuration),
            status: course.status,
            categories: course.categories,
            creationProgress: course.creationProgress,
            thumbnail: course.thumbnailUrl // Set the thumbnail URL in form
          })
        } catch (error) {
          console.error('Error fetching course:', error)
          message.error('Failed to fetch course details')
        } finally {
          setLoading(false)
        }
      } else {
        // For new courses, initialize with empty values
        setFileList([])
        form.setFieldsValue({
          status: 'DRAFT',
          price: 0,
          attendance: 0,
          totalDuration: 0,
          categories: [],
          creationProgress: 'Sections',
          thumbnail: undefined
        })
        setLoading(false)
      }
    }

    fetchCourse()
  }, [id, form])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleExpand = async (expanded: boolean, record: SectionDto) => {
    if (expanded && !expandedSections[record.sectionId]) {
      try {
        const steps = await stepApi.getAllSteps()
        const sectionSteps = steps.filter(
          (step) => step.sectionId === record.sectionId
        )

        setExpandedSections((prev) => ({
          ...prev,
          [record.sectionId]: {
            ...record,
            steps: sectionSteps
          }
        }))
      } catch (error) {
        console.error('Error fetching steps:', error)
        message.error('Failed to fetch steps')
      }
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      // Get the file from the fileList
      const thumbnailFile = fileList[0]?.originFileObj

      const courseData = {
        courseName: values.courseName,
        summary: values.summary,
        price: Number(values.price),
        attendance: Number(values.attendance),
        totalDuration: Number(values.totalDuration),
        status: values.status,
        categories: Array.isArray(values.categories) ? values.categories : [],
        creationProgress: values.creationProgress,
        rating: values.rating || 0,
        thumbnail: thumbnailFile || null
      }

      if (!id) {
        // Create new course
        await courseApi.createACourse(courseData)
        message.success('Course created successfully')
      } else {
        // Update existing course
        await courseApi.updateCourse(id, courseData)
        message.success('Course updated successfully')
      }

      navigate('/admin/courses/all-course')
    } catch (error) {
      console.error('Error submitting form:', error)
      message.error('Failed to save course')
    }
  }

  const handleEditSection = (sectionId: string) => {
    navigate(`/admin/courses/${id}/sections/${sectionId}/edit`)
  }

  const handleDeleteSection = (sectionId: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this section?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await courseApi.deleteSection(id, sectionId)
          message.success('Section deleted successfully')
          // Refresh sections
          const updatedSections = sections.filter(
            (s) => s.sectionId !== sectionId
          )
          setSections(updatedSections)
        } catch (error) {
          console.error('Error deleting section:', error)
          message.error('Failed to delete section')
        }
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEditStep = (sectionId: string, stepId: string) => {
    navigate(`/admin/sections/${sectionId}/steps/${stepId}/edit`)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteStep = (stepId: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this step?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await stepApi.deleteStep(stepId)
          message.success('Step deleted successfully')
          // Refresh sections to update steps
          const updatedSections = await courseApi.getCourseSections(id)
          setSections(updatedSections)
        } catch (error) {
          console.error('Error deleting step:', error)
          message.error('Failed to delete step')
        }
      }
    })
  }

  // Simplified section columns without steps
  const sectionColumns = [
    {
      title: 'Section Name',
      dataIndex: 'sectionName',
      key: 'sectionName',
      render: (text: string) => <span>{text}</span>
    },
    {
      title: 'Summary',
      dataIndex: 'summary',
      key: 'summary',
      render: (text: string) => (
        <Tooltip title={text}>
          <div className="max-w-[300px] truncate">{text}</div>
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      align: 'center' as const,
      render: (_: unknown, record: SectionDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => handleEditSection(record.sectionId)
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                danger: true,
                onClick: () => handleDeleteSection(record.sectionId)
              }
            ]
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<EllipsisOutlined />}
            className="text-gray-400 hover:text-blue-400"
          />
        </Dropdown>
      )
    }
  ]

  return (
    <ConfigProvider
      theme={{
        components: {
          Select: {
            colorBg: '#282d35',
            colorBgContainer: '#282d35',
            colorBgElevated: '#282d35',
            colorBorder: '#363b42',
            colorPrimary: '#3b82f6',
            colorText: '#ffffff',
            colorTextPlaceholder: '#8b949e',
            controlItemBgActive: '#363b42',
            controlItemBgHover: '#363b42',
            optionActiveBg: '#363b42',
            optionSelectedBg: '#363b42',
            multipleItemBg: '#363b42',
            clearBg: '#282d35',
            colorIcon: '#8b949e',
            colorIconHover: '#ffffff',
            colorTextDisabled: '#8b949e'
          },
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
      <BreadcrumbUpdater
        items={
          id
            ? ['Admin Dashboard', 'Courses', 'Edit Course']
            : ['Admin Dashboard', 'Courses', 'Add Course']
        }
        previousItems={['Admin Dashboard', 'Courses']}
      />
      <div className="mx-auto mt-32 w-[70%]">
        {process.env.NODE_ENV === 'development' && (
          <Button
            onClick={() => setLoading(!loading)}
            className="mb-4"
            style={{
              backgroundColor: loading ? '#dc2626' : '#059669',
              color: 'white',
              border: 'none'
            }}
          >
            {loading ? 'Disable' : 'Enable'} Loading State
          </Button>
        )}
        <div className="rounded-lg bg-[#282d35] p-6">
          <h2 className="mb-6 text-2xl text-white">
            {id ? 'Edit Course' : 'Add Course'}
          </h2>

          {loading ? (
            <div className="space-y-6">
              {/* Course Name */}
              <div>
                <Skeleton.Input
                  active={true}
                  block
                  className="mb-2 !h-6 !w-32 !bg-[#31383d]"
                />
                <Skeleton.Input active={true} block className="!bg-[#31383d]" />
              </div>

              {/* Summary */}
              <div>
                <Skeleton.Input
                  active={true}
                  block
                  className="mb-2 !h-6 !w-32 !bg-[#31383d]"
                />
                <Skeleton.Input
                  active={true}
                  block
                  className="!h-[90px] !bg-[#31383d]"
                />
              </div>

              {/* Price */}
              <div>
                <Skeleton.Input
                  active={true}
                  block
                  className="mb-2 !h-6 !w-32 !bg-[#31383d]"
                />
                <Skeleton.Input active={true} block className="!bg-[#31383d]" />
              </div>

              {/* Maximum Attendance */}
              <div>
                <Skeleton.Input
                  active={true}
                  block
                  className="mb-2 !h-6 !w-32 !bg-[#31383d]"
                />
                <Skeleton.Input active={true} block className="!bg-[#31383d]" />
              </div>

              {/* Total Duration */}
              <div>
                <Skeleton.Input
                  active={true}
                  block
                  className="mb-2 !h-6 !w-32 !bg-[#31383d]"
                />
                <Skeleton.Input active={true} block className="!bg-[#31383d]" />
              </div>

              {/* Status */}
              <div>
                <Skeleton.Input
                  active={true}
                  block
                  className="mb-2 !h-6 !w-32 !bg-[#31383d]"
                />
                <Skeleton.Input active={true} block className="!bg-[#31383d]" />
              </div>

              {/* Categories */}
              <div>
                <Skeleton.Input
                  active={true}
                  block
                  className="mb-2 !h-6 !w-32 !bg-[#31383d]"
                />
                <Skeleton.Input active={true} block className="!bg-[#31383d]" />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4">
                <Skeleton.Button
                  active={true}
                  className="!w-20 rounded-md !bg-[#31383d]"
                />
                <Skeleton.Button
                  active={true}
                  className="!w-20 rounded-md !bg-[#31383d]"
                />
              </div>
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                status: 'DRAFT',
                price: 0,
                attendance: 0,
                totalDuration: 0,
                rating: 0,
                categories: [],
                creationProgress: 'Sections'
              }}
            >
              <Form.Item name="creationProgress" hidden={true}>
                <Input type="hidden" />
              </Form.Item>
              <Form.Item name="rating" hidden={true}>
                <Input type="hidden" />
              </Form.Item>
              <Form.Item
                name="courseName"
                label="Course Name"
                rules={[
                  { required: true, message: 'Please input course name!' },
                  {
                    max: 100,
                    message: 'Course name cannot exceed 100 characters!'
                  }
                ]}
              >
                <Input placeholder="Enter course name" />
              </Form.Item>
              <Form.Item
                name="summary"
                label="Summary"
                rules={[
                  { required: true, message: 'Please input course summary!' },
                  {
                    max: 500,
                    message: 'Summary cannot exceed 500 characters!'
                  }
                ]}
              >
                <Input.TextArea placeholder="Enter course summary" rows={4} />
              </Form.Item>
              <Form.Item
                name="price"
                label="Price"
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  { required: true, message: 'Please input course price!' },
                  {
                    type: 'number',
                    min: 0,
                    max: 999999.99,
                    transform: (value) => Number(value),
                    message: 'Price must be between 0 and 999,999.99!'
                  }
                ]}
              >
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="999999.99"
                  placeholder="Enter course price"
                  onChange={(e) => {
                    const value = e.target.value
                    if (value.includes('.')) {
                      const decimals = value.split('.')[1]
                      if (decimals?.length > 2) {
                        e.target.value = Number(value).toFixed(2)
                      }
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                name="attendance"
                label="Maximum Attendance"
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  {
                    required: true,
                    message: 'Please input maximum attendance!'
                  },
                  {
                    type: 'number',
                    min: 1,
                    max: 9999,
                    transform: (value) => Number(value),
                    message: 'Attendance must be between 1 and 9,999!'
                  }
                ]}
              >
                <Input
                  type="number"
                  min="1"
                  max="9999"
                  step="1"
                  placeholder="Enter maximum attendance"
                  onChange={(e) => {
                    const value = e.target.value
                    if (value.includes('.')) {
                      e.target.value = Math.floor(Number(value))
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                name="totalDuration"
                label="Total Duration (minutes)"
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  { required: true, message: 'Please input total duration!' },
                  {
                    type: 'number',
                    min: 1,
                    max: 9999,
                    transform: (value) => Number(value),
                    message: 'Duration must be between 1 and 9,999 minutes!'
                  }
                ]}
              >
                <Input
                  type="number"
                  min="1"
                  max="9999"
                  step="1"
                  placeholder="Enter total duration"
                  onChange={(e) => {
                    const value = e.target.value
                    if (value.includes('.')) {
                      e.target.value = Math.floor(Number(value))
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status!' }]}
              >
                <Select>
                  <Select.Option value={CourseStatus.DRAFT}>
                    Draft
                  </Select.Option>
                  <Select.Option value={CourseStatus.PENDING}>
                    Pending
                  </Select.Option>
                  <Select.Option value={CourseStatus.APPROVED}>
                    Approved
                  </Select.Option>
                  <Select.Option value={CourseStatus.REJECTED}>
                    Rejected
                  </Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="categories"
                label="Categories"
                rules={[
                  { required: true, message: 'Please select categories!' }
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select categories"
                  options={categories}
                />
              </Form.Item>
              <Form.Item name="thumbnail" label="Thumbnail">
                <Upload
                  accept="image/*"
                  maxCount={1}
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={(file) => {
                    const isImage = file.type.startsWith('image/')
                    if (!isImage) {
                      message.error('You can only upload image files!')
                    }
                    const isLt2M = file.size / 1024 / 1024 < 2
                    if (!isLt2M) {
                      message.error('Image must be smaller than 2MB!')
                    }
                    return isImage && isLt2M
                  }}
                  listType="picture-card"
                  showUploadList={{
                    showPreviewIcon: true,
                    showRemoveIcon: true,
                    showDownloadIcon: false
                  }}
                >
                  {fileList.length === 0 && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              <div className="mt-6 flex justify-end gap-4">
                <Button onClick={() => navigate('/admin/courses/all-course')}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  {id ? 'Update' : 'Create'}
                </Button>
              </div>
            </Form>
          )}
        </div>
      </div>

      {id && ( // Only show sections if editing an existing course
        <div className="mt-8 rounded-lg bg-[#282d35] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl text-white">Sections</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`/admin/courses/${id}/sections/add`)}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none'
              }}
              className="hover:!bg-[#2563eb]"
            >
              Add Section
            </Button>
          </div>

          <Table
            dataSource={sections}
            columns={sectionColumns}
            rowKey="sectionId"
            pagination={false}
          />
        </div>
      )}
    </ConfigProvider>
  )
}
