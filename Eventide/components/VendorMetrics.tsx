import React, { useState } from "react";
import { IndianRupee, Eye, CalendarCheck, TrendingUp, X } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface VendorMetricsProps {
  metrics: {
    revenue: number;
    bookings: number;
    views: number;
  };
}

// Mock historical data generation for charts
const generateChartData = (type: "revenue" | "bookings" | "views") => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day) => {
    let value = 0;
    if (type === "revenue") value = Math.floor(Math.random() * 5000) + 2000;
    if (type === "bookings") value = Math.floor(Math.random() * 5) + 1;
    if (type === "views") value = Math.floor(Math.random() * 300) + 100;
    return { name: day, value };
  });
};

const VendorMetrics: React.FC<VendorMetricsProps> = ({ metrics }) => {
  const [expandedMetric, setExpandedMetric] = useState<
    "revenue" | "bookings" | "views" | null
  >(null);

  const colorStyles = {
    green: {
      bg: "bg-green-100 dark:bg-green-900/20",
      text: "text-green-600 dark:text-green-400",
      hoverBg: "group-hover:bg-green-200 dark:group-hover:bg-green-900/30",
      badgeBg: "bg-green-50 dark:bg-green-900/40",
      badgeText: "text-green-600 dark:text-green-300",
      iconColor: "text-green-600 dark:text-green-400",
    },
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      hoverBg: "group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30",
      badgeBg: "bg-blue-50 dark:bg-blue-900/40",
      badgeText: "text-blue-600 dark:text-blue-300",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
      hoverBg: "group-hover:bg-purple-200 dark:group-hover:bg-purple-900/30",
      badgeBg: "bg-purple-50 dark:bg-purple-900/40",
      badgeText: "text-purple-600 dark:text-purple-300",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  };

  const metricConfig = {
    revenue: {
      title: "Monthly Revenue",
      value: `₹${metrics.revenue.toLocaleString()}`,
      icon: IndianRupee,
      color: "green" as keyof typeof colorStyles,
      data: generateChartData("revenue"),
      colorHex: "#10b981", // green-500
      subtext: "+12% from last month",
    },
    bookings: {
      title: "Active Bookings",
      value: metrics.bookings,
      icon: CalendarCheck,
      color: "blue" as keyof typeof colorStyles,
      data: generateChartData("bookings"),
      colorHex: "#3b82f6", // blue-500
      subtext: "Next event: Dec 12",
    },
    views: {
      title: "Profile Views",
      value: metrics.views.toLocaleString(),
      icon: Eye,
      color: "purple" as keyof typeof colorStyles,
      data: generateChartData("views"),
      colorHex: "#a855f7", // purple-500
      subtext: "Top 5% in your category",
    },
  };

  const renderCard = (key: "revenue" | "bookings" | "views") => {
    const config = metricConfig[key];
    const Icon = config.icon;
    const styles = colorStyles[config.color];

    return (
      <div
        onClick={() => setExpandedMetric(key)}
        className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all duration-500 ease-out cursor-pointer relative overflow-hidden group
          ${
            !expandedMetric ? "hover:scale-105 hover:shadow-2xl hover:z-10" : ""
          }
        `}
      >
        <div className="flex items-center gap-4 relative z-10">
          <div
            className={`p-3 rounded-2xl transition-colors duration-300 ${styles.bg} ${styles.text} ${styles.hoverBg}`}
          >
            <Icon size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{config.title}</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {config.value}
            </h3>
          </div>
        </div>
        <div
          className={`mt-4 flex items-center text-xs font-bold w-fit px-2 py-1 rounded-lg transition-colors ${styles.badgeBg} ${styles.badgeText}`}
        >
          {key === "revenue" && <TrendingUp size={14} className="mr-1" />}
          {config.subtext}
        </div>

        {/* Background Decoration */}
        <div
          className={`absolute -right-4 -bottom-4 opacity-5 transform scale-150 rotate-12 transition-transform duration-500 group-hover:scale-175 group-hover:rotate-6 ${styles.iconColor}`}
        >
          <Icon size={100} />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderCard("revenue")}
        {renderCard("bookings")}
        {renderCard("views")}
      </div>

      {/* Expanded Modal View */}
      {expandedMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setExpandedMetric(null)}
          ></div>

          <div className="bg-white rounded-[2rem] w-full max-w-2xl relative z-10 shadow-2xl animate-fade-in-up overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-8 pb-0 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div
                  className={`p-4 rounded-2xl ${
                    colorStyles[metricConfig[expandedMetric].color].bg
                  } ${colorStyles[metricConfig[expandedMetric].color].text}`}
                >
                  {React.createElement(metricConfig[expandedMetric].icon, {
                    size: 32,
                  })}
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900">
                    {metricConfig[expandedMetric].value}
                  </h2>
                  <p className="text-lg text-slate-500 font-medium">
                    {metricConfig[expandedMetric].title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExpandedMetric(null)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Graph Container */}
            <div className="p-8 flex-1 min-h-[350px]">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-6">
                Weekly Trend
              </h3>
              <div className="w-full h-[300px] bg-slate-50 rounded-3xl p-4 border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricConfig[expandedMetric].data}>
                    <defs>
                      <linearGradient
                        id={`color${expandedMetric}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={metricConfig[expandedMetric].colorHex}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={metricConfig[expandedMetric].colorHex}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
                      }}
                      cursor={{
                        stroke: metricConfig[expandedMetric].colorHex,
                        strokeWidth: 2,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={metricConfig[expandedMetric].colorHex}
                      strokeWidth={4}
                      fillOpacity={1}
                      fill={`url(#color${expandedMetric})`}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-slate-400 text-sm mt-4">
                Data updated in real-time based on your activity.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VendorMetrics;
