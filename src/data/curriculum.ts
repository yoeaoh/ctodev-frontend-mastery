export interface Module {
  id: number;
  title: string;
  tier: 'Free' | 'Premium';
  estimatedHours: string;
  priority: string;
  description: string;
}

export const modules: Module[] = [
  {
    id: 1,
    title: "Event Loop & Async JavaScript",
    tier: "Free",
    estimatedHours: "4-6",
    priority: "P0",
    description: "Master the heart of JavaScript's concurrency model. Understand the call stack, microtasks, macrotasks, and the render queue."
  },
  {
    id: 2,
    title: "Virtual DOM & Reconciliation",
    tier: "Free",
    estimatedHours: "3-5",
    priority: "P0",
    description: "Deep dive into React's reconciliation algorithm. Learn how the Virtual DOM works and why keys are critical for performance."
  },
  {
    id: 3,
    title: "Browser Rendering Pipeline",
    tier: "Free",
    estimatedHours: "4-6",
    priority: "P0",
    description: "Understand how HTML, CSS, and JS turn into pixels. Trace the path from Parsing to Layout, Paint, and Compositing."
  },
  {
    id: 4,
    title: "V8 Engine & Memory Management",
    tier: "Premium",
    estimatedHours: "5-8",
    priority: "P1",
    description: "Explore the internals of the V8 engine. Learn about JIT compilation, hidden classes, and how to avoid memory leaks."
  },
  {
    id: 5,
    title: "Frontend System Design",
    tier: "Premium",
    estimatedHours: "6-10",
    priority: "P1",
    description: "Architect large-scale frontend applications. Design for scalability, reliability, and performance."
  },
  {
    id: 6,
    title: "Performance Profiling & Optimization",
    tier: "Premium",
    estimatedHours: "4-7",
    priority: "P2",
    description: "Master Chrome DevTools Performance panel. Identify bottlenecks and implement high-impact optimizations."
  },
  {
    id: 7,
    title: "Network & HTTP/2/3 Protocols",
    tier: "Premium",
    estimatedHours: "3-5",
    priority: "P2",
    description: "Understand the modern networking stack. Optimize asset delivery with multiplexing, server push, and QUIC."
  },
  {
    id: 8,
    title: "Security (XSS, CSP, CORS, OWASP)",
    tier: "Free",
    estimatedHours: "2-4",
    priority: "P3",
    description: "Protect your users and your data. Deep dive into modern web security vulnerabilities and mitigations."
  }
];
