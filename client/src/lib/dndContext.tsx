import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

interface DndProviderWithOptionsProps {
  children: React.ReactNode;
}

export const DndProviderWithOptions: React.FC<DndProviderWithOptionsProps> = ({ children }) => {
  // Detect if we're on a touch device
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  // Use the appropriate backend based on device type
  const backend = isTouchDevice() ? TouchBackend : HTML5Backend;
  const options = isTouchDevice() ? { enableMouseEvents: true } : {};

  return (
    <DndProvider backend={backend} options={options}>
      {children}
    </DndProvider>
  );
};

export default DndProviderWithOptions;
