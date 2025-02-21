import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { FaInstagram, FaFacebook, FaTiktok, FaYoutube } from 'react-icons/fa'

// Animation variants from LoginPage.tsx (lines 18-31)
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

const socialLinks = [
  {
    platform: 'Instagram',
    icon: FaInstagram,
    handle: '@defleur.beauty',
    followers: '50K+',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  {
    platform: 'TikTok',
    icon: FaTiktok,
    handle: '@defleur.official',
    followers: '100K+',
    color: 'bg-black'
  },
  {
    platform: 'Facebook',
    icon: FaFacebook,
    handle: 'De Fleur Beauty',
    followers: '25K+',
    color: 'bg-blue-600'
  },
  {
    platform: 'YouTube',
    icon: FaYoutube,
    handle: 'De Fleur Beauty',
    followers: '30K+',
    color: 'bg-red-600'
  }
]

export const SocialAccountsPage: React.FC = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex min-h-screen items-center justify-center bg-gradient-to-b from-orange-50/80 to-white px-4 py-16"
    >
      <motion.div
        variants={itemVariants}
        className="w-full max-w-4xl space-y-8"
      >
        <motion.div variants={itemVariants} className="text-center">
          <h2 className="text-3xl font-bold text-[#3A4D39]">Connect With Us</h2>
          <p className="mt-2 text-[#3A4D39]/60">
            Follow our social media accounts for daily skincare tips and updates
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {socialLinks.map((social) => (
            <motion.div
              key={social.platform}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="border-rose-200/50 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex size-12 items-center justify-center rounded-full ${social.color} text-white`}
                    >
                      <social.icon className="size-6" />
                    </div>
                    <div>
                      <CardTitle className="text-[#3A4D39]">
                        {social.platform}
                      </CardTitle>
                      <CardDescription>{social.handle}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {social.followers} followers
                    </span>
                    <Button
                      variant="ghost"
                      className="text-[#3A4D39] hover:bg-[#D1E2C4]/20"
                    >
                      Follow Us
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={itemVariants}
          className="mt-12 rounded-2xl bg-[#D1E2C4]/30 p-8 text-center"
        >
          <h3 className="mb-4 text-2xl font-semibold text-[#3A4D39]">
            Join Our Community
          </h3>
          <p className="mb-6 text-[#3A4D39]/80">
            Be part of our growing skincare community and get exclusive content,
            tips, and special offers.
          </p>
          <Button className="rounded-full bg-[#3A4D39] px-8 py-6 text-white hover:bg-[#4A5D49]">
            Subscribe to Newsletter
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default SocialAccountsPage
