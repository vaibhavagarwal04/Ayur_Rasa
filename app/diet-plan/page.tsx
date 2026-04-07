// pages/weekly-diet.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { ArrowLeft } from "lucide-react";
import { getAuthToken, getAuthUser, patientApi, dietPlanApi } from "../lib/api";
import { daysOfWeek as fallbackDaysOfWeek, mealsOfDay, doshaFoods } from "../data/Food";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const dayIndexToName: Record<number, string> = {
  0: "Monday",
  1: "Tuesday",
  2: "Wednesday",
  3: "Thursday",
  4: "Friday",
  5: "Saturday",
  6: "Sunday",
};

const dayNameMap: Record<string, string> = {
  mon: "Monday",
  monday: "Monday",
  tue: "Tuesday",
  tuesday: "Tuesday",
  wed: "Wednesday",
  wednesday: "Wednesday",
  thu: "Thursday",
  thursday: "Thursday",
  fri: "Friday",
  friday: "Friday",
  sat: "Saturday",
  saturday: "Saturday",
  sun: "Sunday",
  sunday: "Sunday",
};

const normalizeDayOfWeek = (value: any) => {
  if (typeof value === "number") {
    return dayIndexToName[value] ?? "Monday";
  }
  if (typeof value === "string") {
    return dayNameMap[value.trim().toLowerCase()] || value;
  }
  return "Monday";
};

const createFallbackDietPlan = (patient: any) => {
  const doshaKey =
    patient?.dosha?.toString()?.trim()?.charAt(0).toUpperCase() +
    patient?.dosha?.toString()?.trim()?.slice(1).toLowerCase();
  const doshaPlan = doshaFoods[doshaKey as keyof typeof doshaFoods] ||
    doshaFoods.Vata;

  const fallbackMeals = fallbackDaysOfWeek.flatMap((day) =>
    mealsOfDay.map((meal) => {
      const foodOptions = doshaPlan[meal.name as keyof typeof doshaPlan] || [];
      const selectedFood = foodOptions[0] || {
        id: `${meal.name}-default`,
        name: `${meal.name} suggestion`,
        calories: 150,
        ayurvedicProperties: "Balanced",
        macronutrients: {
          protein: "Medium",
          carbs: "Medium",
          fats: "Medium",
          fiber: "Medium",
        },
      };

      return {
        id: `${day}-${meal.name}`,
        mealType: meal.name,
        dayOfWeek: day,
        time: meal.time,
        foods: [
          {
            id: `${selectedFood.id}-${day}`,
            portion: 100,
            calories: selectedFood.calories,
            protein: 0,
            carbs: 0,
            fats: 0,
            food: { name: selectedFood.name },
          },
        ],
      };
    })
  );

  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 6);

  return {
    id: "fallback-plan",
    patient: { user: { name: patient?.user?.name || "you" } },
    doctor: { user: { name: "Ayurveda Guide" } },
    startDate: now.toISOString(),
    endDate: endDate.toISOString(),
    weekNumber: 1,
    meals: fallbackMeals,
    recommendations: `Suggested weekly diet for ${doshaKey} dosha. Use this as a starting point and ask your doctor to personalize your meals.`,
    notes: "This plan is generated from your assessment results.",
    isFallback: true,
  };
};

const WeeklyDiet: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState(daysOfWeek[0]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = getAuthToken();
    const user = getAuthUser();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (user?.role === "DOCTOR") {
      setError("Doctors should manage patient plans from the dashboard.");
      setIsLoading(false);
      return;
    }

    const loadPlans = async () => {
      setIsLoading(true);
      setError("");

      let patient: any = null;
      const profileResponse = await patientApi.getMyProfile();
      
      if (profileResponse.success && profileResponse.data?.patient) {
        patient = profileResponse.data.patient;
      } else {
        // Patient profile not found, generate basic fallback
        const basicPatient = {
          id: "fallback",
          dosha: "Vata",
          user: { name: "You" },
        };
        const fallbackPlan = createFallbackDietPlan(basicPatient);
        setPlans([fallbackPlan]);
        setSelectedPlanIndex(0);
        setSelectedDay(fallbackPlan.meals?.[0]?.dayOfWeek || daysOfWeek[0]);
        setIsLoading(false);
        return;
      }

      const patientId = patient.id;
      const plansResponse = await dietPlanApi.getPatientPlans(patientId);

      if (!plansResponse.success) {
        // No backend plans, use fallback
        const fallbackPlan = createFallbackDietPlan(patient);
        setPlans([fallbackPlan]);
        setSelectedPlanIndex(0);
        setSelectedDay(fallbackPlan.meals?.[0]?.dayOfWeek || daysOfWeek[0]);
        setIsLoading(false);
        return;
      }

      const fetchedPlans = plansResponse.data?.dietPlans || [];
      const normalizedPlans = fetchedPlans.map((plan: any) => ({
        ...plan,
        meals: (plan.meals || []).map((meal: any) => ({
          ...meal,
          dayOfWeek: normalizeDayOfWeek(meal.dayOfWeek),
          foods: (meal.foods || []).map((foodItem: any) => ({
            ...foodItem,
            food: foodItem.food || { name: foodItem.name || "Food item" },
          })),
        })),
      }));

      const finalPlans =
        normalizedPlans.length > 0
          ? normalizedPlans
          : [createFallbackDietPlan(patient)];

      setPlans(finalPlans);
      setSelectedPlanIndex(0);
      setSelectedDay(
        finalPlans?.[0]?.meals?.[0]?.dayOfWeek || daysOfWeek[0]
      );
      setIsLoading(false);
    };

    loadPlans();
  }, [router]);

  const activePlan = plans[selectedPlanIndex];
  const availableDays = activePlan
    ? Array.from(new Set(activePlan.meals?.map((meal: any) => meal.dayOfWeek) || []))
    : daysOfWeek;
  const dailyMeals = activePlan
    ? activePlan.meals.filter((meal: any) => meal.dayOfWeek === selectedDay)
    : [];

  const formatDate = (value: string) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return value;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading your diet plan...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex bg-[#f9fafb] min-h-screen font-sans">
        <main className="flex-1 p-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-green-800 mb-2">
              Weekly Diet Plan
            </h1>
            <p className="text-gray-500 max-w-2xl">
              Personalized recommendations based on your assessment and doctor’s guidance.
            </p>
          </div>

          {error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
              <p className="font-semibold">{error}</p>
              <p className="mt-2 text-sm text-gray-600">
                {error.includes("Doctors")
                  ? "Use the dashboard to assign a plan to your patient."
                  : "If no plan appears, complete your assessment or contact your doctor."}
              </p>
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-700">
              <p className="font-semibold">No diet plan assigned yet.</p>
              <p className="mt-2 text-sm text-gray-600">
                Complete the assessment or ask your doctor to create a weekly plan.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="rounded-3xl bg-white p-6 shadow-sm border border-green-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Plan for {activePlan.patient?.user?.name || "you"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Assigned by Dr. {activePlan.doctor?.user?.name || "your doctor"}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-2xl bg-green-50 p-4">
                      <p className="text-xs uppercase tracking-widest text-green-700">Start</p>
                      <p className="font-semibold text-gray-900">{formatDate(activePlan.startDate)}</p>
                    </div>
                    <div className="rounded-2xl bg-green-50 p-4">
                      <p className="text-xs uppercase tracking-widest text-green-700">End</p>
                      <p className="font-semibold text-gray-900">{formatDate(activePlan.endDate)}</p>
                    </div>
                    <div className="rounded-2xl bg-green-50 p-4">
                      <p className="text-xs uppercase tracking-widest text-green-700">Week</p>
                      <p className="font-semibold text-gray-900">{activePlan.weekNumber || 1}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-sm border border-green-100">
                <div className="mb-5 flex flex-wrap gap-3">
                  {plans.map((plan, index) => (
                    <button
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlanIndex(index);
                        setSelectedDay(plan.meals?.[0]?.dayOfWeek || daysOfWeek[0]);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        index === selectedPlanIndex
                          ? "bg-green-700 text-white"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      Plan {plans.length - index}
                    </button>
                  ))}
                </div>

                <div className="mb-6 flex flex-wrap gap-3">
                  {availableDays.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        selectedDay === day
                          ? "bg-green-700 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {dailyMeals.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-gray-200 p-10 text-center text-gray-500">
                    No meals assigned for {selectedDay}.
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {dailyMeals.map((meal: any) => (
                      <div key={meal.id} className="rounded-3xl bg-gray-50 p-6 border border-green-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{meal.mealType}</h3>
                            <p className="text-sm text-gray-500">{meal.time}</p>
                          </div>
                          <span className="text-sm text-green-700 font-semibold">{meal.dayOfWeek}</span>
                        </div>

                        <div className="space-y-4">
                          {meal.foods?.length > 0 ? (
                            meal.foods.map((entry: any) => (
                              <div key={entry.id} className="rounded-2xl bg-white p-4 border border-gray-200">
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <p className="font-semibold text-gray-900">{entry.food?.name || "Food item"}</p>
                                    <p className="text-sm text-gray-500 mt-1">Portion: {entry.portion || "1 serving"}</p>
                                  </div>
                                  <div className="text-right text-sm text-gray-500">
                                    <p>Calories: {entry.calories ?? "-"}</p>
                                    <p>Protein: {entry.protein ?? "-"}g</p>
                                    <p>Carbs: {entry.carbs ?? "-"}g</p>
                                    <p>Fats: {entry.fats ?? "-"}g</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500">No foods added for this meal yet.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {(activePlan.recommendations || activePlan.notes) && (
                <section className="rounded-3xl bg-white p-6 shadow-sm border border-green-100">
                  {activePlan.recommendations && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
                      <p className="text-gray-600 mt-2">{activePlan.recommendations}</p>
                    </div>
                  )}
                  {activePlan.notes && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Doctor Notes</h3>
                      <p className="text-gray-600 mt-2">{activePlan.notes}</p>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default WeeklyDiet;
