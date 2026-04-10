// pages/weekly-diet.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { ArrowLeft, CalendarDays, Clock3, Salad, Sparkles } from "lucide-react";
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

type DietPlanFoodItem = {
  id: string;
  portion: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  food: { name: string };
};

type DietPlanMeal = {
  id: string;
  mealType: string;
  dayOfWeek: string;
  time: string;
  foods: DietPlanFoodItem[];
};

type DietPlanModel = {
  id: string;
  patient: { user: { name: string } };
  doctor: { user: { name: string } };
  startDate: string;
  endDate: string;
  weekNumber: number;
  meals: DietPlanMeal[];
  recommendations: string;
  notes: string;
  isFallback?: boolean;
};

type DietPlanPatient = {
  id?: string;
  dosha?: string;
  user?: { name?: string };
};

const normalizeDayOfWeek = (value: string | number) => {
  if (typeof value === "number") {
    return dayIndexToName[value] ?? "Monday";
  }
  if (typeof value === "string") {
    return dayNameMap[value.trim().toLowerCase()] || value;
  }
  return "Monday";
};

const createFallbackDietPlan = (patient: DietPlanPatient) => {
  const doshaText = patient?.dosha?.toString().trim() || 'Vata';
  const doshaKey =
    doshaText.charAt(0).toUpperCase() + doshaText.slice(1).toLowerCase();
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
  const [plans, setPlans] = useState<DietPlanModel[]>([]);
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

      let patient: DietPlanPatient | null = null;
      const profileResponse = await patientApi.getMyProfile();
      
      if (profileResponse.success && profileResponse.data?.patient) {
        patient = profileResponse.data.patient as DietPlanPatient;
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

      const patientId = patient.id || '';
      if (!patientId) {
        const fallbackPlan = createFallbackDietPlan(patient);
        setPlans([fallbackPlan]);
        setSelectedPlanIndex(0);
        setSelectedDay(fallbackPlan.meals?.[0]?.dayOfWeek || daysOfWeek[0]);
        setIsLoading(false);
        return;
      }
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

      const fetchedPlans = ((plansResponse.data as { dietPlans?: unknown })?.dietPlans ?? []) as unknown[];
      const normalizedPlans = fetchedPlans.map((plan) => {
        const rawPlan = plan as Partial<DietPlanModel> & { meals?: unknown[] };
        return {
          ...rawPlan,
          meals: (rawPlan.meals ?? []).map((meal) => {
            const rawMeal = meal as Partial<DietPlanMeal> & { foods?: unknown[] };
            return {
              ...rawMeal,
              dayOfWeek: normalizeDayOfWeek(rawMeal.dayOfWeek ?? "Monday"),
              foods: (rawMeal.foods ?? []).map((foodItem) => {
                const rawFood = foodItem as Partial<DietPlanFoodItem> & {
                  food?: unknown;
                  name?: string;
                };
                return {
                  ...rawFood,
                  food: (rawFood.food as { name: string }) || {
                    name: rawFood.name || "Food item",
                  },
                } as DietPlanFoodItem;
              }),
            } as DietPlanMeal;
          }),
        } as DietPlanModel;
      });

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
    ? Array.from(new Set(activePlan.meals.map((meal) => meal.dayOfWeek)))
    : daysOfWeek;
  const dailyMeals = activePlan
    ? activePlan.meals.filter((meal) => meal.dayOfWeek === selectedDay)
    : [];
  const totalFoods = dailyMeals.reduce(
    (count, meal) => count + (meal.foods?.length ?? 0),
    0
  );
  const totalCalories = dailyMeals.reduce(
    (sum, meal) =>
      sum +
      (meal.foods?.reduce(
        (mealSum, entry) => mealSum + (Number(entry.calories) || 0),
        0
      ) ?? 0),
    0
  );

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
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(187,247,208,0.35),_transparent_32%),linear-gradient(180deg,#f7fdf8_0%,#f3f7f4_100%)]">
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-green-200 hover:text-green-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>

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
              <section className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-[0_24px_80px_-36px_rgba(22,101,52,0.35)]">
                <div className="grid gap-6 bg-[linear-gradient(135deg,rgba(21,128,61,0.08),rgba(187,247,208,0.42))] px-6 py-8 lg:grid-cols-[1.45fr_0.95fr] lg:px-8">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-4 py-2 text-sm font-medium text-green-800 shadow-sm backdrop-blur">
                      <Sparkles className="h-4 w-4" />
                      Personalized nourishment plan
                    </div>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                      Weekly Diet Plan
                    </h1>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
                      Personalized recommendations based on your assessment and
                      doctor&apos;s guidance.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <div className="rounded-2xl border border-white/60 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-700">
                          Patient
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {activePlan.patient?.user?.name || "You"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/60 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-700">
                          Assigned By
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          Dr. {activePlan.doctor?.user?.name || "Your doctor"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-sm backdrop-blur">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-green-700">
                            Start Date
                          </p>
                          <p className="mt-2 text-lg font-semibold text-gray-900">
                            {formatDate(activePlan.startDate)}
                          </p>
                        </div>
                        <CalendarDays className="h-5 w-5 text-green-700" />
                      </div>
                    </div>
                    <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-sm backdrop-blur">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-green-700">
                            End Date
                          </p>
                          <p className="mt-2 text-lg font-semibold text-gray-900">
                            {formatDate(activePlan.endDate)}
                          </p>
                        </div>
                        <CalendarDays className="h-5 w-5 text-green-700" />
                      </div>
                    </div>
                    <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-sm backdrop-blur">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-green-700">
                            Week Number
                          </p>
                          <p className="mt-2 text-lg font-semibold text-gray-900">
                            {activePlan.weekNumber || 1}
                          </p>
                        </div>
                        <Sparkles className="h-5 w-5 text-green-700" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green-700">
                      Available Plans
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                      Pick your week and day
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-gray-600">
                      Switch between saved plans, then explore each day&apos;s
                      meals with quick nutrition highlights.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
                    <div className="rounded-3xl bg-emerald-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-emerald-700">
                        Selected Day
                      </p>
                      <p className="mt-2 text-lg font-semibold text-gray-900">
                        {selectedDay}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-amber-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-amber-700">
                        Meals
                      </p>
                      <p className="mt-2 text-lg font-semibold text-gray-900">
                        {dailyMeals.length}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-sky-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-sky-700">
                        Calories
                      </p>
                      <p className="mt-2 text-lg font-semibold text-gray-900">
                        {totalCalories || 0} kcal
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-5 mt-8 flex flex-wrap gap-3">
                  {plans.map((plan, index) => (
                    <button
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlanIndex(index);
                        setSelectedDay(plan.meals?.[0]?.dayOfWeek || daysOfWeek[0]);
                      }}
                      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                        index === selectedPlanIndex
                          ? "bg-green-700 text-white shadow-lg shadow-green-700/20"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      Plan {plans.length - index}
                    </button>
                  ))}
                </div>

                <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                  {availableDays.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`rounded-3xl border px-4 py-4 text-left transition ${
                        selectedDay === day
                          ? "border-green-700 bg-green-700 text-white shadow-lg shadow-green-700/20"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:border-green-200 hover:bg-green-50"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-[0.2em] opacity-70">
                        Day
                      </p>
                      <p className="mt-2 text-sm font-semibold">{day}</p>
                    </button>
                  ))}
                </div>

                {dailyMeals.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-gray-200 p-10 text-center text-gray-500">
                    No meals assigned for {selectedDay}.
                  </div>
                ) : (
                  <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                    <div className="grid gap-5">
                      {dailyMeals.map((meal: DietPlanMeal) => (
                        <div
                          key={meal.id}
                          className="overflow-hidden rounded-[1.75rem] border border-green-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fcf9_100%)] shadow-sm"
                        >
                          <div className="flex flex-col gap-4 border-b border-green-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                                <Salad className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {meal.mealType}
                                </h3>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                  <span className="inline-flex items-center gap-1.5">
                                    <Clock3 className="h-4 w-4" />
                                    {meal.time}
                                  </span>
                                  <span className="rounded-full bg-green-50 px-3 py-1 font-medium text-green-700">
                                    {meal.dayOfWeek}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:min-w-[210px]">
                              <div className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-green-100">
                                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                                  Foods
                                </p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                  {meal.foods?.length ?? 0}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-green-100">
                                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                                  Calories
                                </p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                  {meal.foods?.reduce(
                                    (sum, entry) =>
                                      sum + (Number(entry.calories) || 0),
                                    0
                                  ) ?? 0}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 px-6 py-5">
                            {meal.foods?.length > 0 ? (
                              meal.foods.map((entry: DietPlanFoodItem) => (
                                <div
                                  key={entry.id}
                                  className="rounded-[1.5rem] border border-gray-200 bg-white p-4 shadow-sm"
                                >
                                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                      <p className="text-lg font-semibold text-gray-900">
                                        {entry.food?.name || "Food item"}
                                      </p>
                                      <p className="mt-2 text-sm text-gray-500">
                                        Portion: {entry.portion || "1 serving"}
                                      </p>
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                      <div className="rounded-2xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
                                        Calories:{" "}
                                        <span className="font-semibold text-gray-900">
                                          {entry.calories ?? "-"}
                                        </span>
                                      </div>
                                      <div className="rounded-2xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
                                        Protein:{" "}
                                        <span className="font-semibold text-gray-900">
                                          {entry.protein ?? "-"}g
                                        </span>
                                      </div>
                                      <div className="rounded-2xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
                                        Carbs:{" "}
                                        <span className="font-semibold text-gray-900">
                                          {entry.carbs ?? "-"}g
                                        </span>
                                      </div>
                                      <div className="rounded-2xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
                                        Fats:{" "}
                                        <span className="font-semibold text-gray-900">
                                          {entry.fats ?? "-"}g
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500">
                                No foods added for this meal yet.
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <aside className="space-y-5">
                      <div className="rounded-[1.75rem] border border-green-100 bg-white p-5 shadow-sm">
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green-700">
                          Day Summary
                        </p>
                        <div className="mt-5 grid gap-3">
                          <div className="rounded-3xl bg-green-50 p-4">
                            <p className="text-sm text-green-700">
                              Selected Day
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">
                              {selectedDay}
                            </p>
                          </div>
                          <div className="rounded-3xl bg-amber-50 p-4">
                            <p className="text-sm text-amber-700">
                              Planned Meals
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">
                              {dailyMeals.length}
                            </p>
                          </div>
                          <div className="rounded-3xl bg-sky-50 p-4">
                            <p className="text-sm text-sky-700">Food Items</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">
                              {totalFoods}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[1.75rem] border border-green-100 bg-[linear-gradient(180deg,#f7fff8_0%,#ffffff_100%)] p-5 shadow-sm">
                        <div className="flex items-center gap-2 text-green-700">
                          <Sparkles className="h-4 w-4" />
                          <p className="text-sm font-semibold uppercase tracking-[0.24em]">
                            Helpful Tip
                          </p>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-gray-600">
                          Try to keep meal timing consistent through the week.
                          Small, steady routines usually make Ayurvedic plans
                          easier to follow.
                        </p>
                      </div>
                    </aside>
                  </div>
                )}
              </section>

              {(activePlan.recommendations || activePlan.notes) && (
                <section className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
                  {activePlan.recommendations && (
                    <div className="mb-6 rounded-3xl bg-green-50 p-5">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Recommendations
                      </h3>
                      <p className="mt-2 text-gray-600">
                        {activePlan.recommendations}
                      </p>
                    </div>
                  )}
                  {activePlan.notes && (
                    <div className="rounded-3xl bg-amber-50 p-5">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Doctor Notes
                      </h3>
                      <p className="mt-2 text-gray-600">{activePlan.notes}</p>
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
