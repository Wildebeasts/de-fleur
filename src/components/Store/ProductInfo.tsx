import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface ProductInfoProps {
  productId: string
  productName: string
  price: string
  reviewCount: number
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  productName,
  price,
  reviewCount
}) => {
  const [quantity, setQuantity] = React.useState(1)

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  return (
    <div className="ml-5 flex w-2/5 flex-col max-md:ml-0 max-md:w-full">
      <div className="flex w-full grow flex-col pb-20 max-md:mt-8 max-md:max-w-full">
        <div className="flex w-full flex-col pt-5 max-md:max-w-full">
          <h1 className="self-start text-3xl leading-none text-black">
            {productName}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2 py-1 text-base leading-none text-gray-600">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/0a5363848e2de83a819f27dc250005a00e511ed6486c54b29410513b314bc22d?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e"
              className="aspect-[5.75] w-[92px] shrink-0 self-start object-contain"
              alt="Product rating"
            />
            <div className="w-[368px] flex-auto">({reviewCount} reviews)</div>
          </div>
          <div className="mt-4 self-start text-2xl font-semibold leading-none text-black">
            {price}
          </div>
          <form className="mt-8 flex w-full flex-col whitespace-nowrap text-black max-md:max-w-full">
            <label
              htmlFor="size"
              className="pb-2 pt-px text-sm font-medium max-md:max-w-full max-md:pr-5"
            >
              Size
            </label>
            <Select defaultValue="30ml">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30ml">30ml</SelectItem>
                <SelectItem value="50ml">50ml</SelectItem>
                <SelectItem value="100ml">100ml</SelectItem>
              </SelectContent>
            </Select>

            <label
              htmlFor="quantity"
              className="mt-6 py-1 text-sm font-medium max-md:max-w-full max-md:pr-5"
            >
              Quantity
            </label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                type="button"
              >
                -
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-[100px] text-center"
                min={1}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                type="button"
              >
                +
              </Button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="mt-6 rounded-lg bg-rose-300 px-16 pb-6 pt-3.5 text-center text-base text-white max-md:max-w-full max-md:px-5"
            >
              Add to Cart
            </motion.button>
          </form>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-3 rounded-lg bg-stone-300 px-16 py-4 text-center text-base text-gray-800 max-md:max-w-full max-md:px-5"
          >
            Buy Now
          </motion.button>
          <div className="mt-6 flex w-full flex-wrap justify-between gap-5 rounded-lg bg-orange-50 p-4 max-md:max-w-full">
            <div className="flex gap-2 py-0.5">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/54681f64caecf2d61962f09a5ffe92dae7f904c8b528585dcad597ed68c7201d?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e"
                className="my-auto aspect-[1.25] w-5 self-stretch object-contain"
                alt="Free shipping icon"
              />
              <div className="basis-auto text-sm leading-none text-black">
                Free shipping on orders over $100
              </div>
            </div>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/e3da57ea1de56619a2afa4736d3567ee09c8c9d5c51a043f999a8bad77be117c?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e"
              className="my-auto aspect-square w-4 shrink-0 object-contain"
              alt="Information icon"
            />
          </div>
          <div className="mt-6 flex w-full flex-col max-md:max-w-full">
            <div className="flex w-full flex-wrap gap-2 py-1 max-md:max-w-full">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/2511e316a874482fffb66e9ae1f25c4747534339f53a06f8d27ecc82a660cac5?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e"
                className="my-auto aspect-square w-4 self-stretch object-contain"
                alt="Dermatologist tested icon"
              />
              <div className="w-[459px] flex-auto text-base leading-none text-black max-md:max-w-full">
                Dermatologist tested
              </div>
            </div>
            <div className="mt-4 flex w-full flex-wrap gap-2 py-1 max-md:max-w-full">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/8f56d14ef016c27826ce360ccc0aa2e15a6fdf3891098d9b1d5079cc04130c8a?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e"
                className="my-auto aspect-square w-4 self-stretch object-contain"
                alt="Clean ingredients icon"
              />
              <div className="w-[459px] flex-auto text-base leading-none text-black max-md:max-w-full">
                Clean ingredients
              </div>
            </div>
            <div className="mt-4 flex w-full flex-wrap gap-2 py-1 max-md:max-w-full">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/3cf03146e50549800a46508505721227c6397c5dde7a055fa403388c3ad998ca?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e"
                className="my-auto aspect-square w-4 self-stretch object-contain"
                alt="Sustainable packaging icon"
              />
              <div className="w-[459px] flex-auto text-base leading-none text-black max-md:max-w-full">
                Sustainable packaging
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductInfo
