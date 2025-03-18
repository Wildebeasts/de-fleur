import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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

export const LoginPage: React.FC = () => {
  const { login, isLoading, redirectBasedOnRole } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    userName: '',
    password: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await login({
        userName: formData.userName,
        password: formData.password
      })
      toast.success('Login successful!')

      // Get the redirect URL from auth context
      const redirectUrl = redirectBasedOnRole() || '/'
      navigate({ to: redirectUrl })
    } catch (err: unknown) {
      const error = err as { response?: { data?: ApiErrorResponse } }

      if (
        error?.response?.data?.errors &&
        error.response.data.errors.length > 0
      ) {
        // Display the first error description from the API
        toast.error(
          error.response.data.errors[0].description || 'Invalid credentials'
        )
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Login failed. Please check your username and password.')
      }
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
          <h2 className="text-3xl font-bold text-[#3A4D39]">Welcome Back</h2>
          <p className="mt-2 text-[#3A4D39]/60">
            Continue your skincare journey
          </p>
        </motion.div>

        <Card className="border-rose-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-[#3A4D39]">
              Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Welcome to your skincare journey
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <motion.div
                variants={itemVariants}
                className="relative space-y-4 before:absolute before:-left-4 before:h-full before:w-1 before:rounded-full before:bg-gradient-to-b before:from-rose-200 before:to-transparent before:opacity-70"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="userName"
                    className="font-medium text-[#3A4D39]/80"
                  >
                    Username
                  </Label>
                  <Input
                    id="userName"
                    type="text"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="What's your username?"
                    className="rounded-md border-rose-200 focus-visible:ring-rose-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="font-medium text-[#3A4D39]/80"
                    >
                      Password
                    </Label>
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-rose-500 hover:text-rose-600"
                      onClick={() => navigate({ to: '/forgot_password' })}
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Don't worry we won't tell anyone"
                    className="rounded-md border-rose-200 focus-visible:ring-rose-300"
                    required
                  />
                </div>
              </motion.div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full border-rose-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-xs text-[#3A4D39]/60">
                    secure login
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col space-y-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-rose-400 py-5 text-white shadow-sm transition-all duration-300 hover:bg-rose-500"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-rose-500 hover:text-rose-600"
                >
                  Create one
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <motion.div
          variants={itemVariants}
          className="text-center text-sm text-gray-500"
        >
          By signing in, you agree to our{' '}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-[#3A4D39] hover:text-[#4A5D49]"
          >
            Terms of Service
          </Button>{' '}
          and{' '}
          <Button
            type="button"
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
