export enum AlgorithmType {
  BUBBLE_SORT = 'Bubble Sort',
  SELECTION_SORT = 'Selection Sort',
  INSERTION_SORT = 'Insertion Sort',
  QUICK_SORT = 'Quick Sort',
  MERGE_SORT = 'Merge Sort',
  HEAP_SORT = 'Heap Sort',
  RADIX_SORT = 'Radix Sort',
  COUNTING_SORT = 'Counting Sort',
  SHELL_SORT = 'Shell Sort',
  TIM_SORT = 'Tim Sort'
}

export interface SortStep {
  array: number[];
  comparison: number[]; // Indices currently being compared
  swap: number[];       // Indices currently being swapped (if any)
  sorted: number[];     // Indices that are confirmed sorted
  description?: string; // Optional text description of the step
}

export interface AlgorithmData {
  name: AlgorithmType;
  pseudocode: string;
  timeComplexity: string;
  spaceComplexity: string;
}