// @ts-expect-error -- expected
import { Form, Input, Button, message, ConfigProvider, Skeleton, Table, Dropdown, Modal } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import sectionApi from "@/utils/services/SectionService";
import { BreadcrumbUpdater } from "@/components/BreadcrumbUpdater";
import stepApi from "@/utils/services/StepService";
import { EditOutlined, DeleteOutlined, PlusOutlined, EllipsisOutlined } from "@ant-design/icons";

export default function SectionForm() {
  // @ts-expect-error -- expected
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { courseId, sectionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState([]);
  const [stepsLoading, setStepsLoading] = useState(true);

  useEffect(() => {
    const fetchSection = async () => {
      if (sectionId) {
        setLoading(true);
        try {
          const section = await sectionApi.getSectionById(sectionId);
          if (section) {
            form.setFieldsValue({
              sectionName: section.sectionName,
              summary: section.summary,
              content: section.content,
              sectionNumber: section.sectionNumber,
              deadline: new Date(section.deadline).toISOString().slice(0, 16),
            });
          }
        } catch (error) {
          console.error("Error fetching section:", error);
          message.error("Failed to fetch section details");
        } finally {
          setLoading(false);
        }
      } else {
        // For new sections, initialize with empty values
        form.setFieldsValue({
          sectionNumber: 1,
        });
        setLoading(false);
      }
    };

    fetchSection();
  }, [sectionId, form]);

  useEffect(() => {
    const fetchSteps = async () => {
      if (sectionId) {
        try {
          setStepsLoading(true);
          const allSteps = await stepApi.getAllSteps();
          // Filter steps for current section
          const sectionSteps = allSteps.filter((step: { sectionId: string }) => step.sectionId === sectionId);
          setSteps(sectionSteps);
        } catch (error) {
          console.error("Error fetching steps:", error);
          message.error("Failed to fetch steps");
        } finally {
          setStepsLoading(false);
        }
      }
    };

    fetchSteps();
  }, [sectionId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const sectionData = {
        courseId,
        sectionName: values.sectionName,
        summary: values.summary,
        content: values.content,
        sectionNumber: values.sectionNumber,
        deadline: new Date(values.deadline).getTime(),
      };

      if (!sectionId) {
        // Create new section
        // @ts-expect-error -- expected
        await sectionApi.createSection(courseId, sectionData);
        message.success("Section created successfully");
      } else {
        // Update existing section
        await sectionApi.updateSection(sectionId, sectionData);
        message.success("Section updated successfully");
      }

      navigate(`/admin/courses/all-course`);
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Failed to save section");
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this step?",
      // @ts-expect-error -- expected
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await stepApi.deleteStep(stepId);
          message.success("Step deleted successfully");
          // Refresh steps
          const allSteps = await stepApi.getAllSteps();
          // Filter steps for current section
          const sectionSteps = allSteps.filter((step: { sectionId: string }) => step.sectionId === sectionId);
          setSteps(sectionSteps);
        } catch (error) {
          console.error("Error deleting step:", error);
          message.error("Failed to delete step");
        }
      },
    });
  };

  const stepColumns = [
    {
      title: "Step Name",
      dataIndex: "stepName",
      key: "stepName",
    },
    {
      title: "Summary",
      dataIndex: "summary",
      key: "summary",
      ellipsis: true,
    },
    {
      title: "Step Number",
      dataIndex: "stepNumber",
      key: "stepNumber",
      sorter: (a: { stepNumber: number }, b: { stepNumber: number }) => a.stepNumber - b.stepNumber,
    },
    {
      title: "Deadline (Days)", 
      dataIndex: "deadline",
      key: "deadline",
    },
    {
        title: "Actions",
        key: "actions",
        width: 80,
        align: "center" as const,
        // @ts-expect-error -- expected
        render: (_, record) => (
          // @ts-expect-error -- expected
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  icon: <EditOutlined />,
                  label: "Edit",
                  onClick: () => navigate(`/admin/sections/${sectionId}/steps/${record.stepId}/edit`)
                },
                {
                  key: "delete",
                  icon: <DeleteOutlined />,
                  label: "Delete",
                  danger: true,
                  onClick: () => handleDeleteStep(record.stepId)
                }
              ]
            }}
            trigger={["click"]}
          >
            <Button
              type="text"
              // @ts-expect-error -- expected
              icon={<EllipsisOutlined />}
              className="text-gray-400 hover:text-blue-400"
            />
          </Dropdown>
        ),
      }
    ];

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
          sectionId
            ? ["Admin Dashboard", "Courses", "Course Details", "Edit Section"]
            : ["Admin Dashboard", "Courses", "Course Details", "Add Section"]
        }
        previousItems={["Admin Dashboard", "Courses", "Course Details"]}
      />
      <div className="w-[70%] mx-auto mt-[8rem]">
        <div className="bg-[#282d35] p-6 rounded-lg">
          <h2 className="text-2xl mb-6 text-white">
            {sectionId ? "Edit Section" : "Add Section"}
          </h2>

          {loading ? (
            <div className="space-y-6">
              {/* Section Name */}
              <div>
                <Skeleton.Input active={true} className="!bg-[#31383d] !w-28 !h-5 mb-2" />
                <Skeleton.Input active={true} block className="!bg-[#31383d] !h-9" />
              </div>
              {/* Summary */}
              <div>
                <Skeleton.Input active={true} className="!bg-[#31383d] !w-20 !h-5 mb-2" />
                <Skeleton.Input active={true} block className="!bg-[#31383d] !h-24" />
              </div>
              {/* Content */}
              <div>
                <Skeleton.Input active={true} className="!bg-[#31383d] !w-20 !h-5 mb-2" />
                <Skeleton.Input active={true} block className="!bg-[#31383d] !h-36" />
              </div>
              {/* Section Number & Deadline */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Skeleton.Input active={true} className="!bg-[#31383d] !w-32 !h-5 mb-2" />
                  <Skeleton.Input active={true} block className="!bg-[#31383d] !h-9" />
                </div>
                <div>
                  <Skeleton.Input active={true} className="!bg-[#31383d] !w-24 !h-5 mb-2" />
                  <Skeleton.Input active={true} block className="!bg-[#31383d] !h-9" />
                </div>
              </div>
              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <Skeleton.Button active={true} className="!bg-[#31383d] !w-20 !h-8" />
                <Skeleton.Button active={true} className="!bg-[#31383d] !w-20 !h-8" />
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
                name="sectionName"
                label="Section Name"
                rules={[
                  { required: true, message: "Please input section name!" },
                  {
                    max: 100,
                    message: "Section name cannot exceed 100 characters!",
                  },
                ]}
              >
                {/* @ts-expect-error -- expected */}
                <Input placeholder="Enter section name" />
              </Form.Item>

              {/* @ts-expect-error -- expected */}
              <Form.Item
                name="summary"
                label="Summary"
                rules={[
                  { required: true, message: "Please input section summary!" },
                  {
                    max: 500,
                    message: "Summary cannot exceed 500 characters!",
                  },
                ]}
              >
                {/* @ts-expect-error -- expected */}
                <Input.TextArea placeholder="Enter section summary" rows={4} />
              </Form.Item>

              {/* @ts-expect-error -- expected */}
              <Form.Item
                name="content"
                label="Content"
                rules={[
                  { required: true, message: "Please input section content!" },
                ]}
              >
                {/* @ts-expect-error -- expected */}
                <Input.TextArea placeholder="Enter section content" rows={6} />
              </Form.Item>

              {/* @ts-expect-error -- expected */}
              <Form.Item
                name="sectionNumber"
                label="Section Number"
                rules={[
                  { required: true, message: "Please input section number!" },
                  {
                    type: "number",
                    min: 1,
                    message: "Section number must be greater than 0!",
                  },
                ]}
              >
                {/* @ts-expect-error -- expected */}
                <Input type="number" min={1} placeholder="Enter section number" />
              </Form.Item>

              {/* @ts-expect-error -- expected */}
              <Form.Item
                name="deadline"
                label="Deadline"
                rules={[
                  { required: true, message: "Please input deadline!" },
                ]}
              >
                {/* @ts-expect-error -- expected */}
                <Input type="datetime-local" />
              </Form.Item>

              <div className="flex justify-end gap-4 mt-6">
                {/* @ts-expect-error -- expected */}
                <Button onClick={() => navigate(`/admin/courses/all-course`)}>
                  Cancel
                </Button>
                {/* @ts-expect-error -- expected */}
                <Button type="primary" htmlType="submit">
                  {sectionId ? "Update" : "Create"}
                </Button>
              </div>
            </Form>
          )}
        </div>
      </div>
      {sectionId && (
        <div className="mt-8">
          <div className="bg-[#282d35] p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl text-white">Steps</h2>
              {/* @ts-expect-error -- expected */}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate(`/admin/sections/${sectionId}/steps/new`)}
              >
                Add Step
              </Button>
            </div>
            {/* @ts-expect-error -- expected */}
            <Table
              columns={stepColumns}
              dataSource={steps}
              loading={stepsLoading}
              rowKey="id"
              pagination={false}
              className="bg-[#282d35]"
            />
          </div>
        </div>
      )}
    </ConfigProvider>
  );
}