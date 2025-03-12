import React from 'react'

type Props = {
  customerName: string
  phoneNumber: string
}

const CustomerInfo: React.FC<Props> = ({ customerName, phoneNumber }) => {
  return (
    <div className="mt-4 rounded-lg bg-white p-4 shadow-md">
      <h2 className="mb-2 text-xl font-semibold">Customer Info</h2>
      <p className="text-gray-500">Name: {customerName}</p>
      <p className="text-gray-500">Phone: {phoneNumber}</p>
    </div>
  )
}

export default CustomerInfo
