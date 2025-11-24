import { AlgorithmType, AlgorithmData } from './types';

export const ALGORITHM_INFO: Record<AlgorithmType, AlgorithmData> = {
  [AlgorithmType.BUBBLE_SORT]: {
    name: AlgorithmType.BUBBLE_SORT,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    pseudocode: `procedure bubbleSort(A : list of sortable items)
    n := length(A)
    repeat
        swapped := false
        for i := 1 to n-1 inclusive do
            if A[i-1] > A[i] then
                swap(A[i-1], A[i])
                swapped := true
            end if
        end for
        n := n - 1
    until not swapped
end procedure`
  },
  [AlgorithmType.SELECTION_SORT]: {
    name: AlgorithmType.SELECTION_SORT,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    pseudocode: `procedure selectionSort(A : list of sortable items)
    n := length(A)
    for i := 0 to n - 2 do
        minIdx := i
        for j := i + 1 to n - 1 do
            if A[j] < A[minIdx] then
                minIdx := j
            end if
        end for
        swap(A[i], A[minIdx])
    end for
end procedure`
  },
  [AlgorithmType.INSERTION_SORT]: {
    name: AlgorithmType.INSERTION_SORT,
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    pseudocode: `procedure insertionSort(A : list of sortable items)
    i := 1
    while i < length(A)
        j := i
        while j > 0 and A[j-1] > A[j]
            swap(A[j], A[j-1])
            j := j - 1
        end while
        i := i + 1
    end while
end procedure`
  },
  [AlgorithmType.QUICK_SORT]: {
    name: AlgorithmType.QUICK_SORT,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    pseudocode: `algorithm quicksort(A, lo, hi) is
    if lo >= hi || lo < 0 then return
    p := partition(A, lo, hi)
    quicksort(A, lo, p - 1)
    quicksort(A, p + 1, hi)

algorithm partition(A, lo, hi) is
    pivot := A[hi]
    i := lo
    for j := lo to hi - 1 do
        if A[j] <= pivot then
            swap A[i] with A[j]
            i := i + 1
    swap A[i] with A[hi]
    return i`
  },
  [AlgorithmType.MERGE_SORT]: {
    name: AlgorithmType.MERGE_SORT,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    pseudocode: `procedure mergeSort(A)
    if length(A) <= 1 return A

    mid := length(A) / 2
    left := mergeSort(A[0..mid])
    right := mergeSort(A[mid..end])

    return merge(left, right)
end procedure`
  },
  [AlgorithmType.HEAP_SORT]: {
    name: AlgorithmType.HEAP_SORT,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    pseudocode: `procedure heapSort(A)
    buildMaxHeap(A)
    for i from length(A) - 1 down to 1 do
        swap(A[0], A[i])
        heapSize := heapSize - 1
        maxHeapify(A, 0)
    end for
end procedure`
  },
  [AlgorithmType.RADIX_SORT]: {
    name: AlgorithmType.RADIX_SORT,
    timeComplexity: 'O(nk)',
    spaceComplexity: 'O(n+k)',
    pseudocode: `procedure radixSort(A)
    m := getMax(A)
    for exp := 1 to m/exp > 0 do
        countingSort(A, exp)
    end for
end procedure`
  },
  [AlgorithmType.COUNTING_SORT]: {
    name: AlgorithmType.COUNTING_SORT,
    timeComplexity: 'O(n+k)',
    spaceComplexity: 'O(k)',
    pseudocode: `procedure countingSort(A)
    max := findMax(A)
    count := array of size max + 1
    output := array of size length(A)
    
    for each x in A do
        count[x]++
    
    for i from 1 to max do
        count[i] += count[i-1]
        
    for i from length(A)-1 down to 0 do
        output[count[A[i]] - 1] = A[i]
        count[A[i]]--
        
    copy output to A
end procedure`
  },
  [AlgorithmType.SHELL_SORT]: {
    name: AlgorithmType.SHELL_SORT,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    pseudocode: `procedure shellSort(A)
    n := length(A)
    gap := n/2
    while gap > 0 do
        for i := gap to n-1 do
            temp := A[i]
            j := i
            while j >= gap and A[j - gap] > temp do
                A[j] := A[j - gap]
                j := j - gap
            end while
            A[j] := temp
        end for
        gap := gap / 2
    end while
end procedure`
  },
  [AlgorithmType.TIM_SORT]: {
    name: AlgorithmType.TIM_SORT,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    pseudocode: `procedure timSort(A)
    n := length(A)
    RUN := 32
    for i from 0 to n by RUN do
        insertionSort(A, i, min(i + RUN - 1, n - 1))
    
    size := RUN
    while size < n do
        for left from 0 to n by 2*size do
            mid := left + size - 1
            right := min(left + 2*size - 1, n - 1)
            merge(A, left, mid, right)
        end for
        size := 2 * size
    end while
end procedure`
  }
};
