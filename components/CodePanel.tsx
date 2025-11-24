import React from 'react';
import { AlgorithmData } from '../types';

interface CodePanelProps {
  algorithmData: AlgorithmData;
}

const CodePanel: React.FC<CodePanelProps> = ({ algorithmData }) => {
  return (
    <div className="flex flex-col h-full gap-4">
        
        {/* Pseudocode Block */}
        <div className="flex-1 bg-neon-panel/50 border border-neon-blue/20 rounded-xl p-6 overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-transparent"></div>
            <h2 className="text-neon-blue font-mono text-lg mb-4 flex justify-between">
                <span>PSEUDOCODE: {algorithmData.name.toUpperCase()}</span>
                <span className="text-xs text-gray-500 border border-gray-700 px-2 py-1 rounded bg-black/40">READ-ONLY</span>
            </h2>
            <div className="font-mono text-sm text-gray-300 overflow-auto h-[calc(100%-3rem)] whitespace-pre custom-scrollbar">
                {algorithmData.pseudocode}
            </div>
        </div>
    </div>
  );
};

export default CodePanel;