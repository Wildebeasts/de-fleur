/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import orderApi from '@/lib/services/orderApi'
import { Button } from '@/components/ui/button'

// Create a custom event for order refresh
const ORDER_REFRESH_EVENT = 'order-refresh-needed'

// Function to dispatch the refresh event
const triggerOrderRefresh = () => {
  const event = new CustomEvent(ORDER_REFRESH_EVENT)
  window.dispatchEvent(event)
}

interface VNPayReturnParams {
  vnp_Amount: string
  vnp_BankCode: string
  vnp_BankTranNo: string
  vnp_CardType: string
  vnp_OrderInfo: string
  vnp_PayDate: string
  vnp_ResponseCode: string
  vnp_TmnCode: string
  vnp_TransactionNo: string
  vnp_TransactionStatus: string
  vnp_TxnRef: string
  vnp_SecureHash: string
}

interface PaymentReturnData {
  transactionId: string
  totalAmount: string
  responseCode: string
}

const PaymentReturn: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [responseCode, setResponseCode] = useState('')
  const navigate = useNavigate()

  // Function to get error message based on VNPay response code
  const getErrorMessageByCode = (code: string): string => {
    switch (code) {
      case '00':
        return 'Giao dịch thành công'
      case '07':
        return 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).'
      case '09':
        return 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.'
      case '10':
        return 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần'
      case '11':
        return 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.'
      case '12':
        return 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.'
      case '13':
        return 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.'
      case '24':
        return 'Giao dịch không thành công do: Khách hàng hủy giao dịch'
      case '51':
        return 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.'
      case '65':
        return 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.'
      case '75':
        return 'Ngân hàng thanh toán đang bảo trì.'
      case '79':
        return 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch'
      case '99':
        return 'Lỗi không xác định. Vui lòng liên hệ bộ phận hỗ trợ khách hàng.'
      default:
        return 'Giao dịch không thành công. Vui lòng thử lại sau.'
    }
  }

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get all query parameters
        const params = new URLSearchParams(window.location.search)
        const paymentParams: Partial<VNPayReturnParams> = {}

        // Convert URLSearchParams to object
        params.forEach((value, key) => {
          paymentParams[key as keyof VNPayReturnParams] = value
        })

        // Store response code for specific error handling
        const responseCode = paymentParams.vnp_ResponseCode || ''
        setResponseCode(responseCode)

        // Extract orderId from vnp_OrderInfo or vnp_TxnRef
        // First try to extract from vnp_OrderInfo which contains "Payment for order {orderId}"
        let orderId: string | undefined

        if (paymentParams.vnp_OrderInfo) {
          const orderIdMatch = paymentParams.vnp_OrderInfo.match(/order\s+([a-f0-9-]+)/i)
          if (orderIdMatch && orderIdMatch[1]) {
            orderId = orderIdMatch[1]
          }
        }

        // If not found in vnp_OrderInfo, use vnp_TxnRef which should contain the orderId
        if (!orderId && paymentParams.vnp_TxnRef) {
          orderId = paymentParams.vnp_TxnRef
        }

        if (!orderId) {
          throw new Error('Order ID not found in payment return data')
        }

        console.log('Extracted Order ID:', orderId)

        // Create PaymentReturnData object
        const paymentReturnData: PaymentReturnData = {
          transactionId: paymentParams.vnp_TransactionNo || '',
          totalAmount: paymentParams.vnp_Amount || '',
          responseCode: responseCode
        }

        // Call API to update the order status
        // For code 24 (user cancelled) or any other non-success code, mark as PAYMENT_FAILED
        if (responseCode !== '00') {
          // For cancelled payments (code 24) or other failures
          const response = await orderApi.updateOrderStatus(orderId, {
            status: 'PAYMENT_FAILED'
          })

          setIsSuccess(false)
          setErrorMessage(getErrorMessageByCode(responseCode))
        } else {
          // For successful payments, complete the order
          const response = await orderApi.completeOrder(
            orderId,
            responseCode,
            paymentReturnData
          )

          if (response.data.isSuccess) {
            setIsSuccess(true)
            // Set a flag in localStorage to indicate orders need refreshing
            localStorage.setItem('refreshOrders', 'true')
            // Trigger the refresh event
            triggerOrderRefresh()
          } else {
            setIsSuccess(false)
            setErrorMessage(
              response.data.message ||
              'Payment verification failed. Please contact support.'
            )
          }
        }
      } catch (error) {
        console.error('Payment processing error:', error)
        setIsSuccess(false)
        setErrorMessage('An error occurred while processing your payment.')
      } finally {
        setIsProcessing(false)
      }
    }

    processPayment()
  }, [])

  const handleViewOrders = () => {
    // Set the refresh flag before navigating
    localStorage.setItem('refreshOrders', 'true')
    // Trigger the refresh event
    triggerOrderRefresh()
    // Navigate to order history
    navigate({ to: '/order_history' })
  }

  if (isProcessing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto size-12 animate-spin text-[#3A4D39]" />
          <h2 className="mt-4 text-xl font-semibold text-[#3A4D39]">
            Processing your payment...
          </h2>
          <p className="mt-2 text-gray-600">Please do not close this window.</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[60vh] items-center justify-center p-4"
    >
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-lg">
        {isSuccess ? (
          <div className="text-center">
            <div className="mx-auto mb-4 size-16 rounded-full bg-green-100 p-2">
              <svg
                className="size-full text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-[#3A4D39]">
              Payment Successful!
            </h2>
            <p className="mb-6 text-gray-600">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            <div className="space-y-3">
              <Button
                className="w-full bg-[#3A4D39] hover:bg-[#4A5D49]"
                onClick={handleViewOrders}
              >
                View Orders
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate({ to: '/' })}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 size-16 rounded-full bg-red-100 p-2">
              <svg
                className="size-full text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-red-600">
              Payment Failed
            </h2>
            <p className="mb-6 text-gray-600">
              {errorMessage || getErrorMessageByCode(responseCode)}
            </p>
            <div className="space-y-3">
              <Button
                className="w-full bg-[#3A4D39] hover:bg-[#4A5D49]"
                onClick={() => navigate({ to: '/checkout' })}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate({ to: '/cart' })}
              >
                Return to Cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default PaymentReturn
