import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { toast } from 'sonner'
import { useAuth } from '@/lib/context/AuthContext'
import { Link } from '@tanstack/react-router'

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

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const { forgotPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate an API request
      await forgotPassword({ email: email })
      toast.success('Password reset link sent! Check your email.')
    } catch (error) {
      toast.error('Failed to send reset link. Try again later.')
    } finally {
      setIsLoading(false)
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
            Enter your email to receive a password reset link
          </p>
        </motion.div>

        <Card className="border-rose-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#3A4D39]">Reset Password</CardTitle>
            <CardDescription>
              We will send a password reset link to your email
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="border-rose-200 focus-visible:ring-rose-300"
                    required
                  />
                </div>
              </motion.div>
            </CardContent>

            <CardFooter className="flex-col space-y-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-rose-300 text-black hover:bg-rose-400"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link
                  to="/login"
                  search={{ redirect: '/forgot_password' }}
                  className="text-rose-500 hover:text-rose-600"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  )
}
