import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, ArrowRight } from 'lucide-react'

// Animation variants from BlogLayout.tsx
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

const categories = [
  'All',
  'Products',
  'Shipping',
  'Returns',
  'Account',
  'Ingredients'
]

const faqs = {
  Products: [
    {
      q: 'What makes De Fleur products natural?',
      a: 'All De Fleur products contain at least 95% natural ingredients, sourced sustainably from trusted suppliers. We avoid harmful chemicals and synthetic fragrances.',
      tags: ['natural', 'ingredients']
    },
    {
      q: 'Are your products suitable for sensitive skin?',
      a: 'Yes, our products are formulated with sensitive skin in mind. We recommend patch testing before full application.',
      tags: ['sensitive skin', 'safety']
    }
  ],
  Shipping: [
    {
      q: 'What are your shipping timeframes?',
      a: 'Domestic orders typically arrive within 3-5 business days. International shipping can take 10-15 business days.',
      tags: ['delivery', 'timeframes']
    },
    {
      q: 'Do you offer international shipping?',
      a: 'Yes, we ship to most countries worldwide. Shipping costs vary by location.',
      tags: ['international', 'delivery']
    }
  ],
  Returns: [
    {
      q: 'What is your return policy?',
      a: 'We offer a 30-day return policy for unused products in their original packaging. Contact our support team to initiate a return.',
      tags: ['returns', 'policy']
    }
  ],
  Account: [
    {
      q: 'How do I create an account?',
      a: 'Click the "Sign Up" button in the top right corner and follow the prompts to create your account.',
      tags: ['account', 'registration']
    }
  ],
  Ingredients: [
    {
      q: 'Are your products vegan?',
      a: 'Most of our products are vegan. Each product page clearly indicates if the product is vegan-friendly.',
      tags: ['vegan', 'ingredients']
    }
  ]
}

const terms = [
  {
    title: 'Terms of Service',
    content: `These Terms of Service govern your use of De Fleur's website and services. By accessing or using our services, you agree to these terms.`,
    sections: [
      {
        heading: 'Account Terms',
        content:
          'You must be 18 years or older to create an account. You are responsible for maintaining the security of your account credentials.'
      },
      {
        heading: 'Privacy Policy',
        content:
          'We collect and use your information as described in our Privacy Policy. We respect your privacy and protect your personal information.'
      }
    ]
  },
  {
    title: 'Shipping Policy',
    content:
      'Our shipping policies ensure safe and timely delivery of your products.',
    sections: [
      {
        heading: 'Delivery Times',
        content:
          'Standard shipping takes 3-5 business days. Express shipping options are available at checkout.'
      }
    ]
  }
]

const FAQAndTermsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSection, setActiveSection] = useState('faq')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredFaqs = React.useMemo(() => {
    if (selectedCategory === 'All') {
      return Object.entries(faqs).flatMap(([, items]) =>
        items.filter(
          (item) =>
            !searchTerm ||
            item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.tags.some((tag) =>
              tag.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
      )
    }
    return (faqs[selectedCategory as keyof typeof faqs] || []).filter(
      (item) =>
        !searchTerm ||
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )
  }, [selectedCategory, searchTerm])

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#FDF8F4] px-4 py-16"
    >
      <div className="mx-auto max-w-7xl">
        <motion.section variants={itemVariants} className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-rose-100 px-4 py-2 text-sm text-rose-500">
            Help Center
          </span>
          <h1 className="mb-4 text-4xl font-semibold text-[#3A4D39]">
            How Can We Help You?
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#3A4D39]/80">
            Find answers to common questions or review our terms of service
          </p>

          <div className="mx-auto mt-8 flex max-w-2xl items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border-gray-200 pl-10 focus:border-[#3A4D39] focus:ring-[#3A4D39]/20"
              />
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-lg border-gray-200 px-4 py-2 hover:bg-gray-50"
            >
              <Filter className="size-4" /> Filter
            </Button>
          </div>
        </motion.section>

        <motion.div variants={itemVariants}>
          <div className="mb-8 flex items-center justify-center gap-8 border-b">
            <Button
              variant="ghost"
              className={`relative pb-4 text-lg font-medium ${
                activeSection === 'faq'
                  ? 'text-[#3A4D39] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#3A4D39]'
                  : 'text-gray-500 hover:text-[#3A4D39]'
              }`}
              onClick={() => setActiveSection('faq')}
            >
              FAQ
            </Button>
            <Button
              variant="ghost"
              className={`relative pb-4 text-lg font-medium ${
                activeSection === 'terms'
                  ? 'text-[#3A4D39] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#3A4D39]'
                  : 'text-gray-500 hover:text-[#3A4D39]'
              }`}
              onClick={() => setActiveSection('terms')}
            >
              Terms & Policies
            </Button>
          </div>

          {activeSection === 'faq' && (
            <>
              <div className="mb-8 flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant="ghost"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-[#3A4D39] text-white'
                        : 'bg-white text-[#3A4D39] hover:bg-[#D1E2C4]/20'
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {filteredFaqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Accordion type="single" collapsible>
                        <AccordionItem value={`item-${index}`}>
                          <AccordionTrigger className="text-left text-[#3A4D39]">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-[#3A4D39]/80">
                            <p className="mb-4">{faq.a}</p>
                            <div className="flex flex-wrap gap-2">
                              {faq.tags.map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="rounded-full bg-[#D1E2C4]/30 px-3 py-1 text-sm text-[#3A4D39]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}

          {activeSection === 'terms' && (
            <div className="space-y-8">
              {terms.map((term, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-[#D1E2C4] bg-white p-6"
                >
                  <h2 className="mb-4 text-2xl font-semibold text-[#3A4D39]">
                    {term.title}
                  </h2>
                  <p className="mb-6 text-[#3A4D39]/80">{term.content}</p>
                  <div className="space-y-6">
                    {term.sections.map((section, sectionIndex) => (
                      <div key={sectionIndex}>
                        <h3 className="mb-2 text-lg font-medium text-[#3A4D39]">
                          {section.heading}
                        </h3>
                        <p className="text-[#3A4D39]/80">{section.content}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Contact Support Section */}
        <motion.section
          variants={itemVariants}
          className="mt-16 rounded-2xl bg-[#D1E2C4]/30 p-8 text-center"
        >
          <h2 className="mb-4 text-2xl font-semibold text-[#3A4D39]">
            Still Have Questions?
          </h2>
          <p className="mb-6 text-[#3A4D39]/80">
            Our customer support team is here to help you with any questions or
            concerns.
          </p>
          <Button className="rounded-full bg-[#3A4D39] px-8 py-3 font-medium text-white hover:bg-[#4A5D49]">
            <span className="flex items-center gap-2">
              Contact Support
              <ArrowRight className="size-4" />
            </span>
          </Button>
        </motion.section>
      </div>
    </motion.div>
  )
}

export default FAQAndTermsPage
