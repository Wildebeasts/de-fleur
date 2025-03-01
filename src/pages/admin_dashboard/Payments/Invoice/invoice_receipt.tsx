import React from 'react';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import 'jspdf-autotable';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PaymentApi } from '@/utils/services/PaymentService';
// @ts-expect-error -- expected
import { Typography } from 'antd';
import vnpayLogo from '@/assets/logos/vnpay.jpg';
import momoLogo from '@/assets/logos/momo.png';
import LoadingSpinner from '@/components/LoadingSpinner';

const { Text } = Typography;

interface TransactionReceiptProps {
  transaction: {
    paymentId: string;
    orderId: string;
    amount: number;
    paymentStatus: boolean;
    paymentMethod: number;
    courseName?: string;
    createdDate: string;
    paymentDate: string;
    transactionId: string;
    responseCode: string;
    paymentDescription: string;
    cardType: string;
  };
}

const getHeaderGradient = (status: boolean | undefined) => {
  if (status === undefined) {
    return 'from-amber-950/50 via-[#1E1F2E] to-[#1E1F2E]'; // pending
  }
  return status 
    ? 'from-emerald-950/50 via-[#1E1F2E] to-[#1E1F2E]'  // paid
    : 'from-rose-950/50 via-[#1E1F2E] to-[#1E1F2E]';    // failed
};

const TransactionReceipt: React.FC = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState<TransactionReceiptProps['transaction']>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        if (!id) return;
        const response = await PaymentApi.getPaymentById(id);
        setTransaction(response);
      } catch (error) {
        console.error('Failed to fetch payment:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  // Add print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #receipt-content, #receipt-content * {
          visibility: visible;
        }
        #receipt-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white !important;
          color: #111827 !important;
          border: none !important;
        }

        /* Light theme overrides */
        #receipt-content {
          box-shadow: none !important;
        }
        
        #receipt-content .header {
          background: white !important;
          border-bottom: 1px solid #e5e7eb !important;
        }

        #receipt-content .text-gray-400 {
          color: #6b7280 !important;
        }

        #receipt-content .text-white {
          color: #111827 !important;
        }

        #receipt-content .bg-[#161722]/50,
        #receipt-content .bg-[#161722] {
          background: #f9fafb !important;
          border: 1px solid #e5e7eb !important;
        }

        /* Status badge */
        #receipt-content .status-badge.paid {
          background-color: #f0fdf4 !important;
          color: #15803d !important;
          border: 1px solid #bbf7d0 !important;
        }
        #receipt-content .status-badge.failed {
          background-color: #fef2f2 !important;
          color: #b91c1c !important;
          border: 1px solid #fecaca !important;
        }
        #receipt-content .status-badge.pending {
          background-color: #fffbeb !important;
          color: #b45309 !important;
          border: 1px solid #fde68a !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' đ';
  };

  if (loading || !transaction) {
    return <LoadingSpinner />;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen/10 px-8 pt-8">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <span className="mr-2">←</span>
          Back to Transactions
        </button>
        <div className="flex gap-3">
          {/* @ts-expect-error -- expected */}
          <Button 
            onClick={handlePrint}
            icon={<PrinterOutlined />}
            className="flex items-center"
            loading={loading}
          >
            Print
          </Button>
        </div>
      </div>

      {/* Receipt Content */}
      <div 
        id="receipt-content"
        className="max-w-4xl mx-auto bg-gradient-to-b from-[#1E1F2E] to-[#1A1B26] rounded-xl shadow-2xl overflow-hidden border border-gray-800"
      >
        {/* Header Section */}
        <div className={`header bg-gradient-to-b ${getHeaderGradient(transaction?.paymentStatus)} p-8 transition-colors duration-300`}>
          <div className="flex justify-between items-start mb-4">
            <Text className="text-sm text-gray-400">
              Invoice #{transaction?.paymentId.slice(0, 8)}
            </Text>
            <span className={`px-4 py-1.5 rounded-full text-xs font-medium ${
              transaction?.paymentStatus === undefined
                ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                : transaction?.paymentStatus 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-950 text-rose-400 border border-rose-500/30'
            }`}>
              {transaction?.paymentStatus === undefined 
                ? 'PENDING' 
                : transaction?.paymentStatus 
                  ? 'PAID' 
                  : 'FAILED'}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-white">Payment Receipt</h1>
        </div>

        {/* Content Section */}
        <div className="p-8">
          {/* Transaction Time Details */}
          <div className="mb-8 bg-[#161722]/50 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <span className="text-gray-400 text-sm">Created Date</span>
                <p className="text-white mt-1">
                  {format(new Date(transaction?.createdDate || ''), 'MMM dd, yyyy')}
                  <span className="text-gray-400 ml-2 text-sm">
                    {format(new Date(transaction?.createdDate || ''), 'HH:mm:ss')}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Payment Date</span>
                <p className="text-white mt-1">
                  {format(new Date(transaction?.paymentDate || ''), 'MMM dd, yyyy')}
                  <span className="text-gray-400 ml-2 text-sm">
                    {format(new Date(transaction?.paymentDate || ''), 'HH:mm:ss')}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Company & Payment Info */}
          <div className="grid grid-cols-3 gap-8 mb-12">
            {/* Billed From */}
            <div className="space-y-2">
              <h3 className="text-gray-400 text-sm font-medium mb-3">Billed From</h3>
              <div className="text-white space-y-1">
                <p className="font-medium">Cursus Technologies, Inc.</p>
                <p className="text-gray-300">123 Street Name</p>
                <p className="text-gray-300">City, Country</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <h3 className="text-gray-400 text-sm font-medium mb-3">Payment Method</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-sm block">Type</span>
                  <div className="flex items-center gap-2 mt-1">
                    <img 
                      src={transaction?.paymentMethod === 1 ? momoLogo : vnpayLogo} 
                      alt={transaction?.paymentMethod === 1 ? 'MOMO' : 'VNPay'} 
                      className="w-7 h-7 object-contain"
                    />
                    <span className="text-white">
                      {transaction?.paymentMethod === 1 ? 'MOMO' : 'VNPay'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm block">Card</span>
                  <span className="text-white">{transaction?.cardType}</span>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-2">
              <h3 className="text-gray-400 text-sm font-medium mb-3">Transaction Info</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 text-sm block">Transaction ID</span>
                  <span className="text-white">{transaction?.transactionId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order ID (Full Width) */}
          <div className="mb-8 bg-[#161722]/50 rounded-lg p-4">
            <span className="text-gray-400 text-sm">Order ID</span>
            <p className="text-white mt-1 font-mono">{transaction?.orderId}</p>
          </div>

          {/* Items Table */}
          <div className="bg-[#161722] rounded-lg p-6 mb-8">
            <div className="flex justify-between text-gray-400 text-sm mb-4">
              <span>Description</span>
              <span>Amount</span>
            </div>
            <div className="flex justify-between py-3 text-white">
              <div className="flex flex-col">
                <span>{transaction?.courseName}</span>
                <span className="text-sm text-gray-400 mt-1">{transaction?.paymentDescription}</span>
              </div>
              <span className="font-medium">
                {formatCurrency(transaction?.amount || 0)}
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end mb-12">
            <div className="w-1/3">
              <div className="flex justify-between items-center p-4 bg-[#161722] rounded-lg">
                <span className="text-gray-400">Total</span>
                <span className="text-white text-lg font-semibold">
                  {formatCurrency(transaction?.amount || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2 pt-6 border-t border-gray-800">
            <p className="text-gray-400">Thank you for your business!</p>
            <p className="text-gray-500 text-sm">
              If you have any questions, please contact support@cursus.tech
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionReceipt;