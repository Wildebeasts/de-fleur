import React from 'react'
import { QuantityInput } from '@/components/ui/quantity-input'
import { useCart } from '@/lib/context/CartContext'
import { toast } from 'sonner'

interface CartItemProps {
  item: {
    id: string
    name: string
    price: number
    quantity: number
    cosmeticImages?: string[]
    ingredients?: string
    cosmeticType?: string
    brand?:
      | {
          id: string
          name: string
          description?: string
          websiteUrl?: string
          logoUrl?: string
        }
      | string
  }
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart()

  // Validate item data
  if (!item?.id || typeof item.price !== 'number' || !item.name) {
    console.error('Invalid cart item data:', item)
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p>There was an error loading this item.</p>
      </div>
    )
  }

  const handleQuantityChange = async (newQuantity: number) => {
    try {
      // Validate quantity
      if (newQuantity < 0) {
        toast.error('Quantity cannot be negative')
        return
      }
      if (newQuantity > 99) {
        toast.error('Maximum quantity is 99')
        return
      }

      await updateQuantity(item.id, newQuantity)
      toast.success('Quantity updated successfully')
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Failed to update quantity')
    }
  }

  const handleRemove = async () => {
    try {
      await removeFromCart(item.id)
      toast.success('Item removed from cart')
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Failed to remove item')
    }
  }

  const getBrandName = (brand: CartItemProps['item']['brand']) => {
    if (!brand) return ''
    if (typeof brand === 'string') return brand
    return brand.name || ''
  }

  return (
    <div className="flex flex-wrap gap-4 pb-6">
      <img
        loading="lazy"
        src={
          Array.isArray(item.cosmeticImages) && item.cosmeticImages.length > 0
            ? item.cosmeticImages[0]
            : 'https://cdn.builder.io/api/v1/image/assets/TEMP/5601b244a695bdf6e6696f50c1b6d1beeb7b5877098233b16a614080b6cb9ccc'
        }
        alt={item.name}
        className="aspect-square w-24 shrink-0 self-start object-contain"
        onError={(e) => {
          e.currentTarget.src =
            'https://cdn.builder.io/api/v1/image/assets/TEMP/5601b244a695bdf6e6696f50c1b6d1beeb7b5877098233b16a614080b6cb9ccc'
        }}
      />
      <div className="flex w-fit shrink-0 grow basis-0 flex-col py-px max-md:max-w-full">
        <div className="flex flex-wrap justify-between gap-5 leading-none max-md:max-w-full">
          <div className="flex flex-col pb-2.5 pt-0.5">
            <div className="text-base font-medium text-black">{item.name}</div>
            <div className="mt-3 self-start text-sm text-black">
              {item.ingredients || item.cosmeticType || ''}
            </div>
            {item.brand && (
              <div className="mt-1 self-start text-xs text-gray-600">
                Brand: {getBrandName(item.brand)}
              </div>
            )}
          </div>
          <div className="self-start text-base font-medium text-black">
            ${item.price.toFixed(2)}
          </div>
        </div>
        <div className="mt-4 flex w-full flex-wrap justify-between gap-5 max-md:max-w-full">
          <QuantityInput
            value={item.quantity}
            onValueChange={handleQuantityChange}
            className="w-32"
            aria-label="Product quantity"
            min={1}
            max={99}
          />
          <div className="my-auto flex gap-4 text-center text-sm text-black">
            <button
              className="px-px pb-2 pt-px hover:text-gray-600"
              onClick={() => toast.info('Save for Later feature coming soon')}
            >
              Save for Later
            </button>
            <button
              onClick={handleRemove}
              className="flex items-center hover:opacity-75"
              aria-label="Remove item from cart"
            >
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/a232d000dcece140f9fcf3bb7cd14e47345d8408fe2becf4582d85f4bc6b9046"
                alt="Remove item"
                className="aspect-[0.7] w-3.5 shrink-0 object-contain"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartItem
