import React from 'react'
import ProductSelectionAndOrder from '@/components/Staff/ProductSelectionAndOrder'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EventCreation from '@/components/Staff/EventCreation'
import CouponCreation from '@/components/Staff/CouponCreation'
import OrderTracking from '@/components/Staff/OrderTracking'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'

const StaffShop: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="p-6">
      <div className="mb-8 w-full bg-[#fff9f1] py-4 shadow-sm">
        <div className="mx-auto flex max-w-4xl justify-center gap-4">
          <Button
            variant="outline"
            className="border-rose-200 bg-white"
            onClick={() => navigate({ to: '/account_manage' })}
          >
            Account Settings
          </Button>
          <Button
            variant="outline"
            className="border-rose-200 bg-white"
            onClick={() => navigate({ to: '/order_history' })}
          >
            Order History
          </Button>
          <Button className="bg-orange-500 text-white hover:bg-orange-600">
            Staff Dashboard
          </Button>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        {/* Tab List */}
        <TabsList className="mx-auto grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="products">Walk In Orders</TabsTrigger>
          <TabsTrigger value="orders">Order Tracking</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>

        {/* Tab Content for Product Selection */}
        <TabsContent value="products" className="mt-6">
          <ProductSelectionAndOrder />
        </TabsContent>

        {/* Tab Content for Order Tracking */}
        <TabsContent value="orders" className="mt-6">
          <OrderTracking />
        </TabsContent>

        {/* Tab Content for Events */}
        <TabsContent value="events" className="mt-6">
          <EventCreation />
        </TabsContent>

        {/* Tab Content for Coupons */}
        <TabsContent value="coupons" className="mt-6">
          <CouponCreation />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default StaffShop
