import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Category, Product } from '@shared/schema';
import { Helmet } from 'react-helmet';
import { ChevronDown, Filter, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import ProductCard from '@/components/products/ProductCard';

const CategoryPage = () => {
  const { slug } = useParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [productType, setProductType] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Fetch category
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/categories');
      return res.json();
    }
  });
  
  // Fetch category products or all products
  const queryUrl = slug && slug !== 'all' 
    ? `/api/categories/${slug}/products` 
    : '/api/products';
  
  const queryKey = [queryUrl];
  
  // Special cases for pre-filtered categories
  if (slug === 'best-sellers') queryKey.push('bestsellers');
  if (slug === 'new-arrivals') queryKey.push('new');

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey,
    queryFn: async () => {
      const res = await apiRequest('GET', queryUrl);
      let data = await res.json();
      
      // Apply special filters for virtual categories
      if (slug === 'best-sellers') {
        data = data.filter((product: Product) => product.isBestSeller);
      } else if (slug === 'new-arrivals') {
        data = data.filter((product: Product) => product.isNew);
      }
      
      return data;
    }
  });
  
  const category = categories?.find(c => c.slug === slug) || {
    name: getCategoryDisplayName(slug),
    description: `Explore our collection of ${getCategoryDisplayName(slug).toLowerCase()}.`
  };
  
  // Apply filters and sorting
  useEffect(() => {
    if (!products) return;
    
    let result = [...products];
    
    // Apply price filter
    result = result.filter(product => {
      const price = Number(product.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Apply product type filter
    if (productType.length > 0) {
      result = result.filter(product => 
        productType.includes(getCategoryNameById(product.categoryId))
      );
    }
    
    // Apply sorting
    if (sortOption === 'price-asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // 'featured' sorting is default order
    
    setFilteredProducts(result);
  }, [products, sortOption, priceRange, productType, categories]);
  
  function getCategoryNameById(categoryId?: number): string {
    if (!categoryId || !categories) return '';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  }
  
  function getCategoryDisplayName(slug?: string): string {
    if (!slug) return 'All Products';
    
    switch(slug) {
      case 'all': return 'All Products';
      case 'best-sellers': return 'Best Sellers';
      case 'new-arrivals': return 'New Arrivals';
      default: 
        const category = categories?.find(c => c.slug === slug);
        return category?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  }
  
  const handlePriceChange = (min: number, max: number) => {
    setPriceRange([min, max]);
  };
  
  const toggleProductType = (type: string) => {
    setProductType(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  const clearFilters = () => {
    setPriceRange([0, 1000]);
    setProductType([]);
    setSortOption('featured');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-3xl mb-4">Error Loading Products</h1>
        <p className="text-medium-gray mb-8">Sorry, we encountered an error while loading products.</p>
        <Link href="/">
          <Button>
            Return to Home
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{category.name} | DRBijuteria</title>
        <meta name="description" content={category.description || `Explore our collection of ${category.name.toLowerCase()}.`} />
        <meta property="og:title" content={`${category.name} | DRBijuteria`} />
        <meta property="og:description" content={category.description || `Explore our collection of ${category.name.toLowerCase()}.`} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-medium-gray flex items-center">
          <Link href="/">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-black">{category.name}</span>
        </div>
        
        <h1 className="font-serif text-3xl md:text-4xl mb-4 text-center">{category.name}</h1>
        {category.description && (
          <p className="text-medium-gray text-center max-w-xl mx-auto mb-8">
            {category.description}
          </p>
        )}
        
        {/* Filter and Sort Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="border-black">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filter Products</SheetTitle>
                    <SheetDescription>
                      Narrow down products based on your preferences.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Price Range */}
                    <div>
                      <h3 className="font-medium mb-4">Price Range</h3>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="price-range"
                            className="mr-2"
                            checked={priceRange[0] === 0 && priceRange[1] === 1000}
                            onChange={() => handlePriceChange(0, 1000)}
                          />
                          All Prices
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="price-range"
                            className="mr-2"
                            checked={priceRange[0] === 0 && priceRange[1] === 50}
                            onChange={() => handlePriceChange(0, 50)}
                          />
                          Under €50
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="price-range"
                            className="mr-2"
                            checked={priceRange[0] === 50 && priceRange[1] === 100}
                            onChange={() => handlePriceChange(50, 100)}
                          />
                          €50 - €100
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="price-range"
                            className="mr-2"
                            checked={priceRange[0] === 100 && priceRange[1] === 200}
                            onChange={() => handlePriceChange(100, 200)}
                          />
                          €100 - €200
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="price-range"
                            className="mr-2"
                            checked={priceRange[0] === 200 && priceRange[1] === 1000}
                            onChange={() => handlePriceChange(200, 1000)}
                          />
                          €200+
                        </label>
                      </div>
                    </div>
                    
                    {/* Product Category */}
                    {categories && categories.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-4">Product Type</h3>
                        <div className="space-y-2">
                          {categories.map(cat => (
                            <label key={cat.id} className="flex items-center">
                              <Checkbox
                                id={`category-${cat.id}`}
                                checked={productType.includes(cat.name)}
                                onCheckedChange={() => toggleProductType(cat.name)}
                                className="mr-2"
                              />
                              {cat.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Button onClick={clearFilters} variant="outline" className="mt-4">
                      Clear All Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Desktop Filters */}
            <div className="hidden md:block">
              <Button 
                variant="outline" 
                className="border-black"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            
            {/* Count of products */}
            <div className="text-medium-gray">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </div>
          </div>
          
          {/* Sort control */}
          <div>
            <Select
              value={sortOption}
              onValueChange={setSortOption}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Filter Panel (Desktop) */}
        {isFilterOpen && (
          <div className="hidden md:block mb-8 p-6 bg-soft-gray">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium text-lg">Filter Products</h2>
              <button 
                onClick={clearFilters}
                className="text-medium-gray hover:text-black transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Price Range */}
              <div>
                <h3 className="font-medium mb-4">Price Range</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="price-range"
                      className="mr-2"
                      checked={priceRange[0] === 0 && priceRange[1] === 1000}
                      onChange={() => handlePriceChange(0, 1000)}
                    />
                    All Prices
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="price-range"
                      className="mr-2"
                      checked={priceRange[0] === 0 && priceRange[1] === 50}
                      onChange={() => handlePriceChange(0, 50)}
                    />
                    Under €50
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="price-range"
                      className="mr-2"
                      checked={priceRange[0] === 50 && priceRange[1] === 100}
                      onChange={() => handlePriceChange(50, 100)}
                    />
                    €50 - €100
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="price-range"
                      className="mr-2"
                      checked={priceRange[0] === 100 && priceRange[1] === 200}
                      onChange={() => handlePriceChange(100, 200)}
                    />
                    €100 - €200
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="price-range"
                      className="mr-2"
                      checked={priceRange[0] === 200 && priceRange[1] === 1000}
                      onChange={() => handlePriceChange(200, 1000)}
                    />
                    €200+
                  </label>
                </div>
              </div>
              
              {/* Product Category */}
              {categories && categories.length > 0 && (
                <div>
                  <h3 className="font-medium mb-4">Product Type</h3>
                  <div className="space-y-2">
                    {categories.map(cat => (
                      <label key={cat.id} className="flex items-center">
                        <Checkbox
                          id={`category-desktop-${cat.id}`}
                          checked={productType.includes(cat.name)}
                          onCheckedChange={() => toggleProductType(cat.name)}
                          className="mr-2"
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-medium-gray mb-4">No products match your selected filters.</p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryPage;
