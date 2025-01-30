'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/layout'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  mockProducts, 
  mockProductCategories,
  mockAdditionals,
  mockAdditionalCategories,
  Product,
  ProductCategory,
  Additional,
  AdditionalCategory
} from '@/data/products'
import { 
  productColumns, 
  productCategoryColumns,
  additionalColumns,
  additionalCategoryColumns 
} from './columns'
import { ProductDialog } from '@/components/products/product-dialog'
import { CategoryDialog } from '@/components/products/category-dialog'
import { AdditionalDialog } from '@/components/products/additional-dialog'
import { AdditionalCategoryDialog } from '@/components/products/additional-category-dialog'
import { DeleteDialog } from '@/components/products/delete-dialog'
import { useToast } from '@/components/ui/use-toast'

export default function ProductsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState(mockProducts)
  const [categories, setCategories] = useState(mockProductCategories)
  const [additionals, setAdditionals] = useState(mockAdditionals)
  const [additionalCategories, setAdditionalCategories] = useState(mockAdditionalCategories)
  
  // Estados para controle dos modais
  const [productDialog, setProductDialog] = useState({ open: false, product: null as Product | null })
  const [categoryDialog, setCategoryDialog] = useState({ open: false, category: null as ProductCategory | null })
  const [additionalDialog, setAdditionalDialog] = useState({ open: false, additional: null as Additional | null })
  const [additionalCategoryDialog, setAdditionalCategoryDialog] = useState({ 
    open: false, 
    category: null as AdditionalCategory | null 
  })
  const [deleteDialog, setDeleteDialog] = useState({ 
    open: false, 
    title: '',
    description: '',
    onConfirm: () => {},
  })

  const handleNewItem = () => {
    switch (activeTab) {
      case 'products':
        setProductDialog({ open: true, product: null })
        break
      case 'categories':
        setCategoryDialog({ open: true, category: null })
        break
      case 'additionals':
        setAdditionalDialog({ open: true, additional: null })
        break
      case 'additional-categories':
        setAdditionalCategoryDialog({ open: true, category: null })
        break
    }
  }

  const handleEditItem = (item: any) => {
    switch (activeTab) {
      case 'products':
        setProductDialog({ open: true, product: item })
        break
      case 'categories':
        setCategoryDialog({ open: true, category: item })
        break
      case 'additionals':
        setAdditionalDialog({ open: true, additional: item })
        break
      case 'additional-categories':
        setAdditionalCategoryDialog({ open: true, category: item })
        break
    }
  }

  const handleSaveProduct = (product: Product) => {
    if (productDialog.product) {
      setProducts(products.map(p => p.id === product.id ? product : p))
      toast({ title: 'Produto atualizado com sucesso!' })
    } else {
      setProducts([...products, product])
      toast({ title: 'Produto criado com sucesso!' })
    }
  }

  const handleSaveCategory = (category: ProductCategory) => {
    if (categoryDialog.category) {
      setCategories(categories.map(c => c.id === category.id ? category : c))
      toast({ title: 'Categoria atualizada com sucesso!' })
    } else {
      setCategories([...categories, category])
      toast({ title: 'Categoria criada com sucesso!' })
    }
  }

  const handleSaveAdditional = (additional: Additional) => {
    if (additionalDialog.additional) {
      setAdditionals(additionals.map(a => a.id === additional.id ? additional : a))
      toast({ title: 'Adicional atualizado com sucesso!' })
    } else {
      setAdditionals([...additionals, additional])
      toast({ title: 'Adicional criado com sucesso!' })
    }
  }

  const handleSaveAdditionalCategory = (category: AdditionalCategory) => {
    if (additionalCategoryDialog.category) {
      setAdditionalCategories(categories => 
        categories.map(c => c.id === category.id ? category : c)
      )
      toast({ title: 'Categoria de adicionais atualizada com sucesso!' })
    } else {
      setAdditionalCategories([...additionalCategories, category])
      toast({ title: 'Categoria de adicionais criada com sucesso!' })
    }
  }

  const handleDeleteItem = (id: string) => {
    let title = ''
    let description = ''
    let onConfirm = () => {}

    switch (activeTab) {
      case 'products':
        title = 'Excluir Produto'
        description = 'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.'
        onConfirm = () => {
          setProducts(products.filter(p => p.id !== id))
          toast({ title: 'Produto excluído com sucesso!' })
        }
        break
      case 'categories':
        title = 'Excluir Categoria'
        description = 'Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.'
        onConfirm = () => {
          setCategories(categories.filter(c => c.id !== id))
          toast({ title: 'Categoria excluída com sucesso!' })
        }
        break
      case 'additionals':
        title = 'Excluir Adicional'
        description = 'Tem certeza que deseja excluir este adicional? Esta ação não pode ser desfeita.'
        onConfirm = () => {
          setAdditionals(additionals.filter(a => a.id !== id))
          toast({ title: 'Adicional excluído com sucesso!' })
        }
        break
      case 'additional-categories':
        title = 'Excluir Categoria de Adicionais'
        description = 'Tem certeza que deseja excluir esta categoria de adicionais? Esta ação não pode ser desfeita.'
        onConfirm = () => {
          setAdditionalCategories(categories => categories.filter(c => c.id !== id))
          toast({ title: 'Categoria de adicionais excluída com sucesso!' })
        }
        break
    }

    setDeleteDialog({
      open: true,
      title,
      description,
      onConfirm,
    })
  }

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'products':
        return 'Novo Produto'
      case 'categories':
        return 'Nova Categoria'
      case 'additionals':
        return 'Novo Adicional'
      case 'additional-categories':
        return 'Nova Categoria de Adicional'
      default:
        return 'Novo'
    }
  }

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus produtos, categorias e adicionais
            </p>
          </div>

          <Button onClick={handleNewItem}>
            <Plus className="mr-2 h-4 w-4" />
            {getAddButtonText()}
          </Button>
        </div>

        <Tabs defaultValue="products" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="additionals">Adicionais</TabsTrigger>
            <TabsTrigger value="additional-categories">Categorias de Adicionais</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={productColumns({ onEdit: handleEditItem, onDelete: handleDeleteItem })}
                  data={products}
                  searchKey="name"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Categorias de Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={productCategoryColumns({ onEdit: handleEditItem, onDelete: handleDeleteItem })}
                  data={categories}
                  searchKey="name"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additionals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Adicionais</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={additionalColumns({ onEdit: handleEditItem, onDelete: handleDeleteItem })}
                  data={additionals}
                  searchKey="name"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional-categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Categorias de Adicionais</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={additionalCategoryColumns({ onEdit: handleEditItem, onDelete: handleDeleteItem })}
                  data={additionalCategories}
                  searchKey="name"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ProductDialog
        open={productDialog.open}
        onOpenChange={(open) => setProductDialog({ open, product: null })}
        product={productDialog.product}
        categories={categories}
        additionalCategories={additionalCategories}
        onSave={handleSaveProduct}
      />

      <CategoryDialog
        open={categoryDialog.open}
        onOpenChange={(open) => setCategoryDialog({ open, category: null })}
        category={categoryDialog.category}
        onSave={handleSaveCategory}
      />

      <AdditionalDialog
        open={additionalDialog.open}
        onOpenChange={(open) => setAdditionalDialog({ open, additional: null })}
        additional={additionalDialog.additional}
        categories={additionalCategories}
        onSave={handleSaveAdditional}
      />

      <AdditionalCategoryDialog
        open={additionalCategoryDialog.open}
        onOpenChange={(open) => setAdditionalCategoryDialog({ open, category: null })}
        category={additionalCategoryDialog.category}
        additionals={additionals}
        onSave={handleSaveAdditionalCategory}
      />

      <DeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title={deleteDialog.title}
        description={deleteDialog.description}
        onConfirm={deleteDialog.onConfirm}
      />
    </Layout>
  )
}
