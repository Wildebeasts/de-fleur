import React from 'react'

interface Feature {
  icon: string
  text: string
}

interface FeatureListProps {}

const FeatureList: React.FC<FeatureListProps> = () => {
  const features: Feature[] = [
    {
      icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/612c03cb6c88c0b441cf8f5f102cf99cc4e26200d924939ce33de2cc22cd9e64?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
      text: '10% off first order'
    },
    {
      icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/de1df00011474c4ee2ecaddc571c1315fea7c294a3c54b199790a722802e69cd?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
      text: 'Exclusive offers'
    },
    {
      icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/e1fec34b15f5858cecf5ea13ff9001b4795dd0cf310785bb5116a18078789c3a?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
      text: 'Weekly newsletters'
    }
  ]

  return (
    <div className="mt-6 flex flex-wrap justify-between gap-5 bg-transparent px-16 max-md:px-5">
      {features.map((feature, index) => (
        <div key={index} className="flex gap-2.5 bg-transparent py-0.5">
          <div className="flex min-h-[14px] items-center justify-center self-start overflow-hidden">
            <img
              src={feature.icon}
              alt=""
              className="my-auto aspect-square w-3.5 self-stretch object-contain"
            />
          </div>
          <div className="basis-auto text-center text-sm leading-none text-gray-600">
            {feature.text}
          </div>
        </div>
      ))}
    </div>
  )
}

export default FeatureList
