'use client';

import React from 'react';
import Sidebar from '@/components/desktop/Sidebar';
import MobileDrawer from '@/components/mobile/MobileDrawer';
import dynamic from 'next/dynamic';

const MindMap = dynamic(() => import('@/components/canvas/MindMap'), { ssr: false });

export default function StudioPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-stone-50">
      {/* Desktop Sidebar - Hidden on Mobile */}
      <div className="hidden md:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 h-full relative">
        <MindMap />
        
        {/* Mobile Drawer - Visible on Mobile */}
        <div className="md:hidden">
          <MobileDrawer />
        </div>
      </div>
    </div>
  );
}
