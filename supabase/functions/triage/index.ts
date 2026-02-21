import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TriageRequest {
  symptoms: string;
}

interface TriageResponse {
  risk_level: "GREEN" | "YELLOW" | "RED";
  confidence_score: number;
  rules_triggered: string[];
  recommendation: string;
  processed_symptoms: string[];
  override_allowed: boolean;
}

// Hinglish symptom dictionary
const symptomMap: Record<string, string[]> = {
  chest_pain: ["chest pain", "chest me dard", "seene me dard", "chhati me dard", "sine me dard", "chest tightness", "seene me jalan"],
  breathlessness: ["breathless", "saans", "breathing problem", "saans nahi aa rahi", "saans lene me", "dyspnea", "dam ghut", "saans phool"],
  unconscious: ["unconscious", "behosh", "hosh nahi", "faint", "chakkar", "pass out", "gir gaya", "respond nahi"],
  bleeding: ["bleeding", "khoon", "blood", "khoon nikal", "bahut khoon", "hemorrhage", "blood loss"],
  stroke: ["stroke", "lakwa", "paralysis", "face droop", "muh teda", "ek taraf", "speech problem", "bolne me dikkat"],
  fever: ["fever", "bukhar", "temperature", "badan garam", "high fever", "tez bukhar"],
  vomiting: ["vomiting", "ulti", "nausea", "ji machal", "pet kharab"],
  abdominal: ["stomach", "pet me dard", "abdominal", "pet dard", "pait dard"],
  headache: ["headache", "sir dard", "sar dard", "sir me dard", "migraine"],
  cold: ["cold", "sardi", "jukaam", "sneeze", "chheenk", "naak", "runny nose"],
  fracture: ["fracture", "haddi toot", "bone break", "haddi", "toot gayi"],
  burn: ["burn", "jal gaya", "jalana", "jala", "aag"],
  allergy: ["allergy", "rash", "khujli", "itching", "swelling", "sujan", "allergic"],
  seizure: ["seizure", "mirgi", "epilepsy", "convulsion", "fit", "jhatke"],
};

function extractSymptoms(input: string): string[] {
  const lower = input.toLowerCase();
  const found: string[] = [];
  
  for (const [symptom, keywords] of Object.entries(symptomMap)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        found.push(symptom);
        break;
      }
    }
  }
  
  return [...new Set(found)];
}

function detectNegation(input: string, symptom: string): boolean {
  const lower = input.toLowerCase();
  const negationPatterns = ["no ", "nahi ", "not ", "without ", "bina ", "nhi "];
  
  for (const neg of negationPatterns) {
    const keywords = symptomMap[symptom] || [];
    for (const kw of keywords) {
      const idx = lower.indexOf(kw);
      if (idx > 0) {
        const before = lower.substring(Math.max(0, idx - 10), idx);
        if (negationPatterns.some(n => before.includes(n))) return true;
      }
    }
  }
  return false;
}

function triageDecision(symptoms: string[], rawInput: string): TriageResponse {
  const activeSymptoms = symptoms.filter(s => !detectNegation(rawInput, s));
  
  // RED - Critical emergency
  if (
    (activeSymptoms.includes("chest_pain") && activeSymptoms.includes("breathlessness")) ||
    activeSymptoms.includes("unconscious") ||
    activeSymptoms.includes("stroke") ||
    activeSymptoms.includes("seizure") ||
    (activeSymptoms.includes("bleeding") && (rawInput.toLowerCase().includes("bahut") || rawInput.toLowerCase().includes("severe") || rawInput.toLowerCase().includes("heavy"))) ||
    (activeSymptoms.includes("chest_pain") && activeSymptoms.includes("unconscious"))
  ) {
    const rules: string[] = [];
    if (activeSymptoms.includes("chest_pain") && activeSymptoms.includes("breathlessness")) rules.push("CHEST_PAIN_RESP_DISTRESS");
    if (activeSymptoms.includes("unconscious")) rules.push("UNCONSCIOUS_PATIENT");
    if (activeSymptoms.includes("stroke")) rules.push("STROKE_SYMPTOMS");
    if (activeSymptoms.includes("seizure")) rules.push("SEIZURE_ACTIVE");
    if (activeSymptoms.includes("bleeding")) rules.push("SEVERE_HEMORRHAGE");

    return {
      risk_level: "RED",
      confidence_score: 92,
      rules_triggered: rules.length ? rules : ["CRITICAL_COMBINATION"],
      recommendation: "🚨 EMERGENCY: Call 112 immediately. Do not delay. Share your location with emergency services.",
      processed_symptoms: activeSymptoms,
      override_allowed: false,
    };
  }

  // Also RED for single critical symptoms
  if (activeSymptoms.includes("chest_pain") || activeSymptoms.includes("breathlessness")) {
    return {
      risk_level: "RED",
      confidence_score: 85,
      rules_triggered: activeSymptoms.includes("chest_pain") ? ["CHEST_PAIN_ISOLATED"] : ["RESP_DISTRESS_ISOLATED"],
      recommendation: "🚨 EMERGENCY: Seek immediate medical attention. Call 112 or go to nearest emergency room.",
      processed_symptoms: activeSymptoms,
      override_allowed: false,
    };
  }

  // YELLOW - Urgent
  if (
    activeSymptoms.includes("fever") ||
    activeSymptoms.includes("vomiting") ||
    activeSymptoms.includes("abdominal") ||
    activeSymptoms.includes("fracture") ||
    activeSymptoms.includes("burn") ||
    activeSymptoms.includes("bleeding") ||
    activeSymptoms.includes("allergy")
  ) {
    const rules: string[] = [];
    if (activeSymptoms.includes("fever")) rules.push("FEVER_MONITORING");
    if (activeSymptoms.includes("vomiting")) rules.push("PERSISTENT_VOMITING");
    if (activeSymptoms.includes("abdominal")) rules.push("ABDOMINAL_ASSESSMENT");
    if (activeSymptoms.includes("fracture")) rules.push("SUSPECTED_FRACTURE");
    if (activeSymptoms.includes("burn")) rules.push("BURN_ASSESSMENT");
    if (activeSymptoms.includes("bleeding")) rules.push("MODERATE_BLEEDING");
    if (activeSymptoms.includes("allergy")) rules.push("ALLERGIC_REACTION");

    return {
      risk_level: "YELLOW",
      confidence_score: 78,
      rules_triggered: rules,
      recommendation: "⚠️ URGENT: Visit a hospital or clinic within 6 hours. Monitor symptoms closely.",
      processed_symptoms: activeSymptoms,
      override_allowed: true,
    };
  }

  // GREEN - Routine
  if (activeSymptoms.length > 0) {
    return {
      risk_level: "GREEN",
      confidence_score: 88,
      rules_triggered: ["ROUTINE_SYMPTOMS"],
      recommendation: "✅ LOW RISK: Schedule an OPD visit. Rest and stay hydrated. Monitor for any worsening symptoms.",
      processed_symptoms: activeSymptoms,
      override_allowed: true,
    };
  }

  // No symptoms detected - safety first, escalate
  return {
    risk_level: "YELLOW",
    confidence_score: 40,
    rules_triggered: ["UNRECOGNIZED_INPUT_ESCALATION"],
    recommendation: "⚠️ Could not clearly identify symptoms. Please describe in more detail or call 112 if you feel this is an emergency.",
    processed_symptoms: [],
    override_allowed: true,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms }: TriageRequest = await req.json();

    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid input: symptoms text is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (symptoms.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Input too long. Maximum 2000 characters." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const extractedSymptoms = extractSymptoms(symptoms);
    const result = triageDecision(extractedSymptoms, symptoms);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
