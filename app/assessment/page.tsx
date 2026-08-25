"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { getAuthToken, getAuthUser, assessmentApi, patientApi } from "../lib/api";
// Removed: import { motion } from "framer-motion";

const quizQuestions = [
  {
    id: "bodyFrame",
    label: "Body Frame",
    options: [
      { value: "vata", text: "Thin and Lean" },
      { value: "pitta", text: "Medium" },
      { value: "kapha", text: "Well Built" },
    ],
  },
  {
    id: "typeOfHair",
    label: "Type of Hair",
    options: [
      { value: "vata", text: "Dry" },
      { value: "pitta", text: "Normal" },
      { value: "kapha", text: "Greasy" },
    ],
  },
  {
    id: "colorOfHair",
    label: "Color of Hair",
    options: [
      { value: "vata", text: "Grey" },
      { value: "pitta", text: "Brown" },
      { value: "kapha", text: "Black" },
    ],
  },
  {
    id: "skin",
    label: "Skin",
    options: [
      { value: "vata", text: "Dry,Rough" },
      { value: "pitta", text: "Soft,Sweating" },
      { value: "kapha", text: "Moist,Greasy" },
    ],
  },
  {
    id: "complexion",
    label: "Complexion",
    options: [
      { value: "vata", text: "Dark" },
      { value: "pitta", text: "Pinkish" },
      { value: "kapha", text: "Glowing" },
    ],
  },
  {
    id: "bodyWeight",
    label: "Body Weight",
    options: [
      { value: "vata", text: "Underweight" },
      { value: "pitta", text: "Normal" },
      { value: "kapha", text: "Overweight" },
    ],
  },
  {
    id: "nails",
    label: "Nails",
    options: [
      { value: "vata", text: "Blackish" },
      { value: "pitta", text: "Redish" },
      { value: "kapha", text: "Pinkish" },
    ],
  },
  {
    id: "teeth",
    label: "Size and Color of the Teeth",
    options: [
      { value: "vata", text: "Irregular,Blackish" },
      { value: "pitta", text: "Medium,Yellowish" },
      { value: "kapha", text: "Large,White" },
    ],
  },
  {
    id: "paceOfWork",
    label: "Pace of Performing Work",
    options: [
      { value: "vata", text: "Fast" },
      { value: "pitta", text: "Medium" },
      { value: "kapha", text: "Slow" },
    ],
  },
  {
    id: "mentalActivity",
    label: "Mental Activity",
    options: [
      { value: "vata", text: "Restless" },
      { value: "pitta", text: "Aggressive" },
      { value: "kapha", text: "Stable" },
    ],
  },
  {
    id: "memory",
    label: "Memory",
    options: [
      { value: "vata", text: "Short term" },
      { value: "pitta", text: "Good Memory" },
      { value: "kapha", text: "Long Term" },
    ],
  },
  {
    id: "sleepPattern",
    label: "Sleep Pattern",
    options: [
      { value: "vata", text: "Less" },
      { value: "pitta", text: "Moderate" },
      { value: "kapha", text: "Sleepy" },
    ],
  },
  {
    id: "weatherConditions",
    label: "Weather Conditions",
    options: [
      { value: "vata", text: "Dislike Cold" },
      { value: "pitta", text: "Dislike Heat" },
      { value: "kapha", text: "Dislike Moist" },
    ],
  },
  {
    id: "adverseReaction",
    label: "Reaction under Adverse Situations",
    options: [
      { value: "vata", text: "Anxiety" },
      { value: "pitta", text: "Anger" },
      { value: "kapha", text: "Calm" },
    ],
  },
  {
    id: "mood",
    label: "Mood",
    options: [
      { value: "vata", text: "Changes Quickly" },
      { value: "pitta", text: "Constant" },
      { value: "kapha", text: "Changes Slowly" },
    ],
  },
  {
    id: "eatingHabit",
    label: "Eating Habit",
    options: [
      { value: "vata", text: "Irregular Chewing" },
      { value: "pitta", text: "Improper Chewing" },
      { value: "kapha", text: "Proper Chewing" },
    ],
  },
  {
    id: "hunger",
    label: "Hunger",
    options: [
      { value: "vata", text: "Irregular" },
      { value: "pitta", text: "Sudden and Sharp" },
      { value: "kapha", text: "Skips Meal" },
    ],
  },
  {
    id: "bodyTemperature",
    label: "Body Temperature",
    options: [
      { value: "vata", text: "Less than Normal" },
      { value: "pitta", text: "More than Normal" },
      { value: "kapha", text: "Normal" },
    ],
  },
  {
    id: "joints",
    label: "Joints",
    options: [
      { value: "vata", text: "Weak" },
      { value: "pitta", text: "Healthy" },
      { value: "kapha", text: "Heavy" },
    ],
  },
  {
    id: "nature",
    label: "Nature",
    options: [
      { value: "vata", text: "Jealous,Fearful" },
      { value: "pitta", text: "Egoistic,Fearless" },
      { value: "kapha", text: "Forgiving,Grateful" },
    ],
  },
  {
    id: "bodyEnergy",
    label: "Body Energy",
    options: [
      { value: "vata", text: "Low" },
      { value: "pitta", text: "High" },
      { value: "kapha", text: "Medium" },
    ],
  },
  {
    id: "qualityOfVoice",
    label: "Quality of Voice",
    options: [
      { value: "vata", text: "Rough" },
      { value: "pitta", text: "Fast" },
      { value: "kapha", text: "Deep" },
    ],
  },
  {
    id: "dreams",
    label: "Dreams",
    options: [
      { value: "vata", text: "Sky" },
      { value: "pitta", text: "Fire" },
      { value: "kapha", text: "Water" },
    ],
  },
  {
    id: "socialRelations",
    label: "Social Relations",
    options: [
      { value: "vata", text: "Ambivert" },
      { value: "pitta", text: "Extrovert" },
      { value: "kapha", text: "Introvert" },
    ],
  },
  {
    id: "bodyOdor",
    label: "Body Odor",
    options: [
      { value: "vata", text: "Negligible" },
      { value: "pitta", text: "Strong" },
      { value: "kapha", text: "Mild" },
    ],
  },
];

export default function AssessmentPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [patientId, setPatientId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialize = async () => {
      const token = getAuthToken();
      const user = getAuthUser();

      if (!token) {
        router.replace('/login');
        return;
      }

      if (user?.role === 'DOCTOR') {
        router.replace('/Dashboard');
        return;
      }

      const profileResponse = await patientApi.getMyProfile();
      if (profileResponse.success && profileResponse.data?.patient) {
        const patient = profileResponse.data.patient as { id: string; assessments?: unknown[] };
        setPatientId(patient.id);

        type SavedAssessment = {
        createdAt: string;
        vataScore?: number;
        pittaScore?: number;
        kaphaScore?: number;
        primaryDosha?: string;
      };

      const assessments = Array.isArray(patient.assessments)
        ? (patient.assessments as SavedAssessment[])
        : [];

      if (assessments.length > 0) {
        const latestAssessment = [...assessments].sort(
          (a: SavedAssessment, b: SavedAssessment) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

          const vataScore = latestAssessment.vataScore ?? 0;
          const pittaScore = latestAssessment.pittaScore ?? 0;
          const kaphaScore = latestAssessment.kaphaScore ?? 0;
          const primaryDosha =
            latestAssessment.primaryDosha ||
            Object.entries({ vataScore, pittaScore, kaphaScore }).sort(
              (a, b) => b[1] - a[1]
            )[0]?.[0]?.replace('Score', '') ||
            'Vata';

          router.replace(
            `/assessment-result?vata=${vataScore}&pitta=${pittaScore}&kapha=${kaphaScore}&primary=${encodeURIComponent(
              primaryDosha
            )}`
          );
          return;
        }
      }

      setIsLoading(false);
    };

    initialize();
  }, [router]);

  const handleAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const calculateDosha = async () => {
  const answeredQuestions = Object.keys(answers).length;

  if (answeredQuestions < quizQuestions.length) {
    alert(
      `Please answer all ${quizQuestions.length} questions before calculating your Dosha.`
    );
    return;
  }

  if (!patientId) {
    alert("Unable to identify your patient profile. Please refresh the page.");
    return;
  }

  setIsSubmitting(true);
  setSubmitError("");

  try {
    // Convert frontend answer IDs into the exact
    // column names and values used by the ML dataset.
    const mlInput = {
      "Body Frame":
        answers.bodyFrame === "vata"
          ? "Thin and Lean"
          : answers.bodyFrame === "pitta"
          ? "Medium"
          : "Well Built",

      "Type of Hair":
        answers.typeOfHair === "vata"
          ? "Dry"
          : answers.typeOfHair === "pitta"
          ? "Normal"
          : "Greasy",

      "Color of Hair":
        answers.colorOfHair === "vata"
          ? "Grey"
          : answers.colorOfHair === "pitta"
          ? "Brown"
          : "Black",

      Skin:
        answers.skin === "vata"
          ? "Dry,Rough"
          : answers.skin === "pitta"
          ? "Soft,Sweating"
          : "Moist,Greasy",

      Complexion:
        answers.complexion === "vata"
          ? "Dark"
          : answers.complexion === "pitta"
          ? "Pinkish"
          : "Glowing",

      "Body Weight":
        answers.bodyWeight === "vata"
          ? "Underweight"
          : answers.bodyWeight === "pitta"
          ? "Normal"
          : "Overweight",

      Nails:
        answers.nails === "vata"
          ? "Blackish"
          : answers.nails === "pitta"
          ? "Redish"
          : "Pinkish",

      "Size and Color of the Teeth":
        answers.teeth === "vata"
          ? "Irregular,Blackish"
          : answers.teeth === "pitta"
          ? "Medium,Yellowish"
          : "Large,White",

      "Pace of Performing Work":
        answers.paceOfWork === "vata"
          ? "Fast"
          : answers.paceOfWork === "pitta"
          ? "Medium"
          : "Slow",

      "Mental Activity":
        answers.mentalActivity === "vata"
          ? "Restless"
          : answers.mentalActivity === "pitta"
          ? "Aggressive"
          : "Stable",

      Memory:
        answers.memory === "vata"
          ? "Short term"
          : answers.memory === "pitta"
          ? "Good Memory"
          : "Long Term",

      "Sleep Pattern":
        answers.sleepPattern === "vata"
          ? "Less"
          : answers.sleepPattern === "pitta"
          ? "Moderate"
          : "Sleepy",

      "Weather Conditions":
        answers.weatherConditions === "vata"
          ? "Dislike Cold"
          : answers.weatherConditions === "pitta"
          ? "Dislike Heat"
          : "Dislike Moist",

      "Reaction under Adverse Situations":
        answers.adverseReaction === "vata"
          ? "Anxiety"
          : answers.adverseReaction === "pitta"
          ? "Anger"
          : "Calm",

      Mood:
        answers.mood === "vata"
          ? "Changes Quickly"
          : answers.mood === "pitta"
          ? "Constant"
          : "Changes Slowly",

      "Eating Habit":
        answers.eatingHabit === "vata"
          ? "Irregular Chewing"
          : answers.eatingHabit === "pitta"
          ? "Improper Chewing"
          : "Proper Chewing",

      Hunger:
        answers.hunger === "vata"
          ? "Irregular"
          : answers.hunger === "pitta"
          ? "Sudden and Sharp"
          : "Skips Meal",

      "Body Temperature":
        answers.bodyTemperature === "vata"
          ? "Less than Normal"
          : answers.bodyTemperature === "pitta"
          ? "More than Normal"
          : "Normal",

      Joints:
        answers.joints === "vata"
          ? "Weak"
          : answers.joints === "pitta"
          ? "Healthy"
          : "Heavy",

      Nature:
        answers.nature === "vata"
          ? "Jealous,Fearful"
          : answers.nature === "pitta"
          ? "Egoistic,Fearless"
          : "Forgiving,Grateful",

      "Body Energy":
        answers.bodyEnergy === "vata"
          ? "Low"
          : answers.bodyEnergy === "pitta"
          ? "High"
          : "Medium",

      "Quality of Voice":
        answers.qualityOfVoice === "vata"
          ? "Rough"
          : answers.qualityOfVoice === "pitta"
          ? "Fast"
          : "Deep",

      Dreams:
        answers.dreams === "vata"
          ? "Sky"
          : answers.dreams === "pitta"
          ? "Fire"
          : "Water",

      "Social Relations":
        answers.socialRelations === "vata"
          ? "Ambivert"
          : answers.socialRelations === "pitta"
          ? "Extrovert"
          : "Introvert",

      "Body Odor":
        answers.bodyOdor === "vata"
          ? "Negligible"
          : answers.bodyOdor === "pitta"
          ? "Strong"
          : "Mild",
    };

    // Send the 25 answers to the trained ML model
    const mlResponse = await fetch(
      "http://localhost:5000/api/dosha/predict",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mlInput),
      }
    );

    const mlResult = await mlResponse.json();

    if (!mlResponse.ok || !mlResult.success) {
      throw new Error(
        mlResult.error || mlResult.message || "ML prediction failed."
      );
    }

    const prediction = mlResult.prediction as string;

    const probabilities = mlResult.probabilities || {};

    const vataPercent = Math.round(Number(probabilities.Vata || 0));
    const pittaPercent = Math.round(Number(probabilities.Pitta || 0));
    const kaphaPercent = Math.round(Number(probabilities.Kapha || 0));

    // Save the ML result in the existing assessment system
    const response = await assessmentApi.submit({
      patientId,
      answers,
      vataScore: vataPercent,
      pittaScore: pittaPercent,
      kaphaScore: kaphaPercent,
    });

    if (!response.success) {
      setSubmitError(
        response.message || "Failed to save assessment."
      );
      return;
    }

    // Open the existing result page with ML prediction
    router.push(
      `/assessment-result?vata=${vataPercent}&pitta=${pittaPercent}&kapha=${kaphaPercent}&primary=${encodeURIComponent(
        prediction
      )}`
    );
  } catch (error) {
    console.error("Dosha ML prediction error:", error);

    setSubmitError(
      error instanceof Error
        ? error.message
        : "Unable to calculate Dosha using the ML model."
    );
  } finally {
    setIsSubmitting(false);
  }
};
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <p className="text-gray-600">Loading your assessment...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div
        className="min-h-screen bg-neutral-100 flex flex-col items-center py-12 px-4 font-sans"
        // Removed framer-motion props: initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
      >
        <div
          className="w-full max-w-6xl bg-white shadow-2xl rounded-3xl p-8 border border-neutral-200"
          // Removed framer-motion props: initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-8">
            <h1
              className="text-4xl font-extrabold text-gray-800"
              // Removed framer-motion props: initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
            >
              Dosha Assessment Quiz
            </h1>
            <p
              className="text-gray-500 mt-2"
              // Removed framer-motion props: initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}
            >
              Answer the questions below to discover your unique mind-body
              constitution (Prakriti).
            </p>
          </div>

          <div
            className="grid md:grid-cols-2 gap-6"
            // Removed framer-motion props: initial="hidden" animate="visible" variants
          >
            {quizQuestions.map((q) => (
              <div
                key={q.id}
                className="border border-neutral-200 rounded-2xl p-6 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
                // Removed framer-motion props: variants transition
              >
                <h3 className="font-semibold text-lg mb-4 text-gray-800">
                  {q.label}
                </h3>
                <div className="flex flex-col space-y-3">
                  {q.options.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                        answers[q.id] === opt.value
                          ? "border border-green-600 bg-green-50 shadow-sm"
                          : "border border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt.value}
                        checked={answers[q.id] === opt.value}
                        onChange={() => handleAnswer(q.id, opt.value)}
                        className="hidden"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                          answers[q.id] === opt.value
                            ? "border-green-600 bg-green-600"
                            : "border-gray-400 bg-white"
                        }`}
                      >
                        {answers[q.id] === opt.value && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="text-gray-700 font-medium">
                        {opt.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {submitError && (
            <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700 text-center">
              {submitError}
            </div>
          )}

          <div className="flex justify-center mt-10">
            <button
              onClick={calculateDosha}
              disabled={isSubmitting}
              className={`bg-green-600 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg transition-transform duration-300 ${
                isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.05] active:scale-[0.95]"
              }`}
            >
              {isSubmitting ? "Submitting assessment..." : "Calculate Your Dosha"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
