import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ── Bar state drives the colour of each bar ───────────────────────────────────
export type BarState =
  | 'default'   // resting (grey-blue)
  | 'comparing' // being evaluated (orange)
  | 'swapping'  // being swapped / overwritten (red)
  | 'pivot'     // pivot element in Quick Sort (yellow)
  | 'sorted';   // locked in final position (accent purple)

export interface Bar {
  value: number;
  state: BarState;
}

// ── Algorithm descriptor shown in the tab strip ───────────────────────────────
export interface Algorithm {
  key:   string;
  label: string;
  time:  string;   // average time complexity
  space: string;
  description: string;
  showPivot: boolean;
}

@Component({
  selector: 'app-sorting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sorting.component.html',
  styleUrl: './sorting.component.scss'
})
export class SortingComponent implements OnInit {

  // ── Algorithm registry ────────────────────────────────────────────────────
  readonly algorithms: Algorithm[] = [
    {
      key: 'bubble', label: 'Bubble Sort',
      time: 'O(n²)', space: 'O(1)', showPivot: false,
      description:
        'Repeatedly steps through the list, compares adjacent elements and swaps ' +
        'them if out of order. After each full pass the largest unsorted element ' +
        '"bubbles" to its final position. Early-exit stops once no swaps occur.',
    },
    {
      key: 'selection', label: 'Selection Sort',
      time: 'O(n²)', space: 'O(1)', showPivot: false,
      description:
        'Scans the unsorted region to find the minimum element (orange), then ' +
        'swaps it into the first unsorted position (red). Always performs exactly ' +
        'n(n−1)/2 comparisons regardless of input order.',
    },
    {
      key: 'insertion', label: 'Insertion Sort',
      time: 'O(n²)', space: 'O(1)', showPivot: false,
      description:
        'Picks the next unsorted element (orange) and shifts sorted elements right ' +
        '(red) until it finds the correct slot. Adaptive — runs in O(n) on nearly-' +
        'sorted input, making it great for small or partially-ordered arrays.',
    },
    {
      key: 'merge', label: 'Merge Sort',
      time: 'O(n log n)', space: 'O(n)', showPivot: false,
      description:
        'Divide-and-conquer: recursively splits the array in half until single ' +
        'elements remain, then merges halves back in sorted order. Orange = elements ' +
        'being read, red = being written back. Guaranteed O(n log n) in all cases.',
    },
    {
      key: 'quick', label: 'Quick Sort',
      time: 'O(n log n) avg', space: 'O(log n)', showPivot: true,
      description:
        'Picks a pivot (yellow) and partitions the array so smaller elements go ' +
        'left and larger go right (orange = comparing, red = swapping), then ' +
        'recursively sorts each partition. Fastest in practice for most real-world inputs.',
    },
    {
      key: 'heap', label: 'Heap Sort',
      time: 'O(n log n)', space: 'O(1)', showPivot: false,
      description:
        'Builds a max-heap so the largest element sits at the root, then ' +
        'repeatedly extracts the maximum (red swap to end) and re-heapifies ' +
        'the remainder (orange). Guaranteed O(n log n) with O(1) in-place space.',
    },
  ];

  // ── Component state ───────────────────────────────────────────────────────
  activeKey   = 'bubble';           // currently selected tab
  bars: Bar[] = [];
  isSorting   = false;
  isSorted    = false;
  arraySize   = 28;
  speed       = 80;                 // ms delay (lower = faster)
  comparisons = 0;
  swaps       = 0;

  // ── Derived helpers ───────────────────────────────────────────────────────
  get activeAlgo(): Algorithm {
    return this.algorithms.find(a => a.key === this.activeKey)!;
  }

  get speedLabel(): string {
    if (this.speed <= 30)  return 'Fast';
    if (this.speed <= 80)  return 'Medium';
    return 'Slow';
  }

  // ── Complexity table rows ─────────────────────────────────────────────────
  readonly complexityRows = [
    { name: 'Bubble',    best: 'O(n)',       avg: 'O(n²)',         worst: 'O(n²)',      space: 'O(1)',     stable: true  },
    { name: 'Selection', best: 'O(n²)',      avg: 'O(n²)',         worst: 'O(n²)',      space: 'O(1)',     stable: false },
    { name: 'Insertion', best: 'O(n)',       avg: 'O(n²)',         worst: 'O(n²)',      space: 'O(1)',     stable: true  },
    { name: 'Merge',     best: 'O(n log n)', avg: 'O(n log n)',    worst: 'O(n log n)', space: 'O(n)',     stable: true  },
    { name: 'Quick',     best: 'O(n log n)', avg: 'O(n log n)',    worst: 'O(n²)',      space: 'O(log n)', stable: false },
    { name: 'Heap',      best: 'O(n log n)', avg: 'O(n log n)',    worst: 'O(n log n)', space: 'O(1)',     stable: false },
  ];

  ngOnInit(): void { this.generateArray(); }

  // ── Tab switch ────────────────────────────────────────────────────────────
  selectAlgo(key: string): void {
    if (this.isSorting) return;   // don't switch mid-sort
    this.activeKey = key;
    this.generateArray();
  }

  // ── Array generation ──────────────────────────────────────────────────────
  generateArray(): void {
    if (this.isSorting) return;
    this.comparisons = 0;
    this.swaps       = 0;
    this.isSorted    = false;
    this.bars = Array.from({ length: this.arraySize }, () => ({
      value: Math.floor(Math.random() * 90) + 10,   // 10–100
      state: 'default' as BarState,
    }));
  }

  // ── Dispatch to the selected algorithm ───────────────────────────────────
  async startSort(): Promise<void> {
    if (this.isSorting || this.isSorted) return;
    this.isSorting   = true;
    this.comparisons = 0;
    this.swaps       = 0;

    switch (this.activeKey) {
      case 'bubble':    await this.bubbleSort();    break;
      case 'selection': await this.selectionSort(); break;
      case 'insertion': await this.insertionSort(); break;
      case 'merge':     await this.mergeSort(0, this.bars.length - 1); break;
      case 'quick':     await this.quickSort(0, this.bars.length - 1); break;
      case 'heap':      await this.heapSort();      break;
    }

    this.markAllSorted();
  }

  // ════════════════════════════════════════════════════════════════
  //  ALGORITHMS
  // ════════════════════════════════════════════════════════════════

  // ── 1. Bubble Sort ────────────────────────────────────────────────────────
  private async bubbleSort(): Promise<void> {
    const n = this.bars.length;
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        this.bars[j].state     = 'comparing';
        this.bars[j + 1].state = 'comparing';
        this.comparisons++;
        await this.sleep(this.speed);

        if (this.bars[j].value > this.bars[j + 1].value) {
          this.bars[j].state     = 'swapping';
          this.bars[j + 1].state = 'swapping';
          await this.sleep(this.speed * 0.5);
          [this.bars[j], this.bars[j + 1]] = [this.bars[j + 1], this.bars[j]];
          this.swaps++;
          swapped = true;
        }
        this.resetBar(j);
        this.resetBar(j + 1);
      }
      this.bars[n - 1 - i].state = 'sorted';
      if (!swapped) break;  // already sorted — early exit
    }
  }

  // ── 2. Selection Sort ─────────────────────────────────────────────────────
  private async selectionSort(): Promise<void> {
    const n = this.bars.length;
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      this.bars[minIdx].state = 'comparing';

      for (let j = i + 1; j < n; j++) {
        this.bars[j].state = 'comparing';
        this.comparisons++;
        await this.sleep(this.speed);

        if (this.bars[j].value < this.bars[minIdx].value) {
          this.resetBar(minIdx);
          minIdx = j;
        } else {
          this.resetBar(j);
        }
      }

      if (minIdx !== i) {
        this.bars[i].state      = 'swapping';
        this.bars[minIdx].state = 'swapping';
        await this.sleep(this.speed * 0.8);
        [this.bars[i], this.bars[minIdx]] = [this.bars[minIdx], this.bars[i]];
        this.swaps++;
      }

      this.bars[i].state = 'sorted';
      this.resetBar(minIdx);
    }
  }

  // ── 3. Insertion Sort ─────────────────────────────────────────────────────
  private async insertionSort(): Promise<void> {
    const n = this.bars.length;
    this.bars[0].state = 'sorted';

    for (let i = 1; i < n; i++) {
      const key = this.bars[i].value;
      this.bars[i].state = 'comparing';
      await this.sleep(this.speed);

      let j = i - 1;
      while (j >= 0 && this.bars[j].value > key) {
        this.bars[j].state     = 'swapping';
        this.bars[j + 1].state = 'swapping';
        this.comparisons++;
        await this.sleep(this.speed);

        this.bars[j + 1].value = this.bars[j].value;
        this.swaps++;
        this.bars[j + 1].state = 'sorted';
        this.bars[j].state     = 'default';
        j--;
      }
      this.bars[j + 1].value = key;
      this.bars[j + 1].state = 'sorted';
      this.comparisons++;
      await this.sleep(this.speed * 0.4);
    }
  }

  // ── 4. Merge Sort (recursive) ────────────────────────────────────────────
  private async mergeSort(left: number, right: number): Promise<void> {
    if (left >= right) {
      if (left === right) this.bars[left].state = 'sorted';
      return;
    }
    const mid = Math.floor((left + right) / 2);
    await this.mergeSort(left, mid);
    await this.mergeSort(mid + 1, right);
    await this.merge(left, mid, right);
  }

  private async merge(left: number, mid: number, right: number): Promise<void> {
    const leftVals  = this.bars.slice(left, mid + 1).map(b => b.value);
    const rightVals = this.bars.slice(mid + 1, right + 1).map(b => b.value);
    let i = 0, j = 0, k = left;

    while (i < leftVals.length && j < rightVals.length) {
      this.bars[left + i].state    = 'comparing';
      this.bars[mid + 1 + j].state = 'comparing';
      this.comparisons++;
      await this.sleep(this.speed);

      this.bars[k].state = 'swapping';
      await this.sleep(this.speed * 0.3);

      if (leftVals[i] <= rightVals[j]) {
        this.bars[k].value = leftVals[i++];
      } else {
        this.bars[k].value = rightVals[j++];
        this.swaps++;
      }
      this.bars[k].state = 'sorted';
      k++;
    }
    while (i < leftVals.length) {
      this.bars[k].state = 'swapping';
      await this.sleep(this.speed * 0.3);
      this.bars[k].value = leftVals[i++];
      this.bars[k].state = 'sorted';
      k++;
    }
    while (j < rightVals.length) {
      this.bars[k].state = 'swapping';
      await this.sleep(this.speed * 0.3);
      this.bars[k].value = rightVals[j++];
      this.bars[k].state = 'sorted';
      k++;
    }
  }

  // ── 5. Quick Sort (Lomuto partition) ─────────────────────────────────────
  private async quickSort(low: number, high: number): Promise<void> {
    if (low >= high) {
      if (low === high) this.bars[low].state = 'sorted';
      return;
    }
    const pivotIdx = await this.partition(low, high);
    this.bars[pivotIdx].state = 'sorted';
    await this.quickSort(low, pivotIdx - 1);
    await this.quickSort(pivotIdx + 1, high);
  }

  private async partition(low: number, high: number): Promise<number> {
    const pivotValue = this.bars[high].value;
    this.bars[high].state = 'pivot';
    let i = low - 1;

    for (let j = low; j < high; j++) {
      this.bars[j].state = 'comparing';
      this.comparisons++;
      await this.sleep(this.speed);

      if (this.bars[j].value <= pivotValue) {
        i++;
        this.bars[i].state = 'swapping';
        this.bars[j].state = 'swapping';
        await this.sleep(this.speed * 0.5);
        [this.bars[i], this.bars[j]] = [this.bars[j], this.bars[i]];
        this.swaps++;
        this.resetBar(i);
      }
      this.resetBar(j);
    }

    const pivotFinal = i + 1;
    this.bars[pivotFinal].state = 'swapping';
    this.bars[high].state       = 'swapping';
    await this.sleep(this.speed * 0.7);
    [this.bars[pivotFinal], this.bars[high]] = [this.bars[high], this.bars[pivotFinal]];
    this.swaps++;
    return pivotFinal;
  }

  // ── 6. Heap Sort ─────────────────────────────────────────────────────────
  private async heapSort(): Promise<void> {
    const n = this.bars.length;
    // Build max-heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      await this.heapify(n, i);
    }
    // Extract elements
    for (let i = n - 1; i > 0; i--) {
      this.bars[0].state = 'swapping';
      this.bars[i].state = 'swapping';
      await this.sleep(this.speed * 0.7);
      [this.bars[0], this.bars[i]] = [this.bars[i], this.bars[0]];
      this.swaps++;
      this.bars[i].state = 'sorted';
      this.bars[0].state = 'default';
      await this.heapify(i, 0);
    }
  }

  private async heapify(heapSize: number, rootIdx: number): Promise<void> {
    let largest = rootIdx;
    const left  = 2 * rootIdx + 1;
    const right = 2 * rootIdx + 2;

    this.bars[rootIdx].state = 'comparing';
    await this.sleep(this.speed * 0.4);

    if (left < heapSize) {
      this.bars[left].state = 'comparing';
      this.comparisons++;
      await this.sleep(this.speed * 0.4);
      if (this.bars[left].value > this.bars[largest].value) {
        this.resetBar(largest); largest = left;
      } else { this.resetBar(left); }
    }
    if (right < heapSize) {
      this.bars[right].state = 'comparing';
      this.comparisons++;
      await this.sleep(this.speed * 0.4);
      if (this.bars[right].value > this.bars[largest].value) {
        this.resetBar(largest); largest = right;
      } else { this.resetBar(right); }
    }

    if (largest !== rootIdx) {
      this.bars[rootIdx].state = 'swapping';
      this.bars[largest].state = 'swapping';
      await this.sleep(this.speed * 0.5);
      [this.bars[rootIdx], this.bars[largest]] = [this.bars[largest], this.bars[rootIdx]];
      this.swaps++;
      this.resetBar(rootIdx);
      this.resetBar(largest);
      await this.heapify(heapSize, largest);
    } else {
      this.resetBar(rootIdx);
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  UTILITIES
  // ════════════════════════════════════════════════════════════════

  /** Mark all bars sorted and unlock the UI */
  private markAllSorted(): void {
    this.bars.forEach(b => (b.state = 'sorted'));
    this.isSorting = false;
    this.isSorted  = true;
  }

  /** Reset a single bar's state unless it is already permanently sorted */
  private resetBar(index: number): void {
    if (this.bars[index]?.state !== 'sorted') {
      this.bars[index].state = 'default';
    }
  }

  /** Promise-based delay — lets Angular repaint between each step */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}