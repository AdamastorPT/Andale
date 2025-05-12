import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Product } from '@shared/schema';
import ProductCard from './ProductCard';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ProductGridProps = {
  categorySlug?: string;
  showBestsellers?: boolean;
  showNew?: boolean;
  limit?: number;
};

const ProductGrid = ({ categorySlug, showBestsellers, showNew, limit }: ProductGridProps) => {
  const [visibleProducts, setVisibleProducts] = useState(limit || 8);
  
  let queryUrl = '/api/products';
  if (categorySlug) {
    queryUrl = `/api/categories/${categorySlug}/products`;
  }
  
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: [queryUrl],
    queryFn: async () => {
      const res = await apiRequest('GET', queryUrl);
      return res.json();
    }
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }
  
  if (error || !products) {
    return (
      <div className="text-center py-12">
        <p className="text-medium-gray">Failed to load products. Please try again later.</p>
      </div>
    );
  }
  
  let filteredProducts = [...products];
  
  if (showBestsellers) {
    filteredProducts = filteredProducts.filter(product => product.isBestSeller);
  }
  
  if (showNew) {
    filteredProducts = filteredProducts.filter(product => product.isNew);
  }
  
  const displayProducts = filteredProducts.slice(0, visibleProducts);
  
  const loadMore = () => {
    setVisibleProducts(prev => prev + 8);
  };
  
  return (
    <div>
      {displayProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-medium-gray">No products found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {filteredProducts.length > visibleProducts && (
            <div className="text-center mt-12">
              <Button 
                onClick={loadMore}
                className="border border-black bg-transparent hover:bg-black hover:text-white transition-colors px-8 py-3 font-medium tracking-wide"
                variant="outline"
              >
                LOAD MORE
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductGrid;
