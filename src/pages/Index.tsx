import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Activity, MapPin, ShieldAlert, Zap, Database, Lock } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "AI Symptom Triage",
    desc: "Voice & text input with Hinglish support. Rule-based severity classification.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: MapPin,
    title: "Accident Risk Map",
    desc: "Dynamic risk scoring based on weather, time, traffic. Interactive heatmap.",
    color: "text-caution",
    bg: "bg-caution/10",
    border: "border-caution/20",
  },
  {
    icon: ShieldAlert,
    title: "Emergency Protocol",
    desc: "RED mode with one-tap 112 call, location sharing, and hospital locator.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Database,
    title: "Audit Trail",
    desc: "Immutable medical-grade logging. Every decision tracked and stored.",
    color: "text-safe",
    bg: "bg-safe/10",
    border: "border-safe/20",
  },
  {
    icon: Lock,
    title: "Secure & Compliant",
    desc: "Data encryption, Indian legal compliance, consent management.",
    color: "text-muted-foreground",
    bg: "bg-secondary",
    border: "border-border",
  },
  {
    icon: Zap,
    title: "< 2s Response",
    desc: "Production-grade performance. Real backend API. No simulation.",
    color: "text-caution",
    bg: "bg-caution/10",
    border: "border-caution/20",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container relative py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-display text-primary mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              PRODUCTION-READY EMERGENCY AI
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              MEDI<span className="text-primary text-glow-red">TRIAGE</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Real-time AI symptom triage with Hinglish voice input. Accident risk prediction. 
              Emergency protocol activation. Built for India.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/triage">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground glow-red"
                >
                  <Activity className="inline mr-2 h-5 w-5" />
                  Start Triage
                </motion.button>
              </Link>
              <Link to="/accident-risk">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto rounded-xl border-2 border-border bg-secondary px-8 py-4 text-base font-semibold text-foreground hover:border-primary/30"
                >
                  <MapPin className="inline mr-2 h-5 w-5" />
                  Risk Map
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl border ${f.border} ${f.bg} p-6`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.bg} border ${f.border} mb-4`}>
                <f.icon className={`h-5 w-5 ${f.color}`} />
              </div>
              <h3 className="font-display text-base font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Disclaimer footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center">
          <p className="text-xs text-muted-foreground">
            ⚕️ MediTriage is an assistive tool. Not a substitute for medical diagnosis. In emergencies, call <strong className="text-primary">112</strong>.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
