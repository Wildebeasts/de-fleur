import React, { useEffect, useState } from "react";
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
  Modal,
} from "antd";
import { Certificate } from "@/models/Certificate";
import certificateApi from "@/utils/services/CertificateService";
import {
  Award,
  Trash2,
  Check,
} from "lucide-react";
import { BreadcrumbUpdater } from "@/components/BreadcrumbUpdater";
// @ts-expect-error -- expected
import { Empty } from "antd";
import userApi from "@/lib/services/userService";
import courseApi from "@/utils/services/CoursesService";

const CertificateList: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [courseNames, setCourseNames] = useState<Record<string, string>>({});
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCertificateUrl, setSelectedCertificateUrl] = useState<string>('');

  const fetchAdditionalData = async (certificates: Certificate[]) => {
    try {
      // Fetch course names
      const coursePromises = certificates.map(cert => 
        courseApi.getCourseById(cert.courseId)
          .then(course => [cert.courseId, course.courseName])
      );

      // Fetch user names - Update to use username since first/last name aren't available
      const userPromises = certificates.map(cert =>
        userApi.getUserById(cert.userId)
          .then(user => [cert.userId, user.username])
      );

      const courseResults = await Promise.all(coursePromises);
      const userResults = await Promise.all(userPromises);

      setCourseNames(Object.fromEntries(courseResults));
      setUserNames(Object.fromEntries(userResults));
    } catch (error) {
      console.error("Error fetching additional data:", error);
      message.error("Failed to fetch course and user details");
    }
  };

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await certificateApi.getCertificates(0, 1000); // Get all certificates at once
      setCertificates(response.items);
      setPagination(prev => ({
        ...prev,
        total: response.items.length
      }));
      await fetchAdditionalData(response.items);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      message.error("Failed to fetch certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get current certificates for the page
  const getCurrentCertificates = () => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return certificates.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const handleCertificateSelection = (certificateId: string) => {
    setSelectedCertificates((prev) =>
      prev.includes(certificateId)
        ? prev.filter((id) => id !== certificateId)
        : [...prev, certificateId]
    );
  };

  const handleMassDelete = async () => {
    Modal.confirm({
      title: "Delete Selected Certificates",
      // @ts-expect-error -- expected
      content: `Are you sure you want to delete ${selectedCertificates.length} selected certificates?`,
      centered: true,
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          await Promise.all(
            selectedCertificates.map((id) => certificateApi.deleteCertificate(id))
          );
          message.success("Certificates deleted successfully");
          setSelectedCertificates([]);
          setIsEditMode(false);
          fetchCertificates();
        } catch (error) {
          console.error("Error deleting certificates:", error);
          message.error("Failed to delete certificates");
        }
      },
      className: "dark-modal",
    });
  };

  const showCertificateModal = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCertificateUrl(url);
    setIsModalVisible(true);
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
        items={["Admin Dashboard", "Courses", "Certificates"]}
        previousItems={["Admin Dashboard", "Courses"]}
      />
      <div className="w-[80%] mx-auto mt-[8rem]">
        <Card
          title={
            <div className="flex items-center justify-between my-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#282d35]">
                  <Award className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-lg font-semibold text-white">
                  Certificate List
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isEditMode && selectedCertificates.length > 0 && (
                  // @ts-expect-error -- expected
                  <Button
                    danger
                    type="primary"
                    onClick={handleMassDelete}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected ({selectedCertificates.length})
                  </Button>
                )}
                {/* @ts-expect-error -- expected */}
                <Button
                  type={isEditMode ? "primary" : "default"}
                  onClick={() => {
                    setIsEditMode(!isEditMode);
                    setSelectedCertificates([]);
                  }}
                  className={`${
                    isEditMode
                      ? "bg-blue-500 hover:bg-blue-600 border-none text-white"
                      : "bg-[#282d35] hover:bg-[#353a44] text-gray-400 hover:text-white border-[#374151]"
                  }`}
                >
                  {isEditMode ? "Done" : "Delete"}
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
          ) : certificates.length === 0 ? (
            <Empty description="No certificates found" />
          ) : (
            <>
              {/* @ts-expect-error -- expected */}
              <Row gutter={[16, 16]}>
                {getCurrentCertificates().map((certificate) => (
                  // @ts-expect-error -- expected
                  <Col xs={24} sm={12} md={8} lg={6} key={certificate.certificateId}>
                    <Card
                      hoverable
                      className={`
                        group h-full overflow-hidden bg-[#1a1b24] rounded-xl bg-clip-padding 
                        backdrop-filter backdrop-blur-lg bg-opacity-60 border border-gray-100/10 
                        hover:border-gray-100/20 transition-all duration-300 cursor-pointer
                        ${selectedCertificates.includes(certificate.certificateId)
                          ? "ring-2 ring-blue-500"
                          : ""
                        }
                      `}
                      onClick={(e: React.MouseEvent) => {
                        if (isEditMode) {
                          handleCertificateSelection(certificate.certificateId);
                        } else {
                          showCertificateModal(certificate.attachment, e);
                        }
                      }}
                    >
                      <div className="flex flex-col h-full relative">
                        {isEditMode && (
                          <div 
                            className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 z-10
                              ${selectedCertificates.includes(certificate.certificateId)
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-400"
                              } transition-all duration-200`}
                          >
                            {selectedCertificates.includes(certificate.certificateId) && (
                              <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                            )}
                          </div>
                        )}

                        {/* Certificate Preview Image */}
                        <div className="relative w-full aspect-[1.4] mb-4 rounded-lg overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b24] to-transparent z-[1]" />
                          <img
                            src={certificate.attachment}
                            alt="Certificate Preview"
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-gray-400">
                            ID: {certificate.certificateId.slice(0, 8)}...
                          </div>
                        </div>

                        <h3 className="text-base font-semibold text-white mb-2 line-clamp-2">
                          {courseNames[certificate.courseId] || 'Loading...'}
                        </h3>

                        <div className="text-sm text-gray-400 mb-2">
                          Student: {userNames[certificate.userId] || 'Loading...'}
                        </div>

                        <div className="mt-auto flex justify-end">
                          <button 
                            onClick={(e) => showCertificateModal(certificate.attachment, e)}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            View Certificate
                          </button>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
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
                  showTotal={(total: number, range: number[]) =>
                    `${range[0]}-${range[1]} of ${total} items`
                  }
                />
              </div>
            </>
          )}
        </Card>
      </div>
      {/* @ts-expect-error -- expected */}
      <Modal
        title="Certificate Preview"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          // @ts-expect-error -- expected
          <Button 
            key="close" 
            onClick={() => setIsModalVisible(false)}
          >
            Close
          </Button>,
          // @ts-expect-error -- expected
          <Button
            key="open"
            type="primary"
            href={selectedCertificateUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in New Tab
          </Button>
        ]}
        width={800}
        centered
        className="dark-modal"
      >
        <div className="w-full flex justify-center">
          <img
            src={selectedCertificateUrl}
            alt="Certificate"
            className="max-w-full max-h-[500px] object-contain"
            style={{ 
              backgroundColor: '#1a1b24',
              borderRadius: '8px'
            }}
          />
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default CertificateList;
