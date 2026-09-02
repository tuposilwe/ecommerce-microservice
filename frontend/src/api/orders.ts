import { apiClient } from './client';
import type { CheckoutResponse, OrderDto, PageResponse, SortDirection } from '../types';

export async function getOrders(): Promise<OrderDto[]> {
  const { data } = await apiClient.get<OrderDto[]>('/orders');
  return data;
}

export async function getOrder(orderId: number): Promise<OrderDto> {
  const { data } = await apiClient.get<OrderDto>(`/orders/${orderId}`);
  return data;
}

export async function checkoutOrder(orderId: number): Promise<CheckoutResponse> {
  const { data } = await apiClient.post<CheckoutResponse>(`/orders/${orderId}/checkout`);
  return data;
}

export interface AdminOrdersQuery {
  page?: number;
  size?: number;
  status?: string;
  sort?: string;
  direction?: SortDirection;
}

export async function getAdminOrders(query: AdminOrdersQuery = {}): Promise<PageResponse<OrderDto>> {
  const { data } = await apiClient.get<PageResponse<OrderDto>>('/orders/admin', {
    params: query,
  });
  return data;
}
