
import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
  hideHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = React.memo(({ children, hideFooter = false, hideHeader = false }) => {
  return (
    <>
      {!hideHeader && <Header />}
      {children}
      {!hideFooter && <Footer />}
    </>
  );
});

Layout.displayName = 'Layout';

export default Layout;
