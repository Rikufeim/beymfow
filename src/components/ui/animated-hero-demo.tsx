import { ParticleHero } from "@/components/ui/animated-hero";

const ParticleHeroDemo = () => {
  return (
    <div className="min-h-screen w-full bg-black">
      <ParticleHero
        title="BEYMFLOW"
        subtitle="Power for creators"
        description="Flow for everyone. Build ideas, prompts, and systems in a single lab designed for speed, clarity, and control."
        particleCount={10}
        interactiveHint="Move to shape the flow"
        primaryButton={{
          text: "Enter the Lab",
          onClick: () => console.log("Enter the Lab"),
        }}
        secondaryButton={{
          text: "Explore Prompts",
          onClick: () => console.log("Explore Prompts"),
        }}
      />
    </div>
  );
};

export default ParticleHeroDemo;

