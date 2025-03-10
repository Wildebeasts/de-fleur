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
    name: '',
    code: '',
    discount: 0,
    expiryDate: new Date(),
    usageLimit: 0 // Fixed typo from 'uasgeLimit' to 'usageLimit'
  })

  const [coupons, setCoupons] = useState<CouponResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null) // Track edit mode

  // Fetch coupons
  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const response = await couponApi.getCoupons()
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
        name === 'discount' || name === 'usageLimit' ? Number(value) : value
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

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normalize today's date
    const minExpiryDate = new Date(today)
    minExpiryDate.setDate(minExpiryDate.getDate() + 1) // Minimum expiry should be tomorrow

    const expiryDate = new Date(couponDetails.expiryDate)

    // Validation
    if (!couponDetails.name.trim()) {
      toast.error('Coupon name is required.')
      return
    }
    if (!couponDetails.code.trim()) {
      toast.error('Coupon code is required.')
      return
    }
    if (couponDetails.discount <= 0 || couponDetails.discount > 100) {
      toast.error('Discount must be between 1 and 100.')
      return
    }
    if (!couponDetails.expiryDate || isNaN(expiryDate.getTime())) {
      toast.error('A valid expiry date is required.')
      return
    }
    if (expiryDate < minExpiryDate) {
      toast.error('Expiry date must be at least 1 day from today.')
      return
    }
    if (couponDetails.usageLimit <= 0) {
      toast.error('Usage limit must be greater than 0.')
      return
    }

    try {
      if (editingCouponId) {
        // Update existing coupon
        const updateCoupon: CouponUpdateRequest = {
          id: editingCouponId,
          code: couponDetails.code,
          discount: couponDetails.discount,
          expiryDate: couponDetails.expiryDate,
          usageLimit: couponDetails.usageLimit
        }

        const response = await couponApi.updateCoupon(updateCoupon)
        if (response.data.isSuccess) {
          toast.success('Coupon updated successfully!')
          setEditingCouponId(null)
        } else {
          toast.error(response.data.message || 'Failed to update coupon')
          return
        }
      } else {
        // Create new coupon
        const response = await couponApi.createCoupon(couponDetails)
        if (response.data.isSuccess) {
          toast.success('Coupon created successfully!')
        } else {
          toast.error(response.data.message || 'Failed to create coupon')
          return
        }
      }

      setCouponDetails({
        name: '',
        code: '',
        discount: 0,
        expiryDate: new Date(),
        usageLimit: 0
      })
      fetchCoupons() // Refresh list
    } catch (error) {
      console.error('Error saving coupon:', error)
      toast.error('An error occurred while saving the coupon')
    }
  }

  // Edit a coupon
  const handleEdit = (coupon: CouponResponse) => {
    setEditingCouponId(coupon.id)
    setCouponDetails({
      name: coupon.name,
      code: coupon.code,
      discount: coupon.discount,
      expiryDate: new Date(coupon.expiryDate),
      usageLimit: coupon.usageLimit
    })
  }

  // Delete a coupon
  const handleDelete = async (id: string) => {
    try {
      const response = await couponApi.deleteCoupon(id)
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
              <Label htmlFor="couponName">Coupon Name</Label>
              <Input
                id="couponName"
                name="name"
                value={couponDetails.name}
                onChange={handleCouponChange}
                required
              />
              <Label htmlFor="couponCode">Coupon Code</Label>
              <Input
                id="couponCode"
                name="code"
                value={couponDetails.code}
                onChange={handleCouponChange}
                required
              />
              <Label htmlFor="discountValue">Discount Value</Label>
              <Input
                id="discountValue"
                name="discount"
                type="number"
                value={couponDetails.discount}
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
              />
            </div>
            <CardFooter className="flex justify-end">
              <Button type="submit">Save Coupon</Button>
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
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Name</TableHead>
                    <TableHead className="text-left">Code</TableHead>
                    <TableHead className="text-left">Discount</TableHead>
                    <TableHead className="text-left">Start</TableHead>
                    <TableHead className="text-left">Expiry</TableHead>
                    <TableHead className="text-left">Usage Limit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>{coupon.name}</TableCell>
                      <TableCell>{coupon.code}</TableCell>
                      <TableCell>{coupon.discount}%</TableCell>
                      <TableCell>
                        {new Date(coupon.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{coupon.usageLimit} uses</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(coupon.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => handleEdit(coupon)}>Edit</Button>
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
