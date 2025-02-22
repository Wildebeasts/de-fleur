import React, { useEffect, useState, useRef } from "react";
import {
  // @ts-expect-error -- expected
  Card,
  Row,
  Col,
  // @ts-expect-error -- expected
  ConfigProvider,
  Spin,
  Pagination,
  // @ts-expect-error -- expected
  theme,
  Button,
  message,
  Dropdown,
  Modal,
} from "antd";
import { ReportDto, ReportStatus } from "@/utils/services/ReportService";
import reportApi from "@/utils/services/ReportService";
import { format } from "date-fns";
import {
  AlertCircle,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  FileEdit,
  XCircle,
  Paperclip,
  Check,
  X,
  Trash2,
} from "lucide-react";
import type { MenuProps } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { BreadcrumbUpdater } from "@/components/BreadcrumbUpdater";
// @ts-expect-error -- expected
import { Empty } from "antd";
import userApi, { UserDto } from "@/utils/services/UserService";

const getFileType = (url: string) => {
  const extension = url.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif"].includes(extension)) return "image";
  return "other";
};

const ReportList: React.FC = () => {
  const [reports, setReports] = useState<ReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 16,
    total: 0,
  });
  const [selectedReport, setSelectedReport] = useState<ReportDto | null>(null);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAttachment, setShowAttachment] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [previewLoading, setPreviewLoading] = useState(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isAttachmentLoading, setIsAttachmentLoading] = useState(false);
  const [optimizedPreviewUrl, setOptimizedPreviewUrl] = useState<string>("");
  const [users, setUsers] = useState<UserDto[]>([]);

  const getStatusConfig = (status: ReportStatus) => {
    const statusMap = {
      [ReportStatus.Draft]: {
        color: "text-gray-400",
        bgColor: "bg-gray-400/10",
        text: "Draft",
      },
      [ReportStatus.Submitted]: {
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
        text: "Submitted",
      },
      [ReportStatus.InReview]: {
        color: "text-yellow-400",
        bgColor: "bg-yellow-400/10",
        text: "In Review",
      },
      [ReportStatus.Approved]: {
        color: "text-emerald-400",
        bgColor: "bg-emerald-400/10",
        text: "Approved",
      },
      [ReportStatus.Rejected]: {
        color: "text-rose-400",
        bgColor: "bg-rose-400/10",
        text: "Rejected",
      },
    };
    return statusMap[status] || statusMap[ReportStatus.Draft];
  };

  const fetchReports = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await reportApi.getReports(
        page - 1,
        pagination.pageSize
      );
      setReports(response.items);
      setPagination({
        ...pagination,
        current: page,
        total: response.totalPages * pagination.pageSize,
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userApi.getUsers(0, 100); // Fetch first 100 users
      console.log('Fetched users:', response.items); // Debug log
      setUsers(response.items);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page: number) => {
    fetchReports(page);
  };

  const handleStatusChange = async (
    reportId: string,
    action: keyof typeof ReportStatus
  ) => {
    try {
      let response;
      switch (action) {
        case "Draft":
          response = await reportApi.setDraft(reportId);
          break;
        case "Submitted":
          response = await reportApi.setSubmitted(reportId);
          break;
        case "InReview":
          response = await reportApi.setInReview(reportId);
          break;
        case "Approved":
          response = await reportApi.setApproved(reportId);
          break;
        case "Rejected":
          response = await reportApi.setRejected(reportId);
          break;
      }

      if (response?.success) {
        message.success(response.message);
        fetchReports(pagination.current);
      } else {
        message.error(response?.message || "Failed to update status");
      }
    } catch (error) {
      message.error("An unexpected error occurred");
      console.error(error);
    }
  };

  // Status Actions
  // @ts-expect-error -- expected
  const getStatusActions = (report: ReportDto): MenuProps["items"] => {
    const items = [
      {
        key: "Draft",
        label: (
          <div
            className="px-4 py-2 hover:bg-blue-500/10 transition-colors duration-200 cursor-pointer"
            onClick={() =>
              Modal.confirm({
                title: (
                  <div className="flex items-center gap-3">
                    <span className="text-md font-semibold text-white">
                      Change Status
                    </span>
                  </div>
                ),
                // @ts-expect-error -- expected
                content: (
                  <span className="text-white">
                    Are you sure you want to set this report to Draft?
                  </span>
                ),
                centered: true,
                okText: "Yes",
                cancelText: "No",
                onOk: () => handleStatusChange(report.reportId, "Draft"),
                className: "dark-modal",
                styles: {
                  content: {
                    backgroundColor: "#1a1b24",
                    borderRadius: "12px",
                  },
                  body: {
                    color: "#ffffff",
                  },
                  mask: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                  },
                },
                okButtonProps: {
                  className:
                    "bg-blue-500 hover:bg-blue-600 border-none text-white",
                },
                cancelButtonProps: {
                  className:
                    "ant-btn-default bg-[#282d35] hover:bg-[#353a44] text-gray-400 hover:text-white border-[#374151] hover:border-[#4B5563] transition-all",
                },
              })
            }
          >
            Set as Draft
          </div>
        ),
      },
      {
        key: "Submitted",
        label: (
          <div
            className="px-4 py-2 hover:bg-blue-500/10 transition-colors duration-200 cursor-pointer"
            onClick={() =>
              Modal.confirm({
                title: (
                  <div className="flex items-center gap-3">
                    <span className="text-md font-semibold text-white">
                      Change Status
                    </span>
                  </div>
                ),
                // @ts-expect-error -- expected
                content: (
                  <span className="text-white">
                    Are you sure you want to set this report to Submitted?
                  </span>
                ),
                centered: true,
                okText: "Yes",
                cancelText: "No",
                onOk: () => handleStatusChange(report.reportId, "Submitted"),
                className: "dark-modal",
                styles: {
                  content: {
                    backgroundColor: "#1a1b24",
                    borderRadius: "12px",
                  },
                  body: {
                    color: "#ffffff",
                  },
                  mask: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                  },
                },
                okButtonProps: {
                  className:
                    "bg-blue-500 hover:bg-blue-600 border-none text-white",
                },
                cancelButtonProps: {
                  className:
                    "ant-btn-default bg-[#282d35] hover:bg-[#353a44] text-gray-400 hover:text-white border-[#374151] hover:border-[#4B5563] transition-all",
                },
              })
            }
          >
            Set as Submitted
          </div>
        ),
      },
      {
        key: "InReview",
        label: (
          <div
            className="px-4 py-2 hover:bg-blue-500/10 transition-colors duration-200 cursor-pointer"
            onClick={() =>
              Modal.confirm({
                title: (
                  <div className="flex items-center gap-3">
                    <span className="text-md font-semibold text-white">
                      Change Status
                    </span>
                  </div>
                ),
                // @ts-expect-error -- expected
                content: (
                  <span className="text-white">
                    Are you sure you want to set this report to In Review?
                  </span>
                ),
                centered: true,
                okText: "Yes",
                cancelText: "No",
                onOk: () => handleStatusChange(report.reportId, "InReview"),
                className: "dark-modal",
                styles: {
                  content: {
                    backgroundColor: "#1a1b24",
                    borderRadius: "12px",
                  },
                  body: {
                    color: "#ffffff",
                  },
                  mask: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                  },
                },
                okButtonProps: {
                  className:
                    "bg-blue-500 hover:bg-blue-600 border-none text-white",
                },
                cancelButtonProps: {
                  className:
                    "ant-btn-default bg-[#282d35] hover:bg-[#353a44] text-gray-400 hover:text-white border-[#374151] hover:border-[#4B5563] transition-all",
                },
              })
            }
          >
            Set as In Review
          </div>
        ),
      },
    ];

    //console.log("Report Status:", report.reportStatus);

    if (report.reportStatus === ReportStatus.InReview) {
      items.push(
        {
          // @ts-expect-error -- expected
          type: "divider",
        },
        {
          key: "Approved",
          label: (
            <div
              className="px-4 py-2 hover:bg-emerald-500/10 text-emerald-400 transition-colors duration-200 cursor-pointer"
              onClick={() =>
                Modal.confirm({
                  title: (
                    <div className="flex items-center gap-3">
                      <span className="text-md font-semibold text-white">
                        Approve Report
                      </span>
                    </div>
                  ),
                  // @ts-expect-error -- expected
                  content: (
                    <span className="text-white">
                      Are you sure you want to approve this report?
                    </span>
                  ),
                  centered: true,
                  okText: "Yes",
                  cancelText: "No",
                  onOk: () => handleStatusChange(report.reportId, "Approved"),
                  className: "dark-modal",
                  styles: {
                    content: {
                      backgroundColor: "#1a1b24",
                      borderRadius: "12px",
                    },
                    body: {
                      color: "#ffffff",
                    },
                    mask: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                    },
                  },
                  okButtonProps: {
                    className:
                      "bg-emerald-500 hover:bg-emerald-600 border-none text-white",
                  },
                  cancelButtonProps: {
                    className:
                      "ant-btn-default bg-[#282d35] hover:bg-[#353a44] text-gray-400 hover:text-white border-[#374151] hover:border-[#4B5563] transition-all",
                  },
                })
              }
            >
              Approve
            </div>
          ),
        },
        {
          key: "Rejected",
          label: (
            <div
              className="px-4 py-2 hover:bg-rose-500/10 text-rose-400 transition-colors duration-200 cursor-pointer"
              onClick={() =>
                Modal.confirm({
                  title: (
                    <div className="flex items-center gap-3">
                      <span className="text-md font-semibold text-white">
                        Reject Report
                      </span>
                    </div>
                  ),
                  // @ts-expect-error -- expected
                  content: (
                    <span className="text-white">
                      Are you sure you want to reject this report?
                    </span>
                  ),
                  centered: true,
                  okText: "Yes",
                  cancelText: "No",
                  onOk: () => handleStatusChange(report.reportId, "Rejected"),
                  className: "dark-modal",
                  styles: {
                    content: {
                      backgroundColor: "#1a1b24",
                      borderRadius: "12px",
                    },
                    body: {
                      color: "#ffffff",
                    },
                    mask: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                    },
                  },
                  okButtonProps: {
                    className:
                      "bg-rose-500 hover:bg-rose-600 border-none text-white",
                  },
                  cancelButtonProps: {
                    className:
                      "ant-btn-default bg-[#282d35] hover:bg-[#353a44] text-gray-400 hover:text-white border-[#374151] hover:border-[#4B5563] transition-all",
                  },
                })
              }
            >
              Reject
            </div>
          ),
        }
      );
    }

    return items;
  };

  const getStatusIcon = (status: ReportStatus) => {
    const iconClass = "w-4 h-4";
    switch (status) {
      case ReportStatus.Draft:
        return <FileEdit className={`${iconClass} text-gray-400`} />;
      case ReportStatus.Submitted:
        return <Clock className={`${iconClass} text-blue-400`} />;
      case ReportStatus.InReview:
        return <AlertCircle className={`${iconClass} text-yellow-400`} />;
      case ReportStatus.Approved:
        return <CheckCircle2 className={`${iconClass} text-emerald-400`} />;
      case ReportStatus.Rejected:
        return <XCircle className={`${iconClass} text-rose-400`} />;
      default:
        return <FileEdit className={`${iconClass} text-gray-400`} />;
    }
  };

  const getStatusGlow = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.Draft:
        return "shadow-[0_0_15px_-3px_rgba(156,163,175,0.2)]";
      case ReportStatus.Submitted:
        return "shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]";
      case ReportStatus.InReview:
        return "shadow-[0_0_15px_-3px_rgba(234,179,8,0.2)]";
      case ReportStatus.Approved:
        return "shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]";
      case ReportStatus.Rejected:
        return "shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]";
      default:
        return "shadow-[0_0_15px_-3px_rgba(156,163,175,0.2)]";
    }
  };

  const getStatusHoverColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.Draft:
        return "group-hover:text-gray-400";
      case ReportStatus.Submitted:
        return "group-hover:text-blue-400";
      case ReportStatus.InReview:
        return "group-hover:text-yellow-400";
      case ReportStatus.Approved:
        return "group-hover:text-emerald-400";
      case ReportStatus.Rejected:
        return "group-hover:text-rose-400";
      default:
        return "group-hover:text-gray-400";
    }
  };

  const handleCardClick = (report: ReportDto) => {
    setSelectedReport(report);
  };

  const handleReportSelection = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleMassDelete = async () => {
    Modal.confirm({
      title: (
        <div className="flex items-center gap-3">
          <span className="text-md font-semibold text-white">
            Delete Selected Reports
          </span>
        </div>
      ),
      // @ts-expect-error -- expected
      content: (
        <span className="text-white">
          Are you sure you want to delete {selectedReports.length} selected
          reports?
        </span>
      ),
      centered: true,
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          await Promise.all(
            selectedReports.map((id) => reportApi.deleteReport(id))
          );
          message.success("Reports deleted successfully");
          setSelectedReports([]);
          fetchReports(pagination.current);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          message.error("Failed to delete reports");
        }
      },
      className: "dark-modal",
      styles: {
        content: {
          backgroundColor: "#1a1b24",
          borderRadius: "12px",
        },
        body: {
          color: "#ffffff",
        },
        mask: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
        },
      },
      okButtonProps: {
        className: "bg-rose-500 hover:bg-rose-600 border-none text-white",
      },
      cancelButtonProps: {
        className:
          "ant-btn-default bg-[#282d35] hover:bg-[#353a44] text-gray-400 hover:text-white border-[#374151] hover:border-[#4B5563] transition-all",
      },
    });
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const calculateTransform = () => {
    if (!showAttachment) return 0;

    const modalInitialLeft = (windowWidth - 600) / 2; // Initial position from left
    const modalExpandedLeft = (windowWidth - 1120) / 2; // Desired final position from left
    const difference = modalInitialLeft - modalExpandedLeft;

    return -difference;
  };

  const handlePreviewLoad = () => {
    setPreviewLoading(false);
  };

  const createOptimizedPreview = (originalUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Target width for preview
        const maxWidth = 800;
        
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (maxWidth * height) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Preserve transparency
        ctx?.clearRect(0, 0, width, height);
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Check if image has transparency
        const imageData = ctx?.getImageData(0, 0, width, height);
        let hasTransparency = false;
        
        if (imageData) {
          for (let i = 3; i < imageData.data.length; i += 4) {
            if (imageData.data[i] < 255) {
              hasTransparency = true;
              break;
            }
          }
        }
        
        // Use PNG for transparent images, JPEG for opaque ones
        const optimizedUrl = canvas.toDataURL(
          hasTransparency ? 'image/png' : 'image/jpeg',
          0.6
        );
        
        resolve(optimizedUrl);
      };
      
      img.onerror = () => resolve(originalUrl);
      img.src = originalUrl;
    });
  };

  const preloadImage = async (url: string) => {
    setIsImageLoading(true);
    
    if (getFileType(url) === "image") {
      try {
        const optimizedUrl = await createOptimizedPreview(url);
        setOptimizedPreviewUrl(optimizedUrl);
      } catch (error) {
        console.error("Error creating optimized preview:", error);
        setOptimizedPreviewUrl(url); // Fallback to original
      }
    }
    
    setIsImageLoading(false);
    handlePreviewLoad();
  };

  useEffect(() => {
    if (
      selectedReport?.attachment &&
      getFileType(selectedReport.attachment) === "image"
    ) {
      preloadImage(selectedReport.attachment);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReport?.attachment]);

  const renderAttachmentPreview = () => {
    const fileType = getFileType(selectedReport?.attachment || "");

    if (previewLoading || isImageLoading) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100/5 rounded-lg border border-gray-100/10">
          <div className="flex flex-col items-center gap-3">
            {/* @ts-expect-error -- expected */}
            <Spin className="text-blue-400" />
            <span className="text-sm text-gray-400">Loading preview...</span>
          </div>
        </div>
      );
    }

    switch (fileType) {
      case "image":
        return (
          <div className="h-full overflow-hidden rounded-lg border border-gray-100/10">
            <img
              src={optimizedPreviewUrl || selectedReport?.attachment}
              alt="Attachment"
              className="w-full h-full object-contain"
            />
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gray-100/5 rounded-lg border border-gray-100/10">
            <svg
              className="w-12 h-12 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-sm text-gray-400 mb-4">
              Preview Not Available
            </span>
            <a
              href={selectedReport?.attachment}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Download File
            </a>
          </div>
        );
    }
  };

  const preloadAttachment = async (url: string): Promise<void> => {
    if (getFileType(url) !== 'image') return;
    
    setIsAttachmentLoading(true);
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setIsAttachmentLoading(false);
        resolve();
      };
      img.onerror = () => {
        setIsAttachmentLoading(false);
        resolve();
      };
    });
  };

  const handleAttachmentClick = async () => {
    if (!showAttachment && selectedReport?.attachment) {
      await preloadAttachment(selectedReport.attachment);
    }
    setShowAttachment(!showAttachment);
  };

  const findUserByUsername = (username: string): UserDto | undefined => {
    const user = users.find(user => 
      user.username.toLowerCase() === username.toLowerCase()
    );
    console.log('Looking for username:', username); // Debug log
    console.log('Found user:', user); // Debug log
    return user;
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
          Spin: {
            colorPrimary: "#3b82f6",
          },
          Dropdown: {
            controlItemBgHover: "transparent",
            colorBgElevated: "#1a1b24",
            boxShadowSecondary: "none",
            colorText: "#ffffff",
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
            colorBgElevated: "#1a1b24",
            colorBgMask: "rgba(0, 0, 0, 0.8)",
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            colorBorder: "rgba(255, 255, 255, 0.1)",
            colorBgContainer: "#1a1b24",
            colorTextHeading: "#ffffff",
          },
          Button: {
            colorPrimary: "#3b82f6",
            colorPrimaryHover: "#2563eb",
            colorBgContainer: "#282d35",
            colorBgContainerHover: "#353a44",
            colorBorder: "#374151",
            colorBorderHover: "#4B5563",
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
        items={["Admin Dashboard", "Tickets", "Reports"]}
        previousItems={["Admin Dashboard", "Tickets"]}
      />
      <div className="w-[80%] mx-auto mt-[8rem]">
        <Card
          title={
            <div className="flex items-center justify-between my-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#282d35]">
                  <AlertCircle className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-lg font-semibold text-white">
                  Report List
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isEditMode && selectedReports.length > 0 && (
                  // @ts-expect-error -- expected
                  <Button
                    danger
                    type="primary"
                    onClick={handleMassDelete}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected ({selectedReports.length})
                  </Button>
                )}
                {/* @ts-expect-error -- expected */}
                <Button
                  type={isEditMode ? "primary" : "default"}
                  onClick={() => {
                    setIsEditMode(!isEditMode);
                    setSelectedReports([]); // Clear selections when exiting edit mode
                  }}
                  className={`${
                    isEditMode
                      ? "bg-blue-500 hover:bg-blue-600 border-none text-white"
                      : "bg-[#282d35] hover:bg-[#353a44] text-gray-400 hover:text-white border-[#374151]"
                  }`}
                >
                  {isEditMode ? "Done" : "Edit"}
                </Button>
              </div>
            </div>
          }
          className="h-full w-full bg-[#1a1b24] rounded-xl bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-60 
            border border-gray-100/10
            hover:border-gray-100/20 transition-all duration-300"
          headStyle={{
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            position: "relative",
            zIndex: 1,
            background: "transparent",
          }}
        >
          {loading ? (
            <div className="text-center p-12">
              <Spin size="large" />
            </div>
          ) : reports.length === 0 ? (
            <Empty description="No reports found" />
          ) : (
            <>
              {/* @ts-expect-error -- expected */}
              <Row gutter={[16, 16]}>
                {reports.map((report) => {
                  const statusConfig = getStatusConfig(report.reportStatus);
                  return (
                    // @ts-expect-error -- expected
                    <Col
                      xs={24}
                      sm={12}
                      md={8}
                      lg={6}
                      xl={6}
                      key={report.reportId}
                    >
                      <Card
                        hoverable
                        className={`
                          group h-full overflow-hidden bg-[#1a1b24] rounded-xl bg-clip-padding backdrop-filter 
                          backdrop-blur-lg bg-opacity-60 border border-gray-100/10
                          hover:border-gray-100/20 ${getStatusGlow(
                            report.reportStatus
                          )}
                          transition-all duration-300 cursor-pointer
                          ${
                            selectedReports.includes(report.reportId)
                              ? "ring-2 ring-blue-500"
                              : ""
                          }
                        `}
                        onClick={(e: React.MouseEvent) => {
                          if (isEditMode) {
                            handleReportSelection(report.reportId);
                          } else if (
                            !(e.target as HTMLElement).closest(
                              ".dropdown-trigger"
                            )
                          ) {
                            handleCardClick(report);
                          }
                        }}
                        extra={
                          <div className="flex items-center gap-2">
                            {isEditMode ? (
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                  ${
                                    selectedReports.includes(report.reportId)
                                      ? "border-blue-500 bg-blue-500"
                                      : "border-gray-400"
                                  }`}
                              >
                                {selectedReports.includes(report.reportId) && (
                                  <Check className="w-4 h-4 text-white" />
                                )}
                              </div>
                            ) : (
                              // @ts-expect-error -- expected
                              <Dropdown
                                menu={{
                                  items: getStatusActions(report),
                                  className:
                                    "bg-[#1a1b24] border border-gray-100/10 rounded-lg overflow-hidden",
                                }}
                                trigger={["click"]}
                                placement="bottomRight"
                                className="dropdown-trigger"
                              >
                                <Button
                                  type="text"
                                  className="flex items-center justify-center w-8 h-8 rounded-full
                                    hover:bg-gray-100/10 transition-colors duration-300"
                                  // @ts-expect-error -- expected
                                  icon={
                                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                  }
                                />
                              </Dropdown>
                            )}
                          </div>
                        }
                        title={
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {getStatusIcon(report.reportStatus)}
                              <div
                                className={`px-2 py-1 rounded-full text-xs font-medium
                                ${statusConfig.color} ${statusConfig.bgColor}`}
                              >
                                {statusConfig.text}
                              </div>
                            </div>
                          </div>
                        }
                      >
                        <div className="flex flex-col h-full">
                          {/* Date */}
                          <div className="text-xs text-gray-500 mb-4">
                            {format(
                              // @ts-expect-error -- expected
                              new Date(report.createdDate),
                              "MMM dd, yyyy"
                            )}
                          </div>

                          {/* Title */}
                          <h3
                            className={`text-base font-semibold text-white mb-2 
                            line-clamp-2 ${getStatusHoverColor(
                              report.reportStatus
                            )} transition-colors duration-300`}
                          >
                            {report.issue}
                          </h3>

                          {/* Description - single line */}
                          <p className="text-sm text-gray-400 mb-4 line-clamp-1">
                            {report.content}
                          </p>

                          {/* Footer with user info */}
                          <div className="mt-auto flex items-center gap-2">
                            {(() => {
                              const user = findUserByUsername(report.createdBy);
                              console.log('Report createdBy:', report.createdBy); // Debug log
                              console.log('Matched user:', user); // Debug log
                              return (
                                <>
                                  {user?.avatarUrl ? (
                                    <img 
                                      src={user.avatarUrl}
                                      alt={user.username}
                                      className="w-6 h-6 rounded-full object-cover"
                                      onError={(e) => {
                                        console.error('Image failed to load:', user.avatarUrl); // Debug log
                                        e.currentTarget.onerror = null; // Prevent infinite loop
                                        e.currentTarget.src = ''; // Clear the src
                                      }}
                                    />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                      <span className="text-xs text-blue-400">
                                        {user?.username.charAt(0).toUpperCase() || report.createdBy.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  <span className="text-xs text-gray-400">
                                    {user?.username || report.createdBy}
                                  </span>
                                </>
                              );
                            })()}
                            {report.attachment && (
                              <div className="ml-auto">
                                <span className="text-xs text-blue-400">
                                  <Paperclip className="w-3 h-3" />
                                </span>
                              </div>
                            )}
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
                  total={pagination.total}
                  pageSize={pagination.pageSize}
                  onChange={handlePageChange}
                  // @ts-expect-error -- expected
                  className="text-gray-400"
                  showSizeChanger={false}
                  // @ts-expect-error -- expected
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} of ${total} items`
                  }
                  hideOnSinglePage={false}
                />
              </div>
            </>
          )}
        </Card>
      </div>
      {/* @ts-expect-error -- expected */}
      <Modal
        open={selectedReport !== null}
        onCancel={() => {
          if (showAttachment) {
            // If attachment is shown, wait for animation
            setShowAttachment(false);
            setTimeout(() => {
              if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
              }
              setSelectedReport(null);
              retryCountRef.current = 0;
            }, 600);
          } else {
            // If no attachment is shown, close immediately
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
            }
            setSelectedReport(null);
            retryCountRef.current = 0;
          }
        }}
        afterOpenChange={(visible: boolean) => {
          if (!visible) {
            retryCountRef.current = 0;
            if (retryTimeoutRef.current) {
              clearTimeout(retryTimeoutRef.current);
            }
          }
        }}
        footer={null}
        width={600}
        className="dark-modal"
        closeIcon={
          <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
        }
        styles={{
          header: {
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: 0,
            background: "#1E1F2E",
          },
          content: {
            backgroundColor: "#1E1F2E",
            borderRadius: "12px",
            overflow: "hidden",
            maxWidth: "1120px",
            width: showAttachment ? "1100px" : "600px",
            transition: "all 0.6s cubic-bezier(0.87, 0, 0.13, 1)",
            transform: `translateX(${calculateTransform()}px)`,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          },
          body: {
            color: "#ffffff",
            padding: 0,
          },
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          },
          closeButton: {
            top: "16px",
            right: "16px",
          },
        }}
      >
        {selectedReport && (
          <motion.div
            className="flex"
            layout={false}
            transition={{
              duration: 0.6,
              ease: [0.87, 0, 0.13, 1],
            }}
            initial={false}
            animate={false}
          >
            {/* Details Card */}
            <motion.div
              className="flex-shrink-0 w-[550px]"
              initial={false}
              animate={false}
              layout={false}
            >
              {/* Ticket Header */}
              <div className="bg-[#161722] p-6 rounded-t-lg border-b border-gray-100/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-400">Ticket #{selectedReport.reportId.slice(0, 8)}</div>
                    <div
                      className={`px-3 py-1.5 rounded-full text-xs font-medium
                      ${getStatusConfig(selectedReport.reportStatus).color} 
                      ${getStatusConfig(selectedReport.reportStatus).bgColor}`}
                    >
                      {getStatusConfig(selectedReport.reportStatus).text}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {/* @ts-expect-error -- expected */}
                    {format(new Date(selectedReport.createdDate), "MMM dd, yyyy")}
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-white">{selectedReport.issue}</h2>
              </div>

              {/* Ticket Content */}
              <div className="p-6 bg-[#1A1B26]">
                <div className="flex items-center gap-2 mb-4">
                  {(() => {
                    const user = findUserByUsername(selectedReport.createdBy);
                    return (
                      <>
                        {user?.avatarUrl ? (
                          <img 
                            src={user.avatarUrl}
                            alt={user.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-sm text-blue-400">
                              {user?.username.charAt(0).toUpperCase() || selectedReport.createdBy.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-white">{user?.username || selectedReport.createdBy}</div>
                          <div className="text-xs text-gray-400">Author</div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="bg-[#161722] rounded-lg p-4 mb-6">
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedReport.content}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedReport.reportStatus)}
                    <span className="text-sm text-gray-400">Current Status</span>
                  </div>
                  {selectedReport.attachment && (
                    // @ts-expect-error -- expected
                    <Button
                      type="text"
                      onClick={handleAttachmentClick}
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                      // @ts-expect-error -- expected
                      icon={isAttachmentLoading ? <Spin className="w-4 h-4" /> : <Paperclip className="w-4 h-4" />}
                    >
                      {isAttachmentLoading 
                        ? "Loading..." 
                        : showAttachment 
                          ? "Hide Attachment" 
                          : "View Attachment"
                      }
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Attachment section - keep existing code but update background */}
            <AnimatePresence mode="wait">
              {showAttachment && (
                <motion.div
                  className="flex-shrink-0 overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: 520 }}
                  exit={{ width: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.87, 0, 0.13, 1],
                  }}
                >
                  <div className="pl-8 h-full w-[500px] border-l border-gray-100/10 p-6 bg-[#1A1B26]">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="h-full"
                    >
                      {/* Attachment content */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">
                          Attachment
                        </h3>
                        <a
                          href={selectedReport.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-300"
                        >
                          Open in new tab
                        </a>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          transition: {
                            height: {
                              duration: 0.6,
                              ease: [0.87, 0, 0.13, 1],
                            },
                            opacity: {
                              duration: 0.3,
                              delay: 0.2,
                            },
                          },
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                          transition: {
                            height: {
                              duration: 0.6,
                              ease: [0.87, 0, 0.13, 1],
                            },
                            opacity: {
                              duration: 0.3,
                            },
                          },
                        }}
                      >
                        {renderAttachmentPreview()}
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </Modal>
    </ConfigProvider>
  );
};

export default ReportList;
