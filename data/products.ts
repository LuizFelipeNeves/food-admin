export interface Product {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  discountPercentage: number;
  stock: number;
  image?: string;
  category: Category;
  store: string;
  additionals: string[];
  additionalGroups: string[];
  active: boolean;
}

export interface Category {
  _id: string;
  name: string;
  store: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  _id?: string
  name: string
  description: string
  active: boolean
  store: string
}

export interface Additional {
  _id?: string
  name: string
  price: number
  stock: number
  active: boolean
}

export interface AdditionalGroup {
  _id?: string;
  name: string;
  active: boolean;
  description?: string;
  store: string;
  minQuantity: number;
  maxQuantity: number;
  additionals: string[];
}