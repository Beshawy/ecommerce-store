import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MessageCircle, Mail, MapPin, Send, Facebook, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/hooks/use-settings';
import { useStore } from '@/contexts/StoreContext';
import { usePageTracking } from '@/hooks/use-page-tracking';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email').max(255),
  message: z.string().trim().min(1, 'Message is required').max(1000),
});

const Contact = () => {
  const { t } = useLanguage();
  const { storeId } = useStore();
  const { data: settings } = useSettings(storeId);
  usePageTracking(storeId);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async (data: { name: string; email: string; message: string }) => {
      const { error } = await supabase.from('messages').insert({
        ...data,
        store_id: storeId,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t('contact.sent'));
      setForm({ name: '', email: '', message: '' });
      setErrors({});
    },
    onError: () => toast.error(t('contact.failed')),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => { if (err.path[0]) fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    mutation.mutate({ name: result.data.name, email: result.data.email, message: result.data.message });
  };

  const contactMethods = [
    settings?.whatsapp && { icon: MessageCircle, label: 'WhatsApp', href: `https://wa.me/${settings.whatsapp}`, color: 'text-green-500' },
    settings?.email && { icon: Mail, label: settings.email, href: `mailto:${settings.email}`, color: 'text-primary' },
    settings?.facebook && { icon: Facebook, label: 'Facebook', href: settings.facebook, color: 'text-blue-600' },
    settings?.twitter && { icon: Twitter, label: 'X (Twitter)', href: settings.twitter, color: 'text-foreground' },
    settings?.address && { icon: MapPin, label: settings.address, href: null, color: 'text-amber-500' },
  ].filter(Boolean) as { icon: any; label: string; href: string | null; color: string }[];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('contact.title')}</h1>
          <p className="text-muted-foreground mb-10">{t('contact.subtitle')}</p>
          <div className="grid md:grid-cols-2 gap-10">
            <motion.form initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input placeholder={t('contact.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Input placeholder={t('contact.email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
              <div>
                <Textarea placeholder={t('contact.message')} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="rounded-lg resize-none" />
                {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
              </div>
              <Button type="submit" className="rounded-full w-full" disabled={mutation.isPending}>
                <Send className="me-2 h-4 w-4" />
                {mutation.isPending ? t('contact.sending') : t('contact.send')}
              </Button>
            </motion.form>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">{t('contact.other_ways')}</h3>
                <div className="space-y-4">
                  {contactMethods.map((method, i) =>
                    method.href ? (
                      <a key={i} href={method.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <method.icon className={`h-5 w-5 ${method.color}`} /> {method.label}
                      </a>
                    ) : (
                      <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <method.icon className={`h-5 w-5 ${method.color}`} /> {method.label}
                      </div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
