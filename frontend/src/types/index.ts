export type Role = 'USER' | 'ADMIN';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface UserDto {
  user_id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface CategoryDto {
  id: number;
  name: string;
}

export interface ProductDto {
  id?: number;
  name: string;
  price: number;
  description: string;
  hasImage: boolean;
  categoryId: number | null;
}

export interface CartProductDto {
  id: number;
  name: string;
  price: number;
}

export interface CartItemDto {
  product: CartProductDto;
  quantity: number;
  totalPrice: number;
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  totalPrice: number;
}

export interface OrderProductDto {
  id: number;
  name: string;
  price: number;
}

export interface OrderItemDto {
  product: OrderProductDto;
  quantity: number;
  totalPrice: number;
}

export interface OrderDto {
  id: number;
  status: string;
  createdAt: string;
  items: OrderItemDto[];
  totalPrice: number;
}

export interface CheckoutResponse {
  orderId: number;
  checkoutUrl: string;
}

export interface ApiFieldErrors {
  [field: string]: string;
}
