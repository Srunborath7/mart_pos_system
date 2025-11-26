import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function SaleThisMonthChart({ data }) {
  const avg = data?.total_order ? data?.total / data?.total_order : 0;

  const chartData = [
    { name: "Total Sale", value: data?.total ?? 0 },
    { name: "Total Orders", value: data?.total_order ?? 0 },
    { name: "Average Order", value: avg ?? 0 },
  ];

  const COLORS = ["#991b1b", "#f87171", "#fca5a5"];

  return (
    <div className="bg-red-50 rounded-xl shadow-lg p-4 flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold  text-red-900 w-full text-center">
        Sale This Month Overview
      </h2>
      <ResponsiveContainer width={300} height={300} padding="10px">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, value }) => `${name}: $${Number(value).toLocaleString()}`}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `$${Number(value).toLocaleString()}`}
            contentStyle={{
              backgroundColor: "#fee2e2",
              borderRadius: 8,
              border: "none",
            }}
            labelStyle={{ fontWeight: "bold", color: "#7f1d1d" }}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ color: "#7f1d1d", fontWeight: 600 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
