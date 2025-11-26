import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function PurchaseChart({ data }) {
  return (
    <div className="bg-red-50 rounded-xl shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4 text-red-900">Purchase Summary By Month</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={Array.isArray(data) ? data : []}
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
          <Line
            type="monotone"
            dataKey="total"
            name="Total Purchase"
            stroke="#991b1b" 
            strokeWidth={3}
            dot={{ stroke: "#b91c1c", strokeWidth: 2, r: 4, fill: "#f87171" }} 
            activeDot={{ r: 6, fill: "#7f1d1d", strokeWidth: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
