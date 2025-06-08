import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Building, Search, Settings } from 'lucide-react';

interface ViewSwitcherProps {
  currentView: 'admin' | 'company' | 'investor';
  onViewChange: (view: 'admin' | 'company' | 'investor') => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="bg-gray-100 p-1 rounded-lg flex">
      <Button
        variant={currentView === 'admin' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('admin')}
        className="flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Admin Panel
      </Button>
      <Button
        variant={currentView === 'company' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('company')}
        className="flex items-center gap-2"
      >
        <Building className="w-4 h-4" />
        Company View
      </Button>
      <Button
        variant={currentView === 'investor' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('investor')}
        className="flex items-center gap-2"
      >
        <Search className="w-4 h-4" />
        Investor View
      </Button>
    </div>
  );
}
