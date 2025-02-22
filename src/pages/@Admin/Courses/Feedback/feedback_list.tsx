// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import {
  Card,
  Rate,
  Row,
  Col,
  Typography,
  message,
  Button,
  Modal,
  Form,
  Input,
  Dropdown,
  ConfigProvider,
  Select,
  Pagination,
  Spin,
  theme,
  Empty,
} from "antd";
import {
  CommentOutlined,
  EllipsisOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import feedbackApi from "@/utils/services/FeedbackService"; // You'll need to create this service
import type { MenuProps } from "antd";
import userApi, { UserDto } from "@/utils/services/UserService";
import courseApi, { CourseDto } from "@/utils/services/CoursesService";
import { BreadcrumbUpdater } from "@/components/BreadcrumbUpdater";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { Title, Text } = Typography;

interface FeedbackDto {
  feedBackId: string;
  courseId: string;
  userId: string;
  detail: string;
  rating: number;
  createdDate: string;
  updatedDate: string;
}

interface FeedbackStats {
  averageRating: number;
  totalReviews: number;
  positivePercentage: number;
  negativePercentage: number;
}

export default function Reviews() {
  const [feedbacks, setFeedbacks] = useState<FeedbackDto[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [stats, setStats] = useState<FeedbackStats>({
    averageRating: 0,
    totalReviews: 0,
    positivePercentage: 0,
    negativePercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 10,
  });
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const calculateStats = (feedbackData: FeedbackDto[]) => {
    const totalReviews = feedbackData.length;
    if (totalReviews === 0) return;

    const averageRating =
      feedbackData.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews;
    const positiveReviews = feedbackData.filter((f) => f.rating >= 4).length;
    const positivePercentage = (positiveReviews / totalReviews) * 100;

    setStats({
      averageRating,
      totalReviews,
      positivePercentage,
      negativePercentage: 100 - positivePercentage,
    });
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await feedbackApi.getFeedbacks();
      setFeedbacks(response); // response is now directly the array
      calculateStats(response);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      message.error("Failed to fetch feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await userApi.getUsers(0, 100); // Fetch first 100 users
      setUsers(response.items);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await courseApi.getAllCourses();
      setCourses(response);
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Failed to fetch courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    fetchUsers();
    fetchCourses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = () => {
    setSelectedFeedback(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (feedback: FeedbackDto) => {
    setSelectedFeedback(feedback);
    form.setFieldsValue({
      ...feedback,
      courseId: feedback.courseId,
      userId: feedback.userId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (feedbackId: string) => {
    try {
      await feedbackApi.deleteFeedback(feedbackId);
      message.success("Feedback deleted successfully");
      fetchFeedbacks();
    } catch (error) {
      console.error("Error deleting feedback:", error);
      message.error("Failed to delete feedback");
    }
  };

  const handleSubmit = async (values: { courseId: string; userId: string; detail: string; rating: number }) => {
    try {
      const submitData = {
        courseId: values.courseId,
        userId: values.userId,
        detail: values.detail,
        rating: values.rating,
        attachment: '',
      };

      if (selectedFeedback) {
        await feedbackApi.updateFeedback(selectedFeedback.feedBackId, submitData);
        message.success("Feedback updated successfully");
      } else {
        await feedbackApi.createFeedback(submitData);
        message.success("Feedback added successfully");
      }
      
      setIsModalOpen(false);
      form.resetFields();
      fetchFeedbacks();
    } catch (error: unknown) {
      console.error("Error saving feedback:", error);
      if (error instanceof Error && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        message.error(apiError.response?.data?.message || "Failed to save feedback");
      } else {
        message.error("Failed to save feedback");
      }
    }
  };

  const getActionMenu = (feedback: FeedbackDto): MenuProps => ({
    items: [
      {
        key: "edit",
        icon: <EditOutlined />,
        label: "Edit",
        onClick: () => handleEdit(feedback),
      },
      {
        key: "delete",
        icon: <DeleteOutlined />,
        label: "Delete",
        danger: true,
        onClick: () => handleDelete(feedback.feedBackId),
      },
    ],
  });

  const getCourseNameById = (courseId: string): string => {
    const course = courses.find(c => c.courseId === courseId);
    return course?.courseName || courseId;
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize,
    });
  };

  const getUserInitial = (username: string) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  const getFilteredFeedbacks = () => {
    if (!selectedCourse) return feedbacks;
    return feedbacks.filter(feedback => feedback.courseId === selectedCourse);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        components: {
          Card: {
            colorBgContainer: "#1a1b24",
            colorBorderSecondary: "#282d35",
          },
          Pagination: {
            colorText: "#8b949e",
            colorPrimary: "#3b82f6",
            colorBgContainer: "#1a1b24",
          },
          Modal: {
            contentBg: "#1a1b24",
            headerBg: "#1a1b24",
            titleColor: "#ffffff",
            colorText: "#ffffff",
            colorIcon: "#8b949e",
            wireframe: true,
            paddingLG: 24,
            borderRadiusLG: 12,
          },
          Button: {
            colorPrimary: "#3b82f6",
            colorPrimaryHover: "#2563eb",
            colorBgContainer: "#282d35",
            colorBgContainerHover: "#353a44",
            colorText: "#9CA3AF",
            colorTextHover: "#ffffff",
          },
        },
        token: {
          colorBgBase: "#0d1117",
          colorText: "#ffffff",
          colorTextSecondary: "#8b949e",
          borderRadius: 8,
          wireframe: false,
        },
      }}
    >
      <BreadcrumbUpdater
        items={["Admin Dashboard", "Courses", "Feedback"]}
        previousItems={["Admin Dashboard", "Courses"]}
      />
      
      <div className="w-[80%] mx-auto mt-[8rem]">
        <Card
          title={
            <div className="flex items-center justify-between my-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#282d35]">
                  <CommentOutlined className="text-blue-400" />
                </div>
                <span className="text-lg font-semibold text-white">
                  Review List
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Select
                  placeholder="Filter by Course"
                  allowClear
                  className="w-[200px]"
                  onChange={(value) => setSelectedCourse(value)}
                  options={[
                    { label: 'All Courses', value: null },
                    ...courses.map(course => ({
                      label: course.courseName,
                      value: course.courseId
                    }))
                  ]}
                  loading={loadingCourses}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Add Review
                </Button>
              </div>
            </div>
          }
          className="h-full w-full bg-[#1a1b24] rounded-xl bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-60 
            border border-gray-100/10 hover:border-gray-100/20 transition-all duration-300"
        >
          {loading ? (
            <div className="text-center p-12">
              <Spin size="large" />
            </div>
          ) : getFilteredFeedbacks().length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-gray-400">
                      {selectedCourse 
                        ? "No reviews found for this course" 
                        : "No reviews found"}
                    </span>
                    <Button
                      type="primary"
                      onClick={handleAdd}
                      icon={<PlusOutlined />}
                      className="bg-blue-500 hover:bg-blue-600 mt-4"
                    >
                      Add First Review
                    </Button>
                  </div>
                }
                className="text-gray-400"
              />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {getFilteredFeedbacks().map((feedback) => {
                  const user = users.find(u => u.id === feedback.userId);
                  const courseName = getCourseNameById(feedback.courseId);
                  
                  return (
                    <Col xs={24} sm={12} md={8} lg={6} xl={6} key={feedback.feedBackId}>
                      <Card
                        hoverable
                        className="group h-full bg-[#1a1b24] rounded-xl bg-clip-padding backdrop-filter 
                          backdrop-blur-lg bg-opacity-60 border border-gray-100/10
                          hover:border-gray-100/20 transition-all duration-300"
                      >
                        <div className="flex flex-col h-full">
                          {/* Course Name and Date */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-white line-clamp-1 flex-1">
                              {courseName}
                            </span>
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {format(new Date(feedback.createdDate), "MMM dd, yyyy")}
                            </span>
                          </div>

                          {/* Rating */}
                          <div className="mb-2">
                            <Rate 
                              disabled 
                              value={feedback.rating} 
                              className="text-yellow-400 text-sm" 
                            />
                          </div>

                          {/* Content */}
                          <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                            {feedback.detail}
                          </p>

                          {/* Footer with User Info */}
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {user?.avatarUrl ? (
                                <img 
                                  src={user.avatarUrl} 
                                  alt={user.username}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                  <span className="text-xs text-blue-400">
                                    {getUserInitial(user?.username || '')}
                                  </span>
                                </div>
                              )}
                              <span className="text-xs text-gray-400">
                                {user?.username || 'Unknown User'}
                              </span>
                            </div>
                            <Dropdown menu={getActionMenu(feedback)} placement="bottomRight">
                              <Button
                                type="text"
                                icon={<EllipsisOutlined />}
                                className="text-gray-400 hover:text-white"
                              />
                            </Dropdown>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>

              <div className="mt-6 flex justify-end">
                <Pagination
                  current={pagination.current}
                  total={getFilteredFeedbacks().length}
                  pageSize={pagination.pageSize}
                  onChange={handlePageChange}
                  className="text-gray-400"
                  showSizeChanger={false}
                  showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                />
              </div>
            </>
          )}
        </Card>
      </div>

      <Modal
        title={
          <span className="text-white">
            {selectedFeedback ? "Edit Feedback" : "Add Feedback"}
          </span>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        className="overflow-hidden"
        maskClassName="bg-black/50"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="courseId"
            label={<span className="text-white">Course</span>}
            rules={[{ required: true, message: "Please select a course" }]}
          >
            <Select
              loading={loadingCourses}
              placeholder="Select a course"
              className="bg-[#323842] border-[#30363d]"
              options={courses.map(course => ({
                label: course.courseName,
                value: course.courseId
              }))}
            />
          </Form.Item>

          <Form.Item
            name="userId"
            label={<span className="text-white">User</span>}
            rules={[{ required: true, message: "Please select a user" }]}
          >
            <Select
              loading={loadingUsers}
              placeholder="Select a user"
              className="bg-[#323842] border-[#30363d]"
              options={users.map(user => ({
                label: user.username,
                value: user.id
              }))}
            />
          </Form.Item>

          <Form.Item
            name="rating"
            label={<span className="text-white">Rating</span>}
            rules={[{ required: true, message: "Please select rating" }]}
          >
            <Rate className="text-yellow-400" />
          </Form.Item>

          <Form.Item
            name="detail"
            label={<span className="text-white">Detail</span>}
            rules={[{ required: true, message: "Please enter feedback detail" }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Enter your feedback"
              className="bg-[#323842] border-[#30363d] text-white" 
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Button 
              onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
              }} 
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              className="bg-blue-500 hover:bg-blue-600"
            >
              {selectedFeedback ? "Update" : "Add"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </ConfigProvider>
  );
}
