import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Dot
} from "recharts";

const StockChart = ({ apiData }) => {
  console.log(apiData)
  const today = new Date().toISOString().slice(0, 10);

  // Sort all entries by date
  const sorted = Object.entries(apiData).sort(
    ([a], [b]) => new Date(a) - new Date(b)
  );

  // Split past/today vs prediction
  const pastAndToday = sorted.filter(([date]) => date <= today);
  const prediction = sorted.find(([date]) => date > today);

  if (pastAndToday.length < 7 || !prediction) {
    return null; // or loading / error state
  }

  const last7 = pastAndToday.slice(-7);

  const todayValue = last7[6][1];
  const yesterdayValue = last7[5][1];

  const lineColor = todayValue > yesterdayValue ? "#22c55e" : "#ef4444";

  const chartData = [
    ...last7.map(([date, value]) => ({
      date,
      label: formatDate(date),
      value
    })),
    {
      date: prediction[0],
      label: formatDate(prediction[0]),
      value: prediction[1],
      isPrediction: true
    }
  ];

  return (
    <LineChart width={600} height={300} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="label" />
      <YAxis />
      <Tooltip />

      {/* Main line (past + today) */}
      <Line
        type="monotone"
        dataKey="value"
        stroke={lineColor}
        strokeWidth={2}
        connectNulls={false}
        dot={(props) => {
          if (props.payload.value == null) return null;
          if (props.payload.isPrediction) return null;
          return <Dot {...props} r={4} />;
        }}
        isAnimationActive={false}
      />

      {/* Prediction dotted segment */}
      <Line
        type="monotone"
        dataKey="value"
        stroke="#9ca3af"
        strokeDasharray="5 5"
        connectNulls={false}
        dot={(props) => {
          if (props.payload.value == null) return null;
          if (!props.payload.isPrediction) return null;
          return <Dot {...props} r={5} fill="#9ca3af" />;
        }}
        isAnimationActive={false}
      />
    </LineChart>
  );
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}`;
};

export default StockChart;
