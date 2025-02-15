export interface Product {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  discountPercentage: number;
  stock: number;
  image?: string;
  category: string;
  store: string;
  additionals: string[];
  additionalGroups: string[];
  active: boolean;
}

export interface ProductCategory {
  _id: string
  name: string
  description: string
  active: boolean
  subcategories: ProductSubcategory[]
}

export interface ProductSubcategory {
  _id: string
  name: string
  description: string
  categoryId: string
  active: boolean
}

export interface Additional {
  _id: string
  name: string
  description: string
  price: number
  categoryId: string
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