import Layout from "@/components/Layout";

const AIGenerator = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-black pt-24 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black chrome-text mb-8">
            Style Designer
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Define your visual identity and create unique design systems
          </p>

          {/* Info Bubbles */}
          <div className="space-y-4 max-w-2xl mb-8">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 relative">
              <div className="absolute -top-2 left-8 w-4 h-4 bg-black/60 backdrop-blur-md border-l border-t border-white/10 rotate-45"></div>
              <h4 className="text-white font-semibold text-sm mb-2">🎨 Why Use Our Style Designer?</h4>
              <p className="text-white/70 text-xs leading-relaxed">Define your visual identity. Build unique styles, color palettes, and moods that guide your creative direction — from brand aesthetics to visual storytelling.</p>
            </div>
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4 relative">
              <div className="absolute -top-2 left-8 w-4 h-4 bg-black/60 backdrop-blur-md border-l border-t border-white/10 rotate-45"></div>
              <h4 className="text-white font-semibold text-sm mb-2">⚡ How Does It Work?</h4>
              <p className="text-white/70 text-xs leading-relaxed">Choose your vibe or upload a reference, and our tool generates a full visual direction including palette, lighting tone, and design language. The result: a signature aesthetic ready to apply anywhere.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIGenerator;
