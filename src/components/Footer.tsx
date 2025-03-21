import React from 'react'
import SocialIcons from '../components/SocialIcons'
import FooterColumn from '../components/FooterColumn'
import FooterBottom from '../components/FooterBottom'

interface FooterProps {
  companyName: string
  description: string
  socialIcons: string[]
  columns: {
    title: string
    items: string[]
  }[]
}

const Footer: React.FC<FooterProps> = ({
  companyName,
  description,
  socialIcons,
  columns = []
}) => {
  return (
    <footer
      className="flex flex-col justify-center bg-white px-20 py-12 max-md:px-5"
      role="contentinfo"
    >
      <div className="flex w-full flex-col bg-white px-4 max-md:max-w-full">
        <div className="bg-white max-md:max-w-full">
          <div className="flex gap-5 max-md:flex-col">
            <div className="flex w-3/12 flex-col max-md:ml-0 max-md:w-full">
              <div className="mx-auto flex w-full flex-col bg-white pb-6 pt-0.5 max-md:mt-10">
                <h2 className="self-start text-xl leading-none text-black">
                  {companyName}
                </h2>
                <p className="mr-5 mt-10 text-sm leading-4 text-gray-600 max-md:mr-2.5">
                  {description}
                </p>
                <SocialIcons icons={socialIcons} />
              </div>
            </div>
            {columns &&
              columns.map((column, index) => (
                <FooterColumn
                  key={index}
                  title={column.title}
                  items={column.items}
                />
              ))}
          </div>
        </div>
        <FooterBottom companyName={companyName} />
      </div>
    </footer>
  )
}

export default Footer

export const DefaultFooter = () => {
  const footerData = {
    companyName: 'De Fleur',
    description: 'Premium natural skincare for your daily routine.',
    socialIcons: [
      'https://cdn.builder.io/api/v1/image/assets/TEMP/ae0fb0304d3f43d49e674ab5ccd18f24acedacc41e4110120ae5943cc91d0b98?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
      'https://cdn.builder.io/api/v1/image/assets/TEMP/4135e3d29c93208409d3271dea06cc0adbca53e9d900e156ee80ea5151d65128?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e',
      'https://cdn.builder.io/api/v1/image/assets/TEMP/ee60cc5a182029e4c79af0106d26adf407eacb88bc5e67d49908065cad47516a?placeholderIfAbsent=true&apiKey=c62a455a8e834db1ac749b30467de15e'
    ],
    columns: [
      {
        title: 'Shop',
        items: ['All Products', 'Bestsellers', 'New Arrivals', 'Gift Sets']
      },
      {
        title: 'Help',
        items: ['Contact Us', 'Shipping', 'Returns', 'FAQ']
      },
      {
        title: 'About',
        items: ['Our Story', 'Ingredients', 'Sustainability', 'Blog']
      }
    ]
  }

  return <Footer {...footerData} />
}
