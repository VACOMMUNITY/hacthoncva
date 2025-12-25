import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useLeadsByStatus, useLeadsBySource } from '@/hooks/useAnalytics';

const statusColors: Record<string, string> = {
  new: 'hsl(199 89% 48%)',
  contacted: 'hsl(262 83% 58%)',
  qualified: 'hsl(38 92% 50%)',
  registered: 'hsl(24 95% 53%)',
  won: 'hsl(142 76% 36%)',
  lost: 'hsl(0 84% 60%)',
};

const sourceColors = [
  'hsl(239 84% 67%)',
  'hsl(262 83% 58%)',
  'hsl(24 95% 53%)',
  'hsl(142 76% 36%)',
  'hsl(38 92% 50%)',
  'hsl(199 89% 48%)',
];

export const LeadsByStatusChart = () => {
  const { data: leadsByStatus, isLoading } = useLeadsByStatus();

  if (isLoading || !leadsByStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leads by Status</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = leadsByStatus.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    fill: statusColors[item.status],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Leads by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const LeadsBySourceChart = () => {
  const { data: leadsBySource, isLoading } = useLeadsBySource();

  if (isLoading || !leadsBySource) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leads by Source</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = leadsBySource.map((item, index) => ({
    name: item.source.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    value: item.count,
    fill: sourceColors[index % sourceColors.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Leads by Source</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
