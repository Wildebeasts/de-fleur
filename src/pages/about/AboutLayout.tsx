import React from 'react'
import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

// Animation variants remain the same
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

const shippingPolicies = {
  domestic: [
    {
      title: 'Intra-Province Shipping (1-2 business days)',
      cost: '0.75$ for inner city areas, 1.2$ for suburbs areas',
      details: 'Delivered through GiaoHangNhanh service'
    },
    {
      title: 'Intra-Regional Shipping (2-3 business days)',
      cost: '1.2$ for inner city areas, 1.3$ for suburbs areas',
      details: 'Delivered through GiaoHangNhanh service'
    },
    {
      title: 'Inter-Regional Delivery (3-5 business days)',
      cost: '1.2$ for inner city areas, 1.3$ for suburbs areas',
      details: 'Delivered through GiaoHangNhanh service'
    }
  ],
  international: [
    // {
    //   title: 'Standard International (10-15 business days)',
    //   cost: 'Starting at $19.99',
    //   details: 'Available to select countries'
    // },
    // {
    //   title: 'Express International (5-7 business days)',
    //   cost: 'Starting at $39.99',
    //   details: 'Available to select countries'
    // }
  ],
  restrictions: [
    'Certain products cannot be shipped internationally',
    'Additional customs fees may apply',
    'Not available to all countries'
  ]
}

const returnPolicy = {
  timeframe: '3-5 days for Inter-Providence areas, 3-10 days for others',
  conditions: [
    'Items must be unused and in original packaging',
    'Original receipt or gift receipt required'
  ],
  exceptions: [
    'Sale items are final sale',
    'Gift cards are non-returnable',
    'Opened skincare products cannot be returned for hygiene reasons'
  ],
  process: [
    'Initiate return through your account dashboard',
    'Drop off at any GiaoHangNhanh services or the delivery will pick the package at your house',
    'Refund processed within 3-5 business days of receipt'
  ]
}

const privacyPolicy = {
  dataCollection: [
    'Personal identification information',
    'Shopping preferences and history',
    'Device and browser information',
    'Location data (with consent)'
  ],
  dataUsage: [
    'Order processing and fulfillment',
    'Personalized shopping experience',
    'Marketing communications (with consent)',
    'Website optimization and analytics'
  ],
  dataProtection: [
    'SSL encryption for all transactions',
    'Regular security audits',
    'Limited employee access to personal data',
    'Compliance with GDPR and CCPA'
  ],
  userRights: [
    'Right to access personal data',
    'Right to request data deletion',
    'Right to opt-out of marketing',
    'Right to data portability'
  ]
}

const AboutLayout: React.FC = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-orange-50/80 to-white px-4 py-16"
    >
      <div className="mx-auto max-w-7xl">
        {/* Brief About Section */}
        <motion.section variants={itemVariants} className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-rose-100 px-4 py-2 text-sm text-rose-500">
            About De Fleur
          </span>
          <h1 className="mb-4 text-4xl font-semibold text-[#3A4D39]">
            Natural Beauty, Thoughtfully Crafted
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#3A4D39]/80">
            Since 2020, De Fleur has been dedicated to bringing you premium
            skincare products made with natural ingredients, combining
            traditional wisdom with modern science.
          </p>
        </motion.section>

        {/* Main Content */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="shipping" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-3">
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="returns">Returns & Refunds</TabsTrigger>
              <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
            </TabsList>

            <TabsContent value="shipping" className="space-y-8">
              <div className="rounded-lg border border-[#D1E2C4] bg-white p-6">
                <h2 className="mb-6 text-2xl font-semibold text-[#3A4D39]">
                  Domestic Shipping
                </h2>
                <div className="space-y-4">
                  {shippingPolicies.domestic.map((option, index) => (
                    <div key={index} className="rounded-lg bg-orange-50/50 p-4">
                      <h3 className="font-medium text-[#3A4D39]">
                        {option.title}
                      </h3>
                      <p className="text-[#3A4D39]/80">{option.cost}</p>
                      <p className="text-sm text-[#3A4D39]/60">
                        {option.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[#D1E2C4] bg-white p-6">
                <h2 className="mb-6 text-2xl font-semibold text-[#3A4D39]">
                  International Shipping
                </h2>
                <div className="space-y-4">
                  <h4>Not Yet Supported</h4>
                  {/* {shippingPolicies.international.map((option, index) => (
                    <div key={index} className="rounded-lg bg-orange-50/50 p-4">
                      <h3 className="font-medium text-[#3A4D39]">
                        {option.title}
                      </h3>
                      <p className="text-[#3A4D39]/80">{option.cost}</p>
                      <p className="text-sm text-[#3A4D39]/60">
                        {option.details}
                      </p>
                    </div>
                  ))} */}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="returns" className="space-y-8">
              <div className="rounded-lg border border-[#D1E2C4] bg-white p-6">
                <h2 className="mb-6 text-2xl font-semibold text-[#3A4D39]">
                  Return Policy
                </h2>
                <p className="mb-4 text-lg text-[#3A4D39]/80">
                  Return window: {returnPolicy.timeframe}
                </p>

                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="conditions">
                    <AccordionTrigger>Conditions</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-inside list-disc space-y-2 text-[#3A4D39]/80">
                        {returnPolicy.conditions.map((condition, index) => (
                          <li key={index}>{condition}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="exceptions">
                    <AccordionTrigger>Exceptions</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-inside list-disc space-y-2 text-[#3A4D39]/80">
                        {returnPolicy.exceptions.map((exception, index) => (
                          <li key={index}>{exception}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="process">
                    <AccordionTrigger>Return Process</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-inside list-decimal space-y-2 text-[#3A4D39]/80">
                        {returnPolicy.process.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-8">
              <div className="rounded-lg border border-[#D1E2C4] bg-white p-6">
                <h2 className="mb-6 text-2xl font-semibold text-[#3A4D39]">
                  Privacy Policy
                </h2>
                <ScrollArea className="h-[600px] rounded-md border border-[#D1E2C4] p-4">
                  <div className="space-y-6">
                    <section>
                      <h3 className="mb-3 text-xl font-medium text-[#3A4D39]">
                        Data Collection
                      </h3>
                      <ul className="list-inside list-disc space-y-2 text-[#3A4D39]/80">
                        {privacyPolicy.dataCollection.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </section>

                    <section>
                      <h3 className="mb-3 text-xl font-medium text-[#3A4D39]">
                        How We Use Your Data
                      </h3>
                      <ul className="list-inside list-disc space-y-2 text-[#3A4D39]/80">
                        {privacyPolicy.dataUsage.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </section>

                    <section>
                      <h3 className="mb-3 text-xl font-medium text-[#3A4D39]">
                        Data Protection
                      </h3>
                      <ul className="list-inside list-disc space-y-2 text-[#3A4D39]/80">
                        {privacyPolicy.dataProtection.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </section>

                    <section>
                      <h3 className="mb-3 text-xl font-medium text-[#3A4D39]">
                        Your Rights
                      </h3>
                      <ul className="list-inside list-disc space-y-2 text-[#3A4D39]/80">
                        {privacyPolicy.userRights.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Contact Section */}
        <motion.section
          variants={itemVariants}
          className="mt-16 rounded-2xl bg-[#3A4D39] p-8 text-center text-white"
        >
          <h2 className="mb-4 text-2xl font-semibold">Need Help?</h2>
          <p className="mb-6">
            Have questions about our policies or need assistance? Our support
            team is available 24/7 to help.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-white px-8 py-3 font-medium text-[#3A4D39] hover:bg-orange-50"
          >
            Contact Support
          </motion.button>
        </motion.section>
      </div>
    </motion.div>
  )
}

export default AboutLayout
