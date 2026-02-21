import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import VoiceInput from "@/components/VoiceInput";
import RiskCard from "@/components/RiskCard";
import EmergencyMode from "@/components/EmergencyMode";

interface TriageResult {
  risk_level: "GREEN" | "YELLOW" | "RED";
  confidence_score: number;
  rules_triggered: string[];
  recommendation: string;
  processed_symptoms: string[];
  override_allowed: boolean;
}

const examplePrompts = [
  "Mere chest me dard hai aur saans nahi aa rahi",
  "Tez bukhar hai 3 din se",
  "Mild cold aur cough ho raha hai",
  "Pet me bahut dard ho raha hai",
  "Sar me bahut dard hai aur chakkar aa rahe hain",
];

const TriagePage = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [listening, setListening] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [history, setHistory] = useState<Array<{ input: string; result: TriageResult; timestamp: Date }>>([]);

  const handleSubmit = async (text?: string) => {
    const symptoms = text || input;
    if (!symptoms.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("triage", {
        body: { symptoms },
      });

      if (error) throw error;

      const triageResult = data as TriageResult;
      setResult(triageResult);

      // Log to database
      await supabase.from("triage_sessions").insert({
        input_text: symptoms,
        processed_symptoms: triageResult.processed_symptoms,
        risk_level: triageResult.risk_level,
        confidence_score: triageResult.confidence_score,
        rules_triggered: triageResult.rules_triggered,
        recommendation: triageResult.recommendation,
      });

      // Log audit
      await supabase.from("audit_logs").insert({
        action_type: "TRIAGE",
        risk_level: triageResult.risk_level,
        decision_path: { symptoms: triageResult.processed_symptoms, rules: triageResult.rules_triggered },
        rule_triggered: triageResult.rules_triggered[0] || "NONE",
      });

      setHistory((prev) => [{ input: symptoms, result: triageResult, timestamp: new Date() }, ...prev]);

      // Activate emergency mode for RED
      if (triageResult.risk_level === "RED") {
        setEmergencyActive(true);
      }
    } catch (err) {
      console.error("Triage error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceResult = (text: string) => {
    setInput(text);
    setListening(false);
    handleSubmit(text);
  };

  return (
    <div className="min-h-screen pt-16 pb-8">
      <EmergencyMode
        active={emergencyActive}
        recommendation={result?.recommendation || ""}
        onDismiss={() => setEmergencyActive(false)}
      />

      <div className="container max-w-2xl py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Symptom <span className="text-primary">Triage</span>
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Describe your symptoms in English or Hinglish. Voice input supported.
          </p>

          {/* Input Area */}
          <div className="rounded-2xl border border-border bg-card p-4 mb-6">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., Mere chest me dard hai aur breathing problem ho rahi hai..."
              className="w-full min-h-[100px] bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-base"
              maxLength={2000}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className="flex items-center justify-between mt-3">
              <VoiceInput
                onResult={handleVoiceResult}
                isListening={listening}
                onToggle={() => setListening(!listening)}
              />
              <motion.button
                onClick={() => handleSubmit()}
                disabled={loading || !input.trim()}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {loading ? "Analyzing..." : "Triage"}
              </motion.button>
            </div>
          </div>

          {/* Quick prompts */}
          {!result && (
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2 font-display">QUICK EXAMPLES</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setInput(p);
                      handleSubmit(p);
                    }}
                    className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <RiskCard
              level={result.risk_level}
              confidence={result.confidence_score}
              recommendation={result.recommendation}
              symptoms={result.processed_symptoms}
              rules={result.rules_triggered}
            />
          )}

          {/* History */}
          {history.length > 1 && (
            <div className="mt-8">
              <h3 className="font-display text-sm font-bold text-muted-foreground mb-3">SESSION HISTORY</h3>
              <div className="space-y-2">
                {history.slice(1).map((h, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground truncate max-w-[200px]">{h.input}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {h.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-bold font-display ${
                        h.result.risk_level === "RED"
                          ? "bg-primary/10 text-primary"
                          : h.result.risk_level === "YELLOW"
                          ? "bg-caution/10 text-caution"
                          : "bg-safe/10 text-safe"
                      }`}
                    >
                      {h.result.risk_level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TriagePage;
