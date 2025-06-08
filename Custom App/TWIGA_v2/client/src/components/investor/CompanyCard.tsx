import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Company } from '@/types/auth';
import { Building, MapPin, Unlock, Heart, ExternalLink } from 'lucide-react';

interface CompanyCardProps {
  company: Company & {
    overallScore?: number;
    disclosureScore?: number;
  };
  onUnlock: (companyId: number) => void;
  onSave: (companyId: number) => void;
  isUnlocking?: boolean;
}

export function CompanyCard({ company, onUnlock, onSave, isUnlocking = false }: CompanyCardProps) {
  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'High Match', className: 'bg-green-100 text-green-800' };
    if (score >= 80) return { label: 'Recommend', className: 'bg-blue-100 text-blue-800' };
    if (score >= 70) return { label: 'Reviewable', className: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Progress', className: 'bg-gray-100 text-gray-800' };
  };

  const scoreBadge = getScoreBadge(company.overallScore || 0);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {/* Company Logo Placeholder */}
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
              <Building className="w-8 h-8 text-white" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {company.companyName}
              </h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {company.description || 'No description available'}
              </p>

              {/* Location and basic info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                {company.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{company.location}</span>
                  </div>
                )}
                {company.foundingYear && (
                  <span>Founded {company.foundingYear}</span>
                )}
                {company.employeeCount && (
                  <span>{company.employeeCount} employees</span>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {company.sector && (
                  <Badge variant="secondary">{company.sector}</Badge>
                )}
                {company.stage && (
                  <Badge variant="outline">{company.stage}</Badge>
                )}
                {company.sdgFocus?.slice(0, 2).map((sdg) => (
                  <Badge key={sdg} className="bg-blue-100 text-blue-800">
                    {sdg}
                  </Badge>
                ))}
                {company.sdgFocus && company.sdgFocus.length > 2 && (
                  <Badge variant="outline">
                    +{company.sdgFocus.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Score and Actions */}
          <div className="text-right space-y-3">
            <div>
              <Badge className={scoreBadge.className}>
                {scoreBadge.label}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">
                TWIGA Rating: {Math.round(company.overallScore || 0)}%
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => onUnlock(company.id)}
                disabled={isUnlocking}
                className="w-full twiga-button-primary"
                size="sm"
              >
                <Unlock className="w-4 h-4 mr-2" />
                {isUnlocking ? 'Unlocking...' : 'Unlock Profile (2 credits)'}
              </Button>

              <Button
                variant="outline"
                onClick={() => onSave(company.id)}
                className="w-full"
                size="sm"
              >
                <Heart className="w-4 h-4 mr-2" />
                Save to Watchlist
              </Button>

              {company.website && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Quick stats or preview info */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-sm font-medium text-foreground">
              {Math.round(company.disclosureScore || 0)}%
            </div>
            <div className="text-xs text-muted-foreground">Disclosure</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-foreground">
              {company.isPublished ? 'Active' : 'Draft'}
            </div>
            <div className="text-xs text-muted-foreground">Status</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-foreground">
              {new Date(company.updatedAt).toLocaleDateString()}
            </div>
            <div className="text-xs text-muted-foreground">Last Updated</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
