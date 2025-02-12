export interface Product {
  _id: string
  name: string
  description: string
  price: number
  categoryId: string
  subcategoryId?: string
  image?: string
  active: boolean
  additionalCategories: string[]
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

export interface AdditionalCategory {
  _id: string
  name: string
  description: string
  minQuantity: number
  maxQuantity: number
  active: boolean
  additionals: string[] // IDs dos adicionais vinculados
}

// Mock data
export const mockProductCategories: ProductCategory[] = [
  {
    _id: '1',
    name: 'Pizzas',
    description: 'Pizzas tradicionais e especiais',
    active: true,
    subcategories: [
      {
        _id: '1',
        name: 'Pizzas Tradicionais',
        description: 'Sabores clássicos',
        categoryId: '1',
        active: true,
      },
      {
        _id: '2',
        name: 'Pizzas Especiais',
        description: 'Sabores premium',
        categoryId: '1',
        active: true,
      },
    ],
  },
  {
    _id: '2',
    name: 'Bebidas',
    description: 'Refrigerantes, sucos e cervejas',
    active: true,
    subcategories: [
      {
        _id: '3',
        name: 'Refrigerantes',
        description: 'Bebidas não alcoólicas',
        categoryId: '2',
        active: true,
      },
      {
        _id: '4',
        name: 'Cervejas',
        description: 'Bebidas alcoólicas',
        categoryId: '2',
        active: true,
      },
    ],
  },
]

export const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'Pizza Margherita',
    description: 'Molho de tomate, mussarela, manjericão fresco',
    price: 45.90,
    categoryId: '1',
    subcategoryId: '1',
    active: true,
    additionalCategories: ['1', '2'],
  },
  {
    _id: '2',
    name: 'Coca-Cola 2L',
    description: 'Refrigerante Coca-Cola 2 litros',
    price: 12.90,
    categoryId: '2',
    subcategoryId: '3',
    active: true,
    additionalCategories: [],
  },
]

export const mockAdditionalCategories: AdditionalCategory[] = [
  {
    _id: '1',
    name: 'Bordas',
    description: 'Opções de bordas para pizza',
    minQuantity: 0,
    maxQuantity: 1,
    active: true,
    additionals: ['1'],
  },
  {
    _id: '2',
    name: 'Coberturas Extras',
    description: 'Ingredientes adicionais',
    minQuantity: 0,
    maxQuantity: 5,
    active: true,
    additionals: ['2'],
  },
]

export const mockAdditionals: Additional[] = [
  {
    _id: '1',
    name: 'Borda de Catupiry',
    description: 'Borda recheada com catupiry',
    price: 8.90,
    categoryId: '1',
    active: true,
  },
  {
    _id: '2',
    name: 'Bacon Extra',
    description: 'Porção extra de bacon',
    price: 5.90,
    categoryId: '2',
    active: true,
  },
]
