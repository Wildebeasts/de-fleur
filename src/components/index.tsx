import React from 'react'
import Footer from './Footer'

const FooterWrapper: React.FC = () => {
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

export default FooterWrapper
