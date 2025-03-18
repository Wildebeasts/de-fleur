import React, { useState, useEffect } from 'react'
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
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useResetPassword } from '@/lib/hooks/useAuth'
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

export default function ResetPassword() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/reset_password' })
  const resetPassword = useResetPassword()

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    // Get token and email from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const tokenParam = urlParams.get('token')
    const emailParam = urlParams.get('email')

    if (!tokenParam || !emailParam) {
      toast.error('Invalid reset link. Please request a new one.')
      navigate({ to: '/forgot_password', search: {} })
      return
    }

    setToken(tokenParam)
    setEmail(emailParam)
  }, [navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }

    if (formData.password.length < 5) {
      toast.error('Password must be at least 5 characters long.')
      return
    }

    try {
      await resetPassword.mutateAsync({
        email,
        accessToken: token,
        password: formData.password,
        passwordConfirmation: formData.confirmPassword
      })

      toast.success('Your password has been reset successfully!')
      navigate({ to: '/login', search: { redirect: undefined } })
    } catch (err: unknown) {
      const error = err as { response?: { data?: ApiErrorResponse } }

      if (
        error?.response?.data?.errors &&
        error.response.data.errors.length > 0
      ) {
        // Display the first error description from the API
        toast.error(
          error.response.data.errors[0].description ||
            error.response.data.message
        )
      } else if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('An unexpected error occurred')
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
          <h2 className="text-3xl font-bold text-[#3A4D39]">Reset Password</h2>
          <p className="mt-2 text-[#3A4D39]/60">
            Create a new password for your account
          </p>
        </motion.div>

        <Card className="border-rose-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#3A4D39]">New Password</CardTitle>
            <CardDescription>
              Please enter and confirm your new password
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="border-rose-200 focus-visible:ring-rose-300"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Must be at least 5 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="border-rose-200 focus-visible:ring-rose-300"
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
                    secure reset
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col space-y-4">
              <Button
                type="submit"
                disabled={resetPassword.isPending}
                className="w-full rounded-md bg-rose-400 py-5 text-white shadow-sm transition-all duration-300 hover:bg-rose-500"
              >
                {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
              </Button>
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link
                  to="/login"
                  search={{ redirect: undefined }}
                  className="font-medium text-rose-500 hover:text-rose-600"
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
          Need help?{' '}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-[#3A4D39] hover:text-[#4A5D49]"
          >
            Contact Support
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
