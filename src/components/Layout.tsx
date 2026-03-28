import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { usePageTracking } from '@/hooks/use-page-tracking';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  usePageTracking();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
};
