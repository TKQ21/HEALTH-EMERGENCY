import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AccidentRiskRequest {
  latitude?: number;
  longitude?: number;
  time_of_day: string; // "morning" | "afternoon" | "evening" | "night"
  weather: string; // "clear" | "rain" | "fog" | "storm"
  traffic_density: string; // "low" | "moderate" | "heavy"
}

function calculateRisk(input: AccidentRiskRequest) {
  let baseScore = 20;
  const factors: string[] = [];

  // Time factor
  const timeWeights: Record<string, number> = {
    morning: 5,
    afternoon: 8,
    evening: 12,
    night: 20,
  };
  const timeFactor = timeWeights[input.time_of_day] || 10;
  baseScore += timeFactor;
  if (timeFactor >= 12) factors.push(`${input.time_of_day} hours (+${timeFactor})`);

  // Weather factor
  const weatherWeights: Record<string, number> = {
    clear: 0,
    rain: 20,
    fog: 18,
    storm: 30,
  };
  const weatherFactor = weatherWeights[input.weather] || 5;
  baseScore += weatherFactor;
  if (weatherFactor > 0) factors.push(`${input.weather} weather (+${weatherFactor})`);

  // Traffic factor
  const trafficWeights: Record<string, number> = {
    low: 0,
    moderate: 10,
    heavy: 25,
  };
  const trafficFactor = trafficWeights[input.traffic_density] || 5;
  baseScore += trafficFactor;
  if (trafficFactor > 0) factors.push(`${input.traffic_density} traffic (+${trafficFactor})`);

  // Weekend bonus
  const now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) {
    baseScore += 10;
    factors.push("Weekend (+10)");
  }

  // Cap at 100
  const riskPercentage = Math.min(baseScore, 100);

  let riskLevel: "LOW" | "MODERATE" | "HIGH";
  if (riskPercentage < 30) riskLevel = "LOW";
  else if (riskPercentage < 60) riskLevel = "MODERATE";
  else riskLevel = "HIGH";

  return {
    risk_percentage: riskPercentage,
    risk_level: riskLevel,
    factors,
    explanation: factors.join(" + "),
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input: AccidentRiskRequest = await req.json();

    if (!input.time_of_day || !input.weather || !input.traffic_density) {
      return new Response(
        JSON.stringify({ error: "time_of_day, weather, and traffic_density are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validTimes = ["morning", "afternoon", "evening", "night"];
    const validWeather = ["clear", "rain", "fog", "storm"];
    const validTraffic = ["low", "moderate", "heavy"];

    if (!validTimes.includes(input.time_of_day) || !validWeather.includes(input.weather) || !validTraffic.includes(input.traffic_density)) {
      return new Response(
        JSON.stringify({ error: "Invalid input values" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = calculateRisk(input);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
