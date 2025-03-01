// @ts-expect-error -- expected
import { Form, Input, Button, message, ConfigProvider, Skeleton, Upload } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import stepApi from "@/utils/services/StepService";
import { BreadcrumbUpdater } from "@/components/BreadcrumbUpdater";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from 'antd/es/upload/interface';

export default function StepForm() {
  // @ts-expect-error -- expected
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { courseId, sectionId, stepId } = useParams();
  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    const fetchStep = async () => {
      if (stepId) {
        setLoading(true);
        try {
          const step = await stepApi.getStepById(stepId);
          if (step) {
            // Set existing video if available
            if (step.videoUrl) {
              setFileList([
                {
                  uid: '-1',
                  name: 'Current Video',
                  status: 'done',
                  url: step.videoUrl,
                },
              ]);
            }

            form.setFieldsValue({
              stepName: step.stepName,
              summary: step.summary,
              stepNumber: step.stepNumber,
              deadline: step.deadline,
              videoUrl: step.videoUrl,
            });
          }
        } catch (error) {
          console.error("Error fetching step:", error);
          message.error("Failed to fetch step details");
        } finally {
          setLoading(false);
        }
      } else {
        // For new steps, initialize with empty values
        form.setFieldsValue({
          stepNumber: 1,
          deadline: 7,
        });
        setLoading(false);
      }
    };

    fetchStep();
  }, [stepId, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Get the file from the fileList
      const videoFile = fileList[0]?.originFileObj;

      const stepData = {
        sectionId,
        stepName: values.stepName,
        summary: values.summary,
        stepNumber: values.stepNumber,
        deadline: values.deadline,
        video: videoFile || null,
      };

      if (!stepId) {
        // Create new step
        // @ts-expect-error -- expected
        await stepApi.createStep(sectionId, stepData);
        message.success("Step created successfully");
      } else {
        // Update existing step
        await stepApi.updateStep(stepId, stepData);
        message.success("Step updated successfully");
      }

      navigate(`/admin/sections/${sectionId}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Failed to save step");
    }
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            labelColor: "#ffffff",
            colorText: "#ffffff",
            colorError: "#ef4444",
            colorErrorBorder: "#ef4444",
            colorErrorOutline: "#ef4444",
          },
          Input: {
            colorBgContainer: "#282d35",
            colorBorder: "#363b42",
            colorText: "#ffffff",
            colorTextPlaceholder: "#8b949e",
          },
          Button: {
            colorBgContainer: "#282d35",
            colorBorder: "#363b42",
            colorText: "#ffffff",
            colorPrimary: "#3b82f6",
          },
          Upload: {
            colorBgContainer: "#282d35",
            colorBorder: "#363b42",
            colorText: "#ffffff",
            colorTextDescription: "#8b949e",
            colorFillAlter: "#363b42",
          },
        },
        token: {
          colorBgContainer: "#282d35",
          colorText: "#ffffff",
          borderRadius: 8,
          padding: 24,
          colorBgElevated: "#282d35",
          colorTextDisabled: "#8b949e",
        },
      }}
    >
      <BreadcrumbUpdater
        items={
          stepId
            ? ["Admin Dashboard", "Courses", "Section Details", "Edit Step"]
            : ["Admin Dashboard", "Courses", "Section Details", "Add Step"]
        }
        previousItems={["Admin Dashboard", "Courses", "Section Details"]}
      />
      <div className="w-[70%] mx-auto mt-[8rem]">
        <div className="bg-[#282d35] p-6 rounded-lg">
          <h2 className="text-2xl mb-6 text-white">
            {stepId ? "Edit Step" : "Add Step"}
          </h2>

          {loading ? (
            <div className="space-y-6">
              {/* Step Name */}
              <div>
                <Skeleton.Input active={true} className="!bg-[#31383d] !w-24 !h-4 mb-2" />
                <Skeleton.Input active={true} block className="!bg-[#31383d] !h-9" />
              </div>
              
              {/* Summary */}
              <div>
                <Skeleton.Input active={true} className="!bg-[#31383d] !w-24 !h-4 mb-2" />
                <Skeleton.Input active={true} block className="!bg-[#31383d] !h-24" />
              </div>
              
              {/* Step Number and Deadline */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton.Input active={true} className="!bg-[#31383d] !w-24 !h-4 mb-2" />
                  <Skeleton.Input active={true} block className="!bg-[#31383d] !h-9" />
                </div>
                <div>
                  <Skeleton.Input active={true} className="!bg-[#31383d] !w-24 !h-4 mb-2" />
                  <Skeleton.Input active={true} block className="!bg-[#31383d] !h-9" />
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <Skeleton.Input active={true} className="!bg-[#31383d] !w-24 !h-4 mb-2" />
                <Skeleton.Button active={true} className="!bg-[#31383d] !w-32 !h-9" />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-8">
                <Skeleton.Button active={true} className="!bg-[#31383d] !w-20 !h-9" />
                <Skeleton.Button active={true} className="!bg-[#31383d] !w-20 !h-9" />
              </div>
            </div>
          ) : (
            // @ts-expect-error -- expected
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              {/* @ts-expect-error -- expected */}
              <Form.Item
                name="stepName"
                label="Step Name"
                rules={[
                  { required: true, message: "Please input step name!" },
                  {
                    max: 100,
                    message: "Step name cannot exceed 100 characters!",
                  },
                ]}
              >
                {/* @ts-expect-error -- expected */}
                <Input placeholder="Enter step name" />
              </Form.Item>

              {/* @ts-expect-error -- expected */}
              <Form.Item
                name="summary"
                label="Summary"
                rules={[
                  { required: true, message: "Please input step summary!" },
                  {
                    max: 500,
                    message: "Summary cannot exceed 500 characters!",
                  },
                ]}
              >
                {/* @ts-expect-error -- expected */}
                <Input.TextArea placeholder="Enter step summary" rows={4} />
              </Form.Item>

              {/* @ts-expect-error -- expected */}
              <Form.Item
                name="stepNumber"
                label="Step Number"
                rules={[
                  { required: true, message: "Please input step number!" },
                  {
                    type: "number",
                    min: 1,
                    message: "Step number must be greater than 0!",
                  },
                ]}
              >
                {/* @ts-expect-error -- expected */}
                <Input type="number" min={1} placeholder="Enter step number" />
              </Form.Item>

              {/* @ts-expect-error -- expected */}
              <Form.Item
                name="deadline"
                label="Deadline (days after enrollment)"
                rules={[
                  { required: true, message: "Please input deadline in days!" },
                  {
                    type: "number",
                    min: 1,
                    message: "Deadline must be at least 1 day!",
                  },
                ]}
              >
                {/* @ts-expect-error -- expected */}
                <Input type="number" min={1} placeholder="Enter number of days" />
              </Form.Item>

              {/* @ts-expect-error -- expected */}
              <Form.Item
                name="video"
                label="Video"
                rules={[
                  { required: true, message: "Please upload a video!" },
                ]}
              >
                <Upload
                  accept="video/*"
                  maxCount={1}
                  fileList={fileList}
                  // @ts-expect-error -- expected
                  onChange={({ fileList }) => setFileList(fileList)}
                  // @ts-expect-error -- expected
                  beforeUpload={(file) => {
                    const isVideo = file.type.startsWith('video/');
                    if (!isVideo) {
                      message.error('You can only upload video files!');
                    }
                    const isLt100M = file.size / 1024 / 1024 < 100;
                    if (!isLt100M) {
                      message.error('Video must be smaller than 100MB!');
                    }
                    return isVideo && isLt100M;
                  }}
                  listType="text"
                  // @ts-expect-error -- expected
                  showUploadList={{
                    showPreviewIcon: false,
                    showRemoveIcon: true,
                    showDownloadIcon: false,
                  }}
                >
                  {fileList.length === 0 && (
                    // @ts-expect-error -- expected
                    <Button icon={<UploadOutlined />}>Upload Video</Button>
                  )}
                </Upload>
              </Form.Item>

              <div className="flex justify-end gap-4 mt-6">
                {/* @ts-expect-error -- expected */}
                <Button onClick={() => navigate(`/admin/courses/${courseId}/sections/${sectionId}/edit`)}>
                  Cancel
                </Button>
                {/* @ts-expect-error -- expected */}
                <Button type="primary" htmlType="submit">
                  {stepId ? "Update" : "Create"}
                </Button>
              </div>
            </Form>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
}