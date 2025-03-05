import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { FaGoogle, FaApple } from 'react-icons/fa'
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

export const RegisterPage: React.FC = () => {
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

          <CardContent className="space-y-6">
            <motion.div variants={itemVariants} className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 border-rose-200 hover:bg-rose-50"
              >
                <FaGoogle className="mr-2" />
                Google
              </Button>
              <Button
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
                or continue with email
              </span>
            </div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    className="border-rose-200 focus-visible:ring-rose-300"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    className="border-rose-200 focus-visible:ring-rose-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@example.com"
                  className="border-rose-200 focus-visible:ring-rose-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  className="border-rose-200 focus-visible:ring-rose-300"
                />
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
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
            <Button className="w-full bg-rose-300 text-black hover:bg-rose-400">
              Create Account
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
