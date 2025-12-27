import React from "react";
import { useNavigate } from "react-router-dom";
import { HeroBackgroundWorkspace } from "@/components/flow-engine/HeroBackgroundWorkspace";

const FlowEngineWorkspace: React.FC = () => {
  const navigate = useNavigate();

  return (
    <HeroBackgroundWorkspace
      onBack={() => navigate("/flow-engine")}
      isLoggedIn={false}
    />
  );
};

export default FlowEngineWorkspace;
