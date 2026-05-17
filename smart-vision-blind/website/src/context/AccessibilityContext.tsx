import React, { createContext, useContext, useState, useEffect } from 'react';

type TextSize = 'normal' | 'large' | 'extra-large';

interface AccessibilityContextType {
  isSimpleMode: boolean;
  toggleSimpleMode: () => void;
  textSize: TextSize;
  increaseTextSize: () => void;
  decreaseTextSize: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  speak: (text: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(() => {
    return localStorage.getItem('simpleMode') === 'true';
  });

  const [textSize, setTextSize] = useState<TextSize>(() => {
    return (localStorage.getItem('textSize') as TextSize) || 'normal';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('highContrast') === 'true';
  });

  // Persist states to local storage
  useEffect(() => {
    localStorage.setItem('simpleMode', String(isSimpleMode));
    if (isSimpleMode) {
      speak("Simple High Contrast Mode activated.");
    } else {
      speak("Standard Visual Mode activated.");
    }
  }, [isSimpleMode]);

  useEffect(() => {
    localStorage.setItem('textSize', textSize);
  }, [textSize]);

  useEffect(() => {
    localStorage.setItem('highContrast', String(highContrast));
  }, [highContrast]);

  // Voice announcement helper (Requirement #2, AI voice feedback/TTS)
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel previous speech to prevent overlapping announcements
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleSimpleMode = () => {
    setIsSimpleMode((prev) => !prev);
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
    speak(highContrast ? "High Contrast deactivated" : "High Contrast activated");
  };

  const increaseTextSize = () => {
    setTextSize((prev) => {
      if (prev === 'normal') {
        speak("Text size set to large");
        return 'large';
      }
      if (prev === 'large') {
        speak("Text size set to extra large");
        return 'extra-large';
      }
      return prev;
    });
  };

  const decreaseTextSize = () => {
    setTextSize((prev) => {
      if (prev === 'extra-large') {
        speak("Text size set to large");
        return 'large';
      }
      if (prev === 'large') {
        speak("Text size set to normal");
        return 'normal';
      }
      return prev;
    });
  };

  // Render tailwind sizing and theme variables dynamically onto html body
  useEffect(() => {
    const root = document.documentElement;
    
    // Manage text sizing classes
    root.classList.remove('text-normal', 'text-large', 'text-xlarge');
    if (textSize === 'large') root.classList.add('text-large');
    if (textSize === 'extra-large') root.classList.add('text-xlarge');

    // Manage high contrast themes
    if (highContrast || isSimpleMode) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [textSize, highContrast, isSimpleMode]);

  return (
    <AccessibilityContext.Provider
      value={{
        isSimpleMode,
        toggleSimpleMode,
        textSize,
        increaseTextSize,
        decreaseTextSize,
        highContrast,
        toggleHighContrast,
        speak,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
