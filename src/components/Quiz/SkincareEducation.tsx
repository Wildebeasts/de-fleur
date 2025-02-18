import React from 'react'

interface EducationItem {
  icon: string
  text: string
}

interface EducationSection {
  title: string
  items: EducationItem[]
}

const educationSections: EducationSection[] = [
  {
    title: 'Tips for Your Skin Type',
    items: [
      {
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/1159f9087199ae2c0369641d97ab494d27c3dcada6ea1268e87c5802bfc75e3e?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
        text: 'Balance oil production with gentle exfoliation'
      },
      {
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/4da3451af0b482009a9ebd6e2d91184039f1bf58dfd239b6d5a5691bf6e820a7?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
        text: 'Use non-comedogenic products'
      },
      {
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/1dd90769604819eaa8146d6cc1432af7e9f85d17e3aea4d792bc3e6a87ecec9c?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
        text: 'Apply different products to different zones'
      }
    ]
  },
  {
    title: 'Common Mistakes to Avoid',
    items: [
      {
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/64545eee9b80d28990b89cd5682d21b2863f2c415eda55805633f2ffab866cc9?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
        text: 'Over-cleansing the skin'
      },
      {
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/64545eee9b80d28990b89cd5682d21b2863f2c415eda55805633f2ffab866cc9?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
        text: 'Using harsh exfoliants'
      },
      {
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/64545eee9b80d28990b89cd5682d21b2863f2c415eda55805633f2ffab866cc9?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
        text: 'Skipping moisturizer'
      }
    ]
  }
]

export const SkincareEducation: React.FC = () => {
  return (
    <div className="mt-12 flex w-full flex-col rounded-xl bg-white p-8 shadow-[0px_4px_6px_rgba(0,0,0,0.1)] max-md:mt-10 max-md:max-w-full max-md:px-5">
      <h2 className="pb-3.5 pt-px text-2xl text-black max-md:max-w-full max-md:pr-5">
        Skincare Education
      </h2>
      <div className="mt-6 max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col">
          {educationSections.map((section, index) => (
            <div
              key={index}
              className="flex w-6/12 flex-col max-md:ml-0 max-md:w-full"
            >
              <div className="flex w-full grow flex-col py-px max-md:mt-8 max-md:max-w-full">
                <h3 className="self-start text-xl leading-none text-black">
                  {section.title}
                </h3>
                <div className="mt-6 flex w-full flex-col max-md:max-w-full">
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="mt-3 flex w-full flex-wrap gap-3 py-1 max-md:max-w-full"
                    >
                      <div className="flex min-h-[16px] items-center justify-center self-start overflow-hidden">
                        <img
                          loading="lazy"
                          src={item.icon}
                          className="my-auto aspect-[0.87] w-3.5 self-stretch object-contain"
                          alt=""
                        />
                      </div>
                      <div className="w-[531px] flex-auto text-base leading-none text-black max-md:max-w-full">
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
