import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useOutletContext } from 'react-router-dom';

const AdminCategories = () => {
  const { storeId } = useOutletContext<{ storeId: string }>();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories', storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').eq('store_id', storeId).order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name, image_url: imageUrl || null, store_id: storeId };
      if (editId) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories', storeId] });
      toast.success(editId ? 'Category updated' : 'Category created');
      closeDialog();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories', storeId] });
      toast.success('Category deleted');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `categories/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) { toast.error('Upload failed'); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
    setImageUrl(urlData.publicUrl);
    setUploading(false);
  };

  const closeDialog = () => { setDialogOpen(false); setEditId(null); setName(''); setImageUrl(''); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => { setEditId(null); setName(''); setImageUrl(''); setDialogOpen(true); }} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : categories?.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No categories yet</TableCell></TableRow>
            ) : (
              categories?.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden">
                      {c.image_url && <img src={c.image_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setEditId(c.id); setName(c.name); setImageUrl(c.image_url || ''); setDialogOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editId ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <Input placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} required />
            <div>
              {imageUrl && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden mb-2">
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImageUrl('')} className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5"><X className="h-3 w-3" /></button>
                </div>
              )}
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
