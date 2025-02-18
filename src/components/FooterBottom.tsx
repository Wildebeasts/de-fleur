import React from 'react'

interface FooterBottomProps {
  companyName: string
}

const FooterBottom: React.FC<FooterBottomProps> = ({ companyName }) => {
  return (
    <div className="mt-12 flex w-full flex-col bg-white pt-8 text-sm leading-none text-gray-600 max-md:mt-10 max-md:max-w-full">
      <div className="flex w-full flex-wrap gap-10 bg-white max-md:max-w-full">
        <div>
          © {new Date().getFullYear()} {companyName}. All rights reserved.
        </div>
        <div className="flex flex-1 gap-7 bg-white py-1">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </div>
  )
}

export default FooterBottom
