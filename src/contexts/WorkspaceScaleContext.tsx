import React, { createContext, useContext } from "react";

interface WorkspaceScaleContextType {
  nodeScale: number;
}

const WorkspaceScaleContext = createContext<WorkspaceScaleContextType>({
  nodeScale: 1,
});

export const useWorkspaceScale = () => {
  return useContext(WorkspaceScaleContext).nodeScale;
};

export const WorkspaceScaleProvider: React.FC<{
  nodeScale: number;
  children: React.ReactNode;
}> = ({ nodeScale, children }) => {
  return (
    <WorkspaceScaleContext.Provider value={{ nodeScale }}>
      {children}
    </WorkspaceScaleContext.Provider>
  );
};




