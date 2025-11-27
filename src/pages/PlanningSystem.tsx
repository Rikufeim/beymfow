import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PlanningSystem.css";

type StrategyType = "conservative" | "balanced" | "aggressive";

type TemplateKey = "wealth" | "business" | "learning";

type StepKey =
  | "goal"
  | "context"
  | "opportunity"
  | "risk"
  | "strategy"
  | "implementation"
  | "output";

type StepStatus = "idle" | "processing" | "active";

interface StrategyTemplate {
  title: string;
  icon: string;
  risk: number;
  timeline: Record<string, string>;
  actions: string[];
  metrics: Record<string, string>;
}

type SolutionTemplates = Record<TemplateKey, Record<StrategyType, StrategyTemplate>>;

interface StrategyCard extends StrategyTemplate {
  type: StrategyType;
}

const solutionTemplates: SolutionTemplates = {
  wealth: {
    conservative: {
      title: "Steady Wealth Building",
      icon: "🛡️",
      risk: 1,
      timeline: {
        "3mo": "Foundation",
        "1yr": "$10K saved",
        "3yr": "$50K+ portfolio"
      },
      actions: [
        "Start with high-yield savings (4-5% APY)",
        "Index fund investing (S&P 500)",
        "Develop high-income skill",
        "Build emergency fund (6 months)",
        "Automate 20% income to investments"
      ],
      metrics: {
        ROI: "7-10%/yr",
        Time: "15-20h/wk",
        Capital: "$500/mo",
        Success: "85%"
      }
    },
    balanced: {
      title: "Growth & Income Mix",
      icon: "⚖️",
      risk: 2,
      timeline: {
        "3mo": "Setup",
        "1yr": "$25K revenue",
        "3yr": "$150K+ net worth"
      },
      actions: [
        "Start side business or freelancing",
        "Mix stocks & crypto (70/30)",
        "Real estate crowdfunding",
        "Create passive income streams",
        "Network for opportunities"
      ],
      metrics: {
        ROI: "15-25%/yr",
        Time: "25-30h/wk",
        Capital: "$5-10K",
        Success: "65%"
      }
    },
    aggressive: {
      title: "High-Risk High-Reward",
      icon: "🚀",
      risk: 3,
      timeline: {
        "3mo": "Launch",
        "1yr": "$100K potential",
        "3yr": "$1M+ target"
      },
      actions: [
        "Start scalable startup",
        "Active trading & options",
        "Crypto/DeFi strategies",
        "Leverage debt strategically",
        "All-in on highest ROI path"
      ],
      metrics: {
        ROI: "50-500%",
        Time: "60-80h/wk",
        Capital: "$20K+",
        Success: "25%"
      }
    }
  },
  business: {
    conservative: {
      title: "Service-Based Start",
      icon: "🛡️",
      risk: 1,
      timeline: {
        "3mo": "First client",
        "1yr": "$5K/mo",
        "3yr": "Agency scale"
      },
      actions: [
        "Start with freelance services",
        "Build portfolio & testimonials",
        "Focus on one niche deeply",
        "Reinvest all profits initially",
        "Slow, sustainable growth"
      ],
      metrics: {
        Investment: "$1-2K",
        Time: "20h/wk",
        Breakeven: "3mo",
        Success: "75%"
      }
    },
    balanced: {
      title: "Product + Service Mix",
      icon: "⚖️",
      risk: 2,
      timeline: {
        "3mo": "MVP",
        "1yr": "$20K/mo",
        "3yr": "Market leader"
      },
      actions: [
        "Develop digital product",
        "Combine with done-for-you service",
        "Build email list & community",
        "Strategic partnerships",
        "Paid advertising when profitable"
      ],
      metrics: {
        Investment: "$10K",
        Time: "40h/wk",
        Breakeven: "6mo",
        Success: "50%"
      }
    },
    aggressive: {
      title: "VC-Backed Scaling",
      icon: "🚀",
      risk: 3,
      timeline: {
        "3mo": "Seed round",
        "1yr": "Series A",
        "3yr": "Exit/IPO"
      },
      actions: [
        "Build tech/platform solution",
        "Raise investment rounds",
        "Hire aggressively",
        "Capture market share fast",
        "Focus on growth over profit"
      ],
      metrics: {
        Investment: "$50K+",
        Time: "80h/wk",
        Breakeven: "2-3yr",
        Success: "10%"
      }
    }
  },
  learning: {
    conservative: {
      title: "Structured Learning Path",
      icon: "📚",
      risk: 1,
      timeline: {
        "3mo": "Basics",
        "1yr": "Junior level",
        "3yr": "Senior expert"
      },
      actions: [
        "Enroll in online courses",
        "Follow structured curriculum",
        "Practice 2 hours daily",
        "Join study groups",
        "Get mentor guidance"
      ],
      metrics: {
        Cost: "$500",
        Time: "15h/wk",
        Mastery: "3yr",
        Success: "90%"
      }
    },
    balanced: {
      title: "Learn + Build Approach",
      icon: "🔨",
      risk: 2,
      timeline: {
        "3mo": "First project",
        "1yr": "Portfolio",
        "3yr": "Expert practitioner"
      },
      actions: [
        "Project-based learning",
        "Contribute to open source",
        "Build real applications",
        "Document journey publicly",
        "Freelance while learning"
      ],
      metrics: {
        Cost: "$1-2K",
        Time: "25h/wk",
        Mastery: "2yr",
        Success: "70%"
      }
    },
    aggressive: {
      title: "Immersive Bootcamp",
      icon: "💪",
      risk: 3,
      timeline: {
        "3mo": "Bootcamp",
        "6mo": "Job ready",
        "1yr": "Senior role"
      },
      actions: [
        "Quit job for full immersion",
        "Intensive bootcamp program",
        "Build 10+ projects fast",
        "Network aggressively",
        "Target top companies"
      ],
      metrics: {
        Cost: "$15K",
        Time: "60h/wk",
        Mastery: "1yr",
        Success: "60%"
      }
    }
  }
};

const initialDetails: Record<Exclude<StepKey, "output">, string[]> = {
  goal: [
    "Primary objective: pending...",
    "Timeframe: undefined",
    "Scope: undefined"
  ],
  context: [
    "Domain: awaiting...",
    "Resources needed: pending",
    "Key challenges: pending"
  ],
  opportunity: [
    "Market opportunities: scanning...",
    "Skill leverage: analyzing...",
    "Timing factors: evaluating..."
  ],
  risk: [
    "Investment required: calculating...",
    "Time commitment: assessing...",
    "Success probability: computing..."
  ],
  strategy: [
    "Conservative path: building...",
    "Balanced approach: designing...",
    "Aggressive strategy: crafting..."
  ],
  implementation: [
    "First steps: defining...",
    "Milestones: setting...",
    "Success metrics: establishing..."
  ]
};

const initialStatus: Record<StepKey, StepStatus> = {
  goal: "idle",
  context: "idle",
  opportunity: "idle",
  risk: "idle",
  strategy: "idle",
  implementation: "idle",
  output: "idle"
};

const initialProgress: Record<Exclude<StepKey, "output">, number> = {
  goal: 0,
  context: 0,
  opportunity: 0,
  risk: 0,
  strategy: 0,
  implementation: 0
};

const connections: Array<{
  from: Exclude<StepKey, "output">;
  to: Exclude<StepKey, "goal">;
  color: string;
}> = [
  { from: "goal", to: "context", color: "#8b5cf6" },
  { from: "context", to: "opportunity", color: "#8b5cf6" },
  { from: "opportunity", to: "risk", color: "#a855f7" },
  { from: "risk", to: "strategy", color: "#7c3aed" },
  { from: "strategy", to: "implementation", color: "#a855f7" },
  { from: "implementation", to: "output", color: "#22c55e" }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const detectGoalType = (input: string): TemplateKey => {
  const text = input.toLowerCase();
  const patterns: Record<TemplateKey, string[]> = {
    wealth: ["rich", "money", "wealth", "financial", "millionaire", "passive income", "invest"],
    business: ["business", "startup", "company", "entrepreneur", "sell", "product", "service"],
    learning: ["learn", "skill", "programming", "coding", "study", "master", "education"]
  };

  for (const [type, keywords] of Object.entries(patterns) as Array<[TemplateKey, string[]]>) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return type;
    }
  }

  return "wealth";
};

const PlanningSystem: React.FC = () => {
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState("");
  const [stepDetails, setStepDetails] = useState(initialDetails);
  const [stepStatus, setStepStatus] = useState(initialStatus);
  const [progress, setProgress] = useState(initialProgress);
  const [strategies, setStrategies] = useState<StrategyCard[]>([]);
  const [visibleStrategies, setVisibleStrategies] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const goalRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<HTMLDivElement>(null);
  const opportunityRef = useRef<HTMLDivElement>(null);
  const riskRef = useRef<HTMLDivElement>(null);
  const strategyRef = useRef<HTMLDivElement>(null);
  const implementationRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const [paths, setPaths] = useState<Array<{ d: string; color: string }>>([]);

  const refs = useMemo(
    () => ({
      goal: goalRef,
      context: contextRef,
      opportunity: opportunityRef,
      risk: riskRef,
      strategy: strategyRef,
      implementation: implementationRef,
      output: outputRef
    }),
    []
  );

  const updateConnections = useCallback(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    const containerRect = container.getBoundingClientRect();
    const newPaths: Array<{ d: string; color: string }> = [];

    connections.forEach(({ from, to, color }) => {
      const fromEl = refs[from]?.current;
      const toEl = refs[to]?.current;
      if (!fromEl || !toEl) return;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
      const y1 = fromRect.bottom - containerRect.top;
      const x2 = toRect.left + toRect.width / 2 - containerRect.left;
      const y2 = toRect.top - containerRect.top;
      const midY = (y1 + y2) / 2;
      const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

      newPaths.push({ d, color });
    });

    setPaths(newPaths);
  }, [refs]);

  useEffect(() => {
    updateConnections();
  }, [updateConnections]);

  useEffect(() => {
    updateConnections();
  }, [strategies.length, updateConnections]);

  useEffect(() => {
    const handleResize = () => updateConnections();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateConnections]);

  useEffect(() => {
    document.title = "Strategic Solution Generator - Master Agent";
  }, []);

  const resetState = useCallback(() => {
    setStepDetails(initialDetails);
    setStepStatus(initialStatus);
    setProgress(initialProgress);
    setStrategies([]);
    setVisibleStrategies([]);
  }, []);

  const runStep = useCallback(
    async (key: Exclude<StepKey, "output">, update: () => void) => {
      setStepStatus(prev => ({ ...prev, [key]: "processing" }));
      setProgress(prev => ({ ...prev, [key]: 0 }));
      await delay(500);
      update();
      setProgress(prev => ({ ...prev, [key]: 100 }));
      setStepStatus(prev => ({ ...prev, [key]: "active" }));
      await delay(250);
      updateConnections();
    },
    [updateConnections]
  );

  const handleGenerate = useCallback(async () => {
    if (!userInput.trim()) {
      setError("Please enter your goal or challenge.");
      return;
    }
    setError(null);

    resetState();

    const goalType = detectGoalType(userInput);
    const templates = solutionTemplates[goalType];

    await delay(100);

    await runStep("goal", () => {
      setStepDetails(prev => ({
        ...prev,
        goal: [
          `Primary objective: ${goalType.toUpperCase()}`,
          "Timeframe: 3 months - 3 years",
          "Scope: Comprehensive strategy"
        ]
      }));
    });

    await runStep("context", () => {
      setStepDetails(prev => ({
        ...prev,
        context: [
          `Domain: ${goalType === "wealth" ? "Financial" : goalType === "business" ? "Entrepreneurship" : "Skill Development"}`,
          "Resources needed: Variable by strategy",
          "Key challenges: Competition, Time, Capital"
        ]
      }));
    });

    await runStep("opportunity", () => {
      setStepDetails(prev => ({
        ...prev,
        opportunity: [
          "Market opportunities: High demand identified",
          "Skill leverage: Multiple paths available",
          "Timing factors: Favorable conditions"
        ]
      }));
    });

    await runStep("risk", () => {
      setStepDetails(prev => ({
        ...prev,
        risk: [
          "Investment required: $500 - $50K+",
          "Time commitment: 15 - 80 hours/week",
          "Success probability: 10% - 90%"
        ]
      }));
    });

    await runStep("strategy", () => {
      setStepDetails(prev => ({
        ...prev,
        strategy: [
          "Conservative path: Low risk, steady growth",
          "Balanced approach: Moderate risk & reward",
          "Aggressive strategy: High risk, high potential"
        ]
      }));
    });

    await runStep("implementation", () => {
      setStepDetails(prev => ({
        ...prev,
        implementation: [
          "First steps: Defined for each strategy",
          "Milestones: Clear checkpoints set",
          "Success metrics: KPIs established"
        ]
      }));
    });

    setStepStatus(prev => ({ ...prev, output: "processing" }));
    await delay(500);

    const cards = (Object.keys(templates) as StrategyType[]).map(type => ({
      ...templates[type],
      type
    }));

    setStrategies(cards);
    setVisibleStrategies([]);
    setStepStatus(prev => ({ ...prev, output: "active" }));
    updateConnections();

    cards.forEach((_, index) => {
      setTimeout(() => {
        setVisibleStrategies(prev => (prev.includes(index) ? prev : [...prev, index]));
      }, index * 300);
    });
  }, [resetState, runStep, updateConnections, userInput]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && event.ctrlKey) {
        event.preventDefault();
        handleGenerate();
      }
    },
    [handleGenerate]
  );

  const handleBack = useCallback(() => {
    if (document.referrer && document.referrer !== window.location.href) {
      window.history.back();
    } else {
      navigate("/");
    }
  }, [navigate]);

  const renderList = (items: string[]) => (
    <ul className="box-list">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );

  const isProcessing = (key: StepKey) => stepStatus[key] === "processing";
  const isActive = (key: StepKey) => stepStatus[key] === "active";

  return (
    <div className="planning-system-page">
      <div className="container">
        <div className="page-top">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
        </div>
        <h1>🚀 Strategic Solution Generator</h1>
        <p className="subtitle">AI-Powered Multi-Scenario Planning System</p>

        <div className="input-section">
          <div className="input-label">
            <span>🎯</span>
            <span>What Do You Want to Achieve?</span>
          </div>
          <textarea
            className="input-field"
            value={userInput}
            onChange={event => setUserInput(event.target.value)}
            onKeyDown={onKeyDown}
            rows={3}
            placeholder="Example: I want to be rich / I need to learn programming / I want to start a business..."
          />
          {error && <div className="error-text">{error}</div>}
          <button className="process-button" onClick={handleGenerate}>
            🧠 Generate Strategic Solutions
          </button>
        </div>

        <div className="workflow-container" ref={containerRef}>
          <svg className="svg-canvas" ref={svgRef}>
            {paths.map((path, index) => (
              <React.Fragment key={index}>
                <path d={path.d} stroke={path.color} strokeWidth={2} fill="none" opacity={0.3} strokeDasharray="5,5" />
                <circle r={3} fill={path.color} style={{ filter: `drop-shadow(0 0 6px ${path.color})` }}>
                  <animateMotion dur="2s" repeatCount="indefinite" path={path.d} begin={`${index * 0.3}s`} />
                </circle>
              </React.Fragment>
            ))}
          </svg>

          <div className="process-row">
            <div
              ref={goalRef}
              className={`process-box${isActive("goal") ? " active" : ""}${isProcessing("goal") ? " processing" : ""}`}
            >
              <div className="box-header">
                <div className="box-icon">🎯</div>
                <div className="box-title">Goal Analysis</div>
              </div>
              <div className="box-content">
                <strong>Understanding Your Goal:</strong>
                {renderList(stepDetails.goal)}
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress.goal}%` }} />
                </div>
              </div>
            </div>

            <div
              ref={contextRef}
              className={`process-box${isActive("context") ? " active" : ""}${isProcessing("context") ? " processing" : ""}`}
            >
              <div className="box-header">
                <div className="box-icon">🗺️</div>
                <div className="box-title">Context Mapping</div>
              </div>
              <div className="box-content">
                <strong>Analyzing Context:</strong>
                {renderList(stepDetails.context)}
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress.context}%` }} />
                </div>
              </div>
            </div>

            <div
              ref={opportunityRef}
              className={`process-box${isActive("opportunity") ? " active" : ""}${
                isProcessing("opportunity") ? " processing" : ""
              }`}
            >
              <div className="box-header">
                <div className="box-icon">💡</div>
                <div className="box-title">Opportunity Discovery</div>
              </div>
              <div className="box-content">
                <strong>Identifying Paths:</strong>
                {renderList(stepDetails.opportunity)}
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress.opportunity}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="process-row">
            <div
              ref={riskRef}
              className={`process-box${isActive("risk") ? " active" : ""}${isProcessing("risk") ? " processing" : ""}`}
            >
              <div className="box-header">
                <div className="box-icon">⚡</div>
                <div className="box-title">Risk Assessment</div>
              </div>
              <div className="box-content">
                <strong>Evaluating Factors:</strong>
                {renderList(stepDetails.risk)}
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress.risk}%` }} />
                </div>
              </div>
            </div>

            <div
              ref={strategyRef}
              className={`process-box${isActive("strategy") ? " active" : ""}${
                isProcessing("strategy") ? " processing" : ""
              }`}
            >
              <div className="box-header">
                <div className="box-icon">🧩</div>
                <div className="box-title">Strategy Formation</div>
              </div>
              <div className="box-content">
                <strong>Creating Scenarios:</strong>
                {renderList(stepDetails.strategy)}
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress.strategy}%` }} />
                </div>
              </div>
            </div>

            <div
              ref={implementationRef}
              className={`process-box${isActive("implementation") ? " active" : ""}${
                isProcessing("implementation") ? " processing" : ""
              }`}
            >
              <div className="box-header">
                <div className="box-icon">📋</div>
                <div className="box-title">Implementation</div>
              </div>
              <div className="box-content">
                <strong>Action Planning:</strong>
                {renderList(stepDetails.implementation)}
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress.implementation}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="process-row">
            <div
              ref={outputRef}
              className={`process-box output-section${isActive("output") ? " active" : ""}${
                isProcessing("output") ? " processing" : ""
              }`}
            >
              <div className="box-header">
                <div className="box-icon">✨</div>
                <div className="box-title">Strategic Solutions - 3 Scenarios</div>
              </div>
              <div className="box-content">
                <div className="strategy-container">
                  {strategies.map((strategy, index) => {
                    const riskDots = Array.from({ length: 3 }, (_, dotIndex) => (
                      <div
                        key={dotIndex}
                        className={`risk-dot${dotIndex < strategy.risk ? " active" : ""}`}
                      />
                    ));

                    return (
                      <div
                        key={strategy.title}
                        className={`strategy-card ${strategy.type}${
                          visibleStrategies.includes(index) ? " show" : ""
                        }`}
                      >
                        <div className="strategy-header">
                          <div className={`strategy-icon ${strategy.type}`}>{strategy.icon}</div>
                          <div>
                            <div className="strategy-title">{strategy.title}</div>
                            <div className="strategy-risk">{riskDots}</div>
                          </div>
                        </div>
                        <div className="strategy-content">
                          <div className="strategy-section">
                            <h4>Timeline</h4>
                            <div className="timeline">
                              {Object.entries(strategy.timeline).map(([time, value]) => (
                                <div className="timeline-item" key={time}>
                                  <div className="time">{time}</div>
                                  <div className="value">{value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="strategy-section">
                            <h4>Action Steps</h4>
                            <ul className="action-items">
                              {strategy.actions.map(action => (
                                <li key={action}>{action}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="strategy-section">
                            <h4>Key Metrics</h4>
                            <div className="metrics">
                              {Object.entries(strategy.metrics).map(([label, value]) => (
                                <div className="metric" key={label}>
                                  <div className="metric-label">{label}</div>
                                  <div className="metric-value">{value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningSystem;
