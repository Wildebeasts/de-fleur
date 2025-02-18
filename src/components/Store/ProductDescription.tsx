import React from 'react'

interface Feature {
  icon: string
  title: string
  description: string
}

interface ProductDescriptionProps {
  description: string
  features: Feature[]
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description,
  features
}) => {
  return (
    <div className="mt-16 flex flex-col max-md:mt-10 max-md:max-w-full">
      <nav className="flex w-full flex-col justify-center py-px text-center text-base text-black max-md:max-w-full">
        <ul className="flex flex-wrap gap-8 pr-20 max-md:pr-5">
          <li className="whitespace-nowrap border-b-2 border-rose-300 px-5 pb-4 pt-2.5">
            <a href="#description">Description</a>
          </li>
          <li className="whitespace-nowrap px-5 py-3.5">
            <a href="#ingredients">Ingredients</a>
          </li>
          <li className="px-5 pb-5 pt-3">
            <a href="#how-to-use">How to Use</a>
          </li>
          <li className="whitespace-nowrap px-4 pb-5 pt-3">
            <a href="#reviews">Reviews</a>
          </li>
        </ul>
      </nav>
      <div className="flex w-full flex-col py-9 max-md:max-w-full">
        <p className="text-base leading-4 text-gray-600 max-md:mr-2.5 max-md:max-w-full">
          {description}
        </p>
        <div className="mt-11 flex flex-wrap gap-6 max-md:mt-10 max-md:max-w-full">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-1 flex-col items-center px-14 pb-2 max-md:px-5"
            >
              <img
                loading="lazy"
                src={feature.icon}
                className="my-auto aspect-square w-9 self-stretch object-contain"
                alt={`${feature.title} icon`}
              />
              <div className="mt-4 text-center text-base font-medium leading-none text-black">
                {feature.title}
              </div>
              <div className="mt-4 text-center text-sm leading-none text-gray-600">
                {feature.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductDescription
