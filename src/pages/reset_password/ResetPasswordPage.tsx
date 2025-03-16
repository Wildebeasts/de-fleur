import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { toast } from 'sonner'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useAuth } from '@/lib/context/AuthContext'
import { Route } from '@/routes/reset_password'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export const ResetPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const search = useSearch({ from: Route.id }) // Specify the route's ID

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    try {
      // Call API to reset password here
      await resetPassword({
        accessToken: search.accessToken,
        email: search.email,
        password: formData.password,
        passwordConfirmation: formData.confirmPassword
      })
      toast.success('Password has been reset successfully!')
      navigate({
        to: '/login',
        search: {
          redirect: location.pathname
        }
      })
    } catch (err) {
      toast.error('Failed to reset password. Please try again.')
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
            Enter your new password below
          </p>
        </motion.div>

        <Card className="border-rose-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#3A4D39]">
              Create New Password
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your new password"
                  className="border-rose-200 focus-visible:ring-rose-300"
                  required
                />
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your new password"
                  className="border-rose-200 focus-visible:ring-rose-300"
                  required
                />
              </motion.div>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-rose-300 text-black hover:bg-rose-400"
              >
                Reset Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  )
}
