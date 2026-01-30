// Uniform module types

export interface UniformItem {
  id: string;
  institution_id: string;
  name: string;
  description: string | null;
  category: string;
  gender: string;
  image_url: string | null;
  base_price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sizes?: UniformItemSize[];
}

export interface UniformItemSize {
  id: string;
  item_id: string;
  institution_id: string;
  size_label: string;
  price_adjustment: number;
  stock_quantity: number;
  low_stock_threshold: number;
  sku: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UniformOrder {
  id: string;
  institution_id: string;
  order_number: string;
  student_id: string;
  parent_id: string | null;
  placed_by: string | null;
  status: UniformOrderStatus;
  total_amount: number;
  currency: string;
  invoice_id: string | null;
  notes: string | null;
  collection_date: string | null;
  collected_at: string | null;
  collected_by: string | null;
  created_at: string;
  updated_at: string;
  order_lines?: UniformOrderLine[];
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    admission_number: string;
  };
}

export interface UniformOrderLine {
  id: string;
  order_id: string;
  item_id: string;
  size_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  fulfillment_status: string;
  fulfilled_quantity: number;
  created_at: string;
  item?: UniformItem;
  size?: UniformItemSize;
}

export interface UniformStockMovement {
  id: string;
  institution_id: string;
  size_id: string;
  movement_type: 'stock_in' | 'sale' | 'adjustment' | 'return';
  quantity: number;
  reference_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export type UniformOrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'ready' 
  | 'collected' 
  | 'cancelled'
  | 'partially_fulfilled';

export type UniformCategory = 'daily' | 'pe' | 'formal' | 'accessories';

export type UniformGender = 'male' | 'female' | 'unisex';

export interface CartItem {
  item: UniformItem;
  size: UniformItemSize;
  quantity: number;
}

export const uniformCategoryLabels: Record<string, string> = {
  daily: 'Daily Wear',
  pe: 'PE / Sports',
  formal: 'Formal',
  accessories: 'Accessories',
};

export const uniformGenderLabels: Record<string, string> = {
  male: 'Boys',
  female: 'Girls',
  unisex: 'Unisex',
};

export const uniformOrderStatusLabels: Record<UniformOrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  ready: 'Ready for Collection',
  collected: 'Collected',
  cancelled: 'Cancelled',
  partially_fulfilled: 'Partially Fulfilled',
};
