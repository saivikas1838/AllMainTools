import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ── Bar state drives the colour of each element ───────────────────────────────
export type CellState =
  | 'default'   // resting (grey-blue)
  | 'scanning'  // currently being visited (orange)
  | 'comparing' // active comparison (yellow)
  | 'found'     // target found (green)
  | 'rejected'  // eliminated from search (muted)
  | 'bound'     // lo/hi/mid boundary markers (purple tint)
  | 'path';     // path being traversed (teal — jump/interpolation steps)

export interface Cell {
  value: number;
  state: CellState;
  index: number;   // original index (useful for display)
}

// ── Algorithm descriptor ──────────────────────────────────────────────────────
export interface SearchAlgorithm {
  key:         string;
  label:       string;
  time:        string;
  space:       string;
  requireSort: boolean;   // true  → array must be sorted before searching
  showPivot:   boolean;   // true  → show extra legend entry
  description: string;
}

@Component({
  selector: 'app-searching',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './searching.component.html',
  styleUrl: './searching.component.scss'
})
export class SearchingComponent implements OnInit {

  // ── Algorithm registry ────────────────────────────────────────────────────
  readonly algorithms: SearchAlgorithm[] = [
    {
      key: 'linear', label: 'Linear Search',
      time: 'O(n)', space: 'O(1)', requireSort: false, showPivot: false,
      description:
        'Walks through every element one by one until the target is found or the ' +
        'array ends. Works on unsorted data. Simple but slow for large arrays — ' +
        'visits each element at most once giving O(n) worst case.',
    },
    {
      key: 'binary', label: 'Binary Search',
      time: 'O(log n)', space: 'O(1)', requireSort: true, showPivot: false,
      description:
        'Requires a sorted array. Repeatedly halves the search space by comparing ' +
        'the target with the middle element — if smaller, search left half; if ' +
        'larger, search right half. Eliminates half the remaining candidates each step.',
    },
    {
      key: 'jump', label: 'Jump Search',
      time: 'O(√n)', space: 'O(1)', requireSort: true, showPivot: false,
      description:
        'Requires a sorted array. Jumps ahead by √n steps at a time to find a ' +
        'block where the target may exist (teal = jump steps), then falls back to ' +
        'a linear scan within that block. Optimal jump size is √n.',
    },
    {
      key: 'interpolation', label: 'Interpolation Search',
      time: 'O(log log n)', space: 'O(1)', requireSort: true, showPivot: true,
      description:
        'Like Binary Search but estimates the probe position using interpolation ' +
        'formula: pos = lo + ((target − arr[lo]) / (arr[hi] − arr[lo])) × (hi − lo). ' +
        'Near O(log log n) for uniformly distributed data — can degrade to O(n) if skewed.',
    },
    {
      key: 'exponential', label: 'Exponential Search',
      time: 'O(log n)', space: 'O(1)', requireSort: true, showPivot: false,
      description:
        'Starts at index 1 and doubles the index (1 → 2 → 4 → 8 …) until the ' +
        'element at that index exceeds the target (teal = doubling phase). Then ' +
        'applies Binary Search within the identified range. Great for unbounded arrays.',
    },
    {
      key: 'fibonacci', label: 'Fibonacci Search',
      time: 'O(log n)', space: 'O(1)', requireSort: true, showPivot: false,
      description:
        'Uses Fibonacci numbers to divide the array. The offset starts at the ' +
        'smallest Fibonacci number ≥ n and narrows using Fibonacci steps rather ' +
        'than halving. Avoids division — useful where division is expensive.',
    },
    {
      key: 'ternary', label: 'Ternary Search',
      time: 'O(log₃ n)', space: 'O(1)', requireSort: true, showPivot: false,
      description:
        'Divides the search space into three parts using two mid-points (mid1 and ' +
        'mid2). Compares target with both — eliminates one-third each step. Slightly ' +
        'more comparisons per step than Binary Search but same asymptotic complexity.',
    },
    {
      key: 'sentinel', label: 'Sentinel Linear Search',
      time: 'O(n)', space: 'O(1)', requireSort: false, showPivot: false,
      description:
        'Optimised Linear Search: temporarily places the target at the last position ' +
        '(the "sentinel") so the inner loop needs only one comparison per iteration ' +
        'instead of two. Reduces constant-factor overhead over standard linear search.',
    },
  ];

  // ── Component state ───────────────────────────────────────────────────────
  activeKey     = 'linear';
  cells: Cell[] = [];
  isSearching   = false;
  isComplete    = false;
  arraySize     = 30;
  speed         = 80;
  targetValue   = 0;       // the number we're looking for
  targetInput   = '';      // bound to the text input
  resultMessage = '';      // shown after search finishes
  resultFound   = false;
  steps         = 0;       // comparisons made
  targetFocused = false;   // drives floating label on the target input

  // ── Derived helpers ───────────────────────────────────────────────────────
  get activeAlgo(): SearchAlgorithm {
    return this.algorithms.find(a => a.key === this.activeKey)!;
  }

  get speedLabel(): string {
    if (this.speed <= 30)  return 'Fast';
    if (this.speed <= 80)  return 'Medium';
    return 'Slow';
  }

  // ── Complexity reference table ────────────────────────────────────────────
  readonly complexityRows = [
    { name: 'Linear',        best: 'O(1)',        avg: 'O(n)',        worst: 'O(n)',     space: 'O(1)', sorted: false },
    { name: 'Binary',        best: 'O(1)',        avg: 'O(log n)',    worst: 'O(log n)', space: 'O(1)', sorted: true  },
    { name: 'Jump',          best: 'O(1)',        avg: 'O(√n)',       worst: 'O(√n)',    space: 'O(1)', sorted: true  },
    { name: 'Interpolation', best: 'O(1)',        avg: 'O(log log n)',worst: 'O(n)',     space: 'O(1)', sorted: true  },
    { name: 'Exponential',   best: 'O(1)',        avg: 'O(log n)',    worst: 'O(log n)', space: 'O(1)', sorted: true  },
    { name: 'Fibonacci',     best: 'O(1)',        avg: 'O(log n)',    worst: 'O(log n)', space: 'O(1)', sorted: true  },
    { name: 'Ternary',       best: 'O(1)',        avg: 'O(log₃ n)',   worst: 'O(log₃ n)',space: 'O(1)', sorted: true  },
    { name: 'Sentinel',      best: 'O(1)',        avg: 'O(n)',        worst: 'O(n)',     space: 'O(1)', sorted: false },
  ];

  ngOnInit(): void { this.generateArray(); }

  // ── Tab switch ────────────────────────────────────────────────────────────
  selectAlgo(key: string): void {
    if (this.isSearching) return;
    this.activeKey = key;
    this.generateArray();
  }

  // ── Array generation ──────────────────────────────────────────────────────
  generateArray(): void {
    if (this.isSearching) return;
    this.steps         = 0;
    this.isComplete    = false;
    this.resultMessage = '';
    this.resultFound   = false;

    const needsSorted = this.activeAlgo.requireSort;

    // Generate unique random values for cleaner visualisation
    const values = new Set<number>();
    while (values.size < this.arraySize) {
      values.add(Math.floor(Math.random() * (this.arraySize * 3)) + 1);
    }

    let arr = Array.from(values);
    if (needsSorted) arr.sort((a, b) => a - b);

    this.cells = arr.map((v, i) => ({ value: v, state: 'default', index: i }));

    // Pick a random target that exists in the array (~80% of the time)
    const exists = Math.random() < 0.8;
    if (exists) {
      this.targetValue = arr[Math.floor(Math.random() * arr.length)];
    } else {
      // Pick a value guaranteed NOT in the array
      let miss = Math.floor(Math.random() * (this.arraySize * 3)) + 1;
      while (values.has(miss)) miss++;
      this.targetValue = miss;
    }
    this.targetInput = String(this.targetValue);
  }

  // ── Start search ──────────────────────────────────────────────────────────
  async startSearch(): Promise<void> {
    if (this.isSearching || this.isComplete) return;

    // Parse & validate input
    const parsed = parseInt(this.targetInput, 10);
    if (isNaN(parsed)) { this.resultMessage = 'Please enter a valid number.'; return; }
    this.targetValue = parsed;

    // Re-sort if algorithm needs it
    if (this.activeAlgo.requireSort) {
      this.cells.sort((a, b) => a.value - b.value);
      this.cells.forEach((c, i) => { c.index = i; c.state = 'default'; });
    } else {
      this.cells.forEach(c => (c.state = 'default'));
    }

    this.isSearching   = true;
    this.isComplete    = false;
    this.steps         = 0;
    this.resultMessage = '';

    switch (this.activeKey) {
      case 'linear':        await this.linearSearch();        break;
      case 'binary':        await this.binarySearch();        break;
      case 'jump':          await this.jumpSearch();          break;
      case 'interpolation': await this.interpolationSearch(); break;
      case 'exponential':   await this.exponentialSearch();   break;
      case 'fibonacci':     await this.fibonacciSearch();     break;
      case 'ternary':       await this.ternarySearch();       break;
      case 'sentinel':      await this.sentinelSearch();      break;
    }

    this.isSearching = false;
    this.isComplete  = true;
  }

  // ════════════════════════════════════════════════════════════════
  //  SEARCH ALGORITHMS
  // ════════════════════════════════════════════════════════════════

  // ── 1. Linear Search ─────────────────────────────────────────────────────
  private async linearSearch(): Promise<void> {
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].state = 'scanning';
      this.steps++;
      await this.sleep(this.speed);

      if (this.cells[i].value === this.targetValue) {
        this.cells[i].state = 'found';
        this.setResult(true, i);
        return;
      }
      this.cells[i].state = 'rejected';
    }
    this.setResult(false);
  }

  // ── 2. Binary Search ─────────────────────────────────────────────────────
  private async binarySearch(): Promise<void> {
    let lo = 0, hi = this.cells.length - 1;

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);

      // Mark boundaries and mid
      this.markBounds(lo, hi, mid);
      this.steps++;
      await this.sleep(this.speed);

      if (this.cells[mid].value === this.targetValue) {
        this.clearBounds(lo, hi);
        this.cells[mid].state = 'found';
        this.setResult(true, mid);
        return;
      }

      if (this.cells[mid].value < this.targetValue) {
        this.rejectRange(lo, mid);
        lo = mid + 1;
      } else {
        this.rejectRange(mid, hi);
        hi = mid - 1;
      }
    }
    this.setResult(false);
  }

  // ── 3. Jump Search ────────────────────────────────────────────────────────
  private async jumpSearch(): Promise<void> {
    const n        = this.cells.length;
    const stepSize = Math.floor(Math.sqrt(n)); // optimal block size = sqrt(n)
    let   prev     = 0;
    let   curr     = stepSize;                 // curr advances each jump

    // Jump phase: skip ahead by stepSize until cells[curr] >= target
    while (curr < n && this.cells[curr].value < this.targetValue) {
      // Highlight the jump landing position in teal
      this.cells[curr].state = 'path';
      this.steps++;
      await this.sleep(this.speed);
      this.cells[curr].state = 'rejected';

      // Reject the entire block we just skipped over
      this.rejectRange(prev, curr - 1);

      prev  = curr;       // move lower bound forward
      curr += stepSize;   // jump to the next block boundary
    }

    // Linear scan phase: scan from prev up to min(curr, n-1)
    const blockEnd = Math.min(curr, n - 1);

    for (let i = prev; i <= blockEnd; i++) {
      this.cells[i].state = 'scanning';
      this.steps++;
      await this.sleep(this.speed);

      if (this.cells[i].value === this.targetValue) {
        this.cells[i].state = 'found';
        this.setResult(true, i);
        return;
      }

      // Sorted array — no need to scan further right in this block
      if (this.cells[i].value > this.targetValue) {
        this.cells[i].state = 'rejected';
        break;
      }

      this.cells[i].state = 'rejected';
    }

    this.setResult(false);
  }

  // ── 4. Interpolation Search ───────────────────────────────────────────────
  private async interpolationSearch(): Promise<void> {
    let lo = 0, hi = this.cells.length - 1;

    while (lo <= hi &&
           this.targetValue >= this.cells[lo].value &&
           this.targetValue <= this.cells[hi].value) {

      if (lo === hi) {
        if (this.cells[lo].value === this.targetValue) {
          this.cells[lo].state = 'found';
          this.setResult(true, lo);
        } else {
          this.setResult(false);
        }
        return;
      }

      // Interpolation formula — estimate probe position
      const range = this.cells[hi].value - this.cells[lo].value;
      const pos   = lo + Math.floor(
        ((this.targetValue - this.cells[lo].value) / range) * (hi - lo)
      );

      // Show the probe position in teal (different from binary mid)
      this.cells[pos].state = 'path';
      this.markBounds(lo, hi, pos);
      this.steps++;
      await this.sleep(this.speed);

      if (this.cells[pos].value === this.targetValue) {
        this.clearBounds(lo, hi);
        this.cells[pos].state = 'found';
        this.setResult(true, pos);
        return;
      }

      if (this.cells[pos].value < this.targetValue) {
        this.rejectRange(lo, pos);
        lo = pos + 1;
      } else {
        this.rejectRange(pos, hi);
        hi = pos - 1;
      }
    }
    this.setResult(false);
  }

  // ── 5. Exponential Search ─────────────────────────────────────────────────
  private async exponentialSearch(): Promise<void> {
    const n = this.cells.length;
    if (this.cells[0].value === this.targetValue) {
      this.cells[0].state = 'found';
      this.setResult(true, 0);
      return;
    }

    // Doubling phase (teal)
    let i = 1;
    while (i < n && this.cells[i].value <= this.targetValue) {
      this.cells[i].state = 'path';
      this.steps++;
      await this.sleep(this.speed);
      this.cells[i].state = 'rejected';
      i *= 2;
    }

    // Binary search in found range
    const lo = Math.floor(i / 2);
    const hi = Math.min(i, n - 1);
    await this.binarySearchRange(lo, hi);
  }

  // ── 6. Fibonacci Search ───────────────────────────────────────────────────
  private async fibonacciSearch(): Promise<void> {
    const n = this.cells.length;
    let fibM2 = 0, fibM1 = 1, fibM = 1;

    // Find smallest Fibonacci number ≥ n
    while (fibM < n) { fibM2 = fibM1; fibM1 = fibM; fibM = fibM1 + fibM2; }

    let offset = -1;

    while (fibM > 1) {
      const i = Math.min(offset + fibM2, n - 1);

      this.cells[i].state = 'scanning';
      this.steps++;
      await this.sleep(this.speed);

      if (this.cells[i].value < this.targetValue) {
        fibM = fibM1; fibM1 = fibM2; fibM2 = fibM - fibM1;
        offset = i;
        this.cells[i].state = 'rejected';
      } else if (this.cells[i].value > this.targetValue) {
        fibM = fibM2; fibM1 -= fibM2; fibM2 = fibM - fibM1;
        this.cells[i].state = 'rejected';
      } else {
        this.cells[i].state = 'found';
        this.setResult(true, i);
        return;
      }
    }

    if (fibM1 && offset + 1 < n && this.cells[offset + 1].value === this.targetValue) {
      this.cells[offset + 1].state = 'found';
      this.setResult(true, offset + 1);
      return;
    }
    this.setResult(false);
  }

  // ── 7. Ternary Search ─────────────────────────────────────────────────────
  private async ternarySearch(): Promise<void> {
    let lo = 0, hi = this.cells.length - 1;

    while (hi >= lo) {
      const mid1 = lo + Math.floor((hi - lo) / 3);
      const mid2 = hi - Math.floor((hi - lo) / 3);

      // Highlight both mid-points
      this.cells[mid1].state = 'comparing';
      this.cells[mid2].state = 'comparing';
      this.steps += 2;
      await this.sleep(this.speed);

      if (this.cells[mid1].value === this.targetValue) {
        this.cells[mid1].state = 'found';
        this.setResult(true, mid1);
        return;
      }
      if (this.cells[mid2].value === this.targetValue) {
        this.cells[mid2].state = 'found';
        this.setResult(true, mid2);
        return;
      }

      if (this.targetValue < this.cells[mid1].value) {
        this.rejectRange(mid1, hi);
        this.cells[mid1].state = 'rejected';
        hi = mid1 - 1;
      } else if (this.targetValue > this.cells[mid2].value) {
        this.rejectRange(lo, mid2);
        this.cells[mid2].state = 'rejected';
        lo = mid2 + 1;
      } else {
        this.rejectRange(lo, mid1);
        this.rejectRange(mid2, hi);
        lo = mid1 + 1;
        hi = mid2 - 1;
      }
    }
    this.setResult(false);
  }

  // ── 8. Sentinel Linear Search ─────────────────────────────────────────────
  private async sentinelSearch(): Promise<void> {
    const n       = this.cells.length;
    const last    = this.cells[n - 1].value;  // save last element
    this.cells[n - 1].value = this.targetValue; // place sentinel

    let i = 0;
    while (this.cells[i].value !== this.targetValue) {
      this.cells[i].state = 'scanning';
      this.steps++;
      await this.sleep(this.speed);
      this.cells[i].state = 'rejected';
      i++;
    }

    // Restore last element
    this.cells[n - 1].value = last;

    if (i < n - 1 || this.cells[n - 1].value === this.targetValue) {
      this.cells[i].state = 'found';
      this.setResult(true, i);
    } else {
      this.setResult(false);
    }
  }

  // ════════════════════════════════════════════════════════════════
  //  SHARED HELPERS
  // ════════════════════════════════════════════════════════════════

  /** Binary search within [lo, hi] range — used by Exponential Search */
  private async binarySearchRange(lo: number, hi: number): Promise<void> {
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      this.markBounds(lo, hi, mid);
      this.steps++;
      await this.sleep(this.speed);

      if (this.cells[mid].value === this.targetValue) {
        this.clearBounds(lo, hi);
        this.cells[mid].state = 'found';
        this.setResult(true, mid);
        return;
      }
      if (this.cells[mid].value < this.targetValue) {
        this.rejectRange(lo, mid); lo = mid + 1;
      } else {
        this.rejectRange(mid, hi); hi = mid - 1;
      }
    }
    this.setResult(false);
  }

  /** Highlight lo, hi as bound markers and mid as comparing */
  private markBounds(lo: number, hi: number, mid: number): void {
    if (this.cells[lo]?.state !== 'rejected') this.cells[lo].state = 'bound';
    if (this.cells[hi]?.state !== 'rejected') this.cells[hi].state = 'bound';
    if (this.cells[mid]?.state !== 'rejected') this.cells[mid].state = 'comparing';
  }

  /** Clear bound markers back to default */
  private clearBounds(lo: number, hi: number): void {
    [lo, hi].forEach(i => {
      if (this.cells[i]?.state === 'bound') this.cells[i].state = 'default';
    });
  }

  /** Mark a range of cells as rejected (eliminated from search) */
  private rejectRange(from: number, to: number): void {
    for (let i = from; i <= to; i++) {
      if (this.cells[i]?.state !== 'found') this.cells[i].state = 'rejected';
    }
  }

  /** Set the final result message */
  private setResult(found: boolean, index?: number): void {
    this.resultFound = found;
    if (found && index !== undefined) {
      this.resultMessage =
        `✓ Found ${this.targetValue} at index ${index} after ${this.steps} step${this.steps !== 1 ? 's' : ''}.`;
    } else {
      this.resultMessage =
        `✗ ${this.targetValue} not found after ${this.steps} step${this.steps !== 1 ? 's' : ''}.`;
    }
  }

  /** Promise-based delay — lets Angular repaint between steps */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}