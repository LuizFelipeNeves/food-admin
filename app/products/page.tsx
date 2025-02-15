'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/layout'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Product, ProductCategory, Additional, AdditionalGroup } from '@/data/products'
import { 
  productColumns, 
  productCategoryColumns,
  additionalColumns,
  additionalGroupColumns 
} from './columns'
import { ProductDialog } from '@/components/products/product-dialog'
import { CategoryDialog } from '@/components/products/category-dialog'
import { AdditionalDialog } from '@/components/products/additional-dialog'
import { AdditionalGroupDialog } from '@/components/products/additional-group-dialog'
import { DeleteDialog } from '@/components/products/delete-dialog'
import toast from 'react-hot-toast'
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

export default function ProductsPage() {
  const utils = trpc.useUtils()
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

  const { data: additionalGroups, isLoading: additionalGroupsIsLoading } = trpc.additionalCategories.list.useQuery({
    storeId,
  }, {
    onSuccess: (data) => {
      console.log('Additional Groups loaded:', data);
    }
  });

  const createProduct = trpc.products.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Produto "${data.name}" criado com sucesso!`);
      utils.products.list.invalidate({ storeId });
    },
    onError: () => {
      toast.error('Erro ao criar produto');
    }
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: (data) => {
      toast.success(`Produto "${data.name}" atualizado com sucesso!`);
      utils.products.list.invalidate({ storeId });
    },
    onError: () => {
      toast.error('Erro ao atualizar produto');
    }
  });

  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success('Produto excluído com sucesso!');
      utils.products.list.invalidate({ storeId });
    },
    onError: () => {
      toast.error('Erro ao excluir produto');
    }
  });

  const createCategory = trpc.productCategories.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Categoria "${data.name}" criada com sucesso!`);
      utils.productCategories.list.invalidate({ storeId });
    },
    onError: () => {
      toast.error('Erro ao criar categoria');
    }
  });

  const updateCategory = trpc.productCategories.update.useMutation({
    onSuccess: (data) => {
      toast.success(`Categoria "${data.name}" atualizada com sucesso!`);
      utils.productCategories.list.invalidate({ storeId });
    },
    onError: () => {
      toast.error('Erro ao atualizar categoria');
    }
  });

  const deleteCategory = trpc.productCategories.delete.useMutation({
    onSuccess: () => {
      toast.success('Categoria excluída com sucesso!');
      utils.productCategories.list.invalidate({ storeId });
    },
    onError: () => {
      toast.error('Erro ao excluir categoria');
    }
  });

  const createAdditional = trpc.additionals.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Adicional "${data.name}" criado com sucesso!`);
      utils.additionals.list.invalidate({ storeId });
    },
    onError: () => {
      toast.error('Erro ao criar adicional');
    }
  });

  const updateAdditional = trpc.additionals.update.useMutation({
    onSuccess: (data) => {
      toast.success(`Adicional "${data.name}" atualizado com sucesso!`);
      utils.additionals.list.invalidate({ storeId });
    },
    onError: () => {
      toast.error('Erro ao atualizar adicional');
    }
  });

  const deleteAdditional = trpc.additionals.delete.useMutation({
    onSuccess: () => {
      toast.success('Adicional excluído com sucesso!');
      utils.additionals.list.invalidate({ storeId });
    },
    onError: () => {
      toast.error('Erro ao excluir adicional');
    }
  });

  const createAdditionalGroup = trpc.additionalCategories.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Grupo de adicionais "${data.name}" criado com sucesso!`);
      utils.additionalCategories.list.invalidate({ storeId });
    },
    onError: () => {
      toast.error('Erro ao criar grupo de adicionais');
    }
  });

  const updateAdditionalGroup = trpc.additionalCategories.update.useMutation({
    onSuccess: (data) => {
      toast.success(`Grupo de adicionais "${data.name}" atualizado com sucesso!`);
      utils.additionalCategories.list.invalidate({ storeId });
    },
    onError: () => {
      toast.error('Erro ao atualizar grupo de adicionais');
    }
  });

  const deleteAdditionalGroup = trpc.additionalCategories.delete.useMutation({
    onSuccess: () => {
      toast.success('Grupo de adicionais excluído com sucesso!');
      utils.additionalCategories.list.invalidate({ storeId });
    },
    onError: () => {
      toast.error('Erro ao excluir grupo de adicionais');
    }
  });

  const handleSaveProduct = async (data: any) => {
    try {
      if (productDialog.item) {
        await updateProduct.mutateAsync({
          _id: productDialog.item._id,
          ...data,
          store: storeId
        });
      } else {
        await createProduct.mutateAsync(data);
      }
      setProductDialog({ open: false, item: null });
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Erro ao salvar produto');
    }
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

  const handleSaveAdditionalGroup = async (data: any) => {
    if (additionalGroupDialog.item) {
      await updateAdditionalGroup.mutate({
        _id: additionalGroupDialog.item._id,
        ...data,
      });
    } else {
      await createAdditionalGroup.mutate(data);
    }
    setAdditionalGroupDialog({ open: false, item: null });
  };

  // Estados para controle dos modais
  const [productDialog, setProductDialog] = useState<DialogState<Product | null>>({
    open: false,
    item: null,
  })
  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; item: ProductCategory | null }>({ open: false, item: null })
  const [additionalDialog, setAdditionalDialog] = useState<{ open: boolean; item: Additional | null }>({ open: false, item: null })
  const [additionalGroupDialog, setAdditionalGroupDialog] = useState<{ open: boolean; item: AdditionalGroup | null }>({ open: false, item: null })
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ open: false, id: '', type: '', })

  const handleNewItem = () => {
    switch (activeTab) {
      case 'products':
        setProductDialog({ open: true, item: null })
        break
      case 'categories':
        setCategoryDialog({ open: true, item: null })
        break
      case 'additionals':
        setAdditionalDialog({ open: true, item: null })
        break
      case 'additional-groups':
        setAdditionalGroupDialog({ open: true, item: null })
        break
    }
  }

  const handleEditItem = (type: string, item: any) => {
    switch (type) {
      case 'products':
        setProductDialog({ open: true, item })
        break
      case 'categories':
        setCategoryDialog({ open: true, item })
        break
      case 'additionals':
        setAdditionalDialog({ open: true, item })
        break
      case 'additional-groups':
        setAdditionalGroupDialog({ open: true, item })
        break
    }
  }

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
      case 'additional-groups':
        type = 'additional-group'
        onConfirm = () => {
          deleteAdditionalGroup.mutate({ _id: id });
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
      case 'additional-groups':
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
      case 'additional-group':
        title = 'Excluir Categoria de Adicionais';
        description = 'Tem certeza que deseja excluir esta categoria de adicionais?';
        onConfirm = () => deleteAdditionalGroup.mutate({ _id: deleteDialog.id });
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
      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="flex-none space-y-4 p-8 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">
                {activeTab === "products" && "Produtos"}
                {activeTab === "categories" && "Categorias"}
                {activeTab === "additionals" && "Adicionais"}
                {activeTab === "additional-groups" && "Categorias de Adicionais"}
              </h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="w-full sm:w-auto overflow-x-auto">
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="products" className="flex-1 sm:flex-none">Produtos</TabsTrigger>
                    <TabsTrigger value="categories" className="flex-1 sm:flex-none">Categorias</TabsTrigger>
                    <TabsTrigger value="additionals" className="flex-1 sm:flex-none">Adicionais</TabsTrigger>
                    <TabsTrigger value="additional-groups" className="flex-1 sm:flex-none whitespace-nowrap">Cat. Adicionais</TabsTrigger>
                  </TabsList>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  {activeTab === "products" && (
                    <>
                      <Input
                        placeholder="Filtrar produtos..."
                        value={(table?.getColumn('name')?.getFilterValue() as string) ?? ''}
                        onChange={(event) => table?.getColumn('name')?.setFilterValue(event.target.value)}
                        className="w-full sm:w-[180px]"
                      />
                      <Button 
                        onClick={() => setProductDialog({ open: true, item: null })} 
                        disabled={!categories || !additionalGroups}
                        className="w-full sm:w-auto whitespace-nowrap"
                      >
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
                        className="w-full sm:w-[180px]"
                      />
                      <Button 
                        onClick={() => setCategoryDialog({ open: true, item: null })}
                        className="w-full sm:w-auto whitespace-nowrap"
                      >
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
                        className="w-full sm:w-[180px]"
                      />
                      <Button 
                        onClick={() => setAdditionalDialog({ open: true, item: null })}
                        className="w-full sm:w-auto whitespace-nowrap"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Novo Adicional
                      </Button>
                    </>
                  )}
                  {activeTab === "additional-groups" && (
                    <>
                      <Input
                        placeholder="Filtrar categorias..."
                        value={(table?.getColumn('name')?.getFilterValue() as string) ?? ''}
                        onChange={(event) => table?.getColumn('name')?.setFilterValue(event.target.value)}
                        className="w-full sm:w-[180px]"
                      />
                      <Button 
                        onClick={() => setAdditionalGroupDialog({ open: true, item: null })}
                        className="w-full sm:w-auto whitespace-nowrap"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Nova Categoria
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-auto px-1">
                <TabsContent value="products" className="h-full">
                  <div className="space-y-4 h-full">
                    {productsIsLoading ? (
                      <div className="w-full h-24 flex items-center justify-center">
                        <span className="text-muted-foreground">Carregando produtos...</span>
                      </div>
                    ) : products && products.length > 0 ? (
                      <DataTable
                        columns={productColumns({ onEdit: (item) => handleEditItem('products', item), onDelete: handleDeleteItem })}
                        data={products}
                        onTableChange={handleTableChange}
                      />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center">
                        <span className="text-muted-foreground">Nenhum produto encontrado</span>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="categories" className="h-full">
                  <div className="space-y-4 h-full">
                    {categoriesIsLoading ? (
                      <div className="w-full h-24 flex items-center justify-center">
                        <span className="text-muted-foreground">Carregando categorias...</span>
                      </div>
                    ) : categories && categories.length > 0 ? (
                      <DataTable
                        columns={productCategoryColumns({ onEdit: (item) => handleEditItem('categories', item), onDelete: handleDeleteItem })}
                        data={categories}
                        onTableChange={handleTableChange}
                      />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center">
                        <span className="text-muted-foreground">Nenhuma categoria encontrada</span>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="additionals" className="h-full">
                  <div className="space-y-4 h-full">
                    {additionalsIsLoading ? (
                      <div className="w-full h-24 flex items-center justify-center">
                        <span className="text-muted-foreground">Carregando adicionais...</span>
                      </div>
                    ) : additionals && additionals.length > 0 ? (
                      <DataTable
                        columns={additionalColumns({ onEdit: (item) => handleEditItem('additionals', item), onDelete: handleDeleteItem })}
                        data={additionals}
                        onTableChange={handleTableChange}
                      />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center">
                        <span className="text-muted-foreground">Nenhum adicional encontrado</span>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="additional-groups" className="h-full">
                  <div className="space-y-4 h-full">
                    {additionalGroupsIsLoading ? (
                      <div className="w-full h-24 flex items-center justify-center">
                        <span className="text-muted-foreground">Carregando categorias...</span>
                      </div>
                    ) : additionalGroups && additionalGroups.length > 0 ? (
                      <DataTable
                        columns={additionalGroupColumns({ onEdit: (item) => handleEditItem('additional-groups', item), onDelete: handleDeleteItem })}
                        data={additionalGroups}
                        onTableChange={handleTableChange}
                      />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center">
                        <span className="text-muted-foreground">Nenhuma categoria encontrada</span>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      <ProductDialog 
        open={productDialog.open} 
        onOpenChange={(open) => setProductDialog({ open, item: null })}
        product={productDialog.item || null}
        categories={categories || []}
        additionalGroups={additionalGroups || []}
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
        additionalGroups={additionalGroups || []}
        onSave={handleSaveAdditional}
      />
      <AdditionalGroupDialog 
        open={additionalGroupDialog.open} 
        onOpenChange={(open) => setAdditionalGroupDialog({ open, item: null })}
        category={additionalGroupDialog.item}
        additionals={additionals || []}
        onSave={handleSaveAdditionalGroup}
        storeId={storeId}
      />
      <DeleteDialog 
        {...deleteDialog}
        {...getDeleteDialogProps()}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      />
    </Layout>
  );
}
