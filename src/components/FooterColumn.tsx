import React from 'react'

interface FooterColumnProps {
  title: string
  items: string[]
}

const FooterColumn: React.FC<FooterColumnProps> = ({ title, items }) => {
  return (
    <div className="ml-5 flex w-3/12 flex-col max-md:ml-0 max-md:w-full">
      <div className="flex w-full grow flex-col bg-white py-px leading-none max-md:mt-10">
        <h3 className="self-start text-base font-medium text-black">{title}</h3>
        <nav className="mt-6 flex flex-col items-start bg-white pb-2 pr-14 pt-px text-sm text-gray-600 max-md:pr-5">
          {items.map((item, index) => (
            <a href="#" key={index} className={index > 0 ? 'mt-5' : ''}>
              {item}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default FooterColumn
