export interface ProvinceData {
  ProvinceID: number
  ProvinceName: string
  CountryID: number
  Code: string
  NameExtension: string[]
  IsEnable: number
  RegionID: number
  RegionCPN: number
  UpdatedBy: number
  CreatedAt: string
  UpdatedAt: string
  AreaID: number
  CanUpdateCOD: boolean
  Status: number
  CreatedIP: string
  CreatedEmployee: number
  CreatedSource: string
  CreatedDate: string // Assuming ISO string format for DateTime
  UpdatedEmployee: number
  UpdatedSource: string
  UpdatedDate: string // Assuming ISO string format for DateTime
}

export interface DistrictData {
  DistrictID: number
  ProvinceID: number
  DistrictName: string
  Code: string
  Type: number
  SupportType: number
}

export interface WardData {
  WardCode: string
  DistrictID: number
  WardName: string
  NameExtension: string[]
  CanUpdateCOD: boolean
  SupportType: number
  PickType: number
  DeliverType: number
  WhiteListClient: WhiteListClient
  WhiteListWard: WhiteListWard
  Status: number
  ReasonCode: string
  ReasonMessage: string
  OnDates: string[] // Assuming ISO string format for DateTime
  CreatedIP: string
  CreatedEmployee: number
  CreatedSource: string
  CreatedDate: string // Assuming ISO string format for DateTime
  UpdatedEmployee: number
  UpdatedSource: string
  UpdatedDate: string // Assuming ISO string format for DateTime
}

interface WhiteListClient {
  From: string[]
  To: string[]
  Return: string[]
}

interface WhiteListWard {
  From: unknown | null // Use `any` or a more specific type if known
  To: unknown | null // Use `any` or a more specific type if known
}

export interface FeeData {
  total: number // Map to Total
  service_fee: number // Map to Service Fee
  insurance_fee: number // Map to Insurance Fee
  pick_station_fee: number // Map to Pick Station Fee
  coupon_value: number // Map to Coupon Value
  r2s_fee: number // Map to R2S Fee
  document_return: number // Map to Document Return
  double_check: number // Map to Double Check
  cod_fee: number // Map to COD Fee
  pick_remote_areas_fee: number // Map to Pick Remote Areas Fee
  deliver_remote_areas_fee: number // Map to Deliver Remote Areas Fee
  cod_failed_fee: number // Map to COD Failed Fee
}

interface ShippingFeeRequestItem {
  code: string // Unique identifier for the item
  name: string // Name of the item
  quantity: number // Quantity of the item
  price: number // Price of the item
  weight: number // Weight of the item in grams
  length: number // Length of the item in centimeters
  width: number // Width of the item in centimeters
  height: number // Height of the item in centimeters
}

export interface CalculateShippingFeeRequest {
  from_district_id: number // ID of the origin district
  from_ward_code: string // Code of the origin ward
  service_id: number // ID of the shipping service
  service_type_id: number // ID of the shipping service type
  to_district_id: number // ID of the destination district
  to_ward_code: string // Code of the destination ward
  weight: number // Total weight of the shipment in grams
  length: number // Length of the shipment in centimeters
  width: number // Width of the shipment in centimeters
  height: number // Height of the shipment in centimeters
  insurance_value: number // Value of the insurance
  cod_failed_amount: number // Amount for COD (Cash on Delivery) failure
  coupon: string | null // Coupon code (can be null)
  items: ShippingFeeRequestItem[] // List of items in the shipment
}

export interface GetDistrictRequest {
  province_id: number
}

export interface GetWardRequest {
  district_id: number
}
