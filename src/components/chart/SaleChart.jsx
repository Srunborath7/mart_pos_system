import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function SaleChart({ data }) {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-red-50 rounded-xl shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4 text-red-900">Sale Summary By Month</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#fca5a5" />
          <XAxis
            dataKey="title"
            tick={{ fill: "#7f1d1d", fontWeight: 600 }}
            axisLine={{ stroke: "#f87171" }}
            tickLine={{ stroke: "#fca5a5" }}
          />
          <YAxis
            tick={{ fill: "#7f1d1d", fontWeight: 600 }}
            axisLine={{ stroke: "#f87171" }}
            tickLine={{ stroke: "#fca5a5" }}
          />
          <Tooltip
            formatter={(value) => `$${Number(value).toLocaleString()}`}
            contentStyle={{ backgroundColor: "#fee2e2", borderRadius: 8, border: "none" }}
            labelStyle={{ fontWeight: "bold", color: "#7f1d1d" }}
          />
          <Bar
            dataKey="total"
            fill="#991b1b" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
