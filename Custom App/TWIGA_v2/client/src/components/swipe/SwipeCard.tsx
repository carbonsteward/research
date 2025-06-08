import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Heart, X, Star, MapPin, Users, Calendar } from 'lucide-react';
import { Company } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface SwipeCardProps {
  company: Company;
  onSwipe: (direction: 'left' | 'right', companyId: number) => void;
  isTop: boolean;
  zIndex: number;
}

export function SwipeCard({ company, onSwipe, isTop, zIndex }: SwipeCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (!isTop || isAnimating) return;

    const threshold = 150;
    const velocity = info.velocity.x;
    const movement = info.offset.x;

    if (Math.abs(movement) > threshold || Math.abs(velocity) > 500) {
      setIsAnimating(true);
      const direction = movement > 0 ? 'right' : 'left';

      // Animate off screen
      x.set(direction === 'right' ? 1000 : -1000);

      setTimeout(() => {
        onSwipe(direction, company.id);
        setIsAnimating(false);
      }, 300);
    } else {
      // Snap back to center
      x.set(0);
      y.set(0);
    }
  };

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    if (!isTop || isAnimating) return;

    setIsAnimating(true);
    x.set(direction === 'right' ? 1000 : -1000);

    setTimeout(() => {
      onSwipe(direction, company.id);
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    if (!isTop) {
      x.set(0);
      y.set(0);
    }
  }, [isTop, x, y]);

  const sdgNames = {
    '1': 'No Poverty',
    '2': 'Zero Hunger',
    '3': 'Good Health',
    '4': 'Quality Education',
    '5': 'Gender Equality',
    '6': 'Clean Water',
    '7': 'Clean Energy',
    '8': 'Decent Work',
    '9': 'Innovation',
    '10': 'Reduced Inequalities',
    '11': 'Sustainable Cities',
    '12': 'Responsible Consumption',
    '13': 'Climate Action',
    '14': 'Life Below Water',
    '15': 'Life on Land',
    '16': 'Peace and Justice',
    '17': 'Partnerships'
  };

  return (
    <motion.div
      ref={cardRef}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{
        x,
        y,
        rotate,
        opacity,
        zIndex,
      }}
      drag={isTop ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      initial={{ scale: isTop ? 1 : 0.95 }}
      animate={{
        scale: isTop ? 1 : 0.95,
        y: isTop ? 0 : 10
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="h-full w-full overflow-hidden bg-white dark:bg-gray-900 shadow-xl">
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-2xl font-bold">{company.companyName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{company.location}</span>
            </div>
          </div>

          {/* Swipe indicators */}
          <motion.div
            className="absolute top-8 left-8 bg-red-500 text-white px-6 py-2 rounded-full font-bold text-lg rotate-12"
            style={{ opacity: useTransform(x, [-150, -50, 0], [1, 0.5, 0]) }}
          >
            PASS
          </motion.div>
          <motion.div
            className="absolute top-8 right-8 bg-green-500 text-white px-6 py-2 rounded-full font-bold text-lg -rotate-12"
            style={{ opacity: useTransform(x, [0, 50, 150], [0, 0.5, 1]) }}
          >
            MATCH
          </motion.div>
        </div>

        <CardContent className="p-6 space-y-4">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
              {company.description}
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>{company.stage}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{company.employeeCount} employees</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Founded {company.foundingYear}</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Sector</h4>
            <Badge variant="secondary">{company.sector}</Badge>
          </div>

          {company.sdgFocus && company.sdgFocus.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">SDG Focus</h4>
              <div className="flex flex-wrap gap-1">
                {company.sdgFocus.slice(0, 3).map((sdg) => (
                  <Badge key={sdg} variant="outline" className="text-xs">
                    SDG {sdg}: {sdgNames[sdg as keyof typeof sdgNames]}
                  </Badge>
                ))}
                {company.sdgFocus.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{company.sdgFocus.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {isTop && (
            <div className="flex justify-center gap-6 pt-4">
              <motion.button
                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-colors"
                onClick={() => handleButtonSwipe('left')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6" />
              </motion.button>

              <motion.button
                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-colors"
                onClick={() => handleButtonSwipe('right')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart className="h-6 w-6" />
              </motion.button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
