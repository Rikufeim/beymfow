import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import SEOHead from '@/components/SEOHead';
import { buildBreadcrumbSchema, SITE_URL } from '@/lib/seo';

const Features = () => {
  const [searchParams] = useSearchParams();
  const activeParam = searchParams.get('active');
  const [selectedCard, setSelectedCard] = useState<number | null>(
    activeParam ? parseInt(activeParam) : null
  );

  useEffect(() => {
    if (activeParam) {
      setSelectedCard(parseInt(activeParam));
    }
  }, [activeParam]);

  const features = [
    {
      question: "PROMPT LAB",
      answer: (
        <div className="space-y-4">
          <p className="text-lg font-semibold">Where ideas begin.</p>
          <p>Enter the Lab to generate, refine and test ideas through structured prompts. Every great system starts with one clear instruction — the Lab helps you find it.</p>
          
          <ul className="space-y-2 mt-4">
            <li>• Create unique prompts from scratch or adapt frameworks.</li>
            <li>• Adjust logic, tone, and creativity for your purpose.</li>
            <li>• Save and prepare prompts for optimization in Beymflow+.</li>
          </ul>
          
          <p className="mt-4 font-medium">The Lab is where raw intelligence takes form.</p>
        </div>
      ),
      color: "green"
    },
    {
      question: "OPTIMIZE (BEYMFLOW PREMIUM)",
      answer: (
        <div className="space-y-4">
          <p className="text-lg font-semibold">Turn prompts into power.</p>
          <p>Beymflow Premium is the intelligence layer of the system — a space where prompts evolve beyond words. It combines AI optimization, adaptive learning, and real-time refinement to build systems that think with you.</p>
          
          <ul className="space-y-2 mt-4">
            <li>• Access advanced optimization and structural feedback.</li>
            <li>• Use adaptive frameworks that learn your tone, goals, and logic.</li>
            <li>• Automate iterative improvements with Beymflow's feedback loop.</li>
            <li>• Unlock deeper layers of precision, context, and creative output.</li>
          </ul>
          
          <p className="mt-4 font-medium">Beymflow Premium doesn't just enhance prompts — it engineers intelligence.</p>
          <p>This is where your work stops being static and becomes alive.</p>
        </div>
      ),
      color: "purple"
    },
    {
      question: "INTEGRATION",
      answer: (
        <div className="space-y-4">
          <p className="text-lg font-semibold">From idea to execution.</p>
          <p>Integration connects Beymflow's intelligence to real-world environments. Deploy prompts into design systems, business workflows, or creative pipelines — without friction.</p>
          
          <ul className="space-y-2 mt-4">
            <li>• Export or connect outputs directly to your tools and platforms.</li>
            <li>• Deploy strategies, visuals, and frameworks automatically.</li>
            <li>• Maintain dynamic links for continuous updates and learning.</li>
          </ul>
          
          <p className="mt-4 font-medium">Integration turns creation into execution.</p>
        </div>
      ),
      color: "cyan"
    }
  ];

  const getActiveColor = () => {
    if (selectedCard === null) return 'white';
    return features[selectedCard]?.color || 'white';
  };

  const getColorClasses = (color: string, isActive: boolean) => {
    if (!isActive) return 'bg-black border-white/40';
    
    const colorMap: Record<string, string> = {
      green: 'bg-green-500 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.8)]',
      purple: 'bg-purple-500 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.8)]',
      cyan: 'bg-cyan-500 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.8)]'
    };
    return colorMap[color] || 'bg-white border-white/40';
  };

  const getLineColor = (index1: number, index2: number) => {
    const activeColor = getActiveColor();
    if (selectedCard === index1 || selectedCard === index2) {
      const colorMap: Record<string, string> = {
        green: 'stroke-green-500',
        purple: 'stroke-purple-500',
        cyan: 'stroke-cyan-500'
      };
      return colorMap[activeColor] || 'stroke-white/20';
    }
    return 'stroke-white/20';
  };

  const getLineShadow = (index1: number, index2: number) => {
    const activeColor = getActiveColor();
    if (selectedCard === index1 || selectedCard === index2) {
      const shadowMap: Record<string, string> = {
        green: 'drop-shadow(0 0 8px rgba(34,197,94,0.8))',
        purple: 'drop-shadow(0 0 8px rgba(168,85,247,0.8))',
        cyan: 'drop-shadow(0 0 8px rgba(6,182,212,0.8))'
      };
      return shadowMap[activeColor] || 'none';
    }
    return 'none';
  };

  return (
    <Layout>
      <SEOHead pathname="/features" schemas={[buildBreadcrumbSchema([{ name: "Beymflow", url: `${SITE_URL}/` }, { name: "Features", url: `${SITE_URL}/features` }])]} />
      <div className="min-h-screen bg-black text-white pt-[100px] pb-20">
        
        {/* Desktop Layout - Scattered Cards with Timeline */}
        <div className="hidden lg:block relative w-full min-h-[1000px] pb-20 max-w-6xl mx-auto px-8">
          {/* SVG Timeline Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {/* Line from card 0 to card 1 */}
            <line x1="20%" y1="8%" x2="80%" y2="8%" 
              className={`transition-all duration-500 ${getLineColor(0, 1)}`}
              strokeWidth="2"
              style={{ filter: getLineShadow(0, 1) }}
            />
            {/* Line from card 0 to card 2 */}
            <line x1="18%" y1="10%" x2="50%" y2="45%" 
              className={`transition-all duration-500 ${getLineColor(0, 2)}`}
              strokeWidth="2"
              style={{ filter: getLineShadow(0, 2) }}
            />
            {/* Line from card 1 to card 2 */}
            <line x1="82%" y1="10%" x2="50%" y2="45%" 
              className={`transition-all duration-500 ${getLineColor(1, 2)}`}
              strokeWidth="2"
              style={{ filter: getLineShadow(1, 2) }}
            />
          </svg>

          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`absolute w-[360px] transition-all duration-500`}
              style={{ 
                zIndex: selectedCard === index ? 50 : 10,
                top: index === 0 ? '5%' : index === 1 ? '5%' : '45%',
                left: index === 0 ? '8%' : index === 1 ? 'auto' : '50%',
                right: index === 1 ? '8%' : 'auto',
                transform: index === 2 ? 'translateX(-50%)' : 'none'
              }}
            >
              {/* Timeline Dot - positioned at top left of card */}
              <div className="absolute -left-4 top-6 z-20">
                <div className={`w-5 h-5 rounded-full border-2 transition-all duration-500 ${
                  getColorClasses(feature.color, selectedCard === index)
                }`}>
                  {selectedCard === index && (
                    <div className="absolute inset-0 rounded-full animate-ping opacity-75"
                      style={{ 
                        backgroundColor: feature.color === 'green' ? 'rgb(34,197,94)' : 
                                        feature.color === 'purple' ? 'rgb(168,85,247)' : 
                                        'rgb(6,182,212)' 
                      }}
                    ></div>
                  )}
                </div>
              </div>

              <Card
                onClick={() => setSelectedCard(selectedCard === index ? null : index)}
                className={`cursor-pointer transition-all duration-500 p-6 ${
                  selectedCard === index
                    ? 'bg-white/10 border-white/30'
                    : 'bg-black/80 border-white/20 hover:bg-black/60'
                } backdrop-blur-sm shadow-xl`}
              >
                <h2 className="text-xl font-bold text-white uppercase tracking-wide">
                  {feature.question}
                </h2>
              </Card>

              {/* Black Speech Bubble Answer */}
              {selectedCard === index && (
                <div className={`mt-6 animate-fade-in ${index === 2 ? 'mb-20' : ''}`}>
                  <div className="relative bg-black/95 border-2 border-white/30 rounded-2xl p-6 shadow-2xl max-w-xl backdrop-blur-sm">
                    {/* Speech bubble pointer */}
                    <div className="absolute -top-3 left-8 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[16px] border-b-white/30"></div>
                    <div className="absolute -top-2 left-8 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[16px] border-b-black/95"></div>
                    
                    <div className="text-white leading-relaxed">
                      {feature.answer}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile/Tablet Layout - Vertical Stack with Timeline */}
        <div className="lg:hidden px-6 relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-white/20"></div>
          
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="w-full relative pl-8">
                {/* Timeline Dot */}
                <div className="absolute left-8 top-6 -translate-x-1/2 z-10">
                  <div className={`w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                    getColorClasses(feature.color, selectedCard === index)
                  }`}>
                    {selectedCard === index && (
                      <div className="absolute inset-0 rounded-full animate-ping opacity-75"
                        style={{ 
                          backgroundColor: feature.color === 'green' ? 'rgb(34,197,94)' : 
                                          feature.color === 'purple' ? 'rgb(168,85,247)' : 
                                          'rgb(6,182,212)' 
                        }}
                      ></div>
                    )}
                  </div>
                </div>

                {/* Connecting Line Glow for Active */}
                {selectedCard === index && index > 0 && (
                  <div 
                    className="absolute left-10 -top-8 w-0.5 h-8 bg-gradient-to-b to-transparent"
                    style={{
                      backgroundColor: feature.color === 'green' ? 'rgb(34,197,94)' : 
                                      feature.color === 'purple' ? 'rgb(168,85,247)' : 
                                      'rgb(6,182,212)',
                      boxShadow: `0 0 10px ${
                        feature.color === 'green' ? 'rgba(34,197,94,0.6)' : 
                        feature.color === 'purple' ? 'rgba(168,85,247,0.6)' : 
                        'rgba(6,182,212,0.6)'
                      }`
                    }}
                  ></div>
                )}
                
                <Card
                  onClick={() => setSelectedCard(selectedCard === index ? null : index)}
                  className={`cursor-pointer transition-all duration-500 p-6 ${
                    selectedCard === index
                      ? 'bg-white/10 border-white/30'
                      : 'bg-black/80 border-white/20 active:bg-black/60'
                  } backdrop-blur-sm shadow-xl`}
                >
                  <h2 className="text-xl font-bold text-white uppercase tracking-wide">
                    {feature.question}
                  </h2>
                </Card>

                {/* Black Speech Bubble Answer - Mobile */}
                {selectedCard === index && (
                  <div className="mt-4 animate-fade-in">
                    <div className="relative bg-black/95 border-2 border-white/30 rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
                      {/* Speech bubble pointer pointing up */}
                      <div className="absolute -top-3 left-6 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[14px] border-b-white/30"></div>
                      <div className="absolute -top-2 left-6 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[14px] border-b-black/95"></div>
                      
                      <div className="text-white leading-relaxed text-sm">
                        {feature.answer}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Features;
