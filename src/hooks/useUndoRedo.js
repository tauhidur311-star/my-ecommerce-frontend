import { useState, useCallback, useRef } from 'react';

const useUndoRedo = (initialState, maxHistorySize = 50) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);
  const isRedoUndoAction = useRef(false);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const addToHistory = useCallback((newState) => {
    if (isRedoUndoAction.current) {
      isRedoUndoAction.current = false;
      return;
    }

    setHistory(prevHistory => {
      // Remove any future history if we're not at the end
      const newHistory = prevHistory.slice(0, currentIndex + 1);
      
      // Add new state
      newHistory.push(newState);
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        return newHistory.slice(1);
      }
      
      return newHistory;
    });
    
    setCurrentIndex(prevIndex => {
      const newIndex = Math.min(prevIndex + 1, maxHistorySize - 1);
      return newIndex;
    });
  }, [currentIndex, maxHistorySize]);

  const undo = useCallback(() => {
    if (canUndo) {
      isRedoUndoAction.current = true;
      setCurrentIndex(prevIndex => prevIndex - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [canUndo, currentIndex, history]);

  const redo = useCallback(() => {
    if (canRedo) {
      isRedoUndoAction.current = true;
      setCurrentIndex(prevIndex => prevIndex + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [canRedo, currentIndex, history]);

  const reset = useCallback((newInitialState) => {
    setHistory([newInitialState]);
    setCurrentIndex(0);
    isRedoUndoAction.current = false;
  }, []);

  const getCurrentState = useCallback(() => {
    return history[currentIndex];
  }, [history, currentIndex]);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    addToHistory,
    reset,
    getCurrentState,
    historySize: history.length,
    currentIndex
  };
};

export default useUndoRedo;