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
import { FaGoogle, FaApple } from 'react-icons/fa'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useAuth } from '@/lib/context/AuthContext'
import { toast } from 'sonner'

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
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const search = useSearch({ from: '/login' })
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
      navigate({ to: search.redirect || '/' })
    } catch (err) {
      toast.error((err as Error)?.message || 'Login failed. Please try again.')
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
            <CardTitle className="text-[#3A4D39]">Sign In</CardTitle>
            <CardDescription>
              Choose your preferred sign in method
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <motion.div variants={itemVariants} className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-rose-200 hover:bg-rose-50"
                >
                  <FaGoogle className="mr-2" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-rose-200 hover:bg-rose-50"
                >
                  <FaApple className="mr-2" />
                  Apple
                </Button>
              </motion.div>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
                  or continue with
                </span>
              </div>

              <motion.div variants={itemVariants} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Username</Label>
                  <Input
                    id="userName"
                    type="text"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="johndoe"
                    className="border-rose-200 focus-visible:ring-rose-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-rose-500 hover:text-rose-600"
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
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
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="text-rose-500 hover:text-rose-600"
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
