import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Shape {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  duration: number;
  delay: number;
  type: 'square' | 'circle' | 'triangle';
}

const GeometricShapes: React.FC = () => {
  const shapesRef = useRef<Shape[]>([]);
  
  useEffect(() => {
    // Generate random shapes
    const shapes: Shape[] = [];
    const count = 12; // Reduced number of shapes to be less distracting
    const types: ('square' | 'circle' | 'triangle')[] = ['square', 'circle', 'triangle'];
    
    for (let i = 0; i < count; i++) {
      shapes.push({
        id: i,
        x: Math.random() * 100, // Random position (percentage)
        y: Math.random() * 100,
        size: 10 + Math.random() * 30, // Random size between 10px and 40px (smaller)
        rotation: Math.random() * 360, // Random rotation
        duration: 30 + Math.random() * 40, // Animation duration (slower)
        delay: Math.random() * 10, // Random delay
        type: types[Math.floor(Math.random() * types.length)]
      });
    }
    
    shapesRef.current = shapes;
  }, []);
  
  const renderShape = (shape: Shape) => {
    const baseStyle = {
      left: `${shape.x}%`,
      top: `${shape.y}%`,
      width: `${shape.size}px`,
      height: `${shape.size}px`,
      rotate: `${shape.rotation}deg`,
      opacity: 0.2, // Lower opacity to be less distracting
    };
    
    switch (shape.type) {
      case 'circle':
        return (
          <motion.div
            key={shape.id}
            className="geometric-shape"
            style={{
              ...baseStyle,
              borderRadius: '50%',
            }}
            animate={{
              x: [0, 15, -15, 8, -8, 0], // Smaller movement range
              y: [0, -15, 8, -8, 15, 0],
              rotate: [shape.rotation, shape.rotation + 5, shape.rotation - 5, shape.rotation],
              opacity: [0.1, 0.2, 0.1, 0.2, 0.1], // More subtle opacity changes
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: shape.delay,
            }}
          />
        );
      case 'triangle':
        return (
          <motion.div
            key={shape.id}
            style={{
              position: 'absolute',
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              width: 0,
              height: 0,
              borderLeft: `${shape.size / 2}px solid transparent`,
              borderRight: `${shape.size / 2}px solid transparent`,
              borderBottom: `${shape.size}px solid rgba(0, 182, 221, 0.03)`,
              opacity: 0.2,
            }}
            animate={{
              x: [0, 15, -15, 8, -8, 0],
              y: [0, -15, 8, -8, 15, 0],
              rotate: [shape.rotation, shape.rotation + 5, shape.rotation - 5, shape.rotation],
              opacity: [0.1, 0.2, 0.1, 0.2, 0.1],
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: shape.delay,
            }}
          />
        );
      default: // square
        return (
          <motion.div
            key={shape.id}
            className="geometric-shape"
            style={baseStyle}
            animate={{
              x: [0, 15, -15, 8, -8, 0],
              y: [0, -15, 8, -8, 15, 0],
              rotate: [shape.rotation, shape.rotation + 5, shape.rotation - 5, shape.rotation],
              opacity: [0.1, 0.2, 0.1, 0.2, 0.1],
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: shape.delay,
            }}
          />
        );
    }
  };
  
  return (
    <div className="geometric-shapes">
      {shapesRef.current.map(renderShape)}
    </div>
  );
};

export default GeometricShapes;
