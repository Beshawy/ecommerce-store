import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Lang = 'en' | 'ar';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.contact': 'Contact',
    'nav.favorites': 'Favorites',
    // Hero
    'hero.title_1': 'Discover',
    'hero.title_2': 'Premium',
    'hero.title_3': 'Products',
    'hero.subtitle': 'Curated collection of exceptional products, designed to elevate your everyday experience.',
    'hero.browse': 'Browse Products',
    'hero.explore': 'Explore Categories',
    // Index
    'index.shop_by_category': 'Shop by Category',
    'index.find_what': "Find what you're looking for",
    'index.view_all': 'View All',
    'index.featured': 'Featured Products',
    'index.latest': 'Our latest additions',
    // Products
    'products.title': 'Products',
    'products.subtitle': 'Browse our full collection',
    'products.search': 'Search products...',
    'products.all_categories': 'All Categories',
    'products.newest': 'Newest',
    'products.price_low': 'Price: Low to High',
    'products.price_high': 'Price: High to Low',
    'products.name': 'Name',
    'products.no_found': 'No products found',
    'products.try_adjusting': 'Try adjusting your search or filters',
    'products.in_stock': 'in stock',
    'products.out_of_stock': 'Out of stock',
    // Product Detail
    'detail.back': 'Back to Products',
    'detail.in_favorites': 'In Favorites',
    'detail.add_favorites': 'Add to Favorites',
    'detail.not_found': 'Product not found.',
    // Categories
    'categories.title': 'Categories',
    'categories.subtitle': 'Browse products by category',
    'categories.no_yet': 'No categories yet',
    'categories.will_appear': 'Categories will appear here once added by the admin',
    'categories.all': 'All Categories',
    'categories.products_in': 'Products in this category',
    'categories.no_products': 'No products in this category',
    'categories.check_back': 'Check back later for new additions',
    // Favorites
    'favorites.title': 'Favorites',
    'favorites.saved': 'Your saved products',
    'favorites.no_yet': 'No favorites yet',
    'favorites.start_adding': 'Start adding products to your favorites to see them here',
    'favorites.browse': 'Browse Products',
    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': "We'd love to hear from you",
    'contact.name': 'Your name',
    'contact.email': 'Your email',
    'contact.message': 'Your message',
    'contact.send': 'Send Message',
    'contact.sending': 'Sending...',
    'contact.sent': 'Message sent successfully!',
    'contact.failed': 'Failed to send message. Please try again.',
    'contact.other_ways': 'Other ways to reach us',
    // Footer
    'footer.tagline': 'Premium products, curated for you.',
    'footer.shop': 'Shop',
    'footer.support': 'Support',
    'footer.admin': 'Admin',
    'footer.dashboard': 'Dashboard',
    'footer.rights': 'All rights reserved.',
    'footer.follow_us': 'Follow Us',
    // 404
    '404.title': '404',
    '404.subtitle': 'Oops! Page not found',
    '404.return': 'Return to Home',
    // Common
    'common.no_image': 'No image',
    'common.loading': 'Loading...',
  },
  ar: {
    // Nav
    'nav.home': 'الرئيسية',
    'nav.products': 'المنتجات',
    'nav.categories': 'التصنيفات',
    'nav.contact': 'اتصل بنا',
    'nav.favorites': 'المفضلة',
    // Hero
    'hero.title_1': 'اكتشف',
    'hero.title_2': 'منتجات',
    'hero.title_3': 'مميزة',
    'hero.subtitle': 'مجموعة منتقاة من المنتجات الاستثنائية، مصممة لتحسين تجربتك اليومية.',
    'hero.browse': 'تصفح المنتجات',
    'hero.explore': 'استكشف التصنيفات',
    // Index
    'index.shop_by_category': 'تسوق حسب التصنيف',
    'index.find_what': 'ابحث عما تريد',
    'index.view_all': 'عرض الكل',
    'index.featured': 'منتجات مميزة',
    'index.latest': 'أحدث الإضافات',
    // Products
    'products.title': 'المنتجات',
    'products.subtitle': 'تصفح مجموعتنا الكاملة',
    'products.search': 'ابحث عن منتجات...',
    'products.all_categories': 'كل التصنيفات',
    'products.newest': 'الأحدث',
    'products.price_low': 'السعر: من الأقل للأعلى',
    'products.price_high': 'السعر: من الأعلى للأقل',
    'products.name': 'الاسم',
    'products.no_found': 'لا توجد منتجات',
    'products.try_adjusting': 'حاول تعديل البحث أو الفلاتر',
    'products.in_stock': 'متوفر',
    'products.out_of_stock': 'غير متوفر',
    // Product Detail
    'detail.back': 'العودة للمنتجات',
    'detail.in_favorites': 'في المفضلة',
    'detail.add_favorites': 'أضف للمفضلة',
    'detail.not_found': 'المنتج غير موجود.',
    // Categories
    'categories.title': 'التصنيفات',
    'categories.subtitle': 'تصفح المنتجات حسب التصنيف',
    'categories.no_yet': 'لا توجد تصنيفات بعد',
    'categories.will_appear': 'ستظهر التصنيفات هنا عند إضافتها من قبل المسؤول',
    'categories.all': 'كل التصنيفات',
    'categories.products_in': 'المنتجات في هذا التصنيف',
    'categories.no_products': 'لا توجد منتجات في هذا التصنيف',
    'categories.check_back': 'تحقق لاحقاً للإضافات الجديدة',
    // Favorites
    'favorites.title': 'المفضلة',
    'favorites.saved': 'منتجاتك المحفوظة',
    'favorites.no_yet': 'لا توجد مفضلات بعد',
    'favorites.start_adding': 'ابدأ بإضافة المنتجات إلى المفضلة لتظهر هنا',
    'favorites.browse': 'تصفح المنتجات',
    // Contact
    'contact.title': 'اتصل بنا',
    'contact.subtitle': 'يسعدنا سماع رأيك',
    'contact.name': 'اسمك',
    'contact.email': 'بريدك الإلكتروني',
    'contact.message': 'رسالتك',
    'contact.send': 'إرسال الرسالة',
    'contact.sending': 'جاري الإرسال...',
    'contact.sent': 'تم إرسال الرسالة بنجاح!',
    'contact.failed': 'فشل في إرسال الرسالة. حاول مرة أخرى.',
    'contact.other_ways': 'طرق أخرى للتواصل',
    // Footer
    'footer.tagline': 'منتجات مميزة، منتقاة لك.',
    'footer.shop': 'التسوق',
    'footer.support': 'الدعم',
    'footer.admin': 'الإدارة',
    'footer.dashboard': 'لوحة التحكم',
    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.follow_us': 'تابعنا',
    // 404
    '404.title': '404',
    '404.subtitle': 'عذراً! الصفحة غير موجودة',
    '404.return': 'العودة للرئيسية',
    // Common
    'common.no_image': 'لا توجد صورة',
    'common.loading': 'جاري التحميل...',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'ar';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  const t = (key: string) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
