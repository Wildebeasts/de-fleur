import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

// Animation variants following the pattern from:
// Reference: src/pages/store/ShopSearchPage.tsx (lines 9-23)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

// Glossary data structure
const glossaryItems = {
  A: [
    {
      term: 'AHA (Alpha Hydroxy Acids)',
      definition:
        'Natural acids derived from fruits that exfoliate dead skin cells and improve skin texture.'
    },
    {
      term: 'Antioxidants',
      definition:
        'Compounds that protect skin from environmental damage and free radicals.'
    }
  ],
  B: [
    {
      term: 'BHA (Beta Hydroxy Acids)',
      definition:
        'Oil-soluble acids that penetrate pores to treat acne and blackheads.'
    }
  ]
  // Add more letters and terms as needed
}

const GlossaryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const filterGlossaryItems = () => {
    if (!searchTerm) return glossaryItems

    const filtered = {} as typeof glossaryItems
    Object.entries(glossaryItems).forEach(([letter, terms]) => {
      const filteredTerms = terms.filter(
        (item) =>
          item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.definition.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (filteredTerms.length > 0) {
        filtered[letter as keyof typeof glossaryItems] = filteredTerms
      }
    })
    return filtered
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-orange-50/80 to-white px-4 py-16"
    >
      <div className="mx-auto max-w-4xl">
        <motion.div variants={itemVariants} className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-semibold text-[#3A4D39]">
            Skincare Glossary
          </h1>
          <p className="text-lg text-[#3A4D39]/80">
            Your comprehensive guide to understanding skincare ingredients and
            terms
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search terms..."
              className="w-full rounded-full border-[#D1E2C4] px-6 py-3 focus-visible:ring-[#3A4D39]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3A4D39] hover:text-[#4A5D49]"
                onClick={() => setSearchTerm('')}
              >
                Clear
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          {Object.entries(filterGlossaryItems()).map(([letter, terms]) => (
            <motion.div
              key={letter}
              variants={itemVariants}
              className="rounded-lg bg-white p-6 shadow-sm"
            >
              <h2 className="mb-4 text-2xl font-semibold text-[#3A4D39]">
                {letter}
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {terms.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`${letter}-${index}`}
                    className="border-[#D1E2C4]"
                  >
                    <AccordionTrigger className="text-lg font-medium text-[#3A4D39] hover:text-[#4A5D49]">
                      {item.term}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#3A4D39]/80">
                      {item.definition}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default GlossaryPage
