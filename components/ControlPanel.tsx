import React from 'react';
import { AlgorithmType } from '../types';

interface LastRunStats {
    algo: string;
    steps: number;
}

interface ControlPanelProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  selectedAlgorithm: AlgorithmType;
  onAlgorithmChange: (algo: AlgorithmType) => void;
  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  lastRun?: LastRunStats | null;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isPlaying,
  currentStep,
  totalSteps,
  selectedAlgorithm,
  onAlgorithmChange,
  onPrevious,
  onNext,
  onPlayPause,
  onReset,
  speed,
  onSpeedChange,
  lastRun
}) => {
  return (
    <div className="flex flex-col gap-4 w-full bg-neon-panel border-t border-white/10 p-6 shadow-2xl z-10">
      
      {/* Top Row: Algorithm Select & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Dropdown */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
          <select 
            value={selectedAlgorithm}
            onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmType)}
            className="relative w-full md:w-64 bg-slate-900 text-neon-blue border border-white/20 rounded-md py-2 px-4 font-mono focus:outline-none focus:ring-2 focus:ring-neon-blue"
          >
            {Object.values(AlgorithmType).map((algo) => (
              <option key={algo} value={algo}>{algo}</option>
            ))}
          </select>
        </div>

        {/* Counters */}
        <div className="flex gap-8 font-mono text-sm">
            <div className="flex flex-col items-center">
                <span className="text-gray-500 uppercase text-xs">Steps</span>
                <span className="text-neon-green text-xl">{currentStep} <span className="text-gray-600 text-sm">/ {totalSteps}</span></span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-gray-500 uppercase text-xs">Speed (ms)</span>
                <input 
                    type="range" 
                    min="10" 
                    max="500" 
                    step="10" 
                    value={speed} 
                    onChange={(e) => onSpeedChange(Number(e.target.value))}
                    className="accent-neon-purple h-2 w-24 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                {lastRun && (
                    <div className="text-[10px] text-gray-500 mt-1 whitespace-nowrap">
                        Last Run: <span className="text-neon-blue">{lastRun.algo}</span> ({lastRun.steps} steps)
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Bottom Row: Playback Controls */}
      <div className="flex justify-center gap-4 mt-2">
        <button 
            onClick={onReset}
            className="px-6 py-2 rounded font-bold text-white hover:bg-white/10 border border-white/10 transition-colors uppercase text-sm tracking-widest"
        >
            Reset
        </button>
        
        <button 
            onClick={onPrevious}
            disabled={currentStep === 0 || isPlaying}
            className="px-4 py-2 rounded text-neon-blue border border-neon-blue/30 hover:bg-neon-blue/10 disabled:opacity-30 transition-all"
        >
             &lt; Prev
        </button>

        <button 
            onClick={onPlayPause}
            className={`
                px-8 py-2 rounded font-bold uppercase tracking-widest transition-all shadow-lg
                ${isPlaying 
                    ? 'bg-red-500/20 text-red-400 border border-red-500 hover:bg-red-500/30 shadow-red-500/20' 
                    : 'bg-neon-green/20 text-neon-green border border-neon-green hover:bg-neon-green/30 shadow-neon-green/20'
                }
            `}
        >
            {isPlaying ? 'Pause' : 'Run'}
        </button>

        <button 
            onClick={onNext}
            disabled={currentStep === totalSteps - 1 || isPlaying}
            className="px-4 py-2 rounded text-neon-blue border border-neon-blue/30 hover:bg-neon-blue/10 disabled:opacity-30 transition-all"
        >
            Next &gt;
        </button>
      </div>

    </div>
  );
};

export default ControlPanel;
