import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

function UsageChart({ data }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-xl font-semibold mt-2 mb-6 space-y-4">Task Usage Chart</h2>
      <LineChart width={600} height={300} data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <CartesianGrid stroke="#ccc" />
        <Line type="monotone" dataKey="tasksAdded" stroke="#8884d8" />
        <Line type="monotone" dataKey="tasksCompleted" stroke="#82ca9d" />
      </LineChart>
    </div>
  );
}

export default UsageChart;
