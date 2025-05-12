import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { User, Package2, LogOut, Settings, CreditCard, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Helmet } from 'react-helmet';

// Profile update schema
const profileSchema = z.object({
  name: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email').optional(),
  address: z.string().min(5, 'Please enter your full address'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
});

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Please enter your current password'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const ProfilePage = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { toast } = useToast();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Please log in to view your profile.',
      });
    }
  }, [isAuthenticated, navigate, toast]);
  
  // Fetch user orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/orders');
      return res.json();
    },
    enabled: isAuthenticated
  });
  
  if (!isAuthenticated || !user) {
    return null;
  }
  
  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };
  
  return (
    <>
      <Helmet>
        <title>My Account | DRBijuteria</title>
        <meta name="description" content="Manage your account, orders, and personal information." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-serif text-3xl">My Account</h1>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-black"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
          
          <Tabs defaultValue="orders">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="orders" className="text-sm">
                <Package2 className="mr-2 h-4 w-4" />
                My Orders
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-sm">
                <User className="mr-2 h-4 w-4" />
                My Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="text-sm">
                <Settings className="mr-2 h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders">
              <OrdersTab orders={orders} isLoading={isLoadingOrders} />
            </TabsContent>
            
            <TabsContent value="profile">
              <ProfileTab user={user} />
            </TabsContent>
            
            <TabsContent value="security">
              <SecurityTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

const OrdersTab = ({ orders, isLoading }: { orders: any[], isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }
  
  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>You haven't placed any orders yet.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Package2 className="h-12 w-12 mx-auto text-medium-gray mb-4" />
          <p className="mb-4">Start shopping to see your orders here.</p>
          <Button onClick={() => window.location.href = '/category/all'}>
            Browse Products
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
        <CardDescription>View and manage your orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-light-gray p-4 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium">Order #{order.id}</h3>
                  <p className="text-sm text-medium-gray">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <span className={`px-2 py-1 text-xs uppercase rounded ${
                    order.status === 'paid' ? 'bg-green-100 text-green-800' : 
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-soft-gray mr-3 flex-shrink-0">
                        {item.product.images && item.product.images[0] && (
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name} 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <span>{item.product.name} × {item.quantity}</span>
                    </div>
                    <span>€{Number(item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-light-gray pt-3 flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="font-medium">€{Number(order.total).toFixed(2)}</span>
              </div>
              
              <div className="mt-4 text-right">
                <Button variant="outline" size="sm" className="text-xs">
                  <Eye className="mr-1 h-3 w-3" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ProfileTab = ({ user }: { user: any }) => {
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      address: user?.address || '',
      phone: user?.phone || '',
    }
  });
  
  const onSubmit = async (data: ProfileFormData) => {
    try {
      const res = await apiRequest('PATCH', '/api/auth/me', data);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
                disabled
              />
              <p className="text-xs text-medium-gray mt-1">Email cannot be changed.</p>
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register('address')}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register('phone')}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="bg-black text-white hover:bg-black/90"
            disabled={!isDirty || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const SecurityTab = () => {
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });
  
  const onSubmit = async (data: PasswordFormData) => {
    try {
      const res = await apiRequest('POST', '/api/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to change password');
      }
      
      toast({
        title: 'Password Changed',
        description: 'Your password has been successfully changed.',
      });
      
      reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Password Change Failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...register('currentPassword')}
                  className={errors.currentPassword ? 'border-red-500' : ''}
                />
                {errors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...register('newPassword')}
                  className={errors.newPassword ? 'border-red-500' : ''}
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="bg-black text-white hover:bg-black/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <CreditCard className="h-12 w-12 mx-auto text-medium-gray mb-4" />
          <p className="mb-4">You don't have any saved payment methods yet.</p>
          <Button variant="outline">
            <CreditCard className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
