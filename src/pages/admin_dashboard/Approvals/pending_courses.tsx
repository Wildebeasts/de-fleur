import { useEffect, useState } from "react";
//@ts-expect-error -- expected
import { Table, ConfigProvider, Tooltip, Badge, Input, Button, Dropdown, Checkbox } from "antd";
import type { ColumnType } from "antd/es/table";
import { SearchOutlined, CloseOutlined, EllipsisOutlined, CheckOutlined } from "@ant-design/icons";
import courseApi, { CourseFilter } from "@/utils/services/CoursesService";
import { CourseDto } from "@/models/Course";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useLoading } from '@/contexts/LoadingContext';
import { message } from "antd";
import { BreadcrumbUpdater } from "@/components/BreadcrumbUpdater";

// Modify the HighlightText component to handle case-insensitive matching more reliably
const HighlightText = ({
  text,
  searchText,
}: {
  text: string;
  searchText: string;
}) => {
  if (!searchText || !text) return <span>{text}</span>;

  // Create a case-insensitive regular expression with word boundaries
  const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
  const parts = text.toString().split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
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

const CourseStatusConstants = {
  PENDING: 'pending',
} as const;

const PendingCourses = () => {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CourseDto[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [allData, setAllData] = useState<CourseDto[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Add getColumnSearchProps function from category list
  const getColumnSearchProps = (
    dataIndex: keyof CourseDto
  ): ColumnType<CourseDto> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          //@ts-expect-error -- expected
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: "block" }}
        />
        {/* @ts-expect-error -- expected */}
        <Button
          type="primary"
          onClick={() => confirm()}
          size="small"
          style={{ width: 90 }}
        >
          Search
        </Button>
        {/* @ts-expect-error -- expected */}
        <Button
          onClick={() => clearFilters && clearFilters()}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#3b82f6' : '#8b949e' }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()) ?? false,
  });

  // Define columns for the table
  const columns: ColumnType<CourseDto>[] = [
    {
      title: <div className="px-2 sm:px-4">Course Name</div>,
      dataIndex: 'courseName',
      key: 'courseName',
      width: '15%',
      ...getColumnSearchProps('courseName'),
      render: (text: string) => (
        <div className="px-2 sm:px-4">
          <HighlightText text={text} searchText={searchText} />
        </div>
      ),
    },
    {
      title: <div className="px-2 sm:px-4">Description</div>,
      dataIndex: 'summary',
      key: 'summary',
      width: '20%',
      ...getColumnSearchProps('summary'),
      render: (text: string) => (
        <div className="px-2 sm:px-4">
          {/* @ts-expect-error -- expected */}
          <Tooltip title={text}>
            <div className="max-w-[150px] truncate">
              <HighlightText text={text} searchText={searchText} />
            </div>
          </Tooltip>
        </div>
      ),
    },
    {
      title: <div className="px-2 sm:px-4">Price</div>,
      dataIndex: 'price',
      key: 'price',
      width: '10%',
      align: 'right',
      render: (price: number) => (
        <div className="px-2 sm:px-4">
          <HighlightText text={`$${price?.toFixed(2) || '0.00'}`} searchText={searchText} />
        </div>
      ),
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
    },
    {
      title: <div className="px-2 sm:px-4">Attendance</div>,
      dataIndex: 'attendance',
      key: 'attendance',
      width: '10%',
      align: 'right',
      render: (attendance: number) => (
        <div className="px-2 sm:px-4">
          <HighlightText text={attendance?.toString() || '0'} searchText={searchText} />
        </div>
      ),
      sorter: (a, b) => (a.attendance || 0) - (b.attendance || 0),
    },
    {
      title: <div className="px-2 sm:px-4">Duration</div>,
      dataIndex: 'totalDuration',
      key: 'totalDuration',
      width: '10%',
      align: 'right',
      render: (duration: number) => (
        <div className="px-2 sm:px-4">
          <HighlightText text={`${duration || 0} mins`} searchText={searchText} />
        </div>
      ),
      sorter: (a, b) => (a.totalDuration || 0) - (b.totalDuration || 0),
    },
    {
      title: <div className="px-2 sm:px-4">Status</div>,
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      align: 'center',
      render: () => (
        <div className="px-2 sm:px-4">
          {/* @ts-expect-error -- expected */}
          <Badge status="processing" text={
            <HighlightText text="Pending" searchText={searchText} />
          } />
        </div>
      ),
    },
    {
      title: <div className="px-2 sm:px-4">Created Date</div>,
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: '15%',
      align: 'right',
      render: (text: string) => {
        const formattedDate = format(new Date(text), "PPp");
        return (
          <div className="px-2 sm:px-4">
            <HighlightText text={formattedDate} searchText={searchText} />
          </div>
        );
      },
      //@ts-expect-error -- expected
      sorter: (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
    },
    {
      title: <div className="px-2 sm:px-4">Actions</div>,
      key: 'actions',
      width: '10%',
      align: 'center',
      render: (_, record) => (
        <div className="px-2 sm:px-4" onClick={(e) => e.stopPropagation()}>
          {/* @ts-expect-error -- expected */}
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view',
                  label: 'View',
                  onClick: () => handleView(record.courseId!),
                },
                {
                  key: 'approve',
                  label: 'Approve',
                  onClick: () => handleApprove(record.courseId!),
                },
                {
                  key: 'reject',
                  label: 'Reject',
                  onClick: () => handleReject(record.courseId!),
                  danger: true,
                },
              ],
            }}
            trigger={['click']}
          >
            {/* @ts-expect-error -- expected */}
            <Button type="text" icon={<EllipsisOutlined />} />
          </Dropdown>
        </div>
      ),
    },
  ];

  // Modified fetch data function to get pending courses
  const fetchData = async (page: number = 0, pageSize: number = 6) => {
    try {
      setLoading(true);
      startLoading();
      const response = await courseApi.getAdminCourses(
        page, 
        pageSize, 
        CourseFilter.NONE,
        CourseStatusConstants.PENDING
      );

      setData(response.items);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  // Modified fetch all data for search
  const fetchAllForSearch = async () => {
    try {
      const response = await courseApi.getAdminCourses(
        0, 
        1000, 
        CourseFilter.NONE,
        CourseStatusConstants.PENDING
      );
      setAllData(response.items);
    } catch (error) {
      console.error('Error fetching all courses:', error);
    }
  };

  // Add action handlers
  const handleView = (courseId: string) => {
    navigate(`/course-info/${courseId}`);
  };

  const handleApprove = async (courseId: string) => {
    try {
      startLoading();
      await courseApi.approveCourse(courseId);
      await fetchData(currentPage);
      await fetchAllForSearch();
    } catch (error) {
      console.error('Error approving course:', error);
    } finally {
      stopLoading();
    }
  };

  const handleReject = async (courseId: string) => {
    try {
      startLoading();
      await courseApi.rejectCourse(courseId);
      await fetchData(currentPage);
      await fetchAllForSearch();
    } catch (error) {
      console.error('Error rejecting course:', error);
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    fetchData();
    fetchAllForSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Modify the global search function
  const handleGlobalSearch = (value: string) => {
    setSearchText(value); // Don't trim here to preserve spaces during typing

    if (!value || value.trim() === '') {
      fetchData(currentPage);
      return;
    }

    const searchRegex = new RegExp(value.trim(), 'i');
    const filteredData = allData.filter((item) =>
      Object.entries(item).some(([key, val]) => {
        if (!val) return false;
        
        if (key === "createdDate") {
          return format(new Date(val), "PPp")
            .toLowerCase()
            .includes(value.toLowerCase());
        }
        
        return searchRegex.test(val.toString());
      })
    );

    setData(filteredData);
    setTotalPages(Math.ceil(filteredData.length / 6));
  };

  const handleMasterCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //@ts-expect-error -- expected
    setSelectedRowKeys(e.target.checked ? data.map((item) => item.courseId) : []);
  };

  const handleBulkApprove = async () => {
    try {
      startLoading();
      await Promise.all(
        selectedRowKeys.map((courseId) => courseApi.approveCourse(courseId.toString()))
      );
      message.success('Courses approved successfully');
      setSelectedRowKeys([]);
      await fetchData(currentPage);
      await fetchAllForSearch();
    } catch (error) {
      console.error('Error approving courses:', error);
      message.error('Failed to approve courses');
    } finally {
      stopLoading();
    }
  };

  const handleBulkReject = async () => {
    try {
      startLoading();
      await Promise.all(
        selectedRowKeys.map((courseId) => courseApi.rejectCourse(courseId.toString()))
      );
      message.success('Courses rejected successfully');
      setSelectedRowKeys([]);
      await fetchData(currentPage);
      await fetchAllForSearch();
    } catch (error) {
      console.error('Error rejecting courses:', error);
      message.error('Failed to reject courses');
    } finally {
      stopLoading();
    }
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: '#282d35',
            headerColor: '#8b949e',
            bodySortBg: '#282d35',
            borderColor: '#30363d',
            rowHoverBg: '#2c333a',
            rowSelectedBg: '#2c333a',
            rowSelectedHoverBg: '#2c333a',
            headerSortActiveBg: '#282d35',
            headerSortHoverBg: '#282d35',
            filterDropdownBg: '#282d35',
            filterDropdownMenuBg: '#282d35',
            cellPaddingBlock: 16,
            cellPaddingInline: 32,
            headerBorderRadius: 8,
            borderRadius: 8,
            padding: 24,
            headerSplitColor: 'transparent',
            colorBgTextHover: 'transparent',
            colorBgTextActive: 'transparent',
            colorTextPlaceholder: '#ffffff',
            colorBgContainer: '#282d35',
          },
          Empty: {
            colorText: '#ffffff',
            colorTextDisabled: '#ffffff',
            colorFill: '#ffffff',
            colorFillSecondary: '#ffffff',
            colorFillQuaternary: '#ffffff',
            colorIcon: '#ffffff',
            colorIconHover: '#ffffff',
          },
          Input: {
            colorBgContainer: '#282d35',
            colorBorder: '#30363d',
            colorText: '#ffffff',
            colorTextPlaceholder: '#8b949e',
            colorIcon: '#ffffff',
            colorIconHover: '#3b82f6',
          },
          Button: {
            colorPrimary: '#dc2626',
            colorPrimaryHover: '#b91c1c',
            colorPrimaryActive: '#991b1b',
            primaryColor: '#ffffff',
            colorBgContainer: '#282d35',
            colorBorder: '#30363d',
            colorText: '#8b949e',
          },
          Checkbox: {
            colorBgContainer: '#282d35',
            colorBorder: '#8b949e',
            colorText: '#8b949e',
            lineWidth: 1.5,
            borderRadius: 2,
            colorPrimary: '#1890ff',
            controlInteractiveSize: 16,
          },
          Dropdown: {
            colorBgElevated: '#282d35',
            controlItemBgHover: '#363b42',
            colorText: '#8b949e',
          },
        },
        token: {
          colorBgContainer: '#282d35',
          colorText: '#ffffff',
          borderRadius: 8,
          padding: 24,
          colorTextDisabled: '#ffffff',
        },
      }}
    >
      <BreadcrumbUpdater
        items={["Admin Dashboard", "Approvals", "Pending Courses"]}
        previousItems={["Admin Dashboard", "Approvals"]}
      />
      <div className="w-full md:w-[95%] lg:w-[90%] xl:w-[85%] 2xl:w-[70%] mx-auto mt-[8rem]">
        <div className="bg-[#282d35] px-3 sm:px-6 py-4 sm:py-6 mb-4 rounded-lg flex flex-col md:flex-row items-center gap-4">
          <Checkbox
            checked={selectedRowKeys.length === data.length}
            //@ts-expect-error -- expected
            indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < data.length}
            onChange={handleMasterCheckboxChange}
          />

          <div className="flex-1">
            <Input
              //@ts-expect-error -- expected
              prefix={<SearchOutlined className="text-[#8b949e]" />}
              placeholder=" Smart Search..."
              className="w-full bg-[#282d35]"
              value={searchText}
              //@ts-expect-error -- expected
              onChange={(e) => handleGlobalSearch(e.target.value)}
              allowClear={{
                clearIcon: <CloseOutlined className="text-white hover:text-blue-500" />
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            {selectedRowKeys.length > 0 && (
              <>
                <Button
                  //@ts-expect-error -- expected
                  icon={<CheckOutlined />}
                  style={{
                    backgroundColor: "#059669",
                    color: "white",
                    border: "none",
                    boxShadow: "none",
                  }}
                  onClick={handleBulkApprove}
                />
                <Button
                  //@ts-expect-error -- expected
                  icon={<CloseOutlined />}
                  style={{
                    backgroundColor: "#dc2626",
                    color: "white",
                    border: "none",
                    boxShadow: "none",
                  }}
                  onClick={handleBulkReject}
                />
              </>
            )}
          </div>
        </div>

        {/* @ts-expect-error -- expected */}
        <Table
          columns={columns}
          dataSource={data}
          scroll={{ x: { xs: 'max-content', sm: 'max-content', md: 'unset' } }}
          loading={loading}
          rowSelection={{
            type: "checkbox",
            selectedRowKeys,
            onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
            columnTitle: "",
            columnWidth: 48,
            hideSelectAll: true,
            selections: true,
            //@ts-expect-error -- expected
            renderCell: (checked, record, index, originNode) => (
              <div className="pl-4">
                {originNode}
              </div>
            ),
          }}
          pagination={{
            total: totalPages * 6,
            current: currentPage + 1,
            //@ts-expect-error -- expected
            onChange: (page) => {
              fetchData(page - 1);
              setSearchText('');
            },
            pageSize: 6,
            showSizeChanger: false,
          }}
          rowKey="courseId"
          className="approved-items-table"
          size="middle"
        />
      </div>
    </ConfigProvider>
  );
};

export default PendingCourses;
