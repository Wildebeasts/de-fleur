import React from 'react'
import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const testimonials = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Dermatologist',
    image: '/experts/sarah.jpg',
    quote:
      'The natural ingredients in De Fleur products have shown remarkable results in my patients with sensitive skin.',
    specialty: 'Sensitive Skin Care',
    credentials: 'Board Certified Dermatologist, MD',
    featured: true
  },
  {
    name: 'Lisa Thompson',
    role: 'Beauty Expert',
    image: '/experts/lisa.jpg',
    quote:
      'De Fleur stands out for their commitment to combining traditional wisdom with modern skincare science.',
    specialty: 'Clean Beauty',
    credentials: 'Certified Esthetician',
    featured: false
  }
]

const kols = [
  {
    name: 'Emma Roberts',
    role: 'Skincare Influencer',
    image: '/kols/emma.jpg',
    followers: '500K+',
    specialty: 'Natural Skincare',
    featured: true,
    platforms: ['Instagram', 'YouTube', 'TikTok']
  },
  {
    name: 'James Kim',
    role: 'Beauty Educator',
    image: '/kols/james.jpg',
    followers: '250K+',
    specialty: 'K-Beauty Fusion',
    featured: false,
    platforms: ['Instagram', 'YouTube']
  }
]

const TestimonialsPage: React.FC = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-orange-50/80 to-white px-4 py-16"
    >
      <div className="mx-auto max-w-7xl">
        <motion.section variants={itemVariants} className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-rose-100 px-4 py-2 text-sm text-rose-500">
            Testimonials & Experts
          </span>
          <h1 className="mb-4 text-4xl font-semibold text-[#3A4D39]">
            Trusted by Professionals
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#3A4D39]/80">
            Discover what skincare experts and beauty influencers say about De
            Fleur&apos;s natural approach to beauty.
          </p>
        </motion.section>

        <motion.div variants={itemVariants}>
          <Tabs defaultValue="experts" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-2">
              <TabsTrigger value="experts">Expert Testimonials</TabsTrigger>
              <TabsTrigger value="kols">Beauty Influencers</TabsTrigger>
            </TabsList>

            <TabsContent value="experts" className="space-y-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="relative overflow-hidden border-[#D1E2C4]">
                      {testimonial.featured && (
                        <div className="absolute right-4 top-4 z-10 rounded-full bg-rose-500 px-4 py-1 text-sm text-white">
                          Featured Expert
                        </div>
                      )}
                      <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="size-16">
                          <AvatarImage src={testimonial.image} />
                          <AvatarFallback>
                            {testimonial.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-semibold text-[#3A4D39]">
                            {testimonial.name}
                          </h3>
                          <CardDescription>{testimonial.role}</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <blockquote className="mb-4 text-[#3A4D39]/80">
                          &quot;{testimonial.quote}&quot;
                        </blockquote>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#D1E2C4]/30 px-3 py-1 text-sm text-[#3A4D39]">
                            {testimonial.specialty}
                          </span>
                          <span className="rounded-full bg-[#D1E2C4]/30 px-3 py-1 text-sm text-[#3A4D39]">
                            {testimonial.credentials}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="kols" className="space-y-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {kols.map((kol, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="relative overflow-hidden border-[#D1E2C4]">
                      {kol.featured && (
                        <div className="absolute right-4 top-4 z-10 rounded-full bg-rose-500 px-4 py-1 text-sm text-white">
                          Top Influencer
                        </div>
                      )}
                      <CardHeader className="text-center">
                        <Avatar className="mx-auto mb-4 size-24">
                          <AvatarImage src={kol.image} />
                          <AvatarFallback>
                            {kol.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-semibold text-[#3A4D39]">
                          {kol.name}
                        </h3>
                        <CardDescription>{kol.role}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="mb-4 text-lg font-semibold text-[#3A4D39]">
                          {kol.followers} Followers
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                          {kol.platforms.map((platform, idx) => (
                            <span
                              key={idx}
                              className="rounded-full bg-[#D1E2C4]/30 px-3 py-1 text-sm text-[#3A4D39]"
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                        <span className="mt-4 block rounded-full bg-[#D1E2C4]/30 px-3 py-1 text-sm text-[#3A4D39]">
                          {kol.specialty}
                        </span>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default TestimonialsPage
