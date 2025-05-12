import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/lib/store';

type Language = 'pt-PT' | 'en-US';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traduções
const translations: Record<Language, Record<string, string>> = {
  'pt-PT': {
    // Geral
    'app.loading': 'Carregando...',
    'app.error': 'Ocorreu um erro. Por favor, tente novamente.',
    'app.save': 'Guardar',
    'app.cancel': 'Cancelar',
    'app.delete': 'Eliminar',
    'app.edit': 'Editar',
    'app.add': 'Adicionar',
    'app.search': 'Pesquisar',
    'app.filter': 'Filtrar',
    'app.sort': 'Ordenar',
    'app.all': 'Todos',
    
    // Navegação
    'nav.home': 'Início',
    'nav.products': 'Produtos',
    'nav.categories': 'Categorias',
    'nav.blog': 'Blog',
    'nav.about': 'Sobre Nós',
    'nav.contact': 'Contacto',
    'nav.cart': 'Carrinho',
    'nav.wishlist': 'Lista de Desejos',
    'nav.account': 'Minha Conta',
    'nav.login': 'Iniciar Sessão',
    'nav.register': 'Registar',
    'nav.logout': 'Terminar Sessão',
    
    // Produtos
    'product.addToCart': 'Adicionar ao Carrinho',
    'product.addToWishlist': 'Adicionar à Lista de Desejos',
    'product.removeFromWishlist': 'Remover da Lista de Desejos',
    'product.outOfStock': 'Esgotado',
    'product.inStock': 'Em Stock',
    'product.price': 'Preço',
    'product.quantity': 'Quantidade',
    'product.description': 'Descrição',
    'product.related': 'Produtos Relacionados',
    'product.new': 'Novo',
    'product.bestseller': 'Mais Vendido',
    'product.limited': 'Edição Limitada',
    
    // Categorias
    'category.earrings': 'Brincos',
    'category.necklaces': 'Colares',
    'category.bracelets': 'Pulseiras',
    'category.rings': 'Anéis',
    
    // Autenticação
    'auth.login': 'Iniciar Sessão',
    'auth.register': 'Registar',
    'auth.forgotPassword': 'Esqueci-me da Senha',
    'auth.resetPassword': 'Redefinir Senha',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.confirmPassword': 'Confirmar Senha',
    'auth.name': 'Nome',
    'auth.rememberMe': 'Lembrar-me',
    'auth.dontHaveAccount': 'Não tem uma conta?',
    'auth.alreadyHaveAccount': 'Já tem uma conta?',
    'auth.resetLink': 'Enviar Link de Redefinição',
    
    // Perfil
    'profile.title': 'Meu Perfil',
    'profile.edit': 'Editar Perfil',
    'profile.changePassword': 'Alterar Senha',
    'profile.address': 'Morada',
    'profile.phone': 'Telefone',
    'profile.orders': 'Minhas Encomendas',
    'profile.wishlist': 'Minha Lista de Desejos',
    
    // Carrinho
    'cart.title': 'Carrinho de Compras',
    'cart.empty': 'O seu carrinho está vazio',
    'cart.continue': 'Continuar a Comprar',
    'cart.checkout': 'Finalizar Compra',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Envio',
    'cart.total': 'Total',
    'cart.remove': 'Remover',
    
    // Checkout
    'checkout.title': 'Finalizar Compra',
    'checkout.shipping': 'Informações de Envio',
    'checkout.payment': 'Pagamento',
    'checkout.review': 'Revisão do Pedido',
    'checkout.firstName': 'Nome',
    'checkout.lastName': 'Apelido',
    'checkout.address': 'Morada',
    'checkout.city': 'Cidade',
    'checkout.postalCode': 'Código Postal',
    'checkout.country': 'País',
    'checkout.phone': 'Telefone',
    'checkout.placeOrder': 'Fazer Encomenda',
    
    // Outros
    'newsletter.title': 'Subscreva a nossa Newsletter',
    'newsletter.subtitle': 'Fique a par das nossas novidades e promoções exclusivas',
    'newsletter.placeholder': 'O seu email',
    'newsletter.button': 'Subscrever',
    'newsletter.success': 'Obrigado por subscrever!',
    
    'footer.about': 'Sobre Nós',
    'footer.contact': 'Contacto',
    'footer.shipping': 'Envio e Devoluções',
    'footer.privacy': 'Política de Privacidade',
    'footer.terms': 'Termos e Condições',
    'footer.copyright': 'Todos os direitos reservados',
    
    'contact.title': 'Contacte-nos',
    'contact.name': 'Nome',
    'contact.email': 'Email',
    'contact.message': 'Mensagem',
    'contact.send': 'Enviar Mensagem',
    'contact.success': 'Mensagem enviada com sucesso!',
    
    'blog.title': 'Blog',
    'blog.readMore': 'Ler Mais',
    'blog.publishedOn': 'Publicado em',
    'blog.by': 'por',
    'blog.comments': 'Comentários',
    'blog.noArticles': 'Nenhum artigo disponível'
  },
  'en-US': {
    // General
    'app.loading': 'Loading...',
    'app.error': 'An error occurred. Please try again.',
    'app.save': 'Save',
    'app.cancel': 'Cancel',
    'app.delete': 'Delete',
    'app.edit': 'Edit',
    'app.add': 'Add',
    'app.search': 'Search',
    'app.filter': 'Filter',
    'app.sort': 'Sort',
    'app.all': 'All',
    
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.blog': 'Blog',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.cart': 'Cart',
    'nav.wishlist': 'Wishlist',
    'nav.account': 'My Account',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    
    // Products
    'product.addToCart': 'Add to Cart',
    'product.addToWishlist': 'Add to Wishlist',
    'product.removeFromWishlist': 'Remove from Wishlist',
    'product.outOfStock': 'Out of Stock',
    'product.inStock': 'In Stock',
    'product.price': 'Price',
    'product.quantity': 'Quantity',
    'product.description': 'Description',
    'product.related': 'Related Products',
    'product.new': 'New',
    'product.bestseller': 'Bestseller',
    'product.limited': 'Limited Edition',
    
    // Categories
    'category.earrings': 'Earrings',
    'category.necklaces': 'Necklaces',
    'category.bracelets': 'Bracelets',
    'category.rings': 'Rings',
    
    // Authentication
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.forgotPassword': 'Forgot Password',
    'auth.resetPassword': 'Reset Password',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.name': 'Name',
    'auth.rememberMe': 'Remember me',
    'auth.dontHaveAccount': 'Don\'t have an account?',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.resetLink': 'Send Reset Link',
    
    // Profile
    'profile.title': 'My Profile',
    'profile.edit': 'Edit Profile',
    'profile.changePassword': 'Change Password',
    'profile.address': 'Address',
    'profile.phone': 'Phone',
    'profile.orders': 'My Orders',
    'profile.wishlist': 'My Wishlist',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.continue': 'Continue Shopping',
    'cart.checkout': 'Checkout',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.total': 'Total',
    'cart.remove': 'Remove',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.shipping': 'Shipping Information',
    'checkout.payment': 'Payment',
    'checkout.review': 'Order Review',
    'checkout.firstName': 'First Name',
    'checkout.lastName': 'Last Name',
    'checkout.address': 'Address',
    'checkout.city': 'City',
    'checkout.postalCode': 'Postal Code',
    'checkout.country': 'Country',
    'checkout.phone': 'Phone',
    'checkout.placeOrder': 'Place Order',
    
    // Others
    'newsletter.title': 'Subscribe to our Newsletter',
    'newsletter.subtitle': 'Stay updated with our latest news and special offers',
    'newsletter.placeholder': 'Your email',
    'newsletter.button': 'Subscribe',
    'newsletter.success': 'Thank you for subscribing!',
    
    'footer.about': 'About Us',
    'footer.contact': 'Contact',
    'footer.shipping': 'Shipping & Returns',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms & Conditions',
    'footer.copyright': 'All rights reserved',
    
    'contact.title': 'Contact Us',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    'contact.success': 'Message sent successfully!',
    
    'blog.title': 'Blog',
    'blog.readMore': 'Read More',
    'blog.publishedOn': 'Published on',
    'blog.by': 'by',
    'blog.comments': 'Comments',
    'blog.noArticles': 'No articles available'
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('pt-PT'); // Português de Portugal como padrão
  const { user } = useAuthStore();
  
  // Carrega o idioma do usuário do localStorage ao iniciar
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'pt-PT' || savedLanguage === 'en-US')) {
      setLanguageState(savedLanguage);
    } else if (user?.language) {
      // Usa o idioma do usuário se estiver autenticado
      setLanguageState(user.language as Language);
    }
  }, [user]);
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Se o usuário estiver logado, atualiza o idioma no perfil
    if (user) {
      // Faz uma requisição para atualizar o idioma no servidor
      fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ language: lang })
      }).catch(err => console.error('Error updating language preference:', err));
    }
  };
  
  // Função para buscar traduções
  const t = (key: string): string => {
    return translations[language][key] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};