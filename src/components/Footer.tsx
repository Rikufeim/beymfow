import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative py-8 px-4 overflow-hidden bg-transparent">
      <div className="relative max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground">
          © 2024 BEYMFLOW. All rights reserved.
        </p>
        <div className="flex gap-8">
          <Link
            to="#"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            to="#"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
