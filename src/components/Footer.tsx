import { Link } from 'react-router-dom';
import { ShoppingBag, Facebook, Twitter, MessageCircle, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/hooks/use-settings';
import { useStore } from '@/contexts/StoreContext';

export const Footer = () => {
  const { t } = useLanguage();
  const { storeId, storeSlug } = useStore();
  const { data: settings } = useSettings(storeId);
  const base = `/store/${storeSlug}`;

  const socialLinks = [
    { key: 'whatsapp', icon: MessageCircle, href: settings?.whatsapp ? `https://wa.me/${settings.whatsapp}` : '' },
    { key: 'email', icon: Mail, href: settings?.email ? `mailto:${settings.email}` : '' },
    { key: 'facebook', icon: Facebook, href: settings?.facebook || '' },
    { key: 'twitter', icon: Twitter, href: settings?.twitter || '' },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to={base} className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">{settings?.store_name || 'Store'}</span>
            </Link>
            <p className="text-sm text-muted-foreground">{t('footer.tagline')}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">{t('footer.shop')}</h4>
            <div className="flex flex-col gap-2">
              <Link to={`${base}/products`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.products')}</Link>
              <Link to={`${base}/categories`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.categories')}</Link>
              <Link to={`${base}/favorites`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.favorites')}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">{t('footer.support')}</h4>
            <div className="flex flex-col gap-2">
              <Link to={`${base}/contact`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.contact')}</Link>
            </div>
          </div>
          <div>
            {socialLinks.length > 0 && (
              <>
                <h4 className="font-semibold mb-3 text-sm">{t('footer.follow_us')}</h4>
                <div className="flex items-center gap-3">
                  {socialLinks.map((s) => (
                    <a
                      key={s.key}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                    >
                      <s.icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {settings?.store_name || 'Store'}. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
};
