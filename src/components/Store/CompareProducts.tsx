import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import { X } from 'lucide-react'

type CompareProductsProp = {
  selectedProducts: CosmeticResponse[]
  setSelectedProducts: React.Dispatch<React.SetStateAction<CosmeticResponse[]>>
}

const CompareProducts: React.FC<CompareProductsProp> = ({
  selectedProducts,
  setSelectedProducts
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (selectedProducts.length === 2) {
      setIsModalOpen(true)
    }
  }, [selectedProducts])

  const handleRemove = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  return (
    <div>
      {/* Product Comparison Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-full max-w-6xl bg-white p-6 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#3A4D39]">
              Compare Products
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-[#D1E2C4]">
              <thead className="bg-[#F0F9EB] text-[#3A4D39]">
                <tr>
                  <th className="border border-[#D1E2C4] px-4 py-3 text-left text-lg font-semibold">
                    Feature
                  </th>
                  {selectedProducts.map((product) => (
                    <th
                      key={product.id}
                      className="relative border border-[#D1E2C4] px-4 py-3 text-left text-lg font-semibold"
                    >
                      <div className="flex items-center justify-between">
                        {product.name}
                        <button
                          onClick={() => handleRemove(product.id)}
                          className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-[#3A4D39] text-white transition-all hover:bg-[#4A5D49]"
                          aria-label="Remove from comparison"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: 'Price',
                    key: 'price',
                    getValue: (p: CosmeticResponse) => p.price,
                    display: (p: CosmeticResponse) =>
                      `${p.price.toLocaleString()} ₫`,
                    highlight: true,
                    compareType: 'numeric',
                    lowerIsBetter: true
                  },
                  {
                    label: 'Main Usage',
                    key: 'mainUsage',
                    getValue: (p: CosmeticResponse) => p.mainUsage,
                    display: (p: CosmeticResponse) => p.mainUsage,
                    highlight: true
                  },
                  {
                    label: 'Texture',
                    key: 'texture',
                    getValue: (p: CosmeticResponse) => p.texture,
                    display: (p: CosmeticResponse) => p.texture
                  },
                  {
                    label: 'Origin',
                    key: 'origin',
                    getValue: (p: CosmeticResponse) => p.origin,
                    display: (p: CosmeticResponse) => p.origin
                  },
                  {
                    label: 'Weight',
                    key: 'weight',
                    getValue: (p: CosmeticResponse) => p.weight,
                    display: (p: CosmeticResponse) => `${p.weight}g`,
                    compareType: 'numeric',
                    lowerIsBetter: true
                  },
                  {
                    label: 'Dimensions (LxWxH)',
                    key: 'dimensions',
                    getValue: (p: CosmeticResponse) =>
                      p.length * p.width * p.height,
                    display: (p: CosmeticResponse) =>
                      `${p.length} x ${p.width} x ${p.height} cm`
                  },
                  {
                    label: 'Rating',
                    key: 'rating',
                    getValue: (p: CosmeticResponse) => p.rating ?? 0,
                    display: (p: CosmeticResponse) => p.rating ?? 'No rating',
                    highlight: true,
                    compareType: 'numeric',
                    lowerIsBetter: false
                  }
                ].map(
                  (
                    {
                      label,
                      key,
                      getValue,
                      display,
                      highlight,
                      compareType,
                      lowerIsBetter
                    },
                    index
                  ) => (
                    <tr
                      key={key}
                      className={`${
                        index % 2 === 0 ? 'bg-white' : 'bg-[#F9FCF5]'
                      } ${
                        highlight ? 'bg-[#E8F3DC] font-medium' : ''
                      } transition-all hover:bg-[#F0F9EB]`}
                    >
                      <td className="border border-[#D1E2C4] px-4 py-3 font-semibold text-[#3A4D39]">
                        {label}
                      </td>
                      {selectedProducts.map((product, productIndex) => {
                        // Get values for comparison
                        const currentValue = getValue(product)
                        const otherValue =
                          productIndex === 0 && selectedProducts.length > 1
                            ? getValue(selectedProducts[1])
                            : getValue(selectedProducts[0])

                        // Determine if this product is better for this attribute
                        let comparisonElement = null
                        if (
                          compareType === 'numeric' &&
                          selectedProducts.length === 2
                        ) {
                          if (lowerIsBetter) {
                            if (currentValue < otherValue) {
                              comparisonElement = (
                                <span className="ml-2 font-bold text-emerald-600">
                                  ✓
                                </span>
                              )
                            }
                          } else {
                            if (currentValue > otherValue) {
                              comparisonElement = (
                                <span className="ml-2 font-bold text-emerald-600">
                                  ✓
                                </span>
                              )
                            }
                          }
                        }

                        return (
                          <td
                            key={product.id}
                            className="border border-[#D1E2C4] px-4 py-3 text-[#3A4D39]/80"
                          >
                            <div className="flex items-center">
                              <span>{display(product)}</span>
                              {comparisonElement}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-[#3A4D39]/70">
            <p className="flex items-center">
              <span className="mr-2 font-bold text-emerald-600">✓</span>{' '}
              indicates better value for this feature
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CompareProducts
