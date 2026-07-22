import { AreaChart as RAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  color?: string;
  title?: string;
  height?: number;
}

export default function AreaChartComp({ data, xKey, yKey, color = "#16a34a", title, height = 260 }: Props) {
  return (
    <div>
      {title && <h3 className="text-xs font-semibold text-slate-700 mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RAreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
          <defs>
            <linearGradient id={`g-${yKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "12px" }} />
          <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} fill={`url(#g-${yKey})`} />
        </RAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
