import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Dot,
  ResponsiveContainer
} from "recharts";

const StockChart = ({ apiData }) => {
  const today = new Date().toISOString().slice(0, 10);

  // Sort all entries by date
  const sorted = Object.entries(apiData).sort(
    ([a], [b]) => new Date(a) - new Date(b)
  );

  // Split past/today vs prediction
  const pastAndToday = sorted.filter(([date]) => date <= today);
  const prediction = sorted.find(([date]) => date > today);

  if (pastAndToday.length < 2 || !prediction) {
    return null;
  }

  const lastIndex = pastAndToday.length - 1;
  const todayDate = pastAndToday[lastIndex][0];
  const todayValue = pastAndToday[lastIndex][1];

  // ✅ Find the closest previous non-null value (not necessarily yesterday)
  const prevValidEntry = [...pastAndToday]
    .slice(0, lastIndex) // everything before today
    .reverse() // start from the most recent
    .find(([, value]) => value != null);

  const prevValidValue = prevValidEntry?.[1];

  // ✅ Decide line color based on the closest previous valid dot
  // If no previous valid value exists, fallback to neutral
  const lineColor =
    prevValidValue == null
      ? "#606060"
      : todayValue > prevValidValue
        ? "#22c55e"
        : "#ef4444";

  // Build chart data
  // - historicalValue draws the SOLID line (ends at today)
  // - forecastValue draws ONLY the last dashed segment (today -> prediction)
  const chartData = [
    ...pastAndToday.map(([date, value]) => ({
      date,
      label: formatDate(date),
      value,

      historicalValue: value,
      forecastValue: date === todayDate ? value : null, // only today has start point

      isToday: date === todayDate
    })),
    {
      date: prediction[0],
      label: formatDate(prediction[0]),
      value: prediction[1],

      historicalValue: null, // stop solid line at today
      forecastValue: prediction[1], // end point for dashed segment

      isPrediction: true
    }
  ];

  // label -> value lookup (for X axis coloring)
  const dataMap = {};
  chartData.forEach((d) => {
    dataMap[d.label] = d.value;
  });

  // ---- Y axis equal milestones ----
  const values = chartData.map((d) => d.value).filter((v) => v != null);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const TICK_COUNT = 5;

  const niceStep = (range, ticks) => {
    const rough = range / (ticks - 1);
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const fraction = rough / pow;

    if (fraction <= 1) return 1 * pow;
    if (fraction <= 2) return 2 * pow;
    if (fraction <= 5) return 5 * pow;
    return 10 * pow;
  };

  const range = max - min || 1;
  const step = niceStep(range, TICK_COUNT);

  const domainMin = Math.floor(min / step) * step;
  const domainMax = Math.ceil(max / step) * step;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="label"
          tick={(props) => (
            <CustomXAxisTick {...props} dataMap={dataMap} />
          )}
        />

        <YAxis
          domain={[domainMin, domainMax]}
          ticks={Array.from(
            { length: TICK_COUNT },
            (_, i) => domainMin + step * i
          )}
        />

        {/* Custom tooltip so you don't see duplicate rows (because there are 2 lines) */}
        <Tooltip content={<CustomTooltip />} />

        {/* 1) SOLID historical line (past -> today) */}
        <Line
          type="linear"
          dataKey="historicalValue"
          stroke={lineColor}
          strokeWidth={2}
          connectNulls
          dot={(props) => {
            const { payload, cx, cy } = props;

            // No dot if this point isn't part of the historical series
            if (payload.historicalValue == null) return null;

            // Smooth stock-style pulse for today
            if (payload.isToday) {
              return (
                <>
                  {/* core dot */}
                  <circle cx={cx} cy={cy} r={5} fill="#3b82f6" />

                  {/* outward pulse */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    opacity={0.8}
                  >
                    <animate
                      attributeName="r"
                      values="5;14"
                      dur="1.8s"
                      repeatCount="indefinite"
                      calcMode="spline"
                      keySplines="0.2 0 0.2 1"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0"
                      dur="1.8s"
                      repeatCount="indefinite"
                      calcMode="spline"
                      keySplines="0.2 0 0.2 1"
                    />
                  </circle>
                </>
              );
            }

            return <Dot {...props} r={4} />;
          }}
          isAnimationActive={false}
        />

        {/* 2) DASHED forecast segment (today -> prediction) */}
        <Line
          type="linear"
          dataKey="forecastValue"
          stroke="#606060"
          strokeWidth={2}
          strokeDasharray="6 6"
          connectNulls
          // Optional: show only a dot on the prediction point
          dot={(props) => {
            const { payload, cx, cy } = props;
            if (!payload.isPrediction) return null;

            return (
              <circle
                cx={cx}
                cy={cy}
                r={4}
                fill="#fff"
                stroke="#606060"
                strokeWidth={2}
              />
            );
          }}
          activeDot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  // both lines share the same underlying payload object per x-position
  const point = payload[0].payload;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        padding: 8,
        borderRadius: 6
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>
        {point.value}
        {point.isPrediction ? " (predicted)" : ""}
      </div>
    </div>
  );
};

const CustomXAxisTick = ({ x, y, payload, dataMap }) => {
  const isNull = dataMap[payload.value] == null;

  return (
    <text
      x={x}
      y={y + 16}
      textAnchor="middle"
      fill={isNull ? "#ef4444" : "#374151"}
      fontSize={12}
    >
      {payload.value}
    </text>
  );
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}`;
};

export default StockChart;
