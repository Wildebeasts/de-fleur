import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import couponApi from '@/lib/services/couponApi'
import {
  CouponCreateRequest,
  CouponResponse,
  CouponUpdateRequest
} from '@/lib/types/Coupon'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table'

const CouponCreation: React.FC = () => {
  const [couponDetails, setCouponDetails] = useState<CouponCreateRequest>({
    code: '',
    name: '',
    discount: 0,
    maxDiscountAmount: 0,
    minimumOrderPrice: 0,
    expiryDate: new Date(),
    usageLimit: 0
  })

  const [coupons, setCoupons] = useState<CouponResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null) // Track edit mode

  // Fetch coupons
  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const response = await couponApi.getAll()
      if (response.data.isSuccess) {
        setCoupons(response.data.data!)
      } else {
        toast.error(response.data.message || 'Failed to fetch coupons')
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast.error('An error occurred while fetching coupons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  // Handle input changes
  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCouponDetails((prev) => ({
      ...prev,
      [name]:
        name === 'discount' ||
        name === 'usageLimit' ||
        name === 'maxDiscountAmount' ||
        name === 'minimumOrderPrice'
          ? Number(value)
          : value
    }))
  }

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponDetails((prev) => ({
      ...prev,
      expiryDate: new Date(e.target.value) // Convert input value to Date
    }))
  }

  // Submit or update a coupon
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!couponDetails.code.trim()) {
      toast.error('Coupon code is required.')
      return
    }
    if (couponDetails.discount <= 0 || couponDetails.discount > 100) {
      toast.error('Discount must be between 1 and 100.')
      return
    }
    if (couponDetails.maxDiscountAmount <= 0) {
      toast.error('Maximum discount amount must be greater than 0.')
      return
    }
    if (couponDetails.minimumOrderPrice < 0) {
      toast.error('Minimum order price cannot be negative.')
      return
    }
    if (couponDetails.usageLimit <= 0) {
      toast.error('Usage limit must be greater than 0.')
      return
    }

    try {
      if (editingCouponId) {
        const updateCoupon: CouponUpdateRequest = {
          code: couponDetails.code,
          discount: couponDetails.discount,
          maxDiscountAmount: couponDetails.maxDiscountAmount,
          minimumOrderPrice: couponDetails.minimumOrderPrice,
          expiryDate: couponDetails.expiryDate,
          usageLimit: couponDetails.usageLimit
        }

        const response = await couponApi.update(editingCouponId, updateCoupon)
        if (response.data.isSuccess) {
          toast.success('Coupon updated successfully!')
          setEditingCouponId(null)
        } else {
          toast.error(response.data.message || 'Failed to update coupon')
          return
        }
      } else {
        const response = await couponApi.create(couponDetails)
        if (response.data.isSuccess) {
          toast.success('Coupon created successfully!')
        } else {
          toast.error(response.data.message || 'Failed to create coupon')
          return
        }
      }

      // Reset form
      setCouponDetails({
        code: '',
        discount: 0,
        maxDiscountAmount: 0,
        minimumOrderPrice: 0,
        expiryDate: new Date(),
        usageLimit: 0,
        name: ''
      })
      fetchCoupons()
    } catch (error) {
      console.error('Error saving coupon:', error)
      toast.error('An error occurred while saving the coupon')
    }
  }

  // Edit a coupon
  const handleEdit = (coupon: CouponResponse) => {
    setEditingCouponId(coupon.id)
    setCouponDetails({
      code: coupon.code,
      name: coupon.name,
      discount: coupon.discount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      minimumOrderPrice: coupon.minimumOrderPrice,
      expiryDate: new Date(coupon.expiryDate),
      usageLimit: coupon.usageLimit
    })
  }

  // Delete a coupon
  const handleDelete = async (id: string) => {
    try {
      const response = await couponApi.delete(id)
      if (response.data.isSuccess) {
        toast.success('Coupon deleted successfully')
        fetchCoupons() // Refresh list
      } else {
        toast.error(response.data.message || 'Failed to delete coupon')
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
      toast.error('An error occurred while deleting the coupon')
    }
  }

  return (
    <div className="container grid grid-cols-1 gap-6 md:grid-cols-6">
      {/* Coupon Form */}
      <Card className="col-span-2 shadow-md">
        <CardHeader>
          <CardTitle>Create Coupon</CardTitle>
          <CardDescription>
            Fill out the details below to create a new coupon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="couponCode">Coupon Code</Label>
              <Input
                id="couponCode"
                name="code"
                value={couponDetails.code}
                onChange={handleCouponChange}
                required
              />
              <Label htmlFor="discountValue">Discount Percentage (%)</Label>
              <Input
                id="discountValue"
                name="discount"
                type="number"
                value={couponDetails.discount}
                onChange={handleCouponChange}
                required
              />
              <Label htmlFor="maxDiscountAmount">Maximum Discount Amount</Label>
              <Input
                id="maxDiscountAmount"
                name="maxDiscountAmount"
                type="number"
                value={couponDetails.maxDiscountAmount}
                onChange={handleCouponChange}
                required
              />
              <Label htmlFor="minimumOrderPrice">Minimum Order Price</Label>
              <Input
                id="minimumOrderPrice"
                name="minimumOrderPrice"
                type="number"
                value={couponDetails.minimumOrderPrice}
                onChange={handleCouponChange}
                required
              />
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={couponDetails.expiryDate.toISOString().split('T')[0]}
                onChange={handleExpiryDateChange}
                required
              />
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input
                id="usageLimit"
                name="usageLimit"
                type="number"
                value={couponDetails.usageLimit}
                onChange={handleCouponChange}
                required
              />
            </div>
            <CardFooter className="flex justify-end">
              <Button type="submit">
                {editingCouponId ? 'Update Coupon' : 'Create Coupon'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {/* Coupon List */}
      <Card className="col-span-4 shadow-md">
        <CardHeader>
          <CardTitle>Existing Coupons</CardTitle>
          <CardDescription>Manage your available coupons.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : coupons.length === 0 ? (
            <p>No coupons available</p>
          ) : (
            <div className="max-h-[300px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Max Discount</TableHead>
                    <TableHead>Min Order</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Usage Limit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>{coupon.code}</TableCell>
                      <TableCell>{coupon.discount}%</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(coupon.maxDiscountAmount)}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(coupon.minimumOrderPrice)}
                      </TableCell>
                      <TableCell>
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{coupon.usageLimit} uses</TableCell>
                      <TableCell className="space-x-2 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(coupon)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(coupon.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CouponCreation
