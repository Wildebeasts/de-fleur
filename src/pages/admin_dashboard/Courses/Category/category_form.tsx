// @ts-expect-error - ConfigProvider already supported
import { Form, Input, Button, message, ConfigProvider } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import categoryApi from "@/utils/services/CategoryService";
// @ts-expect-error - Skeleton already supported
import { Skeleton } from "antd";
import { BreadcrumbUpdater } from "@/components/BreadcrumbUpdater";

export default function CategoryForm() {
  // @ts-expect-error - Form already supported
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams(); // Get category ID from URL if editing
  const [loading, setLoading] = useState(true);
  // @ts-expect-error - expected debugMode
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [debugMode, setDebugMode] = useState(false);

  // Fetch category data if editing
  useEffect(() => {
    const fetchCategory = async () => {
      if (id) {
        setLoading(true);
        try {
          const response = await categoryApi.getCategories();
          const category = response.items.find(
            (item) => item.categoryId === id
          );
          if (category) {
            form.setFieldsValue({
              cateName: category.cateName,
              cateDescription: category.cateDescription,
              createdBy: category.createdBy,
              createdDate: category.createdDate
            });
          }
        } catch (error) {
          console.error("Error fetching category:", error);
          message.error("Failed to fetch category details");
        } finally {
          setLoading(false);
        }
      } else {
        // If not editing, we can show the form immediately
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!id) {
        // Add mode
        await categoryApi.createCategory({
          cateName: values.cateName,
          cateDescription: values.cateDescription,
        });
        message.success("Category created successfully");
      } else {
        // Edit mode
        await categoryApi.updateCategory(id, {
          cateName: values.cateName,
          cateDescription: values.cateDescription,
          createdBy: values.createdBy,
          createdDate: values.createdDate
        });
        message.success("Category updated successfully");
      }

      navigate("/admin/courses/categories"); // Navigate back to list
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Failed to save category");
    }
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Input: {
            colorBgContainer: "#31383d", // Input background
            colorText: "#ffffff", // Input text
            colorTextPlaceholder: "#8b949e", // Placeholder text
            activeBorderColor: "#3b82f6", // Border color when focused
            hoverBorderColor: "#3b82f6", // Border color on hover
            colorBorder: "#30363d", // Default border color
          },
          Form: {
            labelColor: "#ffffff", // Form label color
            colorError: "#dc2626", // Error text color
          },
          Button: {
            primaryColor: "#ffffff", // Primary button text color
            defaultBg: "#31383d", // Default button background
            defaultColor: "#ffffff", // Default button text color
            colorBorder: "#30363d", // Button border color
          },
          Skeleton: {
            colorFill: "#31383d",
            colorFillHover: "#3b4147",
            backgroundColor: "#282d35",
          },
        },
      }}
    >
      <BreadcrumbUpdater
        items={id 
          ? ["Admin Dashboard", "Courses", "Categories", "Edit Category"] 
          : ["Admin Dashboard", "Courses", "Categories", "Add Category"]}
        previousItems={["Admin Dashboard", "Courses", "Categories"]}
      />
      <div className="w-[70%] mx-auto mt-[8rem]">
        {process.env.NODE_ENV === 'development' && (
          // @ts-expect-error - expected debugMode
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
        <div className="bg-[#282d35] p-6 rounded-lg">
          <h2 className="text-2xl mb-6 text-white">
            {id ? "Edit Category" : "Add Category"}
          </h2>

          {loading ? (
            <div className="space-y-6">
              <div>
                <Skeleton.Input
                  active={true}
                  block
                  className="!bg-[#31383d] !w-32 !h-6"
                />
                <Skeleton.Input
                  active={true}
                  block
                  className="!bg-[#31383d]"
                />
              </div>
              <div>
                <Skeleton.Input
                  active={true}
                  block
                  className="!bg-[#31383d] !w-32 !h-6"
                />
                <Skeleton.Input
                  active={true}
                  block
                  className="!bg-[#31383d] !h-[90px]"
                />
              </div>
              <div className="flex justify-end gap-4">
                <Skeleton.Button
                  active={true}
                  className="!bg-[#31383d] rounded-md"
                />
                <Skeleton.Button
                  active={true}
                  className="!bg-[#31383d] rounded-md"
                />
              </div>
            </div>
          ) : (
            // @ts-expect-error - Form already supported
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              {/* Hidden fields to store createdBy and createdDate */}
              {/* @ts-expect-error - Form.Item already supported */}
              <Form.Item name="createdBy" hidden={true}>
                {/* @ts-expect-error - Input already supported */}
                <Input type="hidden" />
              </Form.Item>
              {/* @ts-expect-error - Form.Item already supported */}
              <Form.Item name="createdDate" hidden={true}>
                {/* @ts-expect-error - Input already supported */}
                <Input type="hidden" />
              </Form.Item>

              {/* Visible fields */}
              {/* @ts-expect-error - Form.Item already supported */}
              <Form.Item
                name="cateName"
                label="Category Name"
                rules={[{ required: true, message: "Please input category name!" }]}
              >
                {/* @ts-expect-error - Input already supported */}
                <Input placeholder="Enter category name" />
              </Form.Item>

              {/* @ts-expect-error - Form.Item already supported */}
              <Form.Item
                name="cateDescription"
                label="Description"
                rules={[
                  { required: true, message: "Please input category description!" },
                ]}
              >
                {/* @ts-expect-error - Input.TextArea already supported */}
                <Input.TextArea placeholder="Enter category description" rows={4} />
              </Form.Item>

              <div className="flex justify-end gap-4 mt-6">
                {/* @ts-expect-error - Button already supported */}
                <Button onClick={() => navigate("/admin/courses/categories")}>
                  Cancel
                </Button>
                {/* @ts-expect-error - Button already supported */}
                <Button type="primary" htmlType="submit">
                  {id ? "Update" : "Create"}
                </Button>
              </div>
            </Form>
          )}
        </div>
      </div>
    </ConfigProvider>
  );
}
