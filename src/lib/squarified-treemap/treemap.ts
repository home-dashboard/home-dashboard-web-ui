export interface Square {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export enum LayoutDirection {
  HORIZONTAL,
  VERTICAL
}

export interface TreeMap<T extends Square> {
  direction: LayoutDirection;
  nodes: Array<T>;
  child?: TreeMap<T>;
  edgeLength: number;
  crossEdgeLength: number;
  container: { edgeLength: number; crossEdgeLength: number };
}

/**
 * [Squarified Treemaps](https://www.win.tue.nl/~vanwijk/stm.pdf) 算法实现.
 *
 * 与原算法不同的是, 本算法会在尾部加入一个用于填充剩余空间的元素(**rest 元素**). 该元素的权重为剩余空间的大小. 如果剩余空间为 0, 则使长宽加 1 以放置该元素.
 *
 * @param children 要布局的元素数据. 元素的权重由 weight 函数返回.
 * @param weight 计算元素权重的函数
 * @param interrupt 布局中断条件. 当 {@link interrupt} 返回 false 时，布局提前结束.
 * 1. 第一个参数为当前布局的节点.
 * 2. 第二个参数为根节点的尺寸. 可通过根节点与当前节点的尺寸比例得到实际渲染的尺寸.
 * @param rest 用于填充剩余空间的元素.
 * 1. 第一个参数为 rest 元素的权重. 当 {@link interrupt} 返回 false 时，会加上未被布局的元素的权重.
 * 2. 第二个参数为未被布局的元素. 当 {@link interrupt} 返回 false 时，会传入布局中断时 {@link children} 中还未参与布局的元素.
 */
export function squarify<T extends Square>(
  children: Array<T>,
  weight: (item: T) => number,
  interrupt: (current: TreeMap<T>, root: { edgeLen: number; crossEdgeLen: number }) => boolean,
  rest: (weight: number, restChildren: Array<T>) => T
): TreeMap<T> {
  if (children.length === 0) return generateTreeMapNode<T>(LayoutDirection.VERTICAL);

  children = children.slice().sort((a, b) => weight(b) - weight(a));

  const childrenSum = sum(children, weight);
  const childrenSumSqrt = Math.sqrt(childrenSum);
  const rootContainerEdgeLen = Number.isInteger(childrenSumSqrt)
    ? childrenSumSqrt + 1
    : Math.ceil(childrenSumSqrt);
  const rootContainerCrossEdgeLen = rootContainerEdgeLen;

  let containerEdgeLen = rootContainerEdgeLen;
  let containerCrossEdgeLen = rootContainerCrossEdgeLen;
  function clipEdgeLen(row: Array<T>, edge: number, zero: boolean = false): number {
    const cut = sum(row, weight) / edge;

    switch (current.direction) {
      case LayoutDirection.VERTICAL:
        containerCrossEdgeLen -= zero ? containerEdgeLen : cut;
        return containerCrossEdgeLen;
      case LayoutDirection.HORIZONTAL:
        containerEdgeLen -= zero ? containerEdgeLen : cut;
        return containerEdgeLen;
      default:
        throw new Error("Invalid direction");
    }
  }
  function unclipEdgeLen(row: Array<T>, edge: number): number {
    const cut = sum(row, weight) / edge;

    switch (current.direction) {
      case LayoutDirection.VERTICAL:
        containerCrossEdgeLen += cut;
        return containerCrossEdgeLen;
      case LayoutDirection.HORIZONTAL:
        containerEdgeLen += cut;
        return containerEdgeLen;
      default:
        throw new Error("Invalid direction");
    }
  }

  const root = generateTreeMapNode<T>(
    LayoutDirection.VERTICAL,
    [],
    0,
    0,
    containerEdgeLen,
    containerCrossEdgeLen
  );
  let current: TreeMap<T> = root;
  function layoutRow(row: Array<T>): boolean {
    current.nodes = row;
    if (current.direction === LayoutDirection.VERTICAL) {
      current.edgeLength = containerEdgeLen;
      current.crossEdgeLength = current.container.crossEdgeLength - containerCrossEdgeLen;
    } else {
      current.edgeLength = containerCrossEdgeLen;
      current.crossEdgeLength = current.container.crossEdgeLength - containerEdgeLen;
    }

    if (
      !interrupt(current, {
        edgeLen: rootContainerEdgeLen,
        crossEdgeLen: rootContainerCrossEdgeLen
      })
    ) {
      return false;
    }

    // 如果剩余空间大于 0，则创建子节点
    if (current.container.crossEdgeLength - current.crossEdgeLength > 0) {
      current.child = generateTreeMapNode(
        current.direction === LayoutDirection.VERTICAL
          ? LayoutDirection.HORIZONTAL
          : LayoutDirection.VERTICAL,
        [],
        0,
        0,
        current.container.crossEdgeLength - current.crossEdgeLength,
        current.container.edgeLength
      );

      current = current.child;
    }

    return true;
  }

  _squarify(children, [], containerEdgeLen);
  function _squarify(_children: Array<T>, row: Array<T>, edge: number): void {
    if (_children.length === 0) {
      clipEdgeLen(row, edge);
      layoutRow(row);
      return;
    }

    const c = _children[0];
    const newRow = row.concat([c]);
    if (worst(row, edge, weight) >= worst(newRow, edge, weight)) {
      _children.splice(0, 1);
      return _squarify(_children, newRow, edge);
    } else {
      const newEdge = clipEdgeLen(row, edge);

      const isInterrupt = layoutRow(row);
      // 布局失败时提前结束
      if (!isInterrupt) {
        unclipEdgeLen(row, edge);
        children = _children.concat(children);
        return;
      }

      return _squarify(_children, [], newEdge);
    }
  }

  // 加入用于填充剩余空间的元素
  const restChild = rest(
    sum(children, weight) + rootContainerEdgeLen ** 2 - childrenSum,
    children.slice()
  );
  clipEdgeLen([restChild], 0, true);
  layoutRow([restChild]);

  return root;
}

function worst<T extends Square>(
  row: Array<T>,
  width: number,
  weight: (item: T) => number
): number {
  if (row.length <= 0) return Number.POSITIVE_INFINITY;

  const width2 = width ** 2;
  const sum2 = sum(row, weight) ** 2;

  return Math.max((width2 * weight(row[0])) / sum2, sum2 / (width2 * weight(row[row.length - 1])));
}

export function sum<T extends Square>(row: Array<T>, weight: (item: T) => number): number {
  let sum = 0;
  for (let i = row.length; i--; ) {
    sum += weight(row[i]);
  }

  return sum;
}

function generateTreeMapNode<T extends Square>(
  direction: LayoutDirection,
  nodes: Array<T> = [],
  edgeLength: number = 0,
  crossEdgeLength: number = 0,
  containerEdgeLength: number = 0,
  containerCrossEdgeLength: number = 0
): TreeMap<T> {
  return {
    direction,
    nodes,
    edgeLength,
    crossEdgeLength,
    container: {
      edgeLength: containerEdgeLength,
      crossEdgeLength: containerCrossEdgeLength
    }
  };
}
