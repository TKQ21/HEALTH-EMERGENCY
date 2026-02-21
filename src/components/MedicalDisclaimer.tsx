import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, CheckCircle } from "lucide-react";

const MedicalDisclaimer = () => {
  const [accepted, setAccepted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("meditriage_disclaimer_accepted");
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    sessionStorage.setItem("meditriage_disclaimer_accepted", "true");
    setAccepted(true);
    setTimeout(() => setVisible(false), 300);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-sm p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-w-lg w-full rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <ShieldAlert className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">Medical Disclaimer</h2>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground mb-6">
              <p>
                <strong className="text-foreground">This is NOT a medical diagnosis tool.</strong> MediTriage is an assistive 
                triage system designed to help you assess symptom urgency.
              </p>
              <p>
                • It does not replace professional medical advice, diagnosis, or treatment.
              </p>
              <p>
                • No prescription capability is provided.
              </p>
              <p>
                • In case of a real emergency, <strong className="text-primary">always call 112</strong> (India emergency number).
              </p>
              <p>
                • Your session data is stored for audit and compliance purposes. Personal data is handled per Indian data protection laws.
              </p>
              <p>
                • By using this tool, you consent to anonymous data collection for improving triage accuracy.
              </p>
            </div>

            <motion.button
              onClick={handleAccept}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <CheckCircle className="inline mr-2 h-4 w-4" />
              I Understand & Accept
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MedicalDisclaimer;
