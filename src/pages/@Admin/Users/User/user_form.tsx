// @ts-expect-error -- expected
import { Form, Input, Button, message, ConfigProvider, Switch, Upload } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import userApi from "@/utils/services/UserService";
import authApi from "@/utils/services/AuthService";
import { useBreadcrumb } from "@/contexts/BreadcrumbContext";
// @ts-expect-error -- expected
import { Skeleton } from "antd";
import { format } from "date-fns";
import { UploadOutlined } from "@ant-design/icons";

interface UserFormData {
  username: string;
  emailConfirmed: boolean;
  createdDate: string;
  avatar?: File;
  avatarUrl?: string;
  password?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  gender?: boolean;
}

export default function UserForm() {
  // @ts-expect-error -- expected
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { updateBreadcrumb } = useBreadcrumb();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      updateBreadcrumb("Admin Dashboard", "Users", "Edit User");
    } else {
      updateBreadcrumb("Admin Dashboard", "Users", "Add User");
    }

    return () => {
      updateBreadcrumb("Admin Dashboard", "Users");
    };
  }, [updateBreadcrumb, id]);

  useEffect(() => {
    const fetchUser = async () => {
      if (id) {
        setLoading(true);
        try {
          const user = await userApi.getUserById(id);
          if (user) {
            form.setFieldsValue({
              username: user.username,
              emailConfirmed: user.emailConfirmed,
              createdDate: format(new Date(user.createdDate), "PPp"),
              avatarUrl: user.avatarUrl
            });
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          message.error("Failed to fetch user details");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (id) {
        // Update existing user
        const userData: Partial<UserFormData> = {
          username: values.username,
          emailConfirmed: values.emailConfirmed
        };
        await userApi.updateUser(userData);
        message.success("User details updated successfully");
        
        if (values.avatar?.fileList?.[0]) {
          const formData = new FormData();
          formData.append('file', values.avatar.fileList[0].originFileObj);
          await userApi.updateUserAvatar(formData);
          message.success("Avatar updated successfully");
        }
      } else {
        // Create new user using authApi with selected gender
        await authApi.register(
          values.username,
          values.password,
          values.email,
          values.firstName,
          values.lastName,
          values.gender // use the selected gender value
        );
        message.success("User created successfully");
      }

      navigate("/admin/users");
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Failed to save user");
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
          Switch: {
            colorPrimary: "#3b82f6",
            colorTextQuaternary: "#ffffff",
            colorTextTertiary: "#ffffff",
          },
          Badge: {
            dotSize: 16,
            statusSize: 16,
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
      <div className="w-[70%] mx-auto mt-[8rem]">
        <div className="bg-[#282d35] p-6 rounded-lg">
          <h2 className="text-2xl mb-6 text-white">
            {id ? "Edit User" : "Add User"}
          </h2>

          {loading ? (
            <div className="space-y-6">
              <div>
                <Skeleton.Input
                  active={true}
                  block
                  className="!bg-[#31383d] !w-24 !h-4 mb-2"
                />
                <Skeleton.Input 
                  active={true} 
                  block 
                  className="!bg-[#31383d] !h-[32px]" 
                />
              </div>
              
              <div>
                <Skeleton.Input
                  active={true}
                  block
                  className="!bg-[#31383d] !w-32 !h-4 mb-2"
                />
                <Skeleton.Input 
                  active={true} 
                  size="small"
                  className="!bg-[#31383d] !w-[44px] !h-[22px]" 
                />
              </div>

              {id && (
                <div>
                  <Skeleton.Input
                    active={true}
                    block
                    className="!bg-[#31383d] !w-28 !h-4 mb-2"
                  />
                  <Skeleton.Input 
                    active={true} 
                    block 
                    className="!bg-[#31383d] !h-[32px]" 
                  />
                </div>
              )}

              <div className="flex justify-end gap-4">
                <Skeleton.Button
                  active={true}
                  className="!bg-[#31383d] !w-[70px] !h-[32px]"
                />
                <Skeleton.Button
                  active={true}
                  className="!bg-[#31383d] !w-[70px] !h-[32px]"
                />
              </div>
            </div>
          ) : (
            // @ts-expect-error -- expected
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              {/* @ts-expect-error -- expected */}
              <Form.Item
                name="username"
                label="Username"
                rules={[
                  { required: true, message: "Please input username!" },
                  { max: 50, message: "Username cannot exceed 50 characters!" },
                  { 
                    pattern: /^\S*$/, 
                    message: "Username cannot contain spaces!" 
                  }
                ]}
              >
                {/* @ts-expect-error -- expected */}
                <Input placeholder="Enter username" disabled={!!id} autoComplete="off" />
              </Form.Item>

              {/* @ts-expect-error -- expected */}
              <Form.Item
                name="emailConfirmed"
                label="Email Confirmed"
                valuePropName="checked"
              >
                {/* @ts-expect-error -- expected */}
                <Switch disabled={!id} />
              </Form.Item>

              {id && (
                // @ts-expect-error -- expected
                <Form.Item
                  name="createdDate"
                  label="Created Date"
                >
                  {/* @ts-expect-error -- expected */}
                  <Input disabled />
                </Form.Item>
              )}

              {id && (
                <Form.Item
                  name="avatar"
                  label="Avatar"
                  // @ts-expect-error -- expected
                  extra={
                    <div className="flex gap-8 items-start mt-2">
                      {form.getFieldValue('avatarUrl') && (
                        <div>
                          <p className="text-sm text-gray-400 mb-2">Current Avatar:</p>
                          <img 
                            src={form.getFieldValue('avatarUrl')} 
                            alt="Current avatar" 
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-400 mb-2">New Avatar Preview:</p>
                        <div className="w-20 h-20 rounded-full overflow-hidden">
                          {form.getFieldValue('avatar')?.fileList?.[0]?.originFileObj && (
                            <img 
                              src={URL.createObjectURL(form.getFieldValue('avatar').fileList[0].originFileObj)} 
                              alt="New avatar preview" 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  }
                >
                  {/* @ts-expect-error -- expected */}
                  <Upload
                    maxCount={1}
                    beforeUpload={() => false}
                    accept="image/*"
                    showUploadList={false}
                  >
                    {/* @ts-expect-error -- expected */}
                    <Button icon={<UploadOutlined />}>Select New Avatar</Button>
                  </Upload>
                </Form.Item>
              )}

              {!id && (
                <>
                  {/* @ts-expect-error -- expected */}
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      { required: true, message: "Please input password!" },
                      { min: 6, message: "Password must be at least 6 characters!" }
                    ]}
                  >
                    {/* @ts-expect-error -- expected */}
                    <Input.Password placeholder="Enter password" autoComplete="new-password" />
                  </Form.Item>

                  {/* @ts-expect-error -- expected */}
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Please input email!" },
                      { type: 'email', message: "Please enter a valid email!" }
                    ]}
                  >
                    {/* @ts-expect-error -- expected */}
                    <Input placeholder="Enter email" autoComplete="off" />
                  </Form.Item>

                  {/* @ts-expect-error -- expected */}
                  <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[
                      { required: true, message: "Please input first name!" }
                    ]}
                  >
                    {/* @ts-expect-error -- expected */}
                    <Input placeholder="Enter first name" autoComplete="off" />
                  </Form.Item>

                  {/* @ts-expect-error -- expected */}
                  <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[
                      { required: true, message: "Please input last name!" }
                    ]}
                  >
                    {/* @ts-expect-error -- expected */}
                    <Input placeholder="Enter last name" autoComplete="off" />
                  </Form.Item>

                  {/* @ts-expect-error -- expected */}
                  <Form.Item
                    name="gender"
                    label="Gender"
                    initialValue={true}
                  >
                    <Switch
                      checkedChildren="Male"
                      unCheckedChildren="Female"
                      defaultChecked
                      // @ts-expect-error -- expected
                      className="!text-gray-300"
                      style={{ backgroundColor: '#363b42' }}
                    />
                  </Form.Item>
                </>
              )}

              <div className="flex justify-end gap-4 mt-6">
                {/* @ts-expect-error -- expected */}
                <Button onClick={() => navigate("/admin/users")}>
                  Cancel
                </Button>
                {/* @ts-expect-error -- expected */}
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

