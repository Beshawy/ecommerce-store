import { useQuery } from '@tanstack/react-query';
import { Package, Layers, MessageSquare, Eye, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, subDays } from 'date-fns';
import { useOutletContext } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const { storeId } = useOutletContext<{ storeId: string }>();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats', storeId],
    queryFn: async () => {
      const [products, categories, messages, views] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('store_id', storeId),
        supabase.from('categories').select('id', { count: 'exact', head: true }).eq('store_id', storeId),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('page_views' as any).select('id', { count: 'exact', head: true }),
      ]);
      return {
        products: products.count || 0,
        categories: categories.count || 0,
        messages: messages.count || 0,
        views: views.count || 0,
      };
    },
    enabled: !!storeId,
  });

  const { data: viewsChart } = useQuery({
    queryKey: ['admin-views-chart', storeId],
    queryFn: async () => {
      const since = subDays(new Date(), 14).toISOString();
      const { data, error } = await supabase
        .from('page_views' as any)
        .select('created_at')
        .gte('created_at', since);
      if (error) throw error;

      const dayMap: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'MM/dd');
        dayMap[d] = 0;
      }
      (data as any[])?.forEach((v: { created_at: string }) => {
        const d = format(new Date(v.created_at), 'MM/dd');
        if (dayMap[d] !== undefined) dayMap[d]++;
      });
      return Object.entries(dayMap).map(([date, count]) => ({ date, views: count }));
    },
    enabled: !!storeId,
  });

  const { data: topPages } = useQuery({
    queryKey: ['admin-top-pages', storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from('page_views' as any).select('page');
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data as any[])?.forEach((v: { page: string }) => {
        counts[v.page] = (counts[v.page] || 0) + 1;
      });
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([page, count]) => ({ page, views: count }));
    },
    enabled: !!storeId,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package} label="Products" value={stats?.products ?? '...'} color="bg-primary/10 text-primary" />
        <StatCard icon={Layers} label="Categories" value={stats?.categories ?? '...'} color="bg-blue-500/10 text-blue-500" />
        <StatCard icon={MessageSquare} label="Messages" value={stats?.messages ?? '...'} color="bg-amber-500/10 text-amber-500" />
        <StatCard icon={Eye} label="Page Views" value={stats?.views ?? '...'} color="bg-green-500/10 text-green-500" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Page Views (Last 14 days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewsChart || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" /> Top Pages
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPages || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="page" type="category" width={120} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
