'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Users, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Categories', href: '/categories', icon: Tag },
  { name: 'Customers', href: '/customers', icon: Users },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-1" aria-label="Sidebar">
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium rounded-md',
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon
              className={cn(
                'mr-2 h-5 w-5',
                isActive ? 'text-gray-500' : 'text-gray-400'
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
