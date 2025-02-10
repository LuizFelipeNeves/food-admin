export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discountPercentage: number;
  image?: string;
  category: string;
  store: string;
  additionals?: string[];
  additionalGroups?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  store: string;
  createdAt: string;
  updatedAt: string;
}

export interface Additional {
  _id: string;
  name: string;
  price: number;
  store: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdditionalGroup {
  _id: string;
  name: string;
  additionals: string[];
  store: string;
  createdAt: string;
  updatedAt: string;
}
