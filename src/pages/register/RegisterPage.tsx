import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/context/AuthContext'
import { toast } from 'sonner'

// Define interfaces for error handling
interface ApiError {
  code: string
  description: string
}

interface ApiErrorResponse {
  isSuccess: boolean
  data: null
  message: string
  errors: ApiError[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    userName: '',
    gender: true
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        password: formData.password,
        passwordConfirmation: formData.confirmPassword,
        userName: formData.userName,
        gender: formData.gender
      })
      toast.success('Registration successful!')
      navigate({ to: '/' })
    } catch (err: unknown) {
      const error = err as { response?: { data?: ApiErrorResponse } }

      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors

        // Check for password too short error
        const passwordTooShortError = errors.find(
          (error: ApiError) => error.code === 'PasswordTooShort'
        )

        if (passwordTooShortError) {
          toast.error(
            passwordTooShortError.description ||
              'Passwords must be at least 5 characters.'
          )
          return
        }

        // Check for duplicate username error
        const duplicateUserError = errors.find(
          (error: ApiError) => error.code === 'AuthErrors.DuplicateUserName'
        )

        if (duplicateUserError) {
          toast.error(
            duplicateUserError.description ||
              'This username has already been taken.'
          )
          return
        }
      }

      // Default error message
      toast.error('Registration failed. Please try again.')
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex min-h-screen items-center justify-center bg-gradient-to-b from-orange-50/80 to-white px-4 py-16"
    >
      <motion.div variants={itemVariants} className="w-full max-w-md space-y-8">
        <motion.div variants={itemVariants} className="text-center">
          <h2 className="text-3xl font-bold text-[#3A4D39]">Create Account</h2>
          <p className="mt-2 text-[#3A4D39]/60">
            Start your personalized skincare journey
          </p>
        </motion.div>

        <Card className="border-rose-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#3A4D39]">Sign Up</CardTitle>
            <CardDescription>
              Join our community of skincare enthusiasts
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="border-rose-200 focus-visible:ring-rose-300"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="border-rose-200 focus-visible:ring-rose-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userName">User Name</Label>
                  <Input
                    id="userName"
                    type="text"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="border-rose-200 focus-visible:ring-rose-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="border-rose-200 focus-visible:ring-rose-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="hello@example.com"
                    required
                    className="border-rose-200 focus-visible:ring-rose-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant={formData.gender ? 'default' : 'outline'}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, gender: true }))
                      }
                    >
                      Male
                    </Button>
                    <Button
                      type="button"
                      variant={!formData.gender ? 'default' : 'outline'}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, gender: false }))
                      }
                    >
                      Female
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="border-rose-200 focus-visible:ring-rose-300"
                  />
                  <p className="text-xs text-gray-500">
                    Must be at least 5 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="border-rose-200 focus-visible:ring-rose-300"
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox id="newsletter" className="mt-1 border-rose-200" />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="newsletter"
                      className="text-sm font-medium leading-none text-gray-700"
                    >
                      Email Newsletter
                    </label>
                    <p className="text-xs text-gray-500">
                      Get updates about new products and skincare tips
                    </p>
                  </div>
                </div>
              </motion.div>
            </CardContent>

            <CardFooter className="flex-col space-y-4">
              <Button
                className="w-full bg-rose-300 text-black hover:bg-rose-400"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  search={{ redirect: '/register' }}
                  className="h-auto p-0 text-rose-500 hover:text-rose-600"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <motion.div
          variants={itemVariants}
          className="text-center text-sm text-gray-500"
        >
          By creating an account, you agree to our{' '}
          <Button
            variant="link"
            className="h-auto p-0 text-[#3A4D39] hover:text-[#4A5D49]"
          >
            Terms of Service
          </Button>{' '}
          and{' '}
          <Button
            variant="link"
            className="h-auto p-0 text-[#3A4D39] hover:text-[#4A5D49]"
          >
            Privacy Policy
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
