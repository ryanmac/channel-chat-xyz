// components/layouts/MainLayout.tsx
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const MainLayout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <div className="min-h-screen">
    <Header />
    {children}
    <Footer />
  </div>
);