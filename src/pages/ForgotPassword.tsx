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
import { useForgotPassword } from '@/lib/hooks/useAuth'
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

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()
  const forgotPassword = useForgotPassword()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await forgotPassword.mutateAsync(email)
      toast.success('Password reset link has been sent to your email')
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
          <h2 className="text-3xl font-bold text-[#3A4D39]">Forgot Password</h2>
          <p className="mt-2 text-[#3A4D39]/60">
            We&apos;ll help you reset your password
          </p>
        </motion.div>

        <Card className="border-rose-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#3A4D39]">Reset Password</CardTitle>
            <CardDescription>
              Enter your email address to receive a password reset link
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                disabled={forgotPassword.isPending}
                className="w-full rounded-md bg-rose-400 py-5 text-white shadow-sm transition-all duration-300 hover:bg-rose-500"
              >
                {forgotPassword.isPending ? 'Sending...' : 'Send Reset Link'}
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
