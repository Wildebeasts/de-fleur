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
        <DialogContent className="w-full max-w-6xl bg-white p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Compare Products
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="border border-gray-300 px-4 py-3 text-left text-lg font-semibold">
                    Feature
                  </th>
                  {selectedProducts.map((product) => (
                    <th
                      key={product.id}
                      className="relative border border-gray-300 px-4 py-3 text-left text-lg font-semibold"
                    >
                      <div className="flex items-center justify-between">
                        {product.name}
                        <button
                          onClick={() => handleRemove(product.id)}
                          className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-red-500 text-white transition-all hover:bg-red-600"
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
                    getValue: (p: CosmeticResponse) =>
                      `${p.price.toLocaleString()} ₫`,
                    highlight: true
                  },
                  {
                    label: 'Main Usage',
                    key: 'mainUsage',
                    getValue: (p: CosmeticResponse) => p.mainUsage,
                    highlight: true
                  },
                  {
                    label: 'Texture',
                    key: 'texture',
                    getValue: (p: CosmeticResponse) => p.texture
                  },
                  {
                    label: 'Origin',
                    key: 'origin',
                    getValue: (p: CosmeticResponse) => p.origin
                  },
                  {
                    label: 'Weight',
                    key: 'weight',
                    getValue: (p: CosmeticResponse) => `${p.weight}g`
                  },
                  {
                    label: 'Dimensions (LxWxH)',
                    key: 'dimensions',
                    getValue: (p: CosmeticResponse) =>
                      `${p.length} x ${p.width} x ${p.height} cm`
                  },
                  {
                    label: 'Rating',
                    key: 'rating',
                    getValue: (p: CosmeticResponse) => p.rating ?? 'No rating',
                    highlight: true
                  }
                ].map(({ label, key, getValue, highlight }, index) => (
                  <tr
                    key={key}
                    className={`${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } ${highlight ? 'bg-yellow-100 font-bold' : ''} transition-all hover:bg-gray-200`}
                  >
                    <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-700">
                      {label}
                    </td>
                    {selectedProducts.map((product) => (
                      <td
                        key={product.id}
                        className="border border-gray-300 px-4 py-3 text-gray-800"
                      >
                        {getValue(product)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CompareProducts
