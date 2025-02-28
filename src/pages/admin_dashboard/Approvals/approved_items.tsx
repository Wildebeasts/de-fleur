import { useEffect, useState } from "react";
//@ts-expect-error -- expected
import { Table, ConfigProvider, Tooltip, Badge, Input, Button } from "antd";
import type { ColumnType } from "antd/es/table";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import courseApi from "@/utils/services/CoursesService";
import { CourseDto } from "@/models/Course";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useLoading } from '@/contexts/LoadingContext';
import { BreadcrumbUpdater } from "@/components/BreadcrumbUpdater";

// Add HighlightText component
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

const ApprovedItems = () => {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CourseDto[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [allData, setAllData] = useState<CourseDto[]>([]);

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
      title: () => <div className="pl-8">Course Name</div>,
      dataIndex: 'courseName',
      key: 'courseName',
      width: '15%',
      ...getColumnSearchProps('courseName'),
      render: (text: string) => (
        <div className="pl-8">
          <HighlightText text={text} searchText={searchText} />
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: 'summary',
      key: 'summary',
      width: '15%',
      ...getColumnSearchProps('summary'),
      render: (text: string) => (
        //@ts-expect-error -- expected
        <Tooltip title={text}>
          <div className="max-w-[300px] truncate">
            <HighlightText text={text} searchText={searchText} />
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Price",
      dataIndex: 'price',
      key: 'price',
      width: '10%',
      align: 'right',
      render: (price: number) => (
        <div>
          ${price?.toFixed(2) || '0.00'}
        </div>
      ),
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
    },
    {
      title: "Attendance",
      dataIndex: 'attendance',
      key: 'attendance',
      width: '10%',
      align: 'right',
      render: (attendance: number) => (
        <div>
          {attendance || 0}
        </div>
      ),
      sorter: (a, b) => (a.attendance || 0) - (b.attendance || 0),
    },
    {
      title: "Duration",
      dataIndex: 'totalDuration',
      key: 'totalDuration',
      width: '10%',
      align: 'right',
      render: (duration: number) => (
        <div>
          {duration || 0} mins
        </div>
      ),
      sorter: (a, b) => (a.totalDuration || 0) - (b.totalDuration || 0),
    },
    {
      title: "Status",
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      align: 'center',
      render: () => (
        <div>
          {/* @ts-expect-error -- expected */}
          <Badge status="success" text="Approved" />
        </div>
      ),
    },
    {
      title: () => <div className="pr-8">Created Date</div>,
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: '12%',
      align: 'right',
      render: (text: string) => {
        const formattedDate = format(new Date(text), "PPp");
        return (
          <div className="pr-8">
            <HighlightText text={formattedDate} searchText={searchText} />
          </div>
        );
      },
      //@ts-expect-error -- expected
      sorter: (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
    },
  ];

  // Fetch data function with pagination
  const fetchData = async (page: number = 0, pageSize: number = 6) => {
    try {
      setLoading(true);
      startLoading();
      const response = await courseApi.getCourses(page, pageSize);
      
      // Filter for only approved courses
      const approvedCourses = response.items.filter(
        course => course.status === 'APPROVED'
      );

      setData(approvedCourses);
      //@ts-expect-error -- expected
      setTotalPages(Math.ceil(response.totalCount / pageSize));
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  // Fetch all data for search
  const fetchAllForSearch = async () => {
    try {
      const response = await courseApi.getCourses(0, 1000); // Get all courses
      const approvedCourses = response.items.filter(
        course => course.status === 'APPROVED'
      );
      setAllData(approvedCourses);
    } catch (error) {
      console.error('Error fetching all courses:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAllForSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global search function
  const handleGlobalSearch = (value: string) => {
    setSearchText(value);

    if (!value) {
      fetchData(currentPage); // Reset to paginated data
      return;
    }

    const filteredData = allData.filter((item) =>
      Object.entries(item).some(([key, val]) => {
        if (key === "createdDate") {
          return format(new Date(val), "PPp")
            .toLowerCase()
            .includes(value.toLowerCase());
        }
        return val?.toString().toLowerCase().includes(value.toLowerCase());
      })
    );

    setData(filteredData);
    setTotalPages(Math.ceil(filteredData.length / 6));
  };

  const handleRowClick = (record: CourseDto) => {
    navigate(`/course-info/${record.courseId}`);
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
            cellPaddingBlock: 8,
            cellPaddingInline: 16,
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
        items={["Admin Dashboard", "Approvals", "Approved Items"]}
        previousItems={["Admin Dashboard", "Approvals"]}
      />
      <div className="w-full md:w-[85%] lg:w-[70%] mx-auto mt-[8rem]">
        <div className="bg-[#282d35] px-6 py-6 mb-4 rounded-lg flex items-center gap-4">
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
        </div>

        {/* @ts-expect-error -- expected */}
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
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
          //@ts-expect-error -- expected
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' }
          })}
          rowKey="courseId"
          size="middle"
        />
      </div>
    </ConfigProvider>
  );
};

export default ApprovedItems;
