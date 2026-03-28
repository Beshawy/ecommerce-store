import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useOutletContext } from 'react-router-dom';
import { useSettings } from '@/hooks/use-settings';
import { formatPrice } from '@/lib/format-price';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  quantity: string;
  category_id: string;
  image_url: string;
}

const emptyForm: ProductForm = { name: '', description: '', price: '', quantity: '', category_id: '', image_url: '' };

const AdminProducts = () => {
  const { storeId } = useOutletContext<{ storeId: string }>();
  const queryClient = useQueryClient();
  const { data: settings } = useSettings(storeId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [uploading, setUploading] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').eq('store_id', storeId).order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const payload = {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price) || 0,
        quantity: parseInt(data.quantity) || 0,
        category_id: data.category_id || null,
        image_url: data.image_url || null,
        store_id: storeId,
      };
      if (editId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products', storeId] });
      toast.success(editId ? 'Product updated' : 'Product created');
      closeDialog();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products', storeId] });
      toast.success('Product deleted');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `products/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) { toast.error('Upload failed'); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
    setForm({ ...form, image_url: urlData.publicUrl });
    setUploading(false);
  };

  const openEdit = (product: any) => {
    setEditId(product.id);
    setForm({ name: product.name, description: product.description || '', price: String(product.price), quantity: String(product.quantity), category_id: product.category_id || '', image_url: product.image_url || '' });
    setDialogOpen(true);
  };

  const closeDialog = () => { setDialogOpen(false); setEditId(null); setForm(emptyForm); };

  const currency = settings?.currency || 'USD';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => { setEditId(null); setForm(emptyForm); setDialogOpen(true); }} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : products?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No products yet</TableCell></TableRow>
            ) : (
              products?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden">
                      {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{(p.categories as any)?.name || '-'}</TableCell>
                  <TableCell>{formatPrice(Number(p.price), currency)}</TableCell>
                  <TableCell>{p.quantity}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
            <Input placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              <Input placeholder="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            </div>
            <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div>
              {form.image_url && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden mb-2">
                  <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setForm({ ...form, image_url: '' })} className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5"><X className="h-3 w-3" /></button>
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save Product'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
