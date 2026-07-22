import { PieChart as RPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  data: Record<string, unknown>[];
  dataKey: string;
  nameKey: string;
  colors?: string[];
  title?: string;
  height?: number;
}

const DEFAULT_COLORS = ["#16a34a", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function PieChartComp({ data, dataKey, nameKey, colors = DEFAULT_COLORS, title, height = 260 }: Props) {
  return (
    <div>
      {title && <h3 className="text-xs font-semibold text-slate-700 mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RPieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey={dataKey} nameKey={nameKey}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "12px" }} />
          <Legend verticalAlign="bottom" iconType="circle" iconSize={6} formatter={(v: string) => <span className="text-xs text-slate-600">{v}</span>} />
        </RPieChart>
      </ResponsiveContainer>
    </div>
  );
}
