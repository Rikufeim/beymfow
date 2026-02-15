import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const PlanBadge = () => {
  const { usageInfo, user } = useAuth();

  if (!user || !usageInfo) return null;

  const { plan, subscriptionStatus, cancelAtPeriodEnd, currentPeriodEnd } = usageInfo;

  if (subscriptionStatus === 'past_due') {
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] px-1.5 py-0">
        Payment issue
      </Badge>
    );
  }

  if (plan === 'pro') {
    if (cancelAtPeriodEnd && currentPeriodEnd) {
      const endDate = new Date(currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return (
        <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0">
          Pro – ends {endDate}
        </Badge>
      );
    }
    return (
      <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0">
        PRO
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-muted-foreground border-border text-[10px] px-1.5 py-0">
      FREE
    </Badge>
  );
};

export default PlanBadge;
