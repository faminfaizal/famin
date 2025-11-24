import { SortStep, AlgorithmType } from '../types';

// Helper to create a snapshot of the current state
const createStep = (
  array: number[],
  comparison: number[] = [],
  swap: number[] = [],
  sorted: number[] = []
): SortStep => {
  return {
    array: [...array], // Deep copy
    comparison,
    swap,
    sorted: [...sorted],
  };
};

export const generateBubbleSortSteps = (array: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...array];
  const n = arr.length;
  const sortedIndices: number[] = [];

  steps.push(createStep(arr, [], [], []));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push(createStep(arr, [j, j + 1], [], sortedIndices)); // Compare

      if (arr[j] > arr[j + 1]) {
        // Swap
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        steps.push(createStep(arr, [j, j + 1], [j, j + 1], sortedIndices));
      }
    }
    sortedIndices.push(n - i - 1);
    steps.push(createStep(arr, [], [], sortedIndices)); // Mark sorted
  }
  // Mark remaining as sorted
  steps.push(createStep(arr, [], [], Array.from({ length: n }, (_, i) => i)));

  return steps;
};

export const generateSelectionSortSteps = (array: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...array];
  const n = arr.length;
  const sortedIndices: number[] = [];

  steps.push(createStep(arr));

  for (let i = 0; i < n; i++) {
    let minIdx = i;
    steps.push(createStep(arr, [i], [], sortedIndices)); // Highlight current start

    for (let j = i + 1; j < n; j++) {
      steps.push(createStep(arr, [minIdx, j], [], sortedIndices)); // Compare with min
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
      steps.push(createStep(arr, [], [i, minIdx], sortedIndices)); // Swap
    }
    sortedIndices.push(i);
  }
  steps.push(createStep(arr, [], [], Array.from({ length: n }, (_, k) => k)));
  return steps;
};

export const generateInsertionSortSteps = (array: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...array];
  const n = arr.length;
  
  steps.push(createStep(arr));

  for (let i = 1; i < n; i++) {
    let j = i;
    steps.push(createStep(arr, [i], [], []));
    
    while (j > 0 && arr[j - 1] > arr[j]) {
      steps.push(createStep(arr, [j - 1, j], [], [])); // Compare
      
      const temp = arr[j];
      arr[j] = arr[j - 1];
      arr[j - 1] = temp;
      
      steps.push(createStep(arr, [j - 1, j], [j - 1, j], [])); // Swap
      j--;
    }
  }
  
  steps.push(createStep(arr, [], [], Array.from({ length: n }, (_, k) => k)));
  return steps;
};


export const generateQuickSortSteps = (array: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  const arr = [...array];
  
  const partition = (low: number, high: number) => {
    const pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      steps.push(createStep(arr, [j, high], [])); // Compare with pivot
      if (arr[j] < pivot) {
        i++;
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        steps.push(createStep(arr, [i, j], [i, j])); // Swap
      }
    }
    
    const temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    steps.push(createStep(arr, [i + 1, high], [i + 1, high])); // Swap pivot to correct place
    return i + 1;
  };

  const quickSort = (low: number, high: number) => {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    }
  };

  quickSort(0, arr.length - 1);
  steps.push(createStep(arr, [], [], Array.from({ length: arr.length }, (_, k) => k)));
  return steps;
};

export const generateMergeSortSteps = (array: number[]): SortStep[] => {
  const steps: SortStep[] = [];
  let arr = [...array];

  const merge = (start: number, mid: number, end: number) => {
    const leftArr = arr.slice(start, mid + 1);
    const rightArr = arr.slice(mid + 1, end + 1);
    
    let i = 0, j = 0, k = start;
    
    while (i < leftArr.length && j < rightArr.length) {
      steps.push(createStep(arr, [start + i, mid + 1 + j], [])); // Comparison
      
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        steps.push(createStep(arr, [], [k])); // Overwrite
        i++;
      } else {
        arr[k] = rightArr[j];
        steps.push(createStep(arr, [], [k])); // Overwrite
        j++;
      }
      k++;
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i];
       steps.push(createStep(arr, [], [k]));
      i++;
      k++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j];
       steps.push(createStep(arr, [], [k]));
      j++;
      k++;
    }
  };

  const mergeSort = (start: number, end: number) => {
    if (start >= end) return;
    const mid = Math.floor((start + end) / 2);
    mergeSort(start, mid);
    mergeSort(mid + 1, end);
    merge(start, mid, end);
  };

  mergeSort(0, arr.length - 1);
  steps.push(createStep(arr, [], [], Array.from({ length: arr.length }, (_, k) => k)));
  return steps;
};

// --- NEW ALGORITHMS ---

export const generateHeapSortSteps = (array: number[]): SortStep[] => {
    const steps: SortStep[] = [];
    const arr = [...array];
    const n = arr.length;
    let sortedIndices: number[] = [];

    const heapify = (n: number, i: number) => {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        steps.push(createStep(arr, [i], [], sortedIndices));

        if (left < n) {
             steps.push(createStep(arr, [largest, left], [], sortedIndices));
             if (arr[left] > arr[largest]) {
                 largest = left;
             }
        }

        if (right < n) {
             steps.push(createStep(arr, [largest, right], [], sortedIndices));
             if (arr[right] > arr[largest]) {
                 largest = right;
             }
        }

        if (largest !== i) {
            const temp = arr[i];
            arr[i] = arr[largest];
            arr[largest] = temp;
            steps.push(createStep(arr, [i, largest], [i, largest], sortedIndices));

            heapify(n, largest);
        }
    };

    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(n, i);
    }

    // Heap sort
    for (let i = n - 1; i > 0; i--) {
        const temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        
        sortedIndices = [...sortedIndices, i];
        steps.push(createStep(arr, [0, i], [0, i], sortedIndices)); // Move max to end

        heapify(i, 0);
    }
    sortedIndices.push(0);
    steps.push(createStep(arr, [], [], sortedIndices));

    return steps;
};

export const generateShellSortSteps = (array: number[]): SortStep[] => {
    const steps: SortStep[] = [];
    const arr = [...array];
    const n = arr.length;

    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        for (let i = gap; i < n; i++) {
            const temp = arr[i];
            let j = i;
            steps.push(createStep(arr, [i], [], [])); // Highlight current

            while (j >= gap && arr[j - gap] > temp) {
                steps.push(createStep(arr, [j, j - gap], [], [])); // Compare
                arr[j] = arr[j - gap];
                steps.push(createStep(arr, [j, j-gap], [j], [])); // Overwrite (Swap visual-ish)
                j -= gap;
            }
            arr[j] = temp;
            steps.push(createStep(arr, [], [j], [])); // Place temp
        }
    }
    
    steps.push(createStep(arr, [], [], Array.from({ length: n }, (_, k) => k)));
    return steps;
};

export const generateCountingSortSteps = (array: number[]): SortStep[] => {
    const steps: SortStep[] = [];
    const arr = [...array];
    const max = Math.max(...arr);
    
    // Visualization of counting sort is tricky with just one array. 
    // We will visualize the reconstruction phase primarily.
    
    const count = new Array(max + 1).fill(0);
    
    // Counting phase (just highlight)
    for (let i = 0; i < arr.length; i++) {
        count[arr[i]]++;
        steps.push(createStep(arr, [i], [], []));
    }
    
    // Cumulative count
    for (let i = 1; i <= max; i++) {
        count[i] += count[i - 1];
    }
    
    const output = new Array(arr.length).fill(0);
    
    // Build output array
    // Since we can't show a secondary array easily, we will simulate the placement logic 
    // but in the visualizer we will just update the main array one by one for effect 
    // OR we just do the overwrite pass.
    
    // To make it look like sorting, let's rebuild the array based on counts directly
    let sortedIndex = 0;
    // We need to rebuild counts to iterate
    const reconstructCounts = new Array(max + 1).fill(0);
    for(let x of array) reconstructCounts[x]++;

    for (let i = 0; i < reconstructCounts.length; i++) {
        while (reconstructCounts[i] > 0) {
            arr[sortedIndex] = i;
            steps.push(createStep(arr, [], [sortedIndex], Array.from({length: sortedIndex}, (_, k) => k)));
            reconstructCounts[i]--;
            sortedIndex++;
        }
    }
    
    steps.push(createStep(arr, [], [], Array.from({ length: arr.length }, (_, k) => k)));
    return steps;
};

export const generateRadixSortSteps = (array: number[]): SortStep[] => {
    const steps: SortStep[] = [];
    const arr = [...array];
    const max = Math.max(...arr);

    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        const output = new Array(arr.length).fill(0);
        const count = new Array(10).fill(0);
        
        // Count
        for (let i = 0; i < arr.length; i++) {
            const digit = Math.floor(arr[i] / exp) % 10;
            count[digit]++;
            steps.push(createStep(arr, [i], [], [])); // Highlight
        }

        // Accumulate
        for (let i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }

        // Build output
        for (let i = arr.length - 1; i >= 0; i--) {
             const digit = Math.floor(arr[i] / exp) % 10;
             output[count[digit] - 1] = arr[i];
             count[digit]--;
        }

        // Copy back to arr
        for (let i = 0; i < arr.length; i++) {
            arr[i] = output[i];
            steps.push(createStep(arr, [], [i], [])); // Update
        }
    }

    steps.push(createStep(arr, [], [], Array.from({ length: arr.length }, (_, k) => k)));
    return steps;
};

export const generateTimSortSteps = (array: number[]): SortStep[] => {
    // Simplified TimSort: Insertion Sort on small chunks + Merge
    const steps: SortStep[] = [];
    const arr = [...array];
    const n = arr.length;
    const RUN = 4; // Small run size for visualization (since array is ~20)

    // Sort individual subarrays of size RUN
    for (let i = 0; i < n; i += RUN) {
        // Insertion Sort
        const end = Math.min(i + RUN - 1, n - 1);
        for (let j = i + 1; j <= end; j++) {
            let k = j;
            steps.push(createStep(arr, [k], [], []));
            while (k > i && arr[k - 1] > arr[k]) {
                 steps.push(createStep(arr, [k-1, k], [], []));
                 const temp = arr[k];
                 arr[k] = arr[k - 1];
                 arr[k - 1] = temp;
                 steps.push(createStep(arr, [k-1, k], [k-1, k], []));
                 k--;
            }
        }
    }

    // Merge runs
    for (let size = RUN; size < n; size = 2 * size) {
        for (let left = 0; left < n; left += 2 * size) {
            const mid = left + size - 1;
            const right = Math.min(left + 2 * size - 1, n - 1);
            if (mid < right) {
                // Merge logic (similar to merge sort but in-place or using temp)
                // Using auxiliary array logic for steps
                const leftArr = arr.slice(left, mid + 1);
                const rightArr = arr.slice(mid + 1, right + 1);
                let i = 0, j = 0, k = left;
                
                while (i < leftArr.length && j < rightArr.length) {
                    steps.push(createStep(arr, [left+i, mid+1+j], [], []));
                    if (leftArr[i] <= rightArr[j]) {
                        arr[k] = leftArr[i];
                        steps.push(createStep(arr, [], [k], []));
                        i++;
                    } else {
                        arr[k] = rightArr[j];
                        steps.push(createStep(arr, [], [k], []));
                        j++;
                    }
                    k++;
                }
                while (i < leftArr.length) {
                    arr[k] = leftArr[i];
                    steps.push(createStep(arr, [], [k], []));
                    i++; k++;
                }
                while (j < rightArr.length) {
                    arr[k] = rightArr[j];
                    steps.push(createStep(arr, [], [k], []));
                    j++; k++;
                }
            }
        }
    }
    
    steps.push(createStep(arr, [], [], Array.from({ length: n }, (_, k) => k)));
    return steps;
};

export const getSortSteps = (type: AlgorithmType, array: number[]): SortStep[] => {
  switch (type) {
    case AlgorithmType.BUBBLE_SORT: return generateBubbleSortSteps(array);
    case AlgorithmType.SELECTION_SORT: return generateSelectionSortSteps(array);
    case AlgorithmType.INSERTION_SORT: return generateInsertionSortSteps(array);
    case AlgorithmType.QUICK_SORT: return generateQuickSortSteps(array);
    case AlgorithmType.MERGE_SORT: return generateMergeSortSteps(array);
    case AlgorithmType.HEAP_SORT: return generateHeapSortSteps(array);
    case AlgorithmType.RADIX_SORT: return generateRadixSortSteps(array);
    case AlgorithmType.COUNTING_SORT: return generateCountingSortSteps(array);
    case AlgorithmType.SHELL_SORT: return generateShellSortSteps(array);
    case AlgorithmType.TIM_SORT: return generateTimSortSteps(array);
    default: return generateBubbleSortSteps(array);
  }
};
