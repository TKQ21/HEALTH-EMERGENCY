import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Cloud, Car, Clock, Loader2, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RiskResult {
  risk_percentage: number;
  risk_level: "LOW" | "MODERATE" | "HIGH";
  factors: string[];
  explanation: string;
}

const timeOptions = [
  { value: "morning", label: "Morning", icon: "🌅" },
  { value: "afternoon", label: "Afternoon", icon: "☀️" },
  { value: "evening", label: "Evening", icon: "🌆" },
  { value: "night", label: "Night", icon: "🌙" },
];

const weatherOptions = [
  { value: "clear", label: "Clear", icon: "☀️" },
  { value: "rain", label: "Rain", icon: "🌧️" },
  { value: "fog", label: "Fog", icon: "🌫️" },
  { value: "storm", label: "Storm", icon: "⛈️" },
];

const trafficOptions = [
  { value: "low", label: "Low", icon: "🟢" },
  { value: "moderate", label: "Moderate", icon: "🟡" },
  { value: "heavy", label: "Heavy", icon: "🔴" },
];

const AccidentRiskPage = () => {
  const [timeOfDay, setTimeOfDay] = useState("morning");
  const [weather, setWeather] = useState("clear");
  const [traffic, setTraffic] = useState("low");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskResult | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("accident-risk", {
        body: { time_of_day: timeOfDay, weather, traffic_density: traffic },
      });

      if (error) throw error;
      setResult(data as RiskResult);

      // Log to database
      await supabase.from("accident_risk_sessions").insert({
        time_of_day: timeOfDay,
        weather,
        traffic_density: traffic,
        risk_percentage: data.risk_percentage,
        risk_level: data.risk_level,
        factors: data.factors,
      });

      await supabase.from("audit_logs").insert({
        action_type: "ACCIDENT_RISK",
        risk_level: data.risk_level,
        decision_path: { time: timeOfDay, weather, traffic, factors: data.factors },
        rule_triggered: "ACCIDENT_RISK_FORMULA",
      });
    } catch (err) {
      console.error("Risk calculation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const riskColor = result
    ? result.risk_level === "HIGH"
      ? { text: "text-primary", bg: "bg-primary/10", border: "border-primary/50", glow: "glow-red" }
      : result.risk_level === "MODERATE"
      ? { text: "text-caution", bg: "bg-caution/10", border: "border-caution/50", glow: "glow-yellow" }
      : { text: "text-safe", bg: "bg-safe/10", border: "border-safe/50", glow: "glow-green" }
    : null;

  return (
    <div className="min-h-screen pt-16 pb-8">
      <div className="container max-w-2xl py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Accident <span className="text-caution">Risk</span> Prediction
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Calculate dynamic risk score based on environmental conditions.
          </p>

          {/* Input Controls */}
          <div className="space-y-4 mb-6">
            {/* Time of Day */}
            <div>
              <label className="flex items-center gap-2 text-xs font-display text-muted-foreground mb-2">
                <Clock className="h-3 w-3" /> TIME OF DAY
              </label>
              <div className="grid grid-cols-4 gap-2">
                {timeOptions.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTimeOfDay(t.value)}
                    className={`rounded-xl border p-3 text-center transition-colors ${
                      timeOfDay === t.value
                        ? "border-primary/50 bg-primary/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <div className="text-lg mb-1">{t.icon}</div>
                    <div className="text-xs font-medium">{t.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Weather */}
            <div>
              <label className="flex items-center gap-2 text-xs font-display text-muted-foreground mb-2">
                <Cloud className="h-3 w-3" /> WEATHER
              </label>
              <div className="grid grid-cols-4 gap-2">
                {weatherOptions.map((w) => (
                  <button
                    key={w.value}
                    onClick={() => setWeather(w.value)}
                    className={`rounded-xl border p-3 text-center transition-colors ${
                      weather === w.value
                        ? "border-caution/50 bg-caution/10 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-caution/30"
                    }`}
                  >
                    <div className="text-lg mb-1">{w.icon}</div>
                    <div className="text-xs font-medium">{w.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Traffic */}
            <div>
              <label className="flex items-center gap-2 text-xs font-display text-muted-foreground mb-2">
                <Car className="h-3 w-3" /> TRAFFIC DENSITY
              </label>
              <div className="grid grid-cols-3 gap-2">
                {trafficOptions.map((tr) => (
                  <button
                    key={tr.value}
                    onClick={() => setTraffic(tr.value)}
                    className={`rounded-xl border p-3 text-center transition-colors ${
                      traffic === tr.value
                        ? "border-foreground/30 bg-secondary text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-foreground/20"
                    }`}
                  >
                    <div className="text-lg mb-1">{tr.icon}</div>
                    <div className="text-xs font-medium">{tr.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <motion.button
            onClick={handleCalculate}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground disabled:opacity-50 mb-6"
          >
            {loading ? (
              <Loader2 className="inline h-5 w-5 animate-spin mr-2" />
            ) : (
              <MapPin className="inline h-5 w-5 mr-2" />
            )}
            {loading ? "Calculating..." : "Calculate Risk"}
          </motion.button>

          {/* Result */}
          {result && riskColor && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border-2 ${riskColor.border} ${riskColor.bg} p-6 ${riskColor.glow}`}
            >
              {/* Risk Score */}
              <div className="text-center mb-6">
                <div className={`font-display text-6xl font-bold ${riskColor.text} mb-2`}>
                  {result.risk_percentage}%
                </div>
                <div className={`font-display text-lg font-bold ${riskColor.text}`}>
                  {result.risk_level === "HIGH" && <AlertTriangle className="inline mr-2 h-5 w-5" />}
                  {result.risk_level === "LOW" && <CheckCircle className="inline mr-2 h-5 w-5" />}
                  {result.risk_level === "MODERATE" && <Info className="inline mr-2 h-5 w-5" />}
                  {result.risk_level} RISK
                </div>
              </div>

              {/* Risk Bar */}
              <div className="h-3 rounded-full bg-secondary mb-6 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.risk_percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    result.risk_level === "HIGH"
                      ? "bg-primary"
                      : result.risk_level === "MODERATE"
                      ? "bg-caution"
                      : "bg-safe"
                  }`}
                />
              </div>

              {/* Factors */}
              {result.factors.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-display">CONTRIBUTING FACTORS</p>
                  <div className="space-y-1.5">
                    {result.factors.map((f, i) => (
                      <div key={i} className="rounded-lg bg-secondary/50 px-3 py-2 text-sm text-foreground">
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AccidentRiskPage;
