const graphContainer = document.getElementById('graphContainer');
const algorithmSelect = document.getElementById('algorithmSelect');
const nodeCountInput = document.getElementById('nodeCount');
const speedRange = document.getElementById('speedRange');
const generateGraphBtn = document.getElementById('generateGraphBtn');
const startBtn = document.getElementById('startBtn');
const algorithmDescription = document.getElementById('algorithmDescription');
const complexity = document.getElementById('complexity');

const algorithms = {
  bfs: {
    title: 'Breadth-First Search (BFS)',
    description: 'BFS explores nodes level by level from a start node, using a queue. It is ideal for shortest paths in unweighted graphs.',
    complexity: 'Time: O(V + E) | Space: O(V)'
  },
  dfs: {
    title: 'Depth-First Search (DFS)',
    description: 'DFS explores as far as possible along each branch before backtracking. It is useful for connectivity, topological ordering, and cycle detection.',
    complexity: 'Time: O(V + E) | Space: O(V)'
  },
  dijkstra: {
    title: 'Shortest Path (Dijkstra)',
    description: 'Dijkstra finds the shortest path from a start node to all other nodes in a weighted graph with non-negative edges.',
    complexity: 'Time: O((V + E) log V) | Space: O(V)'
  }
};

let nodes = [];
let edges = [];
let startNodeId = 0;
let targetNodeId = 1;
let isRunning = false;
let timeoutIds = [];

function setAlgorithmInfo() {
  const info = algorithms[algorithmSelect.value];
  algorithmDescription.innerHTML = `<strong>${info.title}</strong><br>${info.description}`;
  complexity.innerHTML = `<strong>Complexity:</strong> ${info.complexity}`;
}

function createGraph() {
  const count = Number(nodeCountInput.value);
  const containerWidth = graphContainer.clientWidth || 640;
  const containerHeight = graphContainer.clientHeight || 500;

  nodes = [];
  edges = [];

  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count;
    const radiusX = containerWidth * 0.32;
    const radiusY = containerHeight * 0.28;
    const x = containerWidth / 2 + Math.cos(angle) * radiusX;
    const y = containerHeight / 2 + Math.sin(angle) * radiusY;

    nodes.push({
      id: i,
      x,
      y,
      label: i + 1,
      state: 'default'
    });
  }

  startNodeId = 0;
  targetNodeId = count - 1;

  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      if (Math.random() < 0.55) {
        const weight = Math.floor(Math.random() * 9) + 1;
        edges.push({ from: i, to: j, weight, active: false, shortest: false });
        if (Math.random() < 0.5) {
          edges.push({ from: j, to: i, weight, active: false, shortest: false });
        }
      }
    }
  }

  if (edges.length === 0) {
    const a = 0;
    const b = 1;
    edges.push({ from: a, to: b, weight: 3, active: false, shortest: false });
    edges.push({ from: b, to: a, weight: 3, active: false, shortest: false });
  }

  renderGraph();
}

function renderGraph() {
  graphContainer.innerHTML = '';

  edges.forEach((edge) => {
    const from = nodes.find((node) => node.id === edge.from);
    const to = nodes.find((node) => node.id === edge.to);
    if (!from || !to) return;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const line = document.createElement('div');
    line.className = 'edge';
    if (edge.active) line.classList.add('active');
    if (edge.shortest) line.classList.add('shortest');

    line.style.width = `${length}px`;
    line.style.left = `${from.x + 26}px`;
    line.style.top = `${from.y + 26}px`;
    line.style.transform = `rotate(${angle}deg)`;

    const weight = document.createElement('span');
    weight.textContent = edge.weight;
    weight.style.position = 'absolute';
    weight.style.left = `${length / 2}px`;
    weight.style.top = '-12px';
    weight.style.fontSize = '11px';
    weight.style.color = '#dfeef7';
    line.appendChild(weight);

    graphContainer.appendChild(line);
  });

  nodes.forEach((node) => {
    const nodeEl = document.createElement('div');
    nodeEl.className = 'node';
    if (node.id === startNodeId) nodeEl.classList.add('start');
    if (node.id === targetNodeId) nodeEl.classList.add('target');
    if (node.state === 'visited') nodeEl.classList.add('visited');
    if (node.state === 'current') nodeEl.classList.add('current');

    nodeEl.style.left = `${node.x - 26}px`;
    nodeEl.style.top = `${node.y - 26}px`;
    nodeEl.textContent = node.label;

    graphContainer.appendChild(nodeEl);
  });
}

function sleep(ms) {
  return new Promise((resolve) => {
    const id = setTimeout(resolve, ms);
    timeoutIds.push(id);
  });
}

async function bfs() {
  const queue = [startNodeId];
  const visited = new Set([startNodeId]);
  const parents = new Map();

  while (queue.length > 0) {
    if (!isRunning) return;
    const current = queue.shift();
    const currentNode = nodes.find((node) => node.id === current);
    if (currentNode) currentNode.state = 'current';
    renderGraph();
    await sleep(Number(speedRange.value));

    const neighbors = edges
      .filter((edge) => edge.from === current && !visited.has(edge.to))
      .map((edge) => edge.to);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parents.set(neighbor, current);
        queue.push(neighbor);
        const neighborNode = nodes.find((node) => node.id === neighbor);
        if (neighborNode) neighborNode.state = 'visited';
        renderGraph();
        await sleep(Number(speedRange.value));
      }
    }

    const currentNodeAgain = nodes.find((node) => node.id === current);
    if (currentNodeAgain) currentNodeAgain.state = 'visited';
    renderGraph();
  }

  if (nodes.length > 0) {
    nodes.forEach((node) => {
      if (node.id !== startNodeId && node.id !== targetNodeId) node.state = 'visited';
    });
    renderGraph();
  }
}

async function dfs() {
  const visited = new Set();
  const stack = [startNodeId];

  while (stack.length > 0) {
    if (!isRunning) return;
    const current = stack.pop();
    if (visited.has(current)) continue;

    const currentNode = nodes.find((node) => node.id === current);
    if (currentNode) currentNode.state = 'current';
    renderGraph();
    await sleep(Number(speedRange.value));

    visited.add(current);

    const neighbors = edges
      .filter((edge) => edge.from === current)
      .map((edge) => edge.to)
      .reverse();

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }

    if (currentNode) currentNode.state = 'visited';
    renderGraph();
    await sleep(Number(speedRange.value));
  }
}

async function dijkstra() {
  const distances = new Map();
  const visited = new Set();
  const prev = new Map();
  const queue = [...nodes.map((node) => node.id)];

  nodes.forEach((node) => distances.set(node.id, Infinity));
  distances.set(startNodeId, 0);

  while (queue.length > 0 && isRunning) {
    queue.sort((a, b) => distances.get(a) - distances.get(b));
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);

    const currentNode = nodes.find((node) => node.id === current);
    if (currentNode) currentNode.state = 'current';
    renderGraph();
    await sleep(Number(speedRange.value));

    const neighbors = edges.filter((edge) => edge.from === current);
    for (const edge of neighbors) {
      const candidate = distances.get(current) + edge.weight;
      if (candidate < distances.get(edge.to)) {
        distances.set(edge.to, candidate);
        prev.set(edge.to, current);
        edge.active = true;
        edge.shortest = true;
        renderGraph();
        await sleep(Number(speedRange.value));
      }
    }

    if (currentNode) currentNode.state = 'visited';
    renderGraph();
  }

  const target = nodes.find((node) => node.id === targetNodeId);
  if (target) target.state = 'visited';
  renderGraph();
}

async function runAlgorithm() {
  if (isRunning) return;
  isRunning = true;
  startBtn.disabled = true;
  clearTimeouts();

  nodes.forEach((node) => {
    node.state = 'default';
  });
  edges.forEach((edge) => {
    edge.active = false;
    edge.shortest = false;
  });
  renderGraph();

  const algorithm = algorithmSelect.value;

  if (algorithm === 'bfs') await bfs();
  if (algorithm === 'dfs') await dfs();
  if (algorithm === 'dijkstra') await dijkstra();

  isRunning = false;
  startBtn.disabled = false;
}

function clearTimeouts() {
  timeoutIds.forEach((id) => clearTimeout(id));
  timeoutIds = [];
}

algorithmSelect.addEventListener('change', () => {
  setAlgorithmInfo();
});

generateGraphBtn.addEventListener('click', () => {
  clearTimeouts();
  isRunning = false;
  startBtn.disabled = false;
  createGraph();
});

startBtn.addEventListener('click', () => {
  runAlgorithm();
});

nodeCountInput.addEventListener('input', () => {
  createGraph();
});

setAlgorithmInfo();
createGraph();
