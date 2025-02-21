import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckIcon, Package, Truck, Home, Box } from 'lucide-react'

interface OrderStatus {
  text: string
  description: string
  icon: React.ReactNode
}

interface OrderStatusLoaderProps {
  currentStatus: number
  orderStatuses: OrderStatus[]
}

const ProgressLine = ({ progress }: { progress: number }) => (
  <motion.div
    className="absolute left-[1.8rem] top-0 h-full w-0.5 origin-top bg-gray-200"
    style={{ scale: 1 }}
  >
    <motion.div
      className="size-full bg-[#3A4D39]"
      initial={{ scaleY: 0 }}
      animate={{ scaleY: progress }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    />
  </motion.div>
)

const StatusIcon = ({
  icon,
  isCompleted,
  isCurrent
}: {
  icon: React.ReactNode
  isCompleted: boolean
  isCurrent: boolean
}) => {
  return (
    <motion.div
      className={cn(
        'relative flex size-8 items-center justify-center rounded-full border-2',
        isCompleted
          ? 'border-[#3A4D39] bg-[#3A4D39] text-white'
          : isCurrent
            ? 'border-[#3A4D39] bg-[#D1E2C4] text-[#3A4D39]'
            : 'border-gray-300 bg-white text-gray-300'
      )}
      whileHover={isCompleted || isCurrent ? { scale: 1.1 } : {}}
      whileTap={isCompleted || isCurrent ? { scale: 0.95 } : {}}
    >
      {isCompleted ? (
        <CheckIcon className="size-4" />
      ) : (
        <motion.div
          className="size-4"
          initial={false}
          animate={isCurrent ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          {icon}
        </motion.div>
      )}
    </motion.div>
  )
}

const LoaderCore = ({
  orderStatuses,
  currentStatus
}: {
  orderStatuses: OrderStatus[]
  currentStatus: number
}) => {
  const progress = currentStatus / (orderStatuses.length - 1)

  return (
    <div className="relative mx-auto flex max-w-2xl flex-col justify-start">
      <ProgressLine progress={progress} />
      {orderStatuses.map((status, index) => {
        const isCompleted = index <= currentStatus
        const isCurrent = index === currentStatus

        return (
          <motion.div
            key={index}
            className={cn(
              'relative mb-8 flex items-start gap-4 p-4 transition-colors',
              (isCompleted || isCurrent) && 'rounded-lg hover:bg-[#D1E2C4]/10'
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <StatusIcon
              icon={status.icon}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
            />
            <div className="flex flex-col">
              <motion.span
                className={cn(
                  'text-lg font-medium',
                  isCompleted || isCurrent ? 'text-[#3A4D39]' : 'text-gray-400'
                )}
                animate={{
                  scale: isCurrent ? 1.05 : 1
                }}
                transition={{ duration: 0.2 }}
              >
                {status.text}
              </motion.span>
              <motion.span
                className={cn(
                  'text-sm',
                  isCompleted || isCurrent
                    ? 'text-[#3A4D39]/70'
                    : 'text-gray-400'
                )}
              >
                {status.description}
              </motion.span>
              {isCurrent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 text-sm text-[#3A4D39]/60"
                >
                  {getStatusMessage(index)}
                </motion.div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

const getStatusMessage = (status: number): string => {
  const messages = [
    "We've received your order and will begin processing it shortly.",
    'Your items are being carefully prepared for shipment.',
    'Your package is now in transit with our shipping partner.',
    'Your package is with our local delivery partner.',
    'Thank you for shopping with us!'
  ]
  return messages[status]
}

export const OrderStatusLoader = ({
  currentStatus,
  orderStatuses
}: OrderStatusLoaderProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative flex size-full items-center justify-center"
      >
        <LoaderCore
          currentStatus={currentStatus}
          orderStatuses={orderStatuses}
        />
      </motion.div>
    </AnimatePresence>
  )
}

export const orderTrackingStates: OrderStatus[] = [
  {
    text: 'Order Placed',
    description: 'Your order has been confirmed and is being processed',
    icon: <Box className="size-4" />
  },
  {
    text: 'Processing',
    description: 'We are preparing your items for shipment',
    icon: <Package className="size-4" />
  },
  {
    text: 'Shipped',
    description: 'Your order is on its way to you',
    icon: <Truck className="size-4" />
  },
  {
    text: 'Out for Delivery',
    description: 'Your package will be delivered today',
    icon: <Truck className="size-4" />
  },
  {
    text: 'Delivered',
    description: 'Your order has been delivered successfully',
    icon: <Home className="size-4" />
  }
]
