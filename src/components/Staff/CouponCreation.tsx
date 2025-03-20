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
    name: '',
    code: '',
    discount: 0,
    expiryDate: new Date(),
    usageLimit: 0,
    maxDiscountAmount: 0,
    minimumOrderPrice: 0,
    pointRequired: 0
  })

  const [coupons, setCoupons] = useState<CouponResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

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
        name === 'minimumOrderPrice' ||
        name === 'pointRequired'
          ? Number(value)
          : value
    }))
  }

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponDetails((prev) => ({
      ...prev,
      expiryDate: new Date(e.target.value)
    }))
  }

  // Submit or update a coupon
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditing && editingId) {
        // Update existing coupon
        const updateData: CouponUpdateRequest = {
          code: couponDetails.code,
          discount: couponDetails.discount,
          expiryDate: couponDetails.expiryDate,
          usageLimit: couponDetails.usageLimit,
          maxDiscountAmount: couponDetails.maxDiscountAmount,
          minimumOrderPrice: couponDetails.minimumOrderPrice
        }

        const response = await couponApi.update(editingId, updateData)
        if (response.data.isSuccess) {
          toast.success('Coupon updated successfully')
          resetForm()
          fetchCoupons()
        } else {
          toast.error(response.data.message || 'Failed to update coupon')
        }
      } else {
        // Create new coupon
        const response = await couponApi.create(couponDetails)
        if (response.data.isSuccess) {
          toast.success('Coupon created successfully')
          resetForm()
          fetchCoupons()
        } else {
          toast.error(response.data.message || 'Failed to create coupon')
        }
      }
    } catch (error) {
      console.error('Error submitting coupon:', error)
      toast.error('An error occurred while submitting the coupon')
    } finally {
      setLoading(false)
    }
  }

  // Edit a coupon
  const handleEdit = (coupon: CouponResponse) => {
    setIsEditing(true)
    setEditingId(coupon.id)
    setCouponDetails({
      name: coupon.name || '',
      code: coupon.code || '',
      discount: coupon.discount,
      expiryDate: new Date(coupon.expiryDate),
      usageLimit: coupon.usageLimit,
      maxDiscountAmount: coupon.maxDiscountAmount,
      minimumOrderPrice: coupon.minimumOrderPrice,
      pointRequired: coupon.pointRequired || 0
    })
  }

  // Delete a coupon
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      setLoading(true)
      try {
        const response = await couponApi.delete(id)
        if (response.data.isSuccess) {
          toast.success('Coupon deleted successfully')
          fetchCoupons()
        } else {
          toast.error(response.data.message || 'Failed to delete coupon')
        }
      } catch (error) {
        console.error('Error deleting coupon:', error)
        toast.error('An error occurred while deleting the coupon')
      } finally {
        setLoading(false)
      }
    }
  }

  // Reset form
  const resetForm = () => {
    setCouponDetails({
      name: '',
      code: '',
      discount: 0,
      expiryDate: new Date(),
      usageLimit: 0,
      maxDiscountAmount: 0,
      minimumOrderPrice: 0,
      pointRequired: 0
    })
    setIsEditing(false)
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Coupon' : 'Create Coupon'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update the coupon details below'
              : 'Fill in the details to create a new coupon'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Coupon Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Coupon Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={couponDetails.name}
                  onChange={handleCouponChange}
                  placeholder="Enter coupon name"
                  required
                />
              </div>

              {/* Coupon Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  name="code"
                  value={couponDetails.code}
                  onChange={handleCouponChange}
                  placeholder="Enter coupon code"
                  required
                />
              </div>

              {/* Discount */}
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={couponDetails.discount}
                  onChange={handleCouponChange}
                  placeholder="Enter discount percentage"
                  required
                />
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  type="datetime-local"
                  value={couponDetails.expiryDate.toISOString().slice(0, 16)}
                  onChange={handleExpiryDateChange}
                  required
                />
              </div>

              {/* Usage Limit */}
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  name="usageLimit"
                  type="number"
                  min="1"
                  value={couponDetails.usageLimit}
                  onChange={handleCouponChange}
                  placeholder="Enter usage limit"
                  required
                />
              </div>

              {/* Max Discount Amount */}
              <div className="space-y-2">
                <Label htmlFor="maxDiscountAmount">Max Discount Amount</Label>
                <Input
                  id="maxDiscountAmount"
                  name="maxDiscountAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={couponDetails.maxDiscountAmount}
                  onChange={handleCouponChange}
                  placeholder="Enter max discount amount"
                />
              </div>

              {/* Minimum Order Price */}
              <div className="space-y-2">
                <Label htmlFor="minimumOrderPrice">Minimum Order Price</Label>
                <Input
                  id="minimumOrderPrice"
                  name="minimumOrderPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={couponDetails.minimumOrderPrice}
                  onChange={handleCouponChange}
                  placeholder="Enter minimum order price"
                />
              </div>

              {/* Points Required */}
              <div className="space-y-2">
                <Label htmlFor="pointRequired">Points Required</Label>
                <Input
                  id="pointRequired"
                  name="pointRequired"
                  type="number"
                  min="0"
                  value={couponDetails.pointRequired}
                  onChange={handleCouponChange}
                  placeholder="Enter points required for exchange"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {isEditing ? 'Update Coupon' : 'Create Coupon'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Coupons</CardTitle>
          <CardDescription>Manage your existing coupons</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !coupons.length ? (
            <div className="py-4 text-center">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="py-4 text-center">No coupons found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Points Required</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>{coupon.name}</TableCell>
                    <TableCell>{coupon.code}</TableCell>
                    <TableCell>{coupon.discount}%</TableCell>
                    <TableCell>
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{coupon.pointRequired || 0}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CouponCreation
