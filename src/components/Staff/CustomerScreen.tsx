import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import CustomerOrderSummary from './CustomerOrderSummary'
import CustomerCoupon from './CustomerCoupon'
import { CosmeticResponse } from '@/lib/types/Cosmetic'
import CustomerInfo from './CustomerInfo'
import { CouponResponse } from '@/lib/types/Coupon'

type Props = {
  selectedProducts: (CosmeticResponse & { quantity: number })[]
  coupon: CouponResponse | null
  customerName: string
  phoneNumber: string
  onClose: () => void
}

const CustomerScreen: React.FC<Props> = ({
  selectedProducts,
  coupon,
  customerName,
  phoneNumber,
  onClose
}) => {
  const [customerWindow, setCustomerWindow] = useState<Window | null>(null)

  useEffect(() => {
    const newWin = window.open('', 'CustomerView', 'width=600,height=800')

    if (newWin) {
      newWin.document.body.innerHTML = '<div id="customer-root"></div>'
      setCustomerWindow(newWin)

      const checkClosed = setInterval(() => {
        if (newWin.closed) {
          clearInterval(checkClosed)
          setCustomerWindow(null)
          onClose()
        }
      }, 500)

      document
        .querySelectorAll('link[rel="stylesheet"], style')
        .forEach((style) => {
          newWin.document.head.appendChild(style.cloneNode(true))
        })
    } else {
      alert('Pop-up blocked! Please allow pop-ups for this site.')
    }

    return () => {
      newWin?.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (
      customerWindow &&
      customerWindow.document.getElementById('customer-root')
    ) {
      const subtotal = selectedProducts.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
      let total = 0
      if (coupon) {
        total = subtotal - (subtotal * coupon.discount) / 100
      } else {
        total = subtotal
      }

      // eslint-disable-next-line react/no-deprecated
      ReactDOM.render(
        <div className="flex min-h-screen flex-col justify-between bg-gray-100 p-6">
          {/* Header */}
          <h1 className="text-center text-2xl font-bold text-gray-700">
            Customer Order Summary
          </h1>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left Column - Order Summary */}
            <div className="space-y-6">
              <CustomerOrderSummary selectedProducts={selectedProducts} />
            </div>

            {/* Right Column - Customer Info, Coupon, QR Code */}
            <div className="space-y-6">
              <CustomerInfo
                customerName={customerName}
                phoneNumber={phoneNumber}
              />
              <CustomerCoupon coupon={coupon} />
            </div>
          </div>

          {/* Bottom Section - Total Price */}
          <div className="mt-auto bg-white p-4 shadow-lg">
            <div className="flex justify-between text-lg font-medium text-gray-700">
              <span>Subtotal:</span>
              <span>{subtotal.toLocaleString()} VND</span>
            </div>
            <div className="flex justify-between text-lg text-red-600">
              <span>Discount:</span>
              {coupon ? (
                <span>
                  - {((subtotal * coupon!.discount) / 100).toLocaleString()} VND
                </span>
              ) : (
                <span>- {0} VND</span>
              )}
            </div>
            <hr className="my-2 border-gray-300" />
            <div className="flex justify-between text-xl font-bold text-gray-900">
              <span>Total:</span>
              <span>{total.toLocaleString()} VND</span>
            </div>
          </div>
        </div>,
        customerWindow.document.getElementById('customer-root')
      )
    }
  }, [selectedProducts, customerWindow, coupon, customerName, phoneNumber])

  return null
}

export default CustomerScreen
