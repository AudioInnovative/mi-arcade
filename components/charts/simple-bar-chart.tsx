"use client";

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: BarData[];
  maxValue?: number;
  height?: number;
  showValues?: boolean;
}

export function SimpleBarChart({ 
  data, 
  maxValue: providedMax, 
  height = 200,
  showValues = true 
}: SimpleBarChartProps) {
  const maxValue = providedMax || Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-around h-full gap-2">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100;
          return (
            <div 
              key={index} 
              className="flex flex-col items-center flex-1 max-w-[80px]"
            >
              <div className="relative w-full flex flex-col items-center justify-end" style={{ height: height - 40 }}>
                {showValues && (
                  <span className="text-xs font-medium mb-1 text-muted-foreground">
                    {item.value.toLocaleString()}
                  </span>
                )}
                <div
                  className="w-full rounded-t transition-all duration-500"
                  style={{
                    height: `${Math.max(barHeight, 2)}%`,
                    backgroundColor: item.color || 'hsl(var(--primary))',
                    minHeight: '4px',
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground mt-2 truncate w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; positive: boolean };
  color?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, color }: StatCardProps) {
  return (
    <div className="p-4 rounded-lg bg-card border border-border">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon && <span style={{ color: color || 'hsl(var(--primary))' }}>{icon}</span>}
      </div>
      <div className="text-2xl font-bold font-heading" style={{ color }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtitle && (
        <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      )}
      {trend && (
        <div className={`text-xs mt-1 ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
          {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
}
