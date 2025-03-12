import React from 'react'
import ProductSelectionAndOrder from '@/components/Staff/ProductSelectionAndOrder'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EventCreation from '@/components/Staff/EventCreation'
import CouponCreation from '@/components/Staff/CouponCreation'
import OrderTracking from '@/components/Staff/OrderTracking'

const StaffShop: React.FC = () => {
  return (
    <div className="p-6">
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
