import { createContext, useContext, useEffect, useState } from 'react'
import {
  ProvinceData,
  DistrictData,
  WardData,
  CalculateShippingFeeRequest,
  FeeData
} from '../types/delivery'
import deliveryApi from '../services/deliveryApi'

// Define the context type
interface DeliveryContextType {
  provinces: ProvinceData[]
  districts: DistrictData[]
  wards: WardData[]
  shippingFee: FeeData | null
  isProvincesLoading: boolean
  isDistrictsLoading: boolean
  isWardsLoading: boolean
  fetchProvinces: () => Promise<void>
  fetchDistricts: (provinceId: number) => Promise<void>
  fetchWards: (districtId: number) => Promise<void>
  calculateShippingFee: (request: CalculateShippingFeeRequest) => Promise<void>
  resetShippingFee: () => void
}

// Create context with default values
const DeliveryContext = createContext<DeliveryContextType | undefined>(
  undefined
)

// Provider component
export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [provinces, setProvinces] = useState<ProvinceData[]>([])
  const [districts, setDistricts] = useState<DistrictData[]>([])
  const [wards, setWards] = useState<WardData[]>([])
  const [shippingFee, setShippingFee] = useState<FeeData | null>(null)

  // Separate loading states
  const [isProvincesLoading, setIsProvincesLoading] = useState(false)
  const [isDistrictsLoading, setIsDistrictsLoading] = useState(false)
  const [isWardsLoading, setIsWardsLoading] = useState(false)

  useEffect(() => {
    fetchProvinces()
  }, [])

  // Fetch provinces
  const fetchProvinces = async () => {
    setIsProvincesLoading(true)
    try {
      const response = await deliveryApi.getProvince()
      setProvinces(response.data.data || [])
    } catch (error) {
      console.error('Error fetching provinces:', error)
    }
    setIsProvincesLoading(false)
  }

  // Fetch districts based on province ID
  const fetchDistricts = async (provinceId: number) => {
    if (!provinceId) return
    setIsDistrictsLoading(true)
    setDistricts([]) // Reset districts when province changes
    setWards([]) // Also reset wards when province changes
    try {
      const response = await deliveryApi.getDistrict({
        province_id: provinceId
      })
      setDistricts(response.data.data || [])
    } catch (error) {
      console.error('Error fetching districts:', error)
    }
    setIsDistrictsLoading(false)
  }

  // Fetch wards based on district ID
  const fetchWards = async (districtId: number) => {
    if (!districtId) return

    setIsWardsLoading(true)
    setWards([]) // Reset wards when district changes
    try {
      const response = await deliveryApi.getWard({ district_id: districtId })
      setWards(response.data.data || [])
    } catch (error) {
      console.error('Error fetching wards:', error)
    }
    setIsWardsLoading(false)
  }

  // Calculate shipping fee
  const calculateShippingFee = async (request: CalculateShippingFeeRequest) => {
    try {
      const response = await deliveryApi.calculateFee(request)
      console.log(request)

      setShippingFee(response.data.data || null)
    } catch (error) {
      console.error('Error calculating shipping fee:', error)
    }
  }

  const resetShippingFee = () => {
    setShippingFee(null)
  }

  return (
    <DeliveryContext.Provider
      value={{
        provinces,
        districts,
        wards,
        shippingFee,
        isProvincesLoading,
        isDistrictsLoading,
        isWardsLoading,
        fetchProvinces,
        fetchDistricts,
        fetchWards,
        calculateShippingFee,
        resetShippingFee
      }}
    >
      {children}
    </DeliveryContext.Provider>
  )
}

// Custom hook to use the context
export const useDelivery = () => {
  const context = useContext(DeliveryContext)
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider')
  }
  return context
}
