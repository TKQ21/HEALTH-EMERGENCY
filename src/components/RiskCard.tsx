import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, ShieldAlert, Calendar, MapPin } from "lucide-react";

interface RiskCardProps {
  level: "GREEN" | "YELLOW" | "RED";
  confidence: number;
  recommendation: string;
  symptoms: string[];
  rules: string[];
}

const config = {
  GREEN: {
    icon: CheckCircle,
    label: "LOW RISK",
    border: "border-safe/50",
    bg: "bg-safe/5",
    glow: "glow-green",
    textGlow: "text-glow-green",
    color: "text-safe",
    action: "Book OPD Visit",
  },
  YELLOW: {
    icon: AlertTriangle,
    label: "URGENT",
    border: "border-caution/50",
    bg: "bg-caution/5",
    glow: "glow-yellow",
    textGlow: "text-glow-yellow",
    color: "text-caution",
    action: "Visit Hospital Within 6 Hours",
  },
  RED: {
    icon: ShieldAlert,
    label: "EMERGENCY",
    border: "border-primary/50",
    bg: "bg-primary/5",
    glow: "glow-red",
    textGlow: "text-glow-red",
    color: "text-primary",
    action: "Call 112 Immediately",
  },
};

const RiskCard = ({ level, confidence, recommendation, symptoms, rules }: RiskCardProps) => {
  const c = config[level];
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 ${c.border} ${c.bg} p-6 ${c.glow}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg} border ${c.border}`}>
          <Icon className={`h-6 w-6 ${c.color}`} />
        </div>
        <div>
          <h3 className={`font-display text-lg font-bold ${c.color} ${c.textGlow}`}>{c.label}</h3>
          <p className="text-sm text-muted-foreground">Confidence: {confidence}%</p>
        </div>
      </div>

      <p className="text-foreground mb-4">{recommendation}</p>

      {symptoms.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1 font-display">DETECTED SYMPTOMS</p>
          <div className="flex flex-wrap gap-1.5">
            {symptoms.map((s) => (
              <span key={s} className={`rounded-md px-2 py-0.5 text-xs font-medium ${c.bg} ${c.color} border ${c.border}`}>
                {s.replace("_", " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {rules.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1 font-display">RULES TRIGGERED</p>
          <div className="flex flex-wrap gap-1.5">
            {rules.map((r) => (
              <span key={r} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground font-mono">
                {r}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RiskCard;
