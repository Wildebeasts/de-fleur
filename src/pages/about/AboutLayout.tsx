import React from 'react'
import { motion } from 'framer-motion'

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

const AboutLayout: React.FC = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen w-full bg-orange-50/50"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-16">
          {/* Hero Section */}
          <motion.section variants={itemVariants} className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-[#3A4D39]">
              Welcome to De Fleur
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              Bringing beauty and joy to your special moments through the art of
              floral design.
            </p>
          </motion.section>

          {/* Our Story Section */}
          <motion.section
            variants={itemVariants}
            className="grid grid-cols-1 items-center gap-12 md:grid-cols-2"
          >
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-[#3A4D39]">
                Our Story
              </h2>
              <p className="text-gray-600">
                Founded with a passion for creating beautiful floral
                arrangements, De Fleur has been serving our community since
                2020. We believe in the power of flowers to transform spaces and
                touch hearts.
              </p>
              <p className="text-gray-600">
                Every arrangement we create is a unique piece of art, carefully
                crafted to bring joy and beauty to your special moments.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1558350315-8aa00e8e4590?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Florist working"
                className="size-full object-cover"
              />
            </div>
          </motion.section>

          {/* Values Section */}
          <motion.section
            variants={itemVariants}
            className="rounded-2xl bg-white p-8 shadow-sm"
          >
            <h2 className="mb-8 text-center text-3xl font-semibold text-[#3A4D39]">
              Our Values
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  title: 'Quality',
                  description:
                    'We source only the finest flowers to ensure lasting beauty in every arrangement.'
                },
                {
                  title: 'Creativity',
                  description:
                    'Each design is unique, reflecting our artistic vision and your personal style.'
                },
                {
                  title: 'Sustainability',
                  description:
                    'We are committed to eco-friendly practices in our floral designs and packaging.'
                }
              ].map((value, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="rounded-lg bg-orange-50/50 p-6 text-center"
                >
                  <h3 className="mb-4 text-xl font-semibold text-[#3A4D39]">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Team Section */}
          <motion.section variants={itemVariants} className="space-y-8">
            <h2 className="text-center text-3xl font-semibold text-[#3A4D39]">
              Meet Our Team
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  name: 'Emma Thompson',
                  role: 'Lead Florist',
                  image:
                    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
                },
                {
                  name: 'Michael Chen',
                  role: 'Creative Director',
                  image:
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
                },
                {
                  name: 'Sarah Williams',
                  role: 'Event Specialist',
                  image:
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
                }
              ].map((member, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="overflow-hidden rounded-lg bg-white shadow-sm"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-64 w-full object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-[#3A4D39]">
                      {member.name}
                    </h3>
                    <p className="text-gray-600">{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Contact CTA Section */}
          <motion.section
            variants={itemVariants}
            className="rounded-2xl bg-[#3A4D39] p-12 text-center text-white"
          >
            <h2 className="mb-4 text-3xl font-semibold">
              Let&apos;s Create Something Beautiful Together
            </h2>
            <p className="mb-8 text-lg">
              Whether it&apos;s a special event or everyday moments, we&apos;re
              here to help you make it memorable.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-white px-8 py-3 font-semibold text-[#3A4D39] hover:bg-orange-50"
            >
              Contact Us
            </motion.button>
          </motion.section>
        </div>
      </div>
    </motion.div>
  )
}

export default AboutLayout
