
// based on https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript
// add peak using key and change value using key
export class PriorityQueue {
  static top = 0;
  static parent = i => ((i + 1) >>> 1) - 1;
  static left = i => (i << 1) + 1;
  static right = i => (i + 1) << 1;
  private _heap:any;
  private _comparator:any;
  constructor(comparator = (a, b) => a > b) {
    this._heap = [];
    this._comparator = comparator;
  }
  size() {
    return this._heap.length;
  }
  isEmpty() {
    return this.size() == 0;
  }
  peek() {
    return this._heap[PriorityQueue.top];
  }
  peekVal(value){
    let result = null;
    this._heap.forEach(element => {
      let key = element[0];
      if(key == value){
        result = element;
      }
    });
    return result;
  }
  changeVal(value):boolean{
    let changed = false;
    this._heap.forEach(element => {
      let key = element[0];
      if(key == value){
        element = value;
        changed;
      }
    });
    if(changed){
      this._siftUp();
    }
    return changed;
  }
  push(...values) {
    values.forEach(value => {
      this._heap.push(value);
      this._siftUp();
    });
    return this.size();
  }
  pop() {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > PriorityQueue.top) {
      this._swap(PriorityQueue.top, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }
  replace(value) {
    const replacedValue = this.peek();
    this._heap[PriorityQueue.top] = value;
    this._siftDown();
    return replacedValue;
  }
  _greater(i, j) {
    return this._comparator(this._heap[i], this._heap[j]);
  }
  _swap(i, j) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }
  _siftUp() {
    let node = this.size() - 1;
    while (node > PriorityQueue.top && this._greater(node, PriorityQueue.parent(node))) {
      this._swap(node, PriorityQueue.parent(node));
      node = PriorityQueue.parent(node);
    }
  }
  _siftDown() {
    let node = PriorityQueue.top;
    while (
      (PriorityQueue.left(node) < this.size() && this._greater(PriorityQueue.left(node), node)) ||
      (PriorityQueue.right(node) < this.size() && this._greater(PriorityQueue.right(node), node))
    ) {
      let maxChild = (PriorityQueue.right(node) < this.size() && this._greater(PriorityQueue.right(node), PriorityQueue.left(node))) ? PriorityQueue.right(node) : PriorityQueue.left(node);
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
}