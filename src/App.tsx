import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { StoreProvider } from "@/contexts/StoreContext";
import StoreSelector from "./pages/StoreSelector";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";
import Favorites from "./pages/Favorites";
import Contact from "./pages/Contact";
import AdminEntry from "./pages/admin/AdminEntry";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SuperAdminLayout from "./pages/admin/SuperAdminLayout";
import SuperAdminUsers from "./pages/admin/SuperAdminUsers";
import SuperAdminStores from "./pages/admin/SuperAdminStores";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<StoreSelector />} />
              <Route path="/store/:slug" element={<StoreProvider />}>
                <Route index element={<Index />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetail />} />
                <Route path="categories" element={<Categories />} />
                <Route path="categories/:id" element={<CategoryProducts />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="contact" element={<Contact />} />
              </Route>
              <Route path="/admin" element={<AdminEntry />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              <Route path="/super-admin" element={<SuperAdminLayout />}>
                <Route index element={<SuperAdminUsers />} />
                <Route path="users" element={<SuperAdminUsers />} />
                <Route path="stores" element={<SuperAdminStores />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  </ThemeProvider>
);

export default App;
