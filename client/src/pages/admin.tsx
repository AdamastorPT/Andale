import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/lib/store';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Mail, 
  RefreshCw, 
  Edit, 
  Check, 
  X, 
  AlertTriangle,
  ShoppingBag,
  Tag,
  Search
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Helmet } from 'react-helmet';

const AdminPage = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, user, isAdmin } = useAuthStore();
  const { toast } = useToast();
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Please log in to access the admin panel.',
      });
    } else if (!isAdmin) {
      navigate('/');
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to access the admin panel.',
      });
    }
  }, [isAuthenticated, isAdmin, navigate, toast]);
  
  if (!isAuthenticated || !isAdmin) {
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>Admin Dashboard | DRBijuteria</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="bg-soft-gray min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-serif text-3xl">Admin Dashboard</h1>
            <Button 
              onClick={() => navigate('/')}
              variant="outline" 
              className="border-black"
            >
              Return to Site
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <DashboardCard 
              title="Products" 
              icon={<Package className="h-5 w-5" />}
              value="25"
              description="Total products"
              color="bg-blue-50 text-blue-600"
            />
            
            <DashboardCard 
              title="Orders" 
              icon={<ShoppingBag className="h-5 w-5" />}
              value="12"
              description="New orders"
              color="bg-green-50 text-green-600"
            />
            
            <DashboardCard 
              title="Customers" 
              icon={<Users className="h-5 w-5" />}
              value="142"
              description="Registered users"
              color="bg-purple-50 text-purple-600"
            />
            
            <DashboardCard 
              title="Subscribers" 
              icon={<Mail className="h-5 w-5" />}
              value="89"
              description="Newsletter subscribers"
              color="bg-amber-50 text-amber-600"
            />
          </div>
          
          <Tabs defaultValue="products" className="bg-white rounded-lg shadow-sm">
            <TabsList className="border-b p-2 w-full rounded-none justify-start overflow-x-auto">
              <TabsTrigger value="products" className="data-[state=active]:bg-pastel-rose data-[state=active]:text-black">
                <Tag className="h-4 w-4 mr-2" />
                Products
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-pastel-rose data-[state=active]:text-black">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="customers" className="data-[state=active]:bg-pastel-rose data-[state=active]:text-black">
                <Users className="h-4 w-4 mr-2" />
                Customers
              </TabsTrigger>
              <TabsTrigger value="newsletter" className="data-[state=active]:bg-pastel-rose data-[state=active]:text-black">
                <Mail className="h-4 w-4 mr-2" />
                Newsletter
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="p-4">
              <ProductsTab />
            </TabsContent>
            
            <TabsContent value="orders" className="p-4">
              <OrdersTab />
            </TabsContent>
            
            <TabsContent value="customers" className="p-4">
              <CustomersTab />
            </TabsContent>
            
            <TabsContent value="newsletter" className="p-4">
              <NewsletterTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

// Dashboard Card Component
const DashboardCard = ({ 
  title,
  icon,
  value,
  description,
  color
}: { 
  title: string,
  icon: React.ReactNode,
  value: string,
  description: string,
  color: string
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-medium-gray text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-medium">{value}</h3>
            <p className="text-xs text-medium-gray mt-1">{description}</p>
          </div>
          <div className={`${color} p-3 rounded-full`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Products Tab
const ProductsTab = () => {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch products
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/products');
      return res.json();
    }
  });
  
  // Fetch categories for the select
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/categories');
      return res.json();
    }
  });
  
  // Sync with Stripe
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/stripe/sync-products');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Products Synced',
        description: 'Products have been successfully synced from Stripe.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Sync Failed',
        description: error.message || 'Failed to sync products from Stripe.',
      });
    }
  });
  
  // Update product
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('PATCH', `/api/admin/products/${data.id}`, data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Product Updated',
        description: 'Product has been successfully updated.',
      });
      setSelectedProduct(null);
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Failed to update product.',
      });
    }
  });
  
  const handleSyncProducts = () => {
    syncMutation.mutate();
  };
  
  const handleEdit = (product: any) => {
    setSelectedProduct(product);
  };
  
  const handleSave = () => {
    if (!selectedProduct) return;
    
    updateMutation.mutate({
      id: selectedProduct.id,
      isNew: selectedProduct.isNew,
      isBestSeller: selectedProduct.isBestSeller,
      isLimited: selectedProduct.isLimited,
      categoryId: selectedProduct.categoryId
    });
  };
  
  const handleCancel = () => {
    setSelectedProduct(null);
  };
  
  // Filter products based on search
  const filteredProducts = products?.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-medium">Product Management</h2>
          <p className="text-medium-gray text-sm">
            Manage your products and sync with Stripe
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium-gray h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-48 md:w-64"
            />
          </div>
          <Button 
            onClick={handleSyncProducts}
            disabled={syncMutation.isPending}
            className="bg-black text-white hover:bg-black/90"
          >
            {syncMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Products
              </>
            )}
          </Button>
        </div>
      </div>
      
      {isLoadingProducts ? (
        <div className="py-12 text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto text-black mb-4" />
          <p>Loading products...</p>
        </div>
      ) : filteredProducts?.length === 0 ? (
        <div className="py-12 text-center">
          <Package className="h-12 w-12 mx-auto text-medium-gray mb-4" />
          <p className="text-medium-gray">No products found</p>
          <Button 
            onClick={handleSyncProducts}
            className="mt-4"
          >
            Sync Products from Stripe
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts?.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>
                    <div className="w-12 h-12 bg-soft-gray rounded">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-medium-gray">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>€{Number(product.price).toFixed(2)}</TableCell>
                  <TableCell>
                    {selectedProduct && selectedProduct.id === product.id ? (
                      <Select 
                        value={String(selectedProduct.categoryId || '')} 
                        onValueChange={(value) => setSelectedProduct({
                          ...selectedProduct,
                          categoryId: value ? Number(value) : null
                        })}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category: any) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      categories?.find((c: any) => c.id === product.categoryId)?.name || '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {selectedProduct && selectedProduct.id === product.id ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={selectedProduct.isNew}
                            onCheckedChange={(checked) => setSelectedProduct({
                              ...selectedProduct,
                              isNew: checked
                            })}
                          />
                          <span className="text-sm">New</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={selectedProduct.isBestSeller}
                            onCheckedChange={(checked) => setSelectedProduct({
                              ...selectedProduct,
                              isBestSeller: checked
                            })}
                          />
                          <span className="text-sm">Bestseller</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={selectedProduct.isLimited}
                            onCheckedChange={(checked) => setSelectedProduct({
                              ...selectedProduct,
                              isLimited: checked
                            })}
                          />
                          <span className="text-sm">Limited</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {product.isNew && (
                          <span className="inline-block bg-pastel-rose rounded px-2 py-1 text-xs">New</span>
                        )}
                        {product.isBestSeller && (
                          <span className="inline-block bg-pastel-rose rounded px-2 py-1 text-xs">Bestseller</span>
                        )}
                        {product.isLimited && (
                          <span className="inline-block bg-pastel-rose rounded px-2 py-1 text-xs">Limited</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {selectedProduct && selectedProduct.id === product.id ? (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={handleSave}
                          disabled={updateMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleCancel}
                          disabled={updateMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

// Orders Tab
const OrdersTab = () => {
  // Fetch orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/admin/orders'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/orders');
      return res.json();
    }
  });
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-medium">Order Management</h2>
        <p className="text-medium-gray text-sm">View and manage customer orders</p>
      </div>
      
      {isLoadingOrders ? (
        <div className="py-12 text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto text-black mb-4" />
          <p>Loading orders...</p>
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="py-12 text-center">
          <ShoppingBag className="h-12 w-12 mx-auto text-medium-gray mb-4" />
          <p className="text-medium-gray">No orders found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.user?.name || order.user?.email || 'Unknown'}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs inline-block
                      ${order.status === 'paid' ? 'bg-green-100 text-green-800' : 
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}
                    `}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>{order.items?.length || 0}</TableCell>
                  <TableCell>€{Number(order.total).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

// Customers Tab
const CustomersTab = () => {
  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/users');
      return res.json();
    }
  });
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-medium">Customer Management</h2>
        <p className="text-medium-gray text-sm">View and manage registered users</p>
      </div>
      
      {isLoadingUsers ? (
        <div className="py-12 text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto text-black mb-4" />
          <p>Loading customers...</p>
        </div>
      ) : !users || users.length === 0 ? (
        <div className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto text-medium-gray mb-4" />
          <p className="text-medium-gray">No customers found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name || '-'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs inline-block
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}
                    `}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

// Newsletter Tab
const NewsletterTab = () => {
  // Fetch newsletter subscribers
  const { data: subscribers, isLoading: isLoadingSubscribers } = useQuery({
    queryKey: ['/api/admin/newsletter'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/newsletter');
      return res.json();
    }
  });
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-medium">Newsletter Subscribers</h2>
        <p className="text-medium-gray text-sm">View and manage newsletter subscribers</p>
      </div>
      
      {isLoadingSubscribers ? (
        <div className="py-12 text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto text-black mb-4" />
          <p>Loading subscribers...</p>
        </div>
      ) : !subscribers || subscribers.length === 0 ? (
        <div className="py-12 text-center">
          <Mail className="h-12 w-12 mx-auto text-medium-gray mb-4" />
          <p className="text-medium-gray">No subscribers found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subscribed Date</TableHead>
                <TableHead>Confirmed</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers?.map((subscriber: any) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">{subscriber.id}</TableCell>
                  <TableCell>{subscriber.email}</TableCell>
                  <TableCell>
                    {new Date(subscriber.createdAt).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    {subscriber.confirmedAt ? (
                      <span className="text-green-600">
                        <Check className="h-5 w-5 inline" />
                      </span>
                    ) : (
                      <span className="text-amber-500">
                        <AlertTriangle className="h-5 w-5 inline" />
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-6">
            <Button className="bg-black text-white hover:bg-black/90">
              Export to CSV
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
