'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  showNavigation?: boolean;
  navItems?: Array<{ label: string; href: string; icon?: React.ReactNode }>;
}

export function Layout({
  children,
  title,
  showHeader = true,
  showNavigation = true,
  navItems = [],
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      {showHeader && (
        <header className="bg-white border-b border-neutral-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                <span className="text-primary">🍕 Garagem</span>
                <span className="text-secondary ml-1">.Com</span>
              </div>
            </Link>

            {title && <h1 className="hidden md:block text-xl font-semibold text-neutral-900">{title}</h1>}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-neutral-100 rounded-lg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && showNavigation && navItems.length > 0 && (
            <nav className="border-t border-neutral-200 md:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </div>
                </Link>
              ))}
            </nav>
          )}
        </header>
      )}

      <div className="flex">
        {showNavigation && navItems.length > 0 && (
          <aside className="hidden md:block w-64 bg-white border-r border-neutral-200 min-h-screen">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 rounded-lg transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        )}

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
