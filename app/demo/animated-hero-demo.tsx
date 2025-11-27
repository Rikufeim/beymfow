import { ParticleHero } from "@/components/ui/animated-hero";

export default function AnimatedHeroDemo() {
  return (
    <ParticleHero
      title="Power for creators."
      subtitle="Flow for everyone."
      description="Turn ideas into prompts, content, and systems inside the Beymflow Lab."
      particleCount={12}
      interactiveHint="Move to shape the flow"
      primaryButton={{
        text: "Enter the Lab",
        onClick: () => console.log("Lab"),
      }}
      secondaryButton={{
        text: "Explore Prompts",
        onClick: () => console.log("Prompts"),
      }}
    />
  );
}
