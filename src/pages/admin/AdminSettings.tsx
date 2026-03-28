import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, MessageCircle, Mail, Facebook, Twitter, MapPin, Store, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useOutletContext } from 'react-router-dom';
import { currencyOptions } from '@/lib/format-price';

const settingsFields = [
  { key: 'store_name', label: 'Store Name', icon: Store, placeholder: 'My Store', type: 'text' },
  { key: 'currency', label: 'Currency', icon: DollarSign, placeholder: 'USD', type: 'currency' },
  { key: 'whatsapp', label: 'WhatsApp Number', icon: MessageCircle, placeholder: '+201234567890', type: 'text' },
  { key: 'email', label: 'Email', icon: Mail, placeholder: 'contact@store.com', type: 'text' },
  { key: 'facebook', label: 'Facebook URL', icon: Facebook, placeholder: 'https://facebook.com/...', type: 'text' },
  { key: 'twitter', label: 'X (Twitter) URL', icon: Twitter, placeholder: 'https://x.com/...', type: 'text' },
  { key: 'address', label: 'Address', icon: MapPin, placeholder: '123 Store Street, City', type: 'text' },
];

const AdminSettings = () => {
  const { storeId } = useOutletContext<{ storeId: string }>();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings', storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings' as any).select('*').eq('store_id', storeId);
      if (error) throw error;
      const map: Record<string, string> = {};
      (data as any[])?.forEach((row: { key: string; value: string }) => { map[row.key] = row.value; });
      return map;
    },
    enabled: !!storeId,
  });

  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const [key, value] of Object.entries(form)) {
        // Try update first, if no rows affected, insert
        const { data, error } = await supabase
          .from('site_settings' as any)
          .update({ value, updated_at: new Date().toISOString() } as any)
          .eq('key', key)
          .eq('store_id', storeId)
          .select();
        if (error) throw error;
        if (!(data as any[])?.length) {
          const { error: insertError } = await supabase
            .from('site_settings' as any)
            .insert({ key, value, store_id: storeId } as any);
          if (insertError) throw insertError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings', storeId] });
      queryClient.invalidateQueries({ queryKey: ['site-settings', storeId] });
      toast.success('Settings saved');
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="max-w-xl space-y-4">
        {settingsFields.map((field) => (
          <div key={field.key} className="flex items-center gap-3">
            <field.icon className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{field.label}</label>
              {field.type === 'currency' ? (
                <Select value={form[field.key] || 'USD'} onValueChange={(v) => setForm({ ...form, [field.key]: v })}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder={field.placeholder}
                  value={form[field.key] || ''}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="rounded-lg"
                />
              )}
            </div>
          </div>
        ))}
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="rounded-full w-full mt-4">
          <Save className="mr-2 h-4 w-4" /> {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
