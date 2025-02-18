import React from 'react'
import { QuantityInput } from '@/components/ui/quantity-input'

interface CartItemProps {
  item: {
    name: string
    size: string
    price: number
    image: string
  }
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const [quantity, setQuantity] = React.useState(1)

  return (
    <div className="flex flex-wrap gap-4 pb-6">
      <img
        loading="lazy"
        src={item.image}
        alt={item.name}
        className="aspect-square w-24 shrink-0 self-start object-contain"
      />
      <div className="flex w-fit shrink-0 grow basis-0 flex-col py-px max-md:max-w-full">
        <div className="flex flex-wrap justify-between gap-5 leading-none max-md:max-w-full">
          <div className="flex flex-col pb-2.5 pt-0.5">
            <div className="text-base font-medium text-black">{item.name}</div>
            <div className="mt-3 self-start text-sm text-black">
              {item.size}
            </div>
          </div>
          <div className="self-start text-base font-medium text-black">
            ${item.price.toFixed(2)}
          </div>
        </div>
        <div className="mt-4 flex w-full flex-wrap justify-between gap-5 max-md:max-w-full">
          <QuantityInput
            value={quantity}
            onValueChange={setQuantity}
            className="w-32"
            aria-label="Product quantity"
          />
          <div className="my-auto flex gap-4 text-center text-sm text-black">
            <button className="px-px pb-2 pt-px">Save for Later</button>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/a232d000dcece140f9fcf3bb7cd14e47345d8408fe2becf4582d85f4bc6b9046?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e"
              alt="Remove item"
              className="aspect-[0.7] w-3.5 shrink-0 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartItem
