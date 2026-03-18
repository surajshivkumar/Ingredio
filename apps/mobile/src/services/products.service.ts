import { API_URL } from '../config';
import { Category, CategoryItem, ProductDetail } from '../types/api';

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/products/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function getItemsByCategory(categoryId: string): Promise<CategoryItem[]> {
  const res = await fetch(`${API_URL}/products/category/${categoryId}/items`);
  if (!res.ok) throw new Error('Failed to fetch items');
  return res.json();
}

export async function getItemById(categoryId: string, itemId: string): Promise<ProductDetail> {
  const res = await fetch(`${API_URL}/products/category/${categoryId}/items/${itemId}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}
