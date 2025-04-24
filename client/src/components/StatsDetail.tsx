import React from "react";
import StatBar from "@/components/StatBar";

interface Stat {
  name: string;
  value: number;
  color: string;
}

interface StatsDetailProps {
  title: string;
  titleColor: string;
  stats: Stat[];
}

const StatsDetail: React.FC<StatsDetailProps> = ({ title, titleColor, stats }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className={`${titleColor} font-medium mb-2 border-b border-gray-200 pb-2`}>{title}</h4>
      <div className="space-y-2">
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-700">{stat.name}</span>
            <StatBar value={stat.value} color={stat.color} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsDetail;
