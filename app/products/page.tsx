'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/layout'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { 
  Product as IProduct,
  ProductCategory as IProductCategory,
  Additional as IAdditional,
  AdditionalCategory as IAdditionalCategory
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
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table } from '@tanstack/react-table'

// Enable server-side rendering for this page
export const dynamic = 'auto';
export const runtime = 'nodejs';

interface DialogState<T> {
  open: boolean;
  item: T | null;
}

interface DeleteDialogState {
  open: boolean;
  id: string;
  type: string;
}

type Product = IProduct & {
  _id: string;
  name: string;
  description?: string;
  price: number;
  active: boolean;
  category: string;
  additionals?: string[];
  additionalGroups?: string[];
}

type Category = IProductCategory & {
  _id: string;
  name: string;
  active: boolean;
}

type Additional = IAdditional & {
  _id: string;
  name: string;
  price: number;
  active: boolean;
}

type AdditionalCategory = IAdditionalCategory & {
  _id: string;
  name: string;
  additionals: string[];
  active: boolean;
}

export default function ProductsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>('products')
  const [table, setTable] = useState<Table<any> | null>(null)
  
  const storeId = '67a05b53927e38337439322f';

  const { data: products, isLoading: productsIsLoading } = trpc.products.list.useQuery({
    storeId,
  }, {
    onSuccess: (data) => {
      console.log('Products loaded:', data);
    }
  });

  const { data: categories, isLoading: categoriesIsLoading } = trpc.productCategories.list.useQuery({
    storeId,
  }, {
    onSuccess: (data) => {
      console.log('Categories loaded:', data);
    }
  });

  const { data: additionals, isLoading: additionalsIsLoading } = trpc.additionals.list.useQuery({
    storeId,
  }, {
    onSuccess: (data) => {
      console.log('Additionals loaded:', data);
    }
  });

  const { data: additionalCategories, isLoading: additionalCategoriesIsLoading } = trpc.additionalCategories.list.useQuery({
    storeId,
  }, {
    onSuccess: (data) => {
      console.log('Additional Categories loaded:', data);
    }
  });

  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
    },
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    },
  });

  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    },
  });

  const createCategory = trpc.productCategories.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
    },
  });

  const updateCategory = trpc.productCategories.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
    },
  });

  const deleteCategory = trpc.productCategories.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    },
  });

  const createAdditional = trpc.additionals.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Additional created successfully',
      });
    },
  });

  const updateAdditional = trpc.additionals.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Additional updated successfully',
      });
    },
  });

  const deleteAdditional = trpc.additionals.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Additional deleted successfully',
      });
    },
  });

  const createAdditionalCategory = trpc.additionalCategories.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Additional category created successfully',
      });
    },
  });

  const updateAdditionalCategory = trpc.additionalCategories.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Additional category updated successfully',
      });
    },
  });

  const deleteAdditionalCategory = trpc.additionalCategories.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Additional category deleted successfully',
      });
    },
  });

  // Estados para controle dos modais
  const [productDialog, setProductDialog] = useState<{ open: boolean; item: Product | undefined }>({ open: false, item: undefined })
  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; item: Category | null }>({ open: false, item: null })
  const [additionalDialog, setAdditionalDialog] = useState<{ open: boolean; item: Additional | null }>({ open: false, item: null })
  const [additionalCategoryDialog, setAdditionalCategoryDialog] = useState<{ open: boolean; item: AdditionalCategory | null }>({ open: false, item: null })
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ open: false, id: '', type: '', })

  const handleNewItem = () => {
    switch (activeTab) {
      case 'products':
        setProductDialog({ open: true, item: undefined })
        break
      case 'categories':
        setCategoryDialog({ open: true, item: null })
        break
      case 'additionals':
        setAdditionalDialog({ open: true, item: null })
        break
      case 'additional-categories':
        setAdditionalCategoryDialog({ open: true, item: null })
        break
    }
  }

  const handleEditItem = (item: any) => {
    switch (activeTab) {
      case 'products':
        setProductDialog({ open: true, item })
        break
      case 'categories':
        setCategoryDialog({ open: true, item })
        break
      case 'additionals':
        setAdditionalDialog({ open: true, item })
        break
      case 'additional-categories':
        setAdditionalCategoryDialog({ open: true, item })
        break
    }
  }

  const handleSaveProduct = async (data: any) => {
    if (productDialog.item) {
      await updateProduct.mutate({
        _id: productDialog.item._id,
        ...data,
      });
    } else {
      await createProduct.mutate(data);
    }
    setProductDialog({ open: false, item: undefined });
  };

  const handleSaveCategory = async (data: any) => {
    if (categoryDialog.item) {
      await updateCategory.mutate({
        _id: categoryDialog.item._id,
        ...data,
      });
    } else {
      await createCategory.mutate(data);
    }
    setCategoryDialog({ open: false, item: null });
  };

  const handleSaveAdditional = async (data: any) => {
    if (additionalDialog.item) {
      await updateAdditional.mutate({
        _id: additionalDialog.item._id,
        ...data,
      });
    } else {
      await createAdditional.mutate(data);
    }
    setAdditionalDialog({ open: false, item: null });
  };

  const handleSaveAdditionalCategory = async (data: any) => {
    if (additionalCategoryDialog.item) {
      await updateAdditionalCategory.mutate({
        _id: additionalCategoryDialog.item._id,
        ...data,
      });
    } else {
      await createAdditionalCategory.mutate(data);
    }
    setAdditionalCategoryDialog({ open: false, item: null });
  };

  const handleDeleteItem = (id: string) => {
    let type = ''
    let onConfirm = () => {}

    switch (activeTab) {
      case 'products':
        type = 'product'
        onConfirm = () => {
          deleteProduct.mutate({ _id: id });
        }
        break
      case 'categories':
        type = 'category'
        onConfirm = () => {
          deleteCategory.mutate({ _id: id });
        }
        break
      case 'additionals':
        type = 'additional'
        onConfirm = () => {
          deleteAdditional.mutate({ _id: id });
        }
        break
      case 'additional-categories':
        type = 'additional-category'
        onConfirm = () => {
          deleteAdditionalCategory.mutate({ _id: id });
        }
        break
    }

    setDeleteDialog({
      open: true,
      id,
      type,
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

  const handleTableChange = (newTable: Table<any>) => {
    setTable(newTable);
  };

  const getDeleteDialogProps = () => {
    let title = '';
    let description = '';
    let onConfirm = () => {};

    switch (deleteDialog.type) {
      case 'product':
        title = 'Excluir Produto';
        description = 'Tem certeza que deseja excluir este produto?';
        onConfirm = () => deleteProduct.mutate({ _id: deleteDialog.id });
        break;
      case 'category':
        title = 'Excluir Categoria';
        description = 'Tem certeza que deseja excluir esta categoria?';
        onConfirm = () => deleteCategory.mutate({ _id: deleteDialog.id });
        break;
      case 'additional':
        title = 'Excluir Adicional';
        description = 'Tem certeza que deseja excluir este adicional?';
        onConfirm = () => deleteAdditional.mutate({ _id: deleteDialog.id });
        break;
      case 'additional-category':
        title = 'Excluir Categoria de Adicionais';
        description = 'Tem certeza que deseja excluir esta categoria de adicionais?';
        onConfirm = () => deleteAdditionalCategory.mutate({ _id: deleteDialog.id });
        break;
    }

    return {
      title,
      description,
      onConfirm,
    };
  };

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            {activeTab === "products" && "Produtos"}
            {activeTab === "categories" && "Categorias"}
            {activeTab === "additionals" && "Adicionais"}
            {activeTab === "additional-categories" && "Categorias de Adicionais"}
          </h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0">
              <TabsList>
                <TabsTrigger value="products">Produtos</TabsTrigger>
                <TabsTrigger value="categories">Categorias</TabsTrigger>
                <TabsTrigger value="additionals">Adicionais</TabsTrigger>
                <TabsTrigger value="additional-categories">Cat. Adicionais</TabsTrigger>
              </TabsList>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {activeTab === "products" && (
                <>
                  <Input
                    placeholder="Filtrar produtos..."
                    value={(table?.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table?.getColumn('name')?.setFilterValue(event.target.value)}
                    className="w-[180px]"
                  />
                  <Button onClick={() => setProductDialog({ open: true, item: undefined })} disabled={!categories || !additionalCategories}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Produto
                  </Button>
                </>
              )}
              {activeTab === "categories" && (
                <>
                  <Input
                    placeholder="Filtrar categorias..."
                    value={(table?.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table?.getColumn('name')?.setFilterValue(event.target.value)}
                    className="w-[180px]"
                  />
                  <Button onClick={() => setCategoryDialog({ open: true, item: null })}>
                    <Plus className="mr-2 h-4 w-4" /> Nova Categoria
                  </Button>
                </>
              )}
              {activeTab === "additionals" && (
                <>
                  <Input
                    placeholder="Filtrar adicionais..."
                    value={(table?.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table?.getColumn('name')?.setFilterValue(event.target.value)}
                    className="w-[180px]"
                  />
                  <Button onClick={() => setAdditionalDialog({ open: true, item: null })}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Adicional
                  </Button>
                </>
              )}
              {activeTab === "additional-categories" && (
                <>
                  <Input
                    placeholder="Filtrar categorias..."
                    value={(table?.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table?.getColumn('name')?.setFilterValue(event.target.value)}
                    className="w-[180px]"
                  />
                  <Button onClick={() => setAdditionalCategoryDialog({ open: true, item: null })}>
                    <Plus className="mr-2 h-4 w-4" /> Nova Categoria
                  </Button>
                </>
              )}
            </div>
          </div>

          <TabsContent value="products">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {productsIsLoading ? (
                    <div className="w-full h-24 flex items-center justify-center">
                      <span className="text-muted-foreground">Carregando produtos...</span>
                    </div>
                  ) : products && products.length > 0 ? (
                    <DataTable
                      columns={productColumns({ onEdit: handleEditItem, onDelete: handleDeleteItem })}
                      data={products}
                      onTableChange={handleTableChange}
                    />
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center">
                      <span className="text-muted-foreground">Nenhum produto encontrado</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {categoriesIsLoading ? (
                    <div className="w-full h-24 flex items-center justify-center">
                      <span className="text-muted-foreground">Carregando categorias...</span>
                    </div>
                  ) : categories && categories.length > 0 ? (
                    <DataTable
                      columns={productCategoryColumns({ onEdit: handleEditItem, onDelete: handleDeleteItem })}
                      data={categories}
                      onTableChange={handleTableChange}
                    />
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center">
                      <span className="text-muted-foreground">Nenhuma categoria encontrada</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additionals">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {additionalsIsLoading ? (
                    <div className="w-full h-24 flex items-center justify-center">
                      <span className="text-muted-foreground">Carregando adicionais...</span>
                    </div>
                  ) : additionals && additionals.length > 0 ? (
                    <DataTable
                      columns={additionalColumns({ onEdit: handleEditItem, onDelete: handleDeleteItem })}
                      data={additionals}
                      onTableChange={handleTableChange}
                    />
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center">
                      <span className="text-muted-foreground">Nenhum adicional encontrado</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional-categories">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {additionalCategoriesIsLoading ? (
                    <div className="w-full h-24 flex items-center justify-center">
                      <span className="text-muted-foreground">Carregando categorias...</span>
                    </div>
                  ) : additionalCategories && additionalCategories.length > 0 ? (
                    <DataTable
                      columns={additionalCategoryColumns({ onEdit: handleEditItem, onDelete: handleDeleteItem })}
                      data={additionalCategories}
                      onTableChange={handleTableChange}
                    />
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center">
                      <span className="text-muted-foreground">Nenhuma categoria encontrada</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ProductDialog 
          open={productDialog.open} 
          onOpenChange={(open) => setProductDialog({ open, item: undefined })}
          product={productDialog.item}
          categories={categories || []}
          additionalCategories={additionalCategories || []}
          onSave={handleSaveProduct}
        />
        <CategoryDialog 
          open={categoryDialog.open} 
          onOpenChange={(open) => setCategoryDialog({ open, item: null })}
          category={categoryDialog.item}
          onSave={handleSaveCategory}
        />
        <AdditionalDialog 
          open={additionalDialog.open} 
          onOpenChange={(open) => setAdditionalDialog({ open, item: null })}
          additional={additionalDialog.item}
          categories={additionalCategories || []}
          onSave={handleSaveAdditional}
        />
        <AdditionalCategoryDialog 
          open={additionalCategoryDialog.open} 
          onOpenChange={(open) => setAdditionalCategoryDialog({ open, item: null })}
          category={additionalCategoryDialog.item}
          additionals={additionals || []}
          onSave={handleSaveAdditionalCategory}
        />
        <DeleteDialog 
          {...deleteDialog}
          {...getDeleteDialogProps()}
          onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        />
      </div>
    </Layout>
  );
}
