import React, { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const CouponCreation: React.FC = () => {
  const [couponDetails, setCouponDetails] = useState({
    code: '',
    discountType: 'percentage',
    value: 0,
    expiryDate: '',
    usageLimit: null as number | null
  })

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCouponDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setCouponDetails((prev) => ({ ...prev, discountType: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Coupon Details:', couponDetails)
    // Reset form after submission
    setCouponDetails({
      code: '',
      discountType: 'percentage',
      value: 0,
      expiryDate: '',
      usageLimit: null
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Coupon</CardTitle>
        <CardDescription>
          Fill out the details below to create a new coupon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="couponCode">Coupon Code</Label>
              <Input
                id="couponCode"
                name="code"
                value={couponDetails.code}
                onChange={handleCouponChange}
                placeholder="Enter coupon code"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <Select
                onValueChange={handleSelectChange}
                value={couponDetails.discountType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountValue">Discount Value</Label>
              <Input
                id="discountValue"
                name="value"
                type="number"
                value={couponDetails.value}
                onChange={handleCouponChange}
                placeholder="Enter discount value"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={couponDetails.expiryDate}
                onChange={handleCouponChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input
                id="usageLimit"
                name="usageLimit"
                type="number"
                value={couponDetails.usageLimit || ''}
                onChange={handleCouponChange}
                placeholder="Enter usage limit (optional)"
              />
            </div>
          </div>

          <CardFooter className="flex justify-end">
            <Button type="submit">Create Coupon</Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

export default CouponCreation
