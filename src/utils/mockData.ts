import { Thread, Message } from '../types';

// Generate a random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

// Sample messages for demonstration
export const createSampleMessages = (): Message[] => {
  return [
    {
      id: generateId(),
      type: 'user',
      content: 'How do I create a React component?',
      status: 'complete',
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
      id: generateId(),
      type: 'assistant',
      content: `Here's how you can create a basic React component:

\`\`\`jsx
import React from 'react';

const MyComponent = () => {
  return (
    <div>
      <h1>Hello, World!</h1>
      <p>This is my first React component.</p>
    </div>
  );
};

export default MyComponent;
\`\`\`

You can then use this component in another component like this:

\`\`\`jsx
import MyComponent from './MyComponent';

function App() {
  return (
    <div>
      <MyComponent />
    </div>
  );
}
\`\`\``,
      status: 'complete',
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
      thinking: "Let me think about how to explain React components in a clear way. I should include a basic example with proper syntax highlighting..."
    },
    {
      id: generateId(),
      type: 'user',
      content: 'How do I handle state in this component?',
      status: 'complete',
      timestamp: new Date(Date.now() - 1000 * 60 * 3)
    },
    {
      id: generateId(),
      type: 'assistant',
      content: `To handle state in a React component, you can use the useState hook. Here's an example:

\`\`\`jsx
import React, { useState } from 'react';

const Counter = () => {
  // Declare a state variable called "count" with initial value of 0
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
};

export default Counter;
\`\`\`

The useState hook returns a pair: the current state value and a function to update it. You can call the update function to change the state, which will trigger a re-render of the component.`,
      status: 'complete',
      timestamp: new Date(Date.now() - 1000 * 60 * 2)
    }
  ];
};

// Sample threads for demonstration
export const createSampleThreads = (): Thread[] => {
  return [
    {
      id: generateId(),
      title: 'React Components',
      messages: createSampleMessages(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      updatedAt: new Date(Date.now() - 1000 * 60 * 2)
    },
    {
      id: generateId(),
      title: 'CSS Animations',
      messages: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: generateId(),
      title: 'JavaScript Promises',
      messages: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
      updatedAt: new Date(Date.now() - 1000 * 60 * 10)
    }
  ];
};
