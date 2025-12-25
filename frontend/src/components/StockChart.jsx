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
  // Sort dates ascending
  const entries = Object.entries(apiData).sort(
    ([a], [b]) => new Date(a) - new Date(b)
  );

  // 7 days including today
  const pastEntries = entries.slice(0, 7);
  const predictionEntry = entries[7];

  const todayValue = pastEntries[6][1];
  const yesterdayValue = pastEntries[5][1];

  const lineColor = todayValue > yesterdayValue ? "#22c55e" : "#ef4444";

  const pastData = pastEntries.map(([date, value]) => ({
    date,
    label: formatDate(date),
    value
  }));

  const predictionData = [
    {
      date: pastEntries[6][0],
      label: formatDate(pastEntries[6][0]),
      value: todayValue
    },
    {
      date: predictionEntry[0],
      label: formatDate(predictionEntry[0]),
      value: predictionEntry[1]
    }
  ];

  return (
    <LineChart width={600} height={300} data={pastData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="label" />
      <YAxis />
      <Tooltip />

      {/* Main stock line */}
      <Line
        type="monotone"
        dataKey="value"
        stroke={lineColor}
        strokeWidth={2}
        dot={{ r: 4 }}
        isAnimationActive={false}
      />

      {/* Prediction dotted line */}
      <Line
        type="monotone"
        data={predictionData}
        dataKey="value"
        stroke="#9ca3af"
        strokeDasharray="5 5"
        isAnimationActive={false}
        dot={<PredictionDot />}
      />
    </LineChart>
  );
};

const PredictionDot = ({ cx, cy, index }) => {
  if (index === 0) return null;
  return <Dot cx={cx} cy={cy} r={5} fill="#9ca3af" />;
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

export default StockChart;