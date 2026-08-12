import { apiClient } from './client';
import type { OrderDto } from '../types';

export async function getOrders(): Promise<OrderDto[]> {
  const { data } = await apiClient.get<OrderDto[]>('/orders');
  return data;
}

export async function getOrder(orderId: number): Promise<OrderDto> {
  const { data } = await apiClient.get<OrderDto>(`/orders/${orderId}`);
  return data;
}
