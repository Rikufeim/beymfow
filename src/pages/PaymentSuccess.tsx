import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { refreshUsage } = useAuth();

  useEffect(() => {
    // Refresh subscription status after payment
    refreshUsage();
  }, [refreshUsage]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
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
          <Check size={48} className="text-white" />
        </motion.div>

        <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-xl text-gray-400 mb-8">
          Thank you for upgrading to Premium! You now have unlimited access to Flow Engine and all premium features.
        </p>

        <Button
          onClick={() => navigate('/')}
          className="w-full max-w-xs py-6 px-8 bg-black hover:bg-black text-white hover:border-primary border-2 border-primary/30 font-bold text-lg transition-all duration-300 rounded-lg"
        >
          Start Creating Prompts
        </Button>
      </motion.div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
