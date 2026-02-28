import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import SEOHead from '@/components/SEOHead';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { refreshUsage, usageInfo } = useAuth();
  const [synced, setSynced] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    // Poll for plan activation every 3 seconds, max 10 attempts (30s)
    refreshUsage();

    pollRef.current = setInterval(async () => {
      attemptsRef.current += 1;
      await refreshUsage();

      if (attemptsRef.current >= 10) {
        if (pollRef.current) clearInterval(pollRef.current);
        setSynced(true); // stop waiting even if not confirmed
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Watch for plan becoming pro
  useEffect(() => {
    if (usageInfo?.plan === 'pro') {
      setSynced(true);
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [usageInfo?.plan]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <SEOHead pathname="/payment-success" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          {synced ? (
            <Check size={48} className="text-white" />
          ) : (
            <Loader2 size={48} className="text-white animate-spin" />
          )}
        </motion.div>

        <h1 className="text-4xl font-bold mb-4 text-foreground">
          {synced ? 'Payment Successful!' : 'Activating Pro…'}
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          {synced
            ? 'You now have unlimited access to all premium features.'
            : 'Syncing your subscription, just a moment…'}
        </p>

        {synced && (
          <Button
            onClick={() => navigate('/flow')}
            className="w-full max-w-xs py-6 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg transition-all duration-300 rounded-lg"
          >
            Start Creating
          </Button>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
