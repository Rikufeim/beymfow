import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const NexusLandingPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true, 
      antialias: true 
    });
    
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x00ff88,
      transparent: true,
      opacity: 0.8,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create connecting lines
    const linesMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ff88, 
      transparent: true, 
      opacity: 0.15 
    });
    
    const linesGeometry = new THREE.BufferGeometry();
    const linesPositions = new Float32Array(300 * 3);
    
    for (let i = 0; i < 300 * 3; i++) {
      linesPositions[i] = (Math.random() - 0.5) * 8;
    }
    
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linesPositions, 3));
    const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(linesMesh);

    camera.position.z = 3;

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;
      linesMesh.rotation.y -= 0.0005;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-full relative overflow-x-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #111111 100%)',
        fontFamily: "'Rajdhani', sans-serif"
      }}
    >
      {/* Three.js Canvas */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Gradient Overlays */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 255, 136, 0.15) 0%, transparent 50%)',
          zIndex: 2
        }}
      />
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 100% 100%, rgba(0, 136, 255, 0.1) 0%, transparent 50%)',
          zIndex: 2
        }}
      />

      {/* Content */}
      <div className="relative" style={{ zIndex: 10 }}>
        {/* Navigation */}
        <nav className="flex items-center justify-between px-8 py-6 lg:px-16">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #00ff88 0%, #00aa55 100%)',
                boxShadow: '0 0 30px rgba(0, 255, 136, 0.5)'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-black">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span 
              className="text-2xl font-bold tracking-wider"
              style={{ 
                fontFamily: "'Syncopate', sans-serif",
                color: '#00ff88'
              }}
            >
              NEXUS
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Protocol', 'Governance', 'Developers', 'Community'].map((item) => (
              <a 
                key={item}
                href="#" 
                className="text-white/70 hover:text-[#00ff88] transition-colors duration-300 text-sm tracking-wider uppercase"
              >
                {item}
              </a>
            ))}
          </div>

          <button 
            className="px-6 py-2.5 rounded-lg text-black font-semibold text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
              boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)'
            }}
          >
            Connect Wallet
          </button>
        </nav>

        {/* Hero Section */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center px-8 text-center">
          <div 
            className="inline-block px-4 py-1.5 rounded-full mb-8 border"
            style={{
              background: 'rgba(0, 255, 136, 0.1)',
              borderColor: 'rgba(0, 255, 136, 0.3)'
            }}
          >
            <span className="text-[#00ff88] text-sm tracking-wider uppercase">
              ✨ The Future of Decentralized Finance
            </span>
          </div>

          <h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight"
            style={{ 
              fontFamily: "'Syncopate', sans-serif",
              background: 'linear-gradient(135deg, #ffffff 0%, #00ff88 50%, #00aa55 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            BUILD THE
            <br />
            FUTURE
          </h1>

          <p className="text-white/60 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
            The next-generation protocol for decentralized applications. 
            Seamless, secure, and infinitely scalable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              className="px-8 py-4 rounded-lg text-black font-semibold text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                boxShadow: '0 0 30px rgba(0, 255, 136, 0.5)'
              }}
            >
              Launch App
            </button>
            <button 
              className="px-8 py-4 rounded-lg font-semibold text-sm tracking-wider uppercase transition-all duration-300 hover:bg-white/10 border"
              style={{
                color: '#00ff88',
                borderColor: 'rgba(0, 255, 136, 0.5)'
              }}
            >
              Read Docs
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 md:gap-16 mt-20">
            {[
              { value: '$4.2B+', label: 'Total Value Locked' },
              { value: '2.1M+', label: 'Active Users' },
              { value: '150+', label: 'Partner Protocols' }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div 
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{ 
                    fontFamily: "'Syncopate', sans-serif",
                    color: '#00ff88'
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-white/50 text-sm tracking-wider uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-8 lg:px-16">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ 
                fontFamily: "'Syncopate', sans-serif",
                color: '#ffffff'
              }}
            >
              WHY NEXUS?
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Built for the next billion users
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Sub-second finality with our revolutionary consensus mechanism'
              },
              {
                icon: '🔒',
                title: 'Secure by Design',
                description: 'Military-grade encryption with multi-layer security protocols'
              },
              {
                icon: '🌐',
                title: 'Infinitely Scalable',
                description: 'Handle millions of transactions per second without compromise'
              }
            ].map((feature) => (
              <div 
                key={feature.title}
                className="p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 0, 0, 0.5) 100%)',
                  borderColor: 'rgba(0, 255, 136, 0.2)',
                  boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)'
                }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 
                  className="text-xl font-bold mb-3"
                  style={{ color: '#00ff88' }}
                >
                  {feature.title}
                </h3>
                <p className="text-white/50 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-8 text-center">
          <div 
            className="max-w-4xl mx-auto p-12 rounded-3xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
              borderColor: 'rgba(0, 255, 136, 0.3)',
              boxShadow: '0 0 60px rgba(0, 255, 136, 0.15)'
            }}
          >
            <h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ 
                fontFamily: "'Syncopate', sans-serif",
                color: '#ffffff'
              }}
            >
              READY TO BUILD?
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of developers building the future of Web3
            </p>
            <button 
              className="px-10 py-4 rounded-lg text-black font-semibold text-sm tracking-wider uppercase transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                boxShadow: '0 0 30px rgba(0, 255, 136, 0.5)'
              }}
            >
              Start Building →
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #00ff88 0%, #00aa55 100%)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-black">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span 
                className="text-lg font-bold tracking-wider"
                style={{ 
                  fontFamily: "'Syncopate', sans-serif",
                  color: '#00ff88'
                }}
              >
                NEXUS
              </span>
            </div>
            <div className="flex gap-6">
              {['Twitter', 'Discord', 'GitHub', 'Telegram'].map((social) => (
                <a 
                  key={social}
                  href="#" 
                  className="text-white/50 hover:text-[#00ff88] transition-colors text-sm"
                >
                  {social}
                </a>
              ))}
            </div>
            <p className="text-white/30 text-sm">
              © 2024 Nexus Protocol. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default NexusLandingPage;
