'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/layout'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
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
import { trpc } from '@/app/_trpc/client'

// Enable server-side rendering for this page
export const dynamic = 'auto';
export const runtime = 'nodejs';

export default function ProductsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('products')
  
  const storeId = '67a05b53927e38337439322f';

  const { data: products = [], refetch: refetchProducts } = trpc.products.list.useQuery({
    storeId,
  });

  const { data: categories = [], refetch: refetchCategories } = trpc.productCategories.list.useQuery({
    storeId,
  });

  const { data: additionals = [], refetch: refetchAdditionals } = trpc.additionals.list.useQuery({
    storeId,
  });

  const { data: additionalCategories = [], refetch: refetchAdditionalCategories } = trpc.additionalCategories.list.useQuery({
    storeId,
  });

  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      refetchProducts();
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
    },
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      refetchProducts();
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    },
  });

  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      refetchProducts();
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    },
  });

  const createCategory = trpc.productCategories.create.useMutation({
    onSuccess: () => {
      refetchCategories();
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
    },
  });

  const updateCategory = trpc.productCategories.update.useMutation({
    onSuccess: () => {
      refetchCategories();
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
    },
  });

  const deleteCategory = trpc.productCategories.delete.useMutation({
    onSuccess: () => {
      refetchCategories();
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    },
  });

  const createAdditional = trpc.additionals.create.useMutation({
    onSuccess: () => {
      refetchAdditionals();
      toast({
        title: 'Success',
        description: 'Additional created successfully',
      });
    },
  });

  const updateAdditional = trpc.additionals.update.useMutation({
    onSuccess: () => {
      refetchAdditionals();
      toast({
        title: 'Success',
        description: 'Additional updated successfully',
      });
    },
  });

  const deleteAdditional = trpc.additionals.delete.useMutation({
    onSuccess: () => {
      refetchAdditionals();
      toast({
        title: 'Success',
        description: 'Additional deleted successfully',
      });
    },
  });

  const createAdditionalCategory = trpc.additionalCategories.create.useMutation({
    onSuccess: () => {
      refetchAdditionalCategories();
      toast({
        title: 'Success',
        description: 'Additional category created successfully',
      });
    },
  });

  const updateAdditionalCategory = trpc.additionalCategories.update.useMutation({
    onSuccess: () => {
      refetchAdditionalCategories();
      toast({
        title: 'Success',
        description: 'Additional category updated successfully',
      });
    },
  });

  const deleteAdditionalCategory = trpc.additionalCategories.delete.useMutation({
    onSuccess: () => {
      refetchAdditionalCategories();
      toast({
        title: 'Success',
        description: 'Additional category deleted successfully',
      });
    },
  });

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

  const handleSaveProduct = async (data: any) => {
    if (productDialog.product) {
      await updateProduct.mutate({
        id: productDialog.product._id,
        ...data,
      });
    } else {
      await createProduct.mutate({
        ...data,
        store: storeId,
      });
    }
  };

  const handleSaveCategory = async (data: any) => {
    if (categoryDialog.category) {
      await updateCategory.mutate({
        id: categoryDialog.category._id,
        ...data,
      });
    } else {
      await createCategory.mutate({
        ...data,
        store: storeId,
      });
    }
  };

  const handleSaveAdditional = async (data: any) => {
    if (additionalDialog.additional) {
      await updateAdditional.mutate({
        id: additionalDialog.additional._id,
        ...data,
      });
    } else {
      await createAdditional.mutate({
        ...data,
        store: storeId,
      });
    }
  };

  const handleSaveAdditionalCategory = async (data: any) => {
    if (additionalCategoryDialog.category) {
      await updateAdditionalCategory.mutate({
        id: additionalCategoryDialog.category._id,
        ...data,
      });
    } else {
      await createAdditionalCategory.mutate({
        ...data,
        store: storeId,
      });
    }
  };

  const handleDeleteItem = (id: string) => {
    let title = ''
    let description = ''
    let onConfirm = () => {}

    switch (activeTab) {
      case 'products':
        title = 'Excluir Produto'
        description = 'Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.'
        onConfirm = () => {
          deleteProduct.mutate({ id });
        }
        break
      case 'categories':
        title = 'Excluir Categoria'
        description = 'Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.'
        onConfirm = () => {
          deleteCategory.mutate({ id });
        }
        break
      case 'additionals':
        title = 'Excluir Adicional'
        description = 'Tem certeza que deseja excluir este adicional? Esta ação não pode ser desfeita.'
        onConfirm = () => {
          deleteAdditional.mutate({ id });
        }
        break
      case 'additional-categories':
        title = 'Excluir Categoria de Adicionais'
        description = 'Tem certeza que deseja excluir esta categoria de adicionais? Esta ação não pode ser desfeita.'
        onConfirm = () => {
          deleteAdditionalCategory.mutate({ id });
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
      <div className="flex flex-col h-full">
        <div className="p-4 md:p-8 pt-6 space-y-4 bg-background">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Produtos</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie seus produtos, categorias e adicionais
              </p>
            </div>

            <Button onClick={handleNewItem} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {getAddButtonText()}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="products" className="h-full flex flex-col" onValueChange={setActiveTab}>
          <div className="border-b bg-background sticky top-0 z-10">
            <div className="px-4 md:px-8">
              <TabsList className="w-full sm:w-auto inline-flex">
                <TabsTrigger value="products" className="flex-1 sm:flex-none">Produtos</TabsTrigger>
                <TabsTrigger value="categories" className="flex-1 sm:flex-none">Categorias</TabsTrigger>
                <TabsTrigger value="additionals" className="flex-1 sm:flex-none">Adicionais</TabsTrigger>
                <TabsTrigger value="additional-categories" className="flex-1 sm:flex-none">Cat. Adicionais</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-4 md:px-8 pb-4 md:pb-8">
            <TabsContent value="products" className="mt-4 h-[calc(100vh-12rem)]">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Produtos</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-auto">
                      <DataTable
                        columns={productColumns({ onEdit: handleEditItem, onDelete: handleDeleteItem })}
                        data={products}
                        searchKey="name"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="mt-4 h-[calc(100vh-12rem)]">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Categorias de Produtos</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-auto">
                      <DataTable
                        columns={productCategoryColumns({ onEdit: handleEditItem, onDelete: handleDeleteItem })}
                        data={categories}
                        searchKey="name"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="additionals" className="mt-4 h-[calc(100vh-12rem)]">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Adicionais</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-auto">
                      <DataTable
                        columns={additionalColumns({ onEdit: handleEditItem, onDelete: handleDeleteItem })}
                        data={additionals}
                        searchKey="name"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="additional-categories" className="mt-4 h-[calc(100vh-12rem)]">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Categorias de Adicionais</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-auto">
                      <DataTable
                        columns={additionalCategoryColumns({ onEdit: handleEditItem, onDelete: handleDeleteItem })}
                        data={additionalCategories}
                        searchKey="name"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <ProductDialog
        open={productDialog.open}
        onOpenChange={(open) => setProductDialog({ open, product: open ? productDialog.product : null })}
        product={productDialog.product}
        categories={categories}
        additionalCategories={additionalCategories}
        onSave={handleSaveProduct}
      />

      <CategoryDialog
        open={categoryDialog.open}
        onOpenChange={(open) => setCategoryDialog({ open, category: open ? categoryDialog.category : null })}
        category={categoryDialog.category}
        onSave={handleSaveCategory}
      />

      <AdditionalDialog
        open={additionalDialog.open}
        onOpenChange={(open) => setAdditionalDialog({ open, additional: open ? additionalDialog.additional : null })}
        additional={additionalDialog.additional}
        categories={additionalCategories}
        onSave={handleSaveAdditional}
      />

      <AdditionalCategoryDialog
        open={additionalCategoryDialog.open}
        onOpenChange={(open) => setAdditionalCategoryDialog({ open, category: open ? additionalCategoryDialog.category : null })}
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
