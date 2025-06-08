import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeCard } from './SwipeCard';
import { Company } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeStackProps {
  companies: Company[];
  onMatch: (companyId: number) => void;
  onPass: (companyId: number) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function SwipeStack({ companies, onMatch, onPass, onRefresh, isLoading }: SwipeStackProps) {
  const [currentCards, setCurrentCards] = useState<Company[]>([]);
  const [matches, setMatches] = useState<number[]>([]);
  const [passes, setPasses] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Show up to 3 cards at a time
    const visibleCards = companies
      .filter(company => !matches.includes(company.id) && !passes.includes(company.id))
      .slice(0, 3);
    setCurrentCards(visibleCards);
  }, [companies, matches, passes]);

  const handleSwipe = async (direction: 'left' | 'right', companyId: number) => {
    try {
      if (direction === 'right') {
        // Match
        setMatches(prev => [...prev, companyId]);
        onMatch(companyId);

        // Create match in database
        await apiRequest('POST', '/api/matches', {
          companyId,
          status: 'pending'
        });

        toast({
          title: "It's a Match!",
          description: "You've shown interest in this company. They'll be notified!",
        });
      } else {
        // Pass
        setPasses(prev => [...prev, companyId]);
        onPass(companyId);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUndo = () => {
    if (matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      setMatches(prev => prev.slice(0, -1));
    } else if (passes.length > 0) {
      const lastPass = passes[passes.length - 1];
      setPasses(prev => prev.slice(0, -1));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (currentCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">No more companies to review</h3>
          <p className="text-gray-500 mb-4">
            You've reviewed all available companies. Check back later for new opportunities!
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={onRefresh} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Companies
          </Button>

          {(matches.length > 0 || passes.length > 0) && (
            <Button onClick={handleUndo} variant="ghost">
              Undo Last Action
            </Button>
          )}
        </div>

        {matches.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-green-700 dark:text-green-400">
              {matches.length} {matches.length === 1 ? 'match' : 'matches'} created today!
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full max-w-sm mx-auto">
      <AnimatePresence>
        {currentCards.map((company, index) => (
          <SwipeCard
            key={company.id}
            company={company}
            onSwipe={handleSwipe}
            isTop={index === 0}
            zIndex={currentCards.length - index}
          />
        ))}
      </AnimatePresence>

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
          {companies.length - matches.length - passes.length} remaining
        </div>

        <div className="flex gap-2">
          {matches.length > 0 && (
            <div className="bg-green-500/90 text-white rounded-full px-3 py-1 text-sm">
              {matches.length} matches
            </div>
          )}
          {passes.length > 0 && (
            <div className="bg-gray-500/90 text-white rounded-full px-3 py-1 text-sm">
              {passes.length} passed
            </div>
          )}
        </div>
      </div>

      {/* Undo button */}
      {(matches.length > 0 || passes.length > 0) && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <Button
            onClick={handleUndo}
            variant="ghost"
            size="sm"
            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm"
          >
            Undo
          </Button>
        </div>
      )}
    </div>
  );
}
