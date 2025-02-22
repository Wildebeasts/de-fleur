import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Table,
  // @ts-expect-error - expected
  ConfigProvider,
  Dropdown,
  Button,
  Modal,
  message,
  Tooltip,
  Badge,
  // @ts-expect-error - expected
  Rate,
  Tag,
} from "antd";
// @ts-expect-error - expected
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ColumnType } from "antd/es/table";
import "antd/dist/reset.css";
import {
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  PlusOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Input, Checkbox } from "antd";
import courseApi from "@/utils/services/CoursesService";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useLoading } from "@/contexts/LoadingContext";
import stepApi from "@/utils/services/StepService";
import React from "react";
import { BreadcrumbUpdater } from "@/components/BreadcrumbUpdater";
import { ImageOff } from "lucide-react";

interface CourseDto {
  courseId: string;
  courseName: string;
  summary: string;
  attendance: number;
  price: number;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  totalDuration: number;
  createdDate: string;
  lastUpdate: string;
  categories: string[];
  thumbnailUrl: string;
}

interface SectionDto {
  sectionId: string;
  courseId: string;
  sectionName: string;
  sectionNumber: number;
  summary: string;
  content: string;
  deadline: string;
  createdDate: string;
  updatedDate: string;
  isDeleted: boolean;
  steps?: StepDto[];
}

interface StepDto {
  stepId: string;
  sectionId: string;
  stepNumber: number;
  stepName: string;
  summary: string;
  videoUrl: string;
  deadline: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stepResources: any[]; // You can define a specific type for resources if needed
}

interface DataType extends CourseDto {
  key: React.Key;
  sections?: SectionDto[];
}

// Define HighlightText as a regular component first
const HighlightText = ({
  text,
  searchText,
}: {
  text: string;
  searchText: string;
}) => {
  if (!searchText || !text) return <span>{text}</span>;

  const parts = text.split(new RegExp(`(${searchText})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === searchText.toLowerCase() ? (
          <span key={i} className="bg-yellow-500/30">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

// Then memoize it
const MemoizedHighlightText = React.memo(HighlightText);

// @ts-expect-error - expected
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const parseCustomDate = (dateStr: string) => {
  const [datePart, timePart] = dateStr.split(" ");
  const [day, month, year] = datePart.split("/");
  const [time] = timePart.split(" "); // Ignore the 'SA' part
  const [hours, minutes, seconds] = time.split(":");

  return new Date(
    parseInt(year),
    parseInt(month) - 1, // months are 0-based in JavaScript
    parseInt(day),
    parseInt(hours),
    parseInt(minutes),
    parseInt(seconds)
  );
};

const formatPriceWithSuffix = (price: number) => {
  if (price >= 1000000) {
    return {
      value: (price / 1000000).toFixed(0).padStart(3, ' '),
      suffix: 'm'
    };
  } else if (price >= 1000) {
    return {
      value: (price / 1000).toFixed(0).padStart(3, ' '),
      suffix: 'k'
    };
  }
  return {
    value: price.toString().padStart(3, ' '),
    suffix: ' '
  };
};

export default function Courses() {
  // @ts-expect-error - expected
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { updateBreadcrumb } = useBreadcrumb();
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();

  // Add all refs at the top
  const loadingRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // State declarations
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataType[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [originalData, setOriginalData] = useState<DataType[]>([]);

  // Add search handler
  const handleGlobalSearch = useCallback(
    (value: string) => {
      setSearchText(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (!value.trim()) {
          setData(originalData);
          return;
        }

        const filteredData = originalData.filter((item) =>
          Object.entries(item).some(([key, val]) => {
            if (!val) return false;
            if (key === "createdDate") {
              return format(new Date(val), "PPp")
                .toLowerCase()
                .includes(value.toLowerCase());
            }
            if (Array.isArray(val)) {
              return val.some((v) =>
                v?.toString().toLowerCase().includes(value.toLowerCase())
              );
            }
            return val?.toString().toLowerCase().includes(value.toLowerCase());
          })
        );
        setData(filteredData);
      }, 300);
    },
    [originalData]
  );

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Define fetchData first
  const fetchData = useCallback(async () => {
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoading(true);
      startLoading();
      const response = await courseApi.getAllCourses();

      // Fetch sections and steps for each course
      const coursesWithSectionsAndSteps = await Promise.all(
        response.map(async (course) => {
          // @ts-expect-error - expected
          const sections = await courseApi.getCourseSections(course.courseId);
          const sectionsWithSteps = await Promise.all(
            sections.map(async (section) => {
              const steps = await stepApi.getAllSteps();
              const sectionSteps = steps.filter(
                // @ts-expect-error - expected
                (step) => step.sectionId === section.sectionId
              );
              return {
                ...section,
                steps: sectionSteps,
              };
            })
          );

          return {
            ...course,
            // @ts-expect-error - expected
            key: course.courseId,
            sections: sectionsWithSteps,
          };
        })
      );

      // @ts-expect-error - expected
      setData(coursesWithSectionsAndSteps);
      // @ts-expect-error - expected
      setOriginalData(coursesWithSectionsAndSteps);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to fetch data");
    } finally {
      loadingRef.current = false;
      setLoading(false);
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  // Define ALL handler functions before columns
  const handleEdit = useCallback(
    (record: DataType) => {
      navigate(`/admin/courses/edit/${record.courseId}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    (record: DataType) => {
      Modal.confirm({
        title: "Are you sure you want to delete this course?",
        // @ts-expect-error - expected
        content: "This action cannot be undone.",
        okText: "Yes",
        okType: "danger",
        cancelText: "No",
        onOk: async () => {
          try {
            await courseApi.deleteCourse(record.courseId);
            message.success("Course deleted successfully");
            fetchData();
          } catch (error) {
            console.error("Error deleting course:", error);
            message.error("Failed to delete course");
          }
        },
      });
    },
    [fetchData]
  );

  const handleEditSection = useCallback(
    (courseId: string, sectionId: string) => {
      navigate(`/admin/courses/${courseId}/sections/${sectionId}/edit`);
    },
    [navigate]
  );

  const handleDeleteSection = useCallback(
    (courseId: string, sectionId: string) => {
      Modal.confirm({
        title: "Are you sure you want to delete this section?",
        // @ts-expect-error - expected
        content: "This action cannot be undone.",
        okText: "Yes",
        okType: "danger",
        cancelText: "No",
        onOk: async () => {
          try {
            // @ts-expect-error - expected
            await courseApi.deleteSection(courseId, sectionId);
            message.success("Section deleted successfully");
            fetchData();
          } catch (error) {
            console.error("Error deleting section:", error);
            message.error("Failed to delete section");
          }
        },
      });
    },
    [fetchData]
  );

  const handleEditStep = useCallback(
    (sectionId: string, stepId: string) => {
      navigate(`/admin/sections/${sectionId}/steps/${stepId}/edit`);
    },
    [navigate]
  );

  const handleDeleteStep = useCallback(
    (_sectionId: string, stepId: string) => {
      Modal.confirm({
        title: "Are you sure you want to delete this step?",
        // @ts-expect-error - expected
        content: "This action cannot be undone.",
        okText: "Yes",
        okType: "danger",
        cancelText: "No",
        onOk: async () => {
          try {
            await stepApi.deleteStep(stepId);
            message.success("Step deleted successfully");
            fetchData();
          } catch (error) {
            console.error("Error deleting step:", error);
            message.error("Failed to delete step");
          }
        },
      });
    },
    [fetchData]
  );

  // THEN define columns
  const columns = useMemo(
    () => [
      {
        title: "Course Name",
        dataIndex: "courseName",
        key: "courseName",
        width: '15%', // Even smaller width
        render: (text: string, record: DataType) => (
          // @ts-expect-error - expected
          <Tooltip title={
            <div>
              <div className="font-semibold">{text}</div>
              <div className="text-xs mt-1">{record.summary}</div>
            </div>
          }>
            <div className="flex flex-col max-w-[200px]"> {/* Reduced max width */}
              <div className="truncate font-medium">
                <MemoizedHighlightText text={text} searchText={searchText} />
              </div>
              <div className="text-xs text-gray-400 truncate">
                <MemoizedHighlightText 
                  text={record.summary?.length > 35 
                    ? record.summary.substring(0, 35) + '...' 
                    : record.summary} 
                  searchText={searchText} 
                />
              </div>
            </div>
          </Tooltip>
        ),
      },
      {
        title: "",
        dataIndex: "thumbnailUrl",
        key: "thumbnailUrl",
        width: '48px',
        align: "center" as const,
        render: (thumbnailUrl: string) => (
          // @ts-expect-error - expected
          <Button
            type="text"
            onClick={() => {
              Modal.info({
                title: null,
                // @ts-expect-error - expected
                icon: null,
                content: (
                  <div className="relative min-h-[20rem]">
                    {thumbnailUrl && thumbnailUrl.trim() !== '' ? (
                      <img 
                        src={thumbnailUrl} 
                        alt="Course thumbnail" 
                        style={{ width: '100%', borderRadius: '8px' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement?.querySelector('.thumbnail-placeholder')?.classList.remove('hidden');
                        }}
                        className="shadow-lg"
                      />
                    ) : null}
                    <div className={`absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded thumbnail-placeholder min-h-[20rem] ${thumbnailUrl && thumbnailUrl.trim() !== '' ? 'hidden' : ''}`}>
                      <ImageOff className="text-gray-400 w-[10rem] h-[10rem]" />
                    </div>
                  </div>
                ),
                footer: null,
                width: 600,
                className: "thumbnail-preview-modal",
                maskClosable: true
              });
            }}
            className="p-0 flex items-center justify-center hover:scale-110 transition-transform duration-200"
          >
            <div className="relative w-8 h-8">
              {thumbnailUrl && thumbnailUrl.trim() !== '' ? (
                <img
                  src={thumbnailUrl}
                  alt="thumbnail"
                  className="w-8 h-8 object-cover rounded shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.querySelector('.thumbnail-placeholder')?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded thumbnail-placeholder ${thumbnailUrl && thumbnailUrl.trim() !== '' ? 'hidden' : ''}`}>
                <ImageOff className="text-gray-400 w-4 h-4" />
              </div>
            </div>
          </Button>
        ),
      },
      {
        title: "Price",
        dataIndex: "price",
        key: "price",
        align: "center",
        width: '6%',
        render: (price: number) => {
          const formatted = formatPriceWithSuffix(price);
          return (
            // @ts-expect-error -- expected
            <Tooltip title={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}>
              <div className="flex items-center justify-center gap-1">
                <div className="font-mono inline-flex items-baseline">
                  <span className="font-medium w-[3ch] text-right">{formatted.value}</span>
                  <span className="text-gray-400 w-[1ch]">{formatted.suffix}</span>
                </div>
                <span className="text-gray-400 text-xs">đ</span>
              </div>
            </Tooltip>
          );
        },
      },
      {
        title: "Attendance",
        dataIndex: "attendance",
        key: "attendance",
        align: "center",
        width: '7%', // Relative width
        render: (attendance: number) => (
          <span>{attendance.toLocaleString()}</span>
        ),
      },
      {
        title: "Creation Progress",
        dataIndex: "creationProgress",
        key: "creationProgress",
        align: "center",
        width: '10%',
        render: (progress: string) => {
          const progressConfig = {
            'Not Started': { status: 'default', color: '#8b949e' },
            'In Progress': { status: 'processing', color: '#3b82f6' },
            'Complete': { status: 'success', color: '#10b981' },
            'Failed': { status: 'error', color: '#ef4444' }
          };

          // Add a fallback for unexpected values
          const config = progressConfig[progress as keyof typeof progressConfig] || 
                        { status: 'default', color: '#8b949e' };

          return (
            <Badge
              // @ts-expect-error - expected
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              status={config.status as any}
              text={
                <span style={{ color: config.color }}>
                  <MemoizedHighlightText text={progress} searchText={searchText} />
                </span>
              }
            />
          );
        }
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        width: '8%',
        render: (status: string) => {
          const statusConfig = {
            DRAFT: { status: 'default', color: '#8b949e' },
            PENDING: { status: 'processing', color: '#3b82f6' },
            APPROVED: { status: 'success', color: '#10b981' },
            REJECTED: { status: 'error', color: '#ef4444' }
          };

          return (
            <Badge
              // @ts-expect-error - expected
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              status={statusConfig[status as keyof typeof statusConfig].status as any}
              text={
                <span style={{ color: statusConfig[status as keyof typeof statusConfig].color }}>
                  <MemoizedHighlightText text={status} searchText={searchText} />
                </span>
              }
            />
          );
        }
      },
      {
        title: "Duration",
        dataIndex: "totalDuration",
        key: "totalDuration",
        align: "center",
        width: '7%',
        render: (duration: number) => (
          <span>{duration} minutes</span>
        ),
      },
      {
        title: "Categories",
        dataIndex: "categories",
        key: "categories",
        width: '10%', // Give more space to categories
        render: (categories: string[]) => (
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
              // @ts-expect-error - expected
              <Tag
                key={category}
                className="m-0"
                style={{ 
                  backgroundColor: '#1e1f2a',
                  borderColor: '#3b82f640',
                  color: '#3b82f6'
                }}
              >
                <MemoizedHighlightText text={category} searchText={searchText} />
              </Tag>
            ))}
          </div>
        ),
      },
      {
        title: "Rating",
        dataIndex: "rating",
        key: "rating",
        width: '12%', // Relative width
        render: (rating: number) => (
          <div className="flex items-center gap-1 min-w-[120px]">
            <Rate 
              disabled 
              allowHalf
              value={rating}
              className="text-xs" 
              style={{ fontSize: '14px' }} 
            />
            <span className="text-gray-400 text-xs ml-1 whitespace-nowrap">
              ({rating.toFixed(1)})
            </span>
          </div>
        ),
      },
      {
        title: "Created Date",
        dataIndex: "createdDate",
        key: "createdDate",
        render: (date: string) => (
          <MemoizedHighlightText 
            text={format(new Date(date), "PPp")} 
            searchText={searchText} 
          />
        ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 80,
        align: "center" as const,
        render: (_: unknown, record: DataType) => (
          // @ts-expect-error - expected
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  icon: <EditOutlined />,
                  label: "Edit",
                  onClick: () => handleEdit(record),
                },
                {
                  key: "delete",
                  icon: <DeleteOutlined />,
                  label: "Delete",
                  danger: true,
                  onClick: () => handleDelete(record),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button
              type="text"
              // @ts-expect-error - expected
              icon={<EllipsisOutlined />}
              className="text-gray-400 hover:text-blue-400"
            />
          </Dropdown>
        ),
      },
    ],
    [searchText, handleEdit, handleDelete]
  );

  const sectionColumns = useMemo(
    () => [
      {
        title: "Section Name",
        dataIndex: "sectionName",
        key: "sectionName",
        render: (text: string) => (
          <MemoizedHighlightText text={text} searchText={searchText} />
        ),
      },
      {
        title: "Summary",
        dataIndex: "summary",
        key: "summary",
        render: (text: string) => (
          // @ts-expect-error - expected
          <Tooltip title={text}>
            <div className="max-w-[300px] truncate">
              <MemoizedHighlightText text={text} searchText={searchText} />
            </div>
          </Tooltip>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 80,
        align: "center",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (_: any, record: SectionDto) => (
          // @ts-expect-error - expected
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  icon: <EditOutlined />,
                  label: "Edit",
                  onClick: () =>
                    handleEditSection(record.courseId, record.sectionId),
                },
                {
                  key: "delete",
                  icon: <DeleteOutlined />,
                  label: "Delete",
                  danger: true,
                  onClick: () =>
                    handleDeleteSection(record.courseId, record.sectionId),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button
              type="text"
              // @ts-expect-error - expected
              icon={<EllipsisOutlined />}
              className="text-gray-400 hover:text-blue-400"
            />
          </Dropdown>
        ),
      },
    ],
    [searchText, handleEditSection, handleDeleteSection]
  );

  const stepColumns = useMemo(
    () => [
      {
        title: "Step Name",
        dataIndex: "stepName",
        key: "stepName",
        render: (text: string) => (
          <MemoizedHighlightText text={text} searchText={searchText} />
        ),
      },
      {
        title: "Summary",
        dataIndex: "summary",
        key: "summary",
        render: (text: string) => (
          // @ts-expect-error - expected
          <Tooltip title={text}>
            <div className="max-w-[300px] truncate">
              <MemoizedHighlightText text={text} searchText={searchText} />
            </div>
          </Tooltip>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 80,
        align: "center",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (_: any, record: StepDto) => (
          // @ts-expect-error - expected
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  icon: <EditOutlined />,
                  label: "Edit",
                  onClick: () =>
                    handleEditStep(record.sectionId, record.stepId),
                },
                {
                  key: "delete",
                  icon: <DeleteOutlined />,
                  label: "Delete",
                  danger: true,
                  onClick: () =>
                    handleDeleteStep(record.sectionId, record.stepId),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button
              type="text"
              // @ts-expect-error - expected
              icon={<EllipsisOutlined />}
              className="text-gray-400 hover:text-blue-400"
            />
          </Dropdown>
        ),
      },
    ],
    [searchText, handleEditStep, handleDeleteStep]
  );

  // Then expandable config
  const expandableConfig = useMemo(
    () => ({
      expandedRowRender: (record: DataType) => (
        <div className="pl-4 border-l-4 border-blue-500">
          <div className="mb-2 font-semibold text-blue-400">Sections</div>
          {/* @ts-expect-error - expected */}
          <Table
            dataSource={record.sections}
            columns={sectionColumns}
            pagination={false}
            rowKey="sectionId"
            className="bg-[#282d35]"
            expandable={{
              // @ts-expect-error - expected
              expandedRowRender: (section) => (
                <div className="pl-4 border-l-4 border-green-500">
                  <div className="mb-2 font-semibold text-green-400">Steps</div>
                  {/* @ts-expect-error - expected */}
                  <Table
                    dataSource={section.steps}
                    columns={stepColumns}
                    pagination={false}
                    rowKey="stepId"
                    className="bg-[#2c333a]"
                  />
                </div>
              ),
              // @ts-expect-error - expected
              rowExpandable: (section) => section.steps?.length > 0,
            }}
          />
        </div>
      ),
      // @ts-expect-error - expected
      rowExpandable: (record) => record.sections?.length > 0,
    }),
    [sectionColumns, stepColumns]
  );

  // Finally table config
  const tableConfig = useMemo(
    () => ({
      columns,
      dataSource: data,
      loading,
      rowSelection: {
        type: "checkbox" as const,
        selectedRowKeys,
        onChange: setSelectedRowKeys,
        columnTitle: "",
        columnWidth: 48,
        hideSelectAll: true,
      },
      expandable: expandableConfig,
      pagination: {
        pageSize: 10,
        showSizeChanger: false,
      },
      scroll: { y: 600 },
      size: "middle" as const,
    }),
    [columns, data, loading, selectedRowKeys, expandableConfig]
  );

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMasterCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedRowKeys(e.target.checked ? data.map((item) => item.key) : []);
  };

  const handleAdd = () => {
    navigate("/admin/courses/add");
  };

  const handleDeleteSelected = async () => {
    Modal.confirm({
      title: "Are you sure you want to delete selected courses?",
      // @ts-expect-error - expected
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await Promise.all(
            selectedRowKeys.map((key) => courseApi.deleteCourse(key.toString()))
          );
          message.success("Courses deleted successfully");
          setSelectedRowKeys([]);
          fetchData();
        } catch (error) {
          console.error("Error deleting courses:", error);
          message.error("Failed to delete courses");
        }
      },
    });
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "#282d35",
            headerColor: "#8b949e",
            bodySortBg: "#282d35",
            borderColor: "#30363d",
            rowHoverBg: "#2c333a",
            rowSelectedBg: "#2c333a",
            rowSelectedHoverBg: "#2c333a",
            headerSortActiveBg: "#282d35",
            headerSortHoverBg: "#282d35",
            filterDropdownBg: "#282d35",
            filterDropdownMenuBg: "#282d35",
            cellPaddingBlock: 8,
            cellPaddingInline: 32,
            selectionColumnWidth: 48,
            headerBorderRadius: 8,
            borderRadius: 8,
            padding: 24,
            headerSplitColor: "transparent",
            colorBgTextHover: "transparent",
            colorBgTextActive: "transparent",
            colorTextPlaceholder: "#ffffff",
            colorBgContainer: "#282d35",
            expandedRowClassName: "nested-table",
          },
          Empty: {
            colorText: "#ffffff",
            colorTextDisabled: "#ffffff",
            colorFill: "#ffffff",
            colorFillSecondary: "#ffffff",
            colorFillQuaternary: "#ffffff",
            colorIcon: "#ffffff",
            colorIconHover: "#ffffff",
          },
          Input: {
            colorBgContainer: "#282d35",
            colorBorder: "#30363d",
            colorText: "#ffffff",
            colorTextPlaceholder: "#8b949e",
            colorIcon: "#ffffff",
            colorIconHover: "#3b82f6",
          },
          Button: {
            colorPrimary: "#dc2626",
            colorPrimaryHover: "#b91c1c",
            colorPrimaryActive: "#991b1b",
            primaryColor: "#ffffff",
            colorBgContainer: "#282d35",
            colorBorder: "#30363d",
            colorText: "#8b949e",
          },
          Checkbox: {
            colorBgContainer: "#282d35",
            colorBorder: "#8b949e",
            colorText: "#8b949e",
            lineWidth: 1.5,
            borderRadius: 2,
            colorPrimary: "#1890ff",
            controlInteractiveSize: 16,
          },
          Dropdown: {
            colorBgElevated: "#282d35",
            controlItemBgHover: "#363b42",
            colorText: "#8b949e",
          },
        },
        token: {
          colorBgContainer: "#282d35",
          colorText: "#ffffff",
          borderRadius: 8,
          padding: 24,
          colorTextDisabled: "#ffffff",
        },
      }}
    >
      {/* @ts-expect-error - expected */}
      <style jsx global>{`
        .nested-table .ant-table {
          margin: 0 !important;
        }

        /* Style for section level */
        .nested-table:first-child {
          background: #282d35;
        }

        /* Style for step level */
        .nested-table .nested-table {
          background: #2c333a;
        }

        /* Add some spacing between tables */
        .ant-table-expanded-row {
          margin: 8px 0;
        }

        /* Thumbnail preview modal styles */
        .thumbnail-preview-modal .ant-modal-content {
          background: #1a1b24;
          border: 1px solid #282d35;
          padding: 16px;
        }

        .thumbnail-preview-modal .ant-modal-close {
          color: #8b949e;
        }

        .thumbnail-preview-modal .ant-modal-close:hover {
          color: #ffffff;
        }
      `}</style>
      <BreadcrumbUpdater
        items={["Admin Dashboard", "Courses"]}
        previousItems={["Admin Dashboard"]}
      />
      <div className="w-[70%] mx-auto mt-[8rem]">
        <div className="bg-[#1a1b24] px-8 py-5 mb-6 rounded-xl flex items-center justify-between border border-[#282d35] shadow-lg relative overflow-hidden">
          {/* Background accent */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f615] to-transparent"></div>
          
          {/* Left side content */}
          <div className="flex items-center gap-3 relative">
            <div className="w-1 h-12 bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
            <div className="flex flex-col">
              <span className="text-[#d0dbea] text-[0.95rem] leading-relaxed">
                Want to <span className="text-[#3b82f6] font-semibold">approve</span> pending courses?
              </span>
              <span className="text-[#8b949e] text-[0.85rem]">
                Go to Pending Courses page to review and approve courses
              </span>
            </div>
          </div>

          {/* Button */}
          {/* @ts-expect-error - expected */}
          <Button
            type="primary"
            onClick={() => navigate("/admin/approvals/pending")}
            style={{
              backgroundColor: "#1e1f2a",
              color: "#3b82f6",
              border: "1px solid #3b82f640",
              boxShadow: "0 0 10px rgba(59,130,246,0.1)",
              height: "38px",
              padding: "0 24px",
              zIndex: 1
            }}
            className="hover:!bg-[#3b82f620] hover:!border-[#3b82f660] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all duration-300"
          >
            View Pending Courses
          </Button>
        </div>

        <div className="bg-[#282d35] px-6 py-6 mb-4 rounded-lg flex flex-col md:flex-row items-center gap-4">
          <Checkbox
            checked={selectedRowKeys.length === data.length}
            // @ts-expect-error - expected
            indeterminate={
              selectedRowKeys.length > 0 && selectedRowKeys.length < data.length
            }
            onChange={handleMasterCheckboxChange}
          />

          <div className="flex-1">
            <Input
              // @ts-expect-error - expected
              prefix={<SearchOutlined className="text-[#8b949e]" />}
              placeholder=" Smart Search..."
              className="w-full bg-[#282d35]"
              value={searchText}
              // @ts-expect-error - expected
              onChange={(e) => handleGlobalSearch(e.target.value)}
              allowClear={{
                clearIcon: (
                  <CloseOutlined className="text-white hover:text-blue-500" />
                ),
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button
              // @ts-expect-error - expected
              icon={<DeleteOutlined />}
              style={{
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                boxShadow: "none",
              }}
              type="primary"
              onClick={handleDeleteSelected}
              disabled={selectedRowKeys.length === 0}
            />
            {/* @ts-expect-error - expected */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                boxShadow: "none",
              }}
              className="hover:!bg-[#2563eb]"
            >
              Add Course
            </Button>
          </div>
        </div>

        {/* @ts-expect-error - Table is actually supported */}
        <Table {...tableConfig} />
      </div>
    </ConfigProvider>
  );
}
