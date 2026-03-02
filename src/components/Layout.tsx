
import React from 'react';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = React.memo(({ children, hideFooter = false }) => {
  return (
    <>
      {children}
      {!hideFooter && <Footer />}
    </>
  );
});

Layout.displayName = 'Layout';

export default Layout;
