import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone, MapPin, X, ShieldAlert } from "lucide-react";
import { useState } from "react";

interface EmergencyModeProps {
  active: boolean;
  recommendation: string;
  onDismiss: () => void;
}

const EmergencyMode = ({ active, recommendation, onDismiss }: EmergencyModeProps) => {
  const [confirmDismiss, setConfirmDismiss] = useState(false);

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        window.open(url, "_blank");
      });
    }
  };

  const handleCallEmergency = () => {
    window.location.href = "tel:112";
  };

  const handleDismissAttempt = () => {
    setConfirmDismiss(true);
  };

  const handleConfirmDismiss = () => {
    setConfirmDismiss(false);
    onDismiss();
  };

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background p-6"
        >
          {/* Flashing border */}
          <div className="absolute inset-0 border-4 border-primary animate-emergency-border pointer-events-none" />
          
          {/* Pulsating background overlay */}
          <motion.div
            className="absolute inset-0 bg-primary/5"
            animate={{ opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 1, repeat: Infinity }}
          />

          <div className="relative z-10 flex flex-col items-center gap-6 max-w-md text-center">
            {/* Emergency icon */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 glow-red"
            >
              <ShieldAlert className="h-12 w-12 text-primary" />
            </motion.div>

            <h1 className="font-display text-3xl font-bold text-primary text-glow-red animate-emergency-pulse">
              🚨 EMERGENCY
            </h1>

            <p className="text-lg text-foreground">{recommendation}</p>

            {/* Emergency Call Button */}
            <motion.button
              onClick={handleCallEmergency}
              className="w-full rounded-2xl bg-primary py-5 text-xl font-bold text-primary-foreground glow-red"
              whileTap={{ scale: 0.95 }}
              aria-label="Call emergency number 112"
            >
              <Phone className="inline mr-3 h-6 w-6" />
              CALL 112 NOW
            </motion.button>

            {/* Share Location */}
            <motion.button
              onClick={handleShareLocation}
              className="w-full rounded-2xl border-2 border-primary/50 bg-primary/10 py-4 text-lg font-semibold text-primary"
              whileTap={{ scale: 0.95 }}
            >
              <MapPin className="inline mr-2 h-5 w-5" />
              Share Live Location
            </motion.button>

            {/* Dismiss with confirmation */}
            {!confirmDismiss ? (
              <button
                onClick={handleDismissAttempt}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                I understand the risk — Dismiss
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-primary/30 bg-card p-4 w-full"
              >
                <p className="text-sm text-foreground mb-3">
                  <AlertTriangle className="inline mr-1 h-4 w-4 text-primary" />
                  Are you sure? This is a critical emergency alert.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDismiss(false)}
                    className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground"
                  >
                    Keep Alert
                  </button>
                  <button
                    onClick={handleConfirmDismiss}
                    className="flex-1 rounded-lg border border-border py-2 text-sm text-muted-foreground"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmergencyMode;
