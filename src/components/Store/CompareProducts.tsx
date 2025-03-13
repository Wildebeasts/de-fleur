import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { CosmeticResponse } from '@/lib/types/Cosmetic'

const CompareProducts: React.FC = () => {
  const [selectedProducts, setSelectedProducts] = useState<CosmeticResponse[]>(
    []
  )
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (selectedProducts.length === 2) {
      setIsModalOpen(true)
    }
  }, [selectedProducts])

  const toggleCompare = (product: CosmeticResponse) => {
    setSelectedProducts((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id) // Deselect product
      }
      return prev.length < 2 ? [...prev, product] : prev // Limit to 2 products
    })
  }

  return (
    <div>
      {/* Product Comparison Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-full max-w-6xl">
          <DialogHeader>
            <DialogTitle>Compare Products</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Feature</th>
                  {selectedProducts.map((product) => (
                    <th
                      key={product.id}
                      className="relative border border-gray-300 px-4 py-2"
                    >
                      {product.name}
                      <button
                        className="absolute right-1 top-1 text-red-500"
                        onClick={() => toggleCompare(product)}
                      >
                        ✕
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Only keeping important fields */}
                {[
                  {
                    label: 'Brand',
                    key: 'brand',
                    getValue: (p: CosmeticResponse) => p.brand?.name || 'N/A'
                  },
                  {
                    label: 'Skin Type',
                    key: 'skinType',
                    getValue: (p: CosmeticResponse) =>
                      p.skinType?.description || 'N/A'
                  },
                  {
                    label: 'Cosmetic Type',
                    key: 'cosmeticType',
                    getValue: (p: CosmeticResponse) =>
                      p.cosmeticType?.name || 'N/A'
                  },
                  {
                    label: 'Price',
                    key: 'price',
                    getValue: (p: CosmeticResponse) =>
                      `${p.price.toLocaleString()} ₫`
                  },
                  {
                    label: 'Main Usage',
                    key: 'mainUsage',
                    getValue: (p: CosmeticResponse) => p.mainUsage
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
                    getValue: (p: CosmeticResponse) => p.rating ?? 'No rating'
                  }
                ].map(({ label, key, getValue }) => (
                  <tr key={key}>
                    <td className="border border-gray-300 px-4 py-2 font-bold">
                      {label}
                    </td>
                    {selectedProducts.map((product) => (
                      <td
                        key={product.id}
                        className="border border-gray-300 px-4 py-2"
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
