import { Link } from "react-router-dom";
import { Instagram, Twitter } from "lucide-react";
import { motion } from "framer-motion";


const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  }
};

const Footer = () => {
  return (
    <footer className="relative py-16 px-4 overflow-hidden bg-transparent">
      {/* Purple Glow Background */}
      <div className="absolute inset-0 -z-10">
        {/* Main dark background - gradient fade from transparent to black at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
        {/* Bottom purple glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 100%, rgba(88, 28, 135, 0.8) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 0% 100%, rgba(124, 58, 237, 0.5) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 100% 100%, rgba(124, 58, 237, 0.5) 0%, transparent 50%),
              radial-gradient(ellipse 40% 30% at 0% 50%, rgba(88, 28, 135, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse 40% 30% at 100% 50%, rgba(88, 28, 135, 0.3) 0%, transparent 50%)
            `
          }} />

      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand Section */}
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-white/80 tracking-tight">BEYMFLOW</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your AI-powered prompt generation platform. Create perfect prompts for any AI model with our advanced
              tools and generators.
            </p>
            
















          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-bold mb-6 text-foreground">Quick Links</h4>
            <ul className="space-y-3">
              {[
              { to: "/premium", label: "Pricing" },
              { to: "/about", label: "About Us" },
              { to: "#community", label: "Community" },
              { to: "/prompt-lab-page", label: "Prompt Lab" },
              { to: "/flow-engine-page", label: "Flow Engine" }].
              map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-base font-bold mb-6 text-foreground">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-foreground after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full">

                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-base font-bold mb-6 text-foreground">Join the Community</h4>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Stay updated with the latest AI prompt generation techniques and tools.
            </p>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="pt-8 border-t border-border/50">

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">© 2024 BEYMFLOW. All rights reserved.</p>
            <div className="flex gap-8">
              <Link to="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>);

};

export default Footer;