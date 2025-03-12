import QRCode from 'antd/es/qr-code'
import React from 'react'

type Props = {
  totalAmount: number
}

const CustomerQRCode: React.FC<Props> = ({ totalAmount }) => {
  const qrData = `https://payment.example.com/pay?amount=${totalAmount}`

  return (
    <div className="mt-4 rounded-lg bg-white p-4 text-center shadow-md">
      <h2 className="mb-2 text-xl font-semibold">Scan to Pay</h2>
      <QRCode value={qrData} size={128} />
      <p className="mt-2 text-gray-500">
        Total: {totalAmount.toLocaleString()} VND
      </p>
    </div>
  )
}

export default CustomerQRCode
