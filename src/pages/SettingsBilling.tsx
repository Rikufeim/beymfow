import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';

const SettingsBilling = () => {
  const { usageInfo, session, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const plan = usageInfo?.plan || 'free';
  const isPro = plan === 'pro';
  const status = usageInfo?.subscriptionStatus;
  const periodEnd = usageInfo?.currentPeriodEnd;
  const cancelAtEnd = usageInfo?.cancelAtPeriodEnd;

  const handleCheckout = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      if (data?.url) window.open(data.url, '_blank');
    } catch (e: any) {
      toast.error(e.message || 'Failed to open subscription management');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const statusLabel = (s: string | null) => {
    if (!s) return 'No subscription';
    const map: Record<string, { label: string; color: string }> = {
      active: { label: 'Active', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
      trialing: { label: 'Trial', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      past_due: { label: 'Past Due', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
      canceled: { label: 'Canceled', color: 'bg-muted text-muted-foreground border-border' },
      unpaid: { label: 'Unpaid', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    };
    const info = map[s] || { label: s, color: 'bg-muted text-muted-foreground border-border' };
    return <Badge className={`${info.color} text-xs`}>{info.label}</Badge>;
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Please sign in to view billing settings.</p>
        </div>
      </Layout>
    );
  }

    return (
      <>
        <SEOHead pathname="/settings/billing" />
        <div className="min-h-screen bg-neutral-950 text-white">
          {/* Header */}
          <header className="sticky top-0 z-50 flex items-center gap-4 px-6 md:px-10 h-16 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl">
            <Link to="/settings" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm">
              <ArrowLeft size={16} />
              Back to Settings
            </Link>
            <h1 className="text-sm font-semibold tracking-wide">Billing</h1>
          </header>

          <main className="max-w-lg mx-auto px-6 md:px-10 py-12 space-y-8">
          {/* Plan Card */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-primary" />
                <span className="font-semibold text-lg">Current Plan</span>
              </div>
              <Badge className={isPro
                ? 'bg-primary/20 text-primary border-primary/30'
                : 'bg-muted text-muted-foreground border-border'
              }>
                {isPro ? 'PRO' : 'FREE'}
              </Badge>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span>{statusLabel(status ?? null)}</span>
              </div>
              {isPro && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {cancelAtEnd ? 'Access until' : 'Renewal date'}
                    </span>
                    <span className="text-foreground">{formatDate(periodEnd ?? null)}</span>
                  </div>
                  {cancelAtEnd && (
                    <p className="text-xs text-muted-foreground">
                      Your subscription is canceled and will not renew. You keep Pro access until the date above.
                    </p>
                  )}
                </>
              )}
              {!isPro && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily credits</span>
                  <span className="text-foreground">
                    {usageInfo?.creditsRemaining ?? 3} / 3 remaining
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2">
              {isPro ? (
                <Button
                  onClick={handlePortal}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-border hover:bg-accent"
                >
                  Manage Subscription <ExternalLink size={14} className="ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-black text-white hover:bg-neutral-800 border border-white/10"
                >
                  Upgrade to Pro — €9.99/mo
                </Button>
              )}
            </div>
          </div>

          {/* Pro Features */}
          {!isPro && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-3">Pro includes</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✦ Unlimited prompts</li>
                <li>✦ All prompt tools</li>
                <li>✦ All color tools</li>
                <li>✦ Premium templates</li>
                <li>✦ Advanced model options</li>
                <li>✦ Faster processing</li>
                <li>✦ Priority support</li>
              </ul>
            </div>
          )}
          </main>
        </div>
      </>
    );
};

export default SettingsBilling;
