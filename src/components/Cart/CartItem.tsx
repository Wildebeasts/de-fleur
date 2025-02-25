import React from 'react'
import { QuantityInput } from '@/components/ui/quantity-input'
import { useCart } from '@/lib/context/CartContext'

interface CartItemProps {
  item: {
    id: string
    name: string
    price: number
    quantity: number
    cosmeticImages?: string[]
    ingredients?: string
    cosmeticType?: string
    brand?: string
  }
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart()

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.id, newQuantity)
  }

  return (
    <div className="flex flex-wrap gap-4 pb-6">
      <img
        loading="lazy"
        src={
          item.cosmeticImages?.[0] ||
          'https://cdn.builder.io/api/v1/image/assets/TEMP/5601b244a695bdf6e6696f50c1b6d1beeb7b5877098233b16a614080b6cb9ccc'
        }
        alt={item.name}
        className="aspect-square w-24 shrink-0 self-start object-contain"
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
                Brand: {item.brand}
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
          />
          <div className="my-auto flex gap-4 text-center text-sm text-black">
            <button className="px-px pb-2 pt-px">Save for Later</button>
            <button
              onClick={() => removeFromCart(item.id)}
              className="flex items-center"
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
