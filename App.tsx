import React, { useState, useEffect, useRef, useCallback } from 'react';
import ControlPanel from './components/ControlPanel';
import Visualizer from './components/Visualizer';
import CodePanel from './components/CodePanel';
import { AlgorithmType, SortStep } from './types';
import { ALGORITHM_INFO } from './constants';
import { getSortSteps } from './services/sortingLogic';

const ARRAY_SIZE = 20;
const INITIAL_SPEED = 100;

function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>(AlgorithmType.BUBBLE_SORT);
  const [initialArray, setInitialArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  // Last Run Stats
  const [lastRunStats, setLastRunStats] = useState<{ algo: string, steps: number } | null>(null);

  const timerRef = useRef<number | null>(null);

  // Initialize Random Array
  const generateRandomArray = useCallback(() => {
    const newArray = Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 90) + 10);
    setInitialArray(newArray);
    return newArray;
  }, []);

  // Compute Steps when Algorithm or Array changes
  useEffect(() => {
    // Avoid infinite loop on initial render if array is empty
    const arr = initialArray.length > 0 ? initialArray : generateRandomArray();
    
    const computedSteps = getSortSteps(selectedAlgorithm, arr);
    setSteps(computedSteps);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [selectedAlgorithm, initialArray, generateRandomArray]);

  // Handler for changing algorithm that saves previous run stats
  const handleAlgorithmChange = (newAlgo: AlgorithmType) => {
      // Save stats of current algorithm before switching, if steps exist
      if (steps.length > 0) {
          setLastRunStats({ algo: selectedAlgorithm, steps: steps.length });
      }
      setSelectedAlgorithm(newAlgo);
  };

  // Timer Logic for "Playing"
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            // Run completed, save stats
            setLastRunStats({ algo: selectedAlgorithm, steps: steps.length });
            return prev;
          }
          return prev + 1;
        });
      }, 510 - speed); // Invert speed so higher number = faster
    } else if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length, speed, selectedAlgorithm]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    // When resetting with same algo, save current stats as "last run"
    if (steps.length > 0) {
        setLastRunStats({ algo: selectedAlgorithm, steps: steps.length });
    }
    generateRandomArray();
  };

  const currentStepData = steps[currentStepIndex] || { array: [], comparison: [], swap: [], sorted: [] };

  return (
    <div className="flex flex-col h-screen w-full bg-[#050510] text-white overflow-hidden font-sans selection:bg-neon-purple selection:text-white">
      
      {/* Header */}
      <header className="flex-none h-16 border-b border-white/10 flex items-center px-8 bg-black/20 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-neon-blue to-neon-purple shadow-[0_0_15px_rgba(0,243,255,0.5)]"></div>
            <h1 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                NEON<span className="text-neon-blue">SORT</span>
            </h1>
        </div>
        <div className="ml-auto flex items-center gap-6 text-xs font-mono text-gray-500">
            <span>COMPLEXITY: <span className="text-neon-green">{ALGORITHM_INFO[selectedAlgorithm].timeComplexity}</span></span>
            <span>MEM: <span className="text-neon-purple">{ALGORITHM_INFO[selectedAlgorithm].spaceComplexity}</span></span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Background Grid Effect */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(56, 189, 248, 0.3) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
        </div>

        {/* Left Column: Code & Info */}
        <div className="w-full md:w-1/3 lg:w-1/4 p-6 z-10 border-r border-white/5 bg-black/20 backdrop-blur-sm">
           <CodePanel 
             algorithmData={ALGORITHM_INFO[selectedAlgorithm]} 
           />
        </div>

        {/* Right Column: Visualization */}
        <div className="flex-1 p-6 z-10 flex flex-col items-center justify-center relative">
            <Visualizer 
                currentStepData={currentStepData} 
                dataSize={ARRAY_SIZE}
            />
            
            {/* Overlay Status */}
            <div className="absolute top-10 right-10">
                 {currentStepIndex === steps.length - 1 && steps.length > 0 && (
                     <div className="bg-neon-green/20 border border-neon-green text-neon-green px-4 py-2 rounded shadow-[0_0_20px_rgba(10,255,10,0.3)] animate-pulse font-mono text-sm font-bold">
                         SORT COMPLETE
                     </div>
                 )}
            </div>
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="flex-none z-30">
        <ControlPanel 
            isPlaying={isPlaying}
            currentStep={currentStepIndex}
            totalSteps={steps.length}
            selectedAlgorithm={selectedAlgorithm}
            onAlgorithmChange={handleAlgorithmChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onReset={handleReset}
            speed={speed}
            onSpeedChange={setSpeed}
            lastRun={lastRunStats}
        />
      </footer>
    </div>
  );
}

export default App;
