import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Copy, RotateCcw, Sparkles, Briefcase, Coins, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = [
  "Content Creation",
  "Marketing",
  "Design",
  "Business Strategy",
  "Social Media",
  "Image Creation",
  "Product Mockups",
];

type PipelineStep = "idle" | "running" | "input_done" | "refined" | "created" | "error";

const PROMPT_LAB_CATEGORY_CARDS: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
}> = [
  {
    title: "Personal",
    description:
      "Daily productivity systems, learning workflows and growth prompts tailored to your life goals.",
    icon: UserRound,
    gradient: "from-[#8B5CF6]/40 via-transparent to-transparent",
  },
  {
    title: "Business",
    description:
      "Marketing strategies, operations playbooks and growth prompts to scale your company faster.",
    icon: Briefcase,
    gradient: "from-[#22D3EE]/40 via-transparent to-transparent",
  },
  {
    title: "Crypto",
    description:
      "Market intelligence, investor updates and Web3 research prompts for the next frontier.",
    icon: Coins,
    gradient: "from-[#F59E0B]/40 via-transparent to-transparent",
  },
];

const PromptLab = () => {
  const [mode, setMode] = useState<"Business" | "Crypto">("Business");
  const [categories, setCategories] = useState<string[]>([]);
  const [userGoal, setUserGoal] = useState("");
  const [context, setContext] = useState("");
  const [timeframeDays, setTimeframeDays] = useState(7);
  const [expertTone, setExpertTone] = useState(true);
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [finalOutput, setFinalOutput] = useState("");
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>("idle");
  const [progress, setProgress] = useState(0);

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleGenerate = async () => {
    console.log("Generate button clicked");
    console.log("User goal length:", userGoal.length);
    
    if (userGoal.length < 20) {
      toast({
        title: "Kerro tarkemmin",
        description: "Kerro tarkemmin mitä haluat (väh. 20 merkkiä).",
        variant: "destructive",
      });
      return;
    }

    setPipelineStep("running");
    setProgress(0);
    setOptimizedPrompt("");
    setFinalOutput("");

    try {
      // Step A: Input Agent
      console.log("Starting Input Agent...");
      setProgress(10);
      
      const inputPayload = {
        userGoal,
        context,
        categories,
        mode,
        timeframeDays,
        expertTone,
      };
      console.log("Input Agent payload:", inputPayload);
      
      const { data: inputData, error: inputError } = await supabase.functions.invoke(
        "agent-input",
        {
          body: inputPayload,
        }
      );

      console.log("Input Agent response:", { data: inputData, error: inputError });

      if (inputError) {
        console.error("Input Agent error:", inputError);
        throw inputError;
      }
      if (!inputData?.spec) {
        console.error("Invalid Input Agent response:", inputData);
        throw new Error("Invalid response from Input Agent");
      }

      console.log("Input Agent spec:", inputData.spec);
      setPipelineStep("input_done");
      setProgress(33);

      // Step B: Refine Agent
      console.log("Starting Refine Agent...");
      const { data: refineData, error: refineError } = await supabase.functions.invoke(
        "agent-refine",
        {
          body: { spec: inputData.spec },
        }
      );

      console.log("Refine Agent response:", { data: refineData, error: refineError });

      if (refineError) {
        console.error("Refine Agent error:", refineError);
        throw refineError;
      }
      if (!refineData?.optimizedPrompt) {
        console.error("Invalid Refine Agent response:", refineData);
        throw new Error("Invalid response from Refine Agent");
      }

      console.log("Optimized prompt:", refineData.optimizedPrompt);
      setOptimizedPrompt(refineData.optimizedPrompt);
      setPipelineStep("refined");
      setProgress(66);

      // Step C: Creator Agent (streaming)
      console.log("Starting Creator Agent (streaming)...");
      const CREATOR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-creator`;
      console.log("Creator URL:", CREATOR_URL);
      
      const response = await fetch(CREATOR_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          optimizedPrompt: refineData.optimizedPrompt,
          mode,
        }),
      });

      console.log("Creator Agent stream response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Creator Agent stream error:", errorText);
        throw new Error(`Failed to start Creator Agent stream: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        console.error("No response body from Creator Agent");
        throw new Error("No response body");
      }

      console.log("Starting to read stream...");
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let accumulatedOutput = "";

      if (mode === "Crypto") {
        accumulatedOutput = "Educational content. Not financial advice.\n\n";
        setFinalOutput(accumulatedOutput);
      }

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              accumulatedOutput += content;
              setFinalOutput(accumulatedOutput);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      console.log("Stream complete. Final output length:", accumulatedOutput.length);
      setPipelineStep("created");
      setProgress(100);

      toast({
        title: "Valmis!",
        description: "3-vaiheinen pipeline suoritettu onnistuneesti.",
      });
    } catch (error: any) {
      console.error("Pipeline error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      setPipelineStep("error");
      toast({
        title: "Virhe",
        description: error.message || "Agent pipeline failed — try again or simplify inputs.",
        variant: "destructive",
      });
    }
  };

  const handleStartOver = () => {
    setOptimizedPrompt("");
    setFinalOutput("");
    setPipelineStep("idle");
    setProgress(0);
    setUserGoal("");
    setContext("");
    setCategories([]);
    setTimeframeDays(7);
    setExpertTone(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopioitu!",
      description: `${label} kopioitu leikepöydälle.`,
    });
  };

  const getProgressLabel = () => {
    if (pipelineStep === "idle") return "Odottaa";
    if (pipelineStep === "running") return "Input Agent ⏳";
    if (pipelineStep === "input_done") return "Input Agent ✅";
    if (pipelineStep === "refined") return "Refine Agent ✅";
    if (pipelineStep === "created") return "Creator Agent ✅";
    if (pipelineStep === "error") return "Virhe ❌";
    return "";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 pt-32 pb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">PromptLab</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Multi-Agent Prompt Generator: Input → Refine → Creator
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-12">
          {PROMPT_LAB_CATEGORY_CARDS.map(({ title, description, icon: Icon, gradient }) => (
            <Card
              key={title}
              className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80`}
                aria-hidden={true}
              />
              <div className="relative p-6 flex flex-col h-full">
                <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center mb-5">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Input Section */}
        <Card className="bg-card/50 border-white/10 p-6 mb-8">
          <div className="space-y-6">
            {/* Mode Selector */}
            <div>
              <Label htmlFor="mode">Mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as "Business" | "Crypto")}>
                <SelectTrigger id="mode" className="mt-2 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10">
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categories */}
            <div>
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {CATEGORIES.map((cat) => (
                  <Badge
                    key={cat}
                    variant={categories.includes(cat) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80 transition-colors"
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            {/* User Goal */}
            <div>
              <Label htmlFor="userGoal">Mitä haluat saada aikaan?</Label>
              <Textarea
                id="userGoal"
                value={userGoal}
                onChange={(e) => setUserGoal(e.target.value)}
                placeholder="Mitä haluat saada aikaan? Kerro mahdollisimman konkreettisesti."
                className="mt-2 min-h-[100px] bg-background"
              />
            </div>

            {/* Context */}
            <div>
              <Label htmlFor="context">Konteksti</Label>
              <Textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Kenelle tämä on? Mikä on brändi, tyyli, rajoitteet?"
                className="mt-2 min-h-[80px] bg-background"
              />
            </div>

            {/* Timeframe & Expert Tone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="timeframe">Aikaväli (päivää)</Label>
                <Input
                  id="timeframe"
                  type="number"
                  min={1}
                  max={30}
                  value={timeframeDays}
                  onChange={(e) => setTimeframeDays(parseInt(e.target.value))}
                  className="mt-2 bg-background"
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="expertTone"
                  checked={expertTone}
                  onCheckedChange={setExpertTone}
                />
                <Label htmlFor="expertTone" className="cursor-pointer">
                  Asiantuntijamainen sävy
                </Label>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={pipelineStep === "running"}
              className="w-full"
              size="lg"
            >
              {pipelineStep === "running" ? "Generating..." : "Generate"}
            </Button>
          </div>
        </Card>

        {/* Progress Bar */}
        {pipelineStep !== "idle" && (
          <Card className="bg-card/50 border-white/10 p-6 mb-8">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{getProgressLabel()}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </Card>
        )}

        {/* Output Section */}
        {(optimizedPrompt || finalOutput) && (
          <div className="space-y-6">
            {/* Optimized Prompt */}
            {optimizedPrompt && (
              <Card className="bg-card/50 border-white/10 p-6">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg font-semibold">Optimized Prompt</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(optimizedPrompt, "Optimized Prompt")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={optimizedPrompt}
                  readOnly
                  className="min-h-[200px] bg-background font-mono text-sm"
                />
              </Card>
            )}

            {/* Final Output */}
            {finalOutput && (
              <Card className="bg-card/50 border-white/10 p-6">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg font-semibold">Final Output</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(finalOutput, "Final Output")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={finalOutput}
                  readOnly
                  className="min-h-[300px] bg-background whitespace-pre-wrap"
                />
              </Card>
            )}

            {/* Start Over Button */}
            <Button
              variant="outline"
              onClick={handleStartOver}
              className="w-full"
              size="lg"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default PromptLab;
