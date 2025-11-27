import PromptLabWorkspace from "@/layouts/PromptLabWorkspace";
import AssistantChat from "@/components/AssistantChat";
import OptimizerChat from "@/components/OptimizerChat";
import GeneratorPanel from "@/components/GeneratorPanel"; // nykyinen keskikolumni

export default function Page() {
  return (
    <PromptLabWorkspace
      Left={<AssistantChat />}
      Center={<GeneratorPanel />}
      Right={<OptimizerChat />}
    />
  );
}
