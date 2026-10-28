export type Category = "tcg" | "collectibles" | "consoles" | "games" | "f_and_b";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  category: Category;
  is_preorder: boolean;
  preorder_est_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  role: "customer" | "admin";
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string | null;
  guest_name: string | null;
  guest_contact: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  total_price: number;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
