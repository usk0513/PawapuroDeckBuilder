import React from "react";

interface StatBarProps {
  value: number;
  color: string;
  maxValue?: number;
}

const StatBar: React.FC<StatBarProps> = ({ value, color, maxValue = 5 }) => {
  // Calculate percentage (max 100%)
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <div className="flex items-center">
      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
        <div 
          className={`${color} rounded-full h-2`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium">+{value}</span>
    </div>
  );
};

export default StatBar;
