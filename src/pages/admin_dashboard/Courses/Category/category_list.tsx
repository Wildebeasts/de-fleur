import React, { useCallback, useMemo, useRef } from "react";
import { useEffect, useState } from "react";
import {
  Table,
  // @ts-expect-error - expected
  ConfigProvider,
  Dropdown,
  Button,
  Modal,
  message,
  Tooltip,
} from "antd";
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
import categoryApi from "@/utils/services/CategoryService";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useLoading } from "@/contexts/LoadingContext";
import { BreadcrumbUpdater } from "@/components/BreadcrumbUpdater";

// Define the CategoryDto interface
interface CategoryDto {
  categoryId: string;
  cateName: string;
  cateDescription: string;
  createdBy: string | null;
  createdDate: string;
}

interface DataType extends CategoryDto {
  key: string;
}

// First, memoize HighlightText outside the component
const MemoizedHighlightText = React.memo(
  ({ text, searchText }: { text: string; searchText: string }) => {
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
  }
);

// Move theme configuration outside component
const tableTheme = {
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
} as const;

export default function Categories() {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();

  // Add refs at the top
  const loadingRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // State declarations
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataType[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [originalData, setOriginalData] = useState<DataType[]>([]);

  // Define fetchData first
  const fetchData = useCallback(async () => {
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoading(true);
      startLoading();
      const response = await categoryApi.getCategories();

      const transformedData = response.items.map((item) => ({
        ...item,
        key: item.categoryId,
      }));

      setData(transformedData);
      setOriginalData(transformedData);
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
      navigate(`/admin/courses/categories/edit/${record.categoryId}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    (record: DataType) => {
      Modal.confirm({
        title: "Are you sure you want to delete this category?",
        // @ts-expect-error -- expected
        content: "This action cannot be undone.",
        okText: "Yes",
        okType: "danger",
        cancelText: "No",
        onOk: async () => {
          try {
            await categoryApi.deleteCategory(record.categoryId);
            message.success("Category deleted successfully");
            fetchData();
          } catch (error) {
            console.error("Error deleting category:", error);
            message.error("Failed to delete category");
          }
        },
      });
    },
    [fetchData]
  );

  const handleAdd = useCallback(() => {
    navigate("/admin/courses/categories/add");
  }, [navigate]);

  const handleDeleteSelected = useCallback(() => {
    Modal.confirm({
      title: "Are you sure you want to delete selected categories?",
      // @ts-expect-error -- expected
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await Promise.all(
            selectedRowKeys.map((key) =>
              categoryApi.deleteCategory(key.toString())
            )
          );
          message.success("Categories deleted successfully");
          setSelectedRowKeys([]);
          fetchData();
        } catch (error) {
          console.error("Error deleting categories:", error);
          message.error("Failed to delete categories");
        }
      },
    });
  }, [selectedRowKeys, fetchData]);

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
            return val.toString().toLowerCase().includes(value.toLowerCase());
          })
        );
        setData(filteredData);
      }, 300);
    },
    [originalData]
  );

  // THEN define columns
  const columns = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "cateName",
        key: "cateName",
        width: 200,
        sorter: (a: { cateName?: string }, b: { cateName?: string }) => {
          const nameA = a?.cateName || "";
          const nameB = b?.cateName || "";
          return nameA.localeCompare(nameB);
        },
        defaultSortOrder: "ascend",
        render: (text: string) => (
          <MemoizedHighlightText text={text} searchText={searchText} />
        ),
        sortDirections: ["ascend", "descend", "ascend"],
        showSorterTooltip: false,
      },
      {
        title: "Description",
        dataIndex: "cateDescription",
        key: "cateDescription",
        width: 200,
        render: (text: string) => (
          //@ts-expect-error -- expected
          <Tooltip title={text}>
            <div className="max-w-[200px] truncate">
              <MemoizedHighlightText text={text} searchText={searchText} />
            </div>
          </Tooltip>
        ),
      },
      {
        title: "Created Date",
        dataIndex: "createdDate",
        key: "createdDate",
        align: "right",
        width: 200,
        render: (text: string) => {
          const formattedDate = format(new Date(text), "PPp");
          return (
            <MemoizedHighlightText
              text={formattedDate}
              searchText={searchText}
            />
          );
        },
        sorter: (a: { createdDate?: string }, b: { createdDate?: string }) => {
          const dateA = a?.createdDate || "";
          const dateB = b?.createdDate || "";
          return dateA.localeCompare(dateB);
        },
      },
      {
        title: "Actions",
        key: "actions",
        fixed: "right",
        width: 80,
        align: "center",
        // @ts-expect-error -- expected
        render: (_, record: DataType) => (
          // @ts-expect-error - Dropdown is actually supported
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
              // @ts-expect-error - Button icon is actually supported
              icon={<EllipsisOutlined />}
              className="text-gray-400 hover:text-blue-400"
            />
          </Dropdown>
        ),
      },
    ],
    [searchText, handleEdit, handleDelete]
  );

  // Finally table config
  // @ts-expect-error -- expected
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
      pagination: {
        pageSize: 10,
        showSizeChanger: false,
      },
      scroll: { y: 600 },
      size: "middle" as const,
    }),
    [columns, data, loading, selectedRowKeys]
  );

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMasterCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedRowKeys(e.target.checked ? data.map((item) => item.key) : []);
    },
    [data]
  );

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <ConfigProvider theme={tableTheme}>
      <BreadcrumbUpdater
        items={["Admin Dashboard", "Courses", "Categories"]}
        previousItems={["Admin Dashboard", "Courses"]}
      />
      <div className="w-[70%] mx-auto mt-[8rem]">
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
            {/* @ts-expect-error - Table is actually supported */}
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
              Add Category
            </Button>
          </div>
        </div>

        {/* @ts-expect-error - Table is actually supported */}
        <Table<DataType> {...tableConfig} />
      </div>
    </ConfigProvider>
  );
}
