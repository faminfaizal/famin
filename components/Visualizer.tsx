import React from 'react';
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { SortStep } from '../types';

interface VisualizerProps {
  currentStepData: SortStep;
  dataSize: number;
}

const Visualizer: React.FC<VisualizerProps> = ({ currentStepData, dataSize }) => {
  // Transform array of numbers into Recharts friendly object array
  const chartData = currentStepData.array.map((value, index) => ({
    index,
    value,
  }));

  const getBarColor = (index: number) => {
    if (currentStepData.sorted.includes(index)) return '#0aff0a'; // Neon Green (Sorted)
    if (currentStepData.swap.includes(index)) return '#bc13fe';   // Neon Purple (Swap)
    if (currentStepData.comparison.includes(index)) return '#facc15'; // Yellow (Compare)
    return '#00f3ff'; // Neon Blue (Default)
  };

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col justify-center items-center relative p-4 bg-neon-panel/30 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(0,243,255,0.1)]">
        <h3 className="absolute top-4 left-4 text-neon-blue font-mono tracking-widest text-sm uppercase">Visualization Module</h3>
        
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
             {/* Hide axes for a cleaner look, or style them minimally */}
             <XAxis dataKey="index" hide />
             <YAxis hide domain={[0, 'auto']} />
             <Bar dataKey="value" animationDuration={200} isAnimationActive={false}>
               {chartData.map((entry, index) => (
                 <Cell 
                    key={`cell-${index}`} 
                    fill={getBarColor(index)} 
                    stroke={getBarColor(index)}
                    strokeWidth={1}
                    className="transition-all duration-200"
                  />
               ))}
             </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Simple Legend */}
        <div className="flex gap-4 text-xs font-mono text-gray-400 mt-2">
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#00f3ff] rounded-sm"></span> Idle</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#facc15] rounded-sm"></span> Compare</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#bc13fe] rounded-sm"></span> Swap</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#0aff0a] rounded-sm"></span> Sorted</div>
        </div>
    </div>
  );
};

export default Visualizer;
