import { createContext, useContext, useState, ReactNode } from "react";

interface DocumentContextType {
  currentResult: any | null;
  setCurrentResult: (result: any) => void;
}

const DocumentContext = createContext<DocumentContextType | null>(null);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [currentResult, setCurrentResult] = useState<any | null>(null);
  return (
    <DocumentContext.Provider value={{ currentResult, setCurrentResult }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error("useDocument must be used within DocumentProvider");
  return ctx;
}