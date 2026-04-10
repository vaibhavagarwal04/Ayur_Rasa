"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Edit3,
  Save,
  X,
  Activity,
  Droplets,
  Clock,
  Heart,
  TrendingUp,
  ArrowLeft,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Salad,
  ClipboardList,
  Phone,
  Scale,
} from "lucide-react";
import { getAuthUser, getAuthToken, patientApi, userApi } from "../lib/api";

// Type for BMI history entries
type BMIEntry = {
  date: string;
  value: number;
};

// Profile data type
type ProfileData = {
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  prakriti: string;
  vikriti: string;
  constitution: string;
  height: string;
  weight: string;
  bmi: string;
  bloodPressure: string;
  pulseRate: string;
  bmiHistory: BMIEntry[];
  dietaryPreference: string;
  allergies: string;
  mealFrequency: string;
  waterIntake: string;
  sleepPattern: string;
  exerciseFrequency: string;
  stressLevel: string;
  bowelMovement: string;
  medicalConditions: string;
  currentMedications: string;
  lastConsultation: string;
};

type ProfileField = keyof ProfileData;

type BackendPatient = {
  user?: { name?: string; phone?: string; email?: string };
  age?: number;
  gender?: string;
  address?: string;
  prakriti?: string;
  vikriti?: string;
  constitution?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  bloodPressure?: string;
  pulseRate?: number;
  bmiHistory?: string | Array<{ date: string; value: number }>;
  dietaryHabits?: string;
  allergies?: string;
  mealFrequency?: string;
  waterIntake?: string;
  sleepPattern?: string;
  physicalActivity?: string;
  stressLevel?: string;
  bowelMovements?: string;
  medicalConditions?: string;
  currentMedications?: string;
  lastConsultation?: string;
};

const EMPTY_PROFILE: ProfileData = {
  name: "",
  age: 0,
  gender: "",
  phone: "",
  email: "",
  address: "",
  prakriti: "",
  vikriti: "",
  constitution: "",
  height: "",
  weight: "",
  bmi: "",
  bloodPressure: "",
  pulseRate: "",
  bmiHistory: [],
  dietaryPreference: "",
  allergies: "",
  mealFrequency: "",
  waterIntake: "",
  sleepPattern: "",
  exerciseFrequency: "",
  stressLevel: "",
  bowelMovement: "",
  medicalConditions: "",
  currentMedications: "",
  lastConsultation: "",
};

// Validation functions
const validateNameOnly = (value: string): boolean => {
  return /^[a-zA-Z\s]*$/.test(value);
};

const validatePhoneNumber = (value: string): boolean => {
  const digitsOnly = value.replace(/\D/g, "");
  return digitsOnly.length <= 10;
};

const validateNumberInput = (value: string): boolean => {
  return /^\d*\.?\d*$/.test(value);
};

const SectionHeader = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-4 border-b border-green-100 px-6 py-5">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone: "green" | "amber" | "blue" | "rose";
}) => {
  const toneClasses = {
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-sky-50 text-sky-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
};

const InfoPill = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-green-700">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
    <p className="mt-2 text-sm font-medium text-gray-800">{value}</p>
  </div>
);

const QuickAction = ({
  icon: Icon,
  title,
  note,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  note: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="rounded-[1.5rem] border border-gray-200 bg-white p-5 text-left transition hover:border-green-200 hover:bg-green-50"
  >
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-700">
      <Icon className="h-5 w-5" />
    </div>
    <p className="mt-4 text-base font-semibold text-gray-900">{title}</p>
    <p className="mt-2 text-sm leading-6 text-gray-600">{note}</p>
  </button>
);

const InputField = ({
  label,
  field,
  value,
  type = "text",
  options = null,
  disabled,
  placeholder,
  onChange,
}: {
  label: string;
  field: ProfileField;
  value: string | number;
  type?: string;
  options?: string[] | null;
  disabled: boolean;
  placeholder?: string;
  onChange: (field: ProfileField, value: string | number) => void;
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const v = e.target.value;
      if (field === "name") {
        if (!validateNameOnly(v)) return;
      } else if (field === "phone") {
        if (!validatePhoneNumber(v)) return;
      } else if (["height", "weight", "bmi", "pulseRate"].includes(field)) {
        if (!validateNumberInput(v)) return;
      } else if (field === "age") {
        const ageNum = Number(v) || 0;
        if (ageNum > 120) return;
      }
      onChange(field, type === "number" ? Number(v) : v);
    },
    [field, type, onChange]
  );

  const commonClasses =
    "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-100 disabled:bg-gray-50 disabled:text-gray-500";

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {options ? (
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={commonClasses}
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          className={commonClasses}
        />
      )}
    </div>
  );
};

// ============ MAIN COMPONENT ============
export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [patientId, setPatientId] = useState<string | null>(null);
  const [authRole, setAuthRole] = useState<"PATIENT" | "DOCTOR" | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>(EMPTY_PROFILE);
  const [tempData, setTempData] = useState<ProfileData>(EMPTY_PROFILE);

  // Handle change during editing
  const handleChange = useCallback(
    (field: ProfileField, value: string | number) => {
      setTempData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const mapPatientProfile = (patient: BackendPatient): ProfileData => {
    const user = patient.user ?? {};
    const parsedBmiHistory = typeof patient.bmiHistory === "string"
      ? JSON.parse(patient.bmiHistory || "[]")
      : Array.isArray(patient.bmiHistory)
      ? patient.bmiHistory
      : [];

    return {
      name: user.name || "",
      age: patient.age || 0,
      gender: patient.gender || "",
      phone: user.phone || "",
      email: user.email || "",
      address: patient.address || "",
      prakriti: patient.prakriti || "",
      vikriti: patient.vikriti || "",
      constitution: patient.constitution || "",
      height: patient.height ? String(patient.height) : "",
      weight: patient.weight ? String(patient.weight) : "",
      bmi: patient.bmi ? String(patient.bmi) : "",
      bloodPressure: patient.bloodPressure || "",
      pulseRate: patient.pulseRate ? String(patient.pulseRate) : "",
      bmiHistory: parsedBmiHistory,
      dietaryPreference: patient.dietaryHabits || "",
      allergies: patient.allergies || "",
      mealFrequency: patient.mealFrequency || "",
      waterIntake: patient.waterIntake || "",
      sleepPattern: patient.sleepPattern || "",
      exerciseFrequency: patient.physicalActivity || "",
      stressLevel: patient.stressLevel || "",
      bowelMovement: patient.bowelMovements || "",
      medicalConditions: patient.medicalConditions || "",
      currentMedications: patient.currentMedications || "",
      lastConsultation: patient.lastConsultation || "",
    };
  };

  useEffect(() => {
    const computedBmi = (() => {
      const heightCm = Number(tempData.height);
      const weightKg = Number(tempData.weight);
      if (!heightCm || !weightKg) return "";
      const heightMeters = heightCm / 100;
      if (!heightMeters) return "";
      return (weightKg / (heightMeters * heightMeters)).toFixed(1);
    })();

    setTempData((prev) => {
      if (prev.bmi === computedBmi) return prev;
      return { ...prev, bmi: computedBmi };
    });
  }, [tempData.height, tempData.weight]);

  const profileCompletion = useMemo(() => {
    const fields = [
      tempData.name,
      tempData.email,
      tempData.phone,
      tempData.gender,
      tempData.address,
      tempData.prakriti,
      tempData.height,
      tempData.weight,
      tempData.dietaryPreference,
      tempData.sleepPattern,
      tempData.exerciseFrequency,
      tempData.medicalConditions,
    ];
    const completed = fields.filter((field) => String(field).trim()).length;
    return Math.round((completed / fields.length) * 100);
  }, [tempData]);

  const backDestination = authRole === "DOCTOR" ? "/Dashboard" : "/Dashboard";
  const latestBmiEntry = tempData.bmiHistory?.[0];

  const handleSave = useCallback(async () => {
    if (!patientId) {
      setSaveError("Unable to save profile: missing patient information.");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const userPayload: Record<string, string> = {};
      if (tempData.name !== profileData.name) userPayload.name = tempData.name;
      if (tempData.phone !== profileData.phone) userPayload.phone = tempData.phone;

      if (Object.keys(userPayload).length > 0) {
        const userResponse = await userApi.updateProfile(userPayload);
        if (!userResponse.success) {
          throw new Error(userResponse.message || "Failed to update user profile.");
        }

        const stored = localStorage.getItem("user");
        if (stored) {
          const updatedUser = { ...JSON.parse(stored), ...userPayload };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          window.dispatchEvent(new Event("loginStateChange"));
        }
      }

      const nextHistory = [...(tempData.bmiHistory || [])];
      const latestDate = new Date().toISOString().slice(0, 10);
      const bmiValue = Number(tempData.bmi);
      if (bmiValue) {
        const alreadyLogged = nextHistory.some(
          (entry) => entry.date === latestDate && Number(entry.value) === bmiValue
        );
        if (!alreadyLogged) {
          nextHistory.unshift({ date: latestDate, value: bmiValue });
        }
      }

      const patientPayload: Record<string, unknown> = {
        age: tempData.age,
        gender: tempData.gender,
        height: tempData.height ? Number(tempData.height) : undefined,
        weight: tempData.weight ? Number(tempData.weight) : undefined,
        bmi: tempData.bmi ? Number(tempData.bmi) : undefined,
        address: tempData.address,
        prakriti: tempData.prakriti,
        vikriti: tempData.vikriti,
        constitution: tempData.constitution,
        bloodPressure: tempData.bloodPressure,
        pulseRate: tempData.pulseRate ? Number(tempData.pulseRate) : undefined,
        dietaryHabits: tempData.dietaryPreference,
        mealFrequency: tempData.mealFrequency,
        bowelMovements: tempData.bowelMovement,
        waterIntake: tempData.waterIntake,
        physicalActivity: tempData.exerciseFrequency,
        stressLevel: tempData.stressLevel,
        medicalConditions: tempData.medicalConditions,
        allergies: tempData.allergies,
        currentMedications: tempData.currentMedications,
        lastConsultation: tempData.lastConsultation,
        bmiHistory: JSON.stringify(nextHistory),
      };

      const patientResponse = await patientApi.updateProfile(patientId, patientPayload);
      if (!patientResponse.success) {
        throw new Error(patientResponse.message || "Failed to save patient profile.");
      }

      const updatedProfile = { ...tempData, bmiHistory: nextHistory };
      setProfileData(updatedProfile);
      setTempData(updatedProfile);
      setIsEditing(false);
      setSaveSuccess("Profile updated successfully.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setSaveError(message || "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  }, [patientId, profileData, tempData]);

  // Cancel editing
  const handleCancel = useCallback(() => {
    setTempData(profileData);
    setIsEditing(false);
    setSaveError("");
    setSaveSuccess("");
  }, [profileData]);

  useEffect(() => {
    const loadProfile = async () => {
      const token = getAuthToken();
      const authUser = getAuthUser();

      if (!token || !authUser) {
        router.replace("/login");
        return;
      }

      setAuthRole(authUser.role);

      const response = await patientApi.getMyProfile();
      if (response.success && response.data?.patient) {
        const patientProfile = response.data.patient as BackendPatient & { id?: string };
        if (patientProfile.id) {
          setPatientId(patientProfile.id);
        }
        const profile = mapPatientProfile(patientProfile);
        setProfileData(profile);
        setTempData(profile);
      } else {
        const fallbackProfile: ProfileData = {
          ...EMPTY_PROFILE,
          name: authUser.name,
          email: authUser.email,
        };
        setProfileData(fallbackProfile);
        setTempData(fallbackProfile);
      }

      setIsLoading(false);
    };

    loadProfile();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,#f4fbf5_0%,#eef5ff_100%)]">
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(187,247,208,0.35),_transparent_35%),linear-gradient(180deg,#f7fdf8_0%,#f4f8ff_100%)]">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-[0_30px_80px_-38px_rgba(22,101,52,0.32)]">
          <div className="grid gap-8 bg-[linear-gradient(135deg,rgba(21,128,61,0.08),rgba(224,242,254,0.55))] px-6 py-8 lg:grid-cols-[1.45fr_0.9fr] lg:px-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-4 py-2 text-sm font-medium text-green-800 shadow-sm backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                Personal wellness profile
              </div>
              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-green-600 text-white shadow-lg shadow-green-700/20">
                  <User className="h-9 w-9" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    {tempData.name || "My Profile"}
                  </h1>
                  <p className="mt-2 max-w-2xl text-base leading-7 text-gray-600">
                    Keep your personal details, health metrics, and lifestyle information in one polished space.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InfoPill icon={Mail} label="Email" value={tempData.email || "Not added"} />
                <InfoPill icon={Phone} label="Phone" value={tempData.phone || "Not added"} />
                <InfoPill icon={MapPin} label="Address" value={tempData.address || "Not added"} />
                <InfoPill icon={Heart} label="Prakriti" value={tempData.prakriti || "Not added"} />
              </div>
            </div>

            <div className="flex flex-col justify-between gap-5">
              <div className="rounded-[1.75rem] border border-white/60 bg-white/85 p-5 shadow-sm backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-green-700">
                      Profile Completion
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                      {profileCompletion}%
                    </p>
                  </div>
                  <Sparkles className="h-6 w-6 text-green-700" />
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-green-100">
                  <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${profileCompletion}%` }} />
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Complete more health and lifestyle details for stronger recommendations.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push(backDestination)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-green-200 hover:text-green-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </button>
                {!isEditing ? (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setTempData(profileData);
                      setSaveError("");
                      setSaveSuccess("");
                    }}
                    className="flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-700/20 transition hover:bg-green-700"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg transition ${isSaving ? "cursor-not-allowed bg-green-400" : "bg-green-600 hover:bg-green-700 shadow-green-700/20"}`}
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Scale} label="Current BMI" value={tempData.bmi || "Not added"} tone="green" />
          <StatCard icon={Heart} label="Stress Level" value={tempData.stressLevel || "Not added"} tone="amber" />
          <StatCard icon={Droplets} label="Water Intake" value={tempData.waterIntake || "Not added"} tone="blue" />
          <StatCard icon={Clock} label="Last Consultation" value={tempData.lastConsultation || "No date added"} tone="rose" />
        </section>

        {(saveError || saveSuccess) && (
          <section className="mt-6 space-y-3">
            {saveError && (
              <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="rounded-[1.5rem] border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
                {saveSuccess}
              </div>
            )}
          </section>
        )}

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-sm">
              <SectionHeader icon={User} title="Personal Information" description="Basic identity and contact details used across your account." />
              <div className="grid gap-5 p-6 md:grid-cols-2">
                <InputField label="Full Name" field="name" value={tempData.name} disabled={!isEditing} placeholder="Enter your name" onChange={handleChange} />
                <InputField label="Age" field="age" type="number" value={tempData.age} disabled={!isEditing} placeholder="Enter age" onChange={handleChange} />
                <InputField label="Gender" field="gender" options={["Male", "Female", "Other"]} value={tempData.gender} disabled={!isEditing} onChange={handleChange} />
                <InputField label="Phone" field="phone" value={tempData.phone} disabled={!isEditing} placeholder="10-digit number" onChange={handleChange} />
                <InputField label="Email" field="email" type="email" value={tempData.email} disabled={true} placeholder="Email address" onChange={handleChange} />
                <InputField label="Address" field="address" value={tempData.address} disabled={!isEditing} placeholder="City, state or full address" onChange={handleChange} />
              </div>
            </section>

            <section className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-sm">
              <SectionHeader icon={Heart} title="Ayurvedic Assessment" description="Your constitution and current imbalance markers for better plan matching." />
              <div className="grid gap-5 p-6 md:grid-cols-2">
                <InputField label="Prakriti" field="prakriti" options={["Vata", "Pitta", "Kapha", "Vata-Pitta", "Pitta-Kapha", "Vata-Kapha"]} value={tempData.prakriti} disabled={!isEditing} onChange={handleChange} />
                <InputField label="Vikriti" field="vikriti" options={["Vata", "Pitta", "Kapha", "Vata-Pitta", "Pitta-Kapha", "Vata-Kapha"]} value={tempData.vikriti} disabled={!isEditing} onChange={handleChange} />
                <InputField label="Body Constitution" field="constitution" options={["Slim", "Medium", "Stocky"]} value={tempData.constitution} disabled={!isEditing} onChange={handleChange} />
              </div>
            </section>

            <section className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-sm">
              <SectionHeader icon={Activity} title="Health Metrics" description="Track your physical measurements and core wellness indicators." />
              <div className="grid gap-5 p-6 md:grid-cols-2">
                <div className="grid gap-5 md:col-span-2 md:grid-cols-3">
                  <InputField label="Height (cm)" field="height" value={tempData.height} disabled={!isEditing} placeholder="e.g. 170" onChange={handleChange} />
                  <InputField label="Weight (kg)" field="weight" value={tempData.weight} disabled={!isEditing} placeholder="e.g. 64" onChange={handleChange} />
                  <InputField label="BMI" field="bmi" value={tempData.bmi} disabled={true} placeholder="Auto calculated" onChange={handleChange} />
                </div>
                <InputField label="Blood Pressure" field="bloodPressure" value={tempData.bloodPressure} disabled={!isEditing} placeholder="e.g. 120/80" onChange={handleChange} />
                <InputField label="Pulse Rate (bpm)" field="pulseRate" value={tempData.pulseRate} disabled={!isEditing} placeholder="e.g. 72" onChange={handleChange} />
              </div>
            </section>

            <section className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-sm">
              <SectionHeader icon={Droplets} title="Dietary And Lifestyle" description="Daily routines and food preferences that shape your recommendations." />
              <div className="grid gap-5 p-6 md:grid-cols-2">
                <InputField label="Dietary Preference" field="dietaryPreference" options={["Vegetarian", "Non-Vegetarian", "Vegan", "Flexitarian"]} value={tempData.dietaryPreference} disabled={!isEditing} onChange={handleChange} />
                <InputField label="Food Allergies" field="allergies" value={tempData.allergies} disabled={!isEditing} placeholder="List key allergies" onChange={handleChange} />
                <InputField label="Meal Frequency" field="mealFrequency" value={tempData.mealFrequency} disabled={!isEditing} placeholder="e.g. 3 meals + 1 snack" onChange={handleChange} />
                <InputField label="Daily Water Intake" field="waterIntake" value={tempData.waterIntake} disabled={!isEditing} placeholder="e.g. 2.5 litres" onChange={handleChange} />
                <InputField label="Sleep Pattern" field="sleepPattern" value={tempData.sleepPattern} disabled={!isEditing} placeholder="e.g. 11 PM to 6 AM" onChange={handleChange} />
                <InputField label="Exercise Frequency" field="exerciseFrequency" value={tempData.exerciseFrequency} disabled={!isEditing} placeholder="e.g. 4 times/week" onChange={handleChange} />
                <InputField label="Stress Level" field="stressLevel" options={["Low", "Moderate", "High", "Very High"]} value={tempData.stressLevel} disabled={!isEditing} onChange={handleChange} />
                <InputField label="Bowel Movement" field="bowelMovement" value={tempData.bowelMovement} disabled={!isEditing} placeholder="Describe your routine" onChange={handleChange} />
              </div>
            </section>

            <section className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-sm">
              <SectionHeader icon={TrendingUp} title="Medical History" description="Important clinical details that may affect your diet and recovery plan." />
              <div className="grid gap-5 p-6 md:grid-cols-2">
                <InputField label="Medical Conditions" field="medicalConditions" value={tempData.medicalConditions} disabled={!isEditing} placeholder="List ongoing conditions" onChange={handleChange} />
                <InputField label="Current Medications" field="currentMedications" value={tempData.currentMedications} disabled={!isEditing} placeholder="List current medicines" onChange={handleChange} />
                <InputField label="Last Consultation" field="lastConsultation" type="date" value={tempData.lastConsultation} disabled={!isEditing} onChange={handleChange} />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green-700">
                Quick Actions
              </p>
              <div className="mt-5 grid gap-4">
                <QuickAction icon={ClipboardList} title="Take Assessment" note="Update your dosha profile and keep your recommendations current." onClick={() => router.push("/assessment")} />
                <QuickAction icon={Salad} title="Open Diet Plan" note="Jump straight to your weekly diet plan and meal recommendations." onClick={() => router.push("/diet-plan")} />
              </div>
            </section>

            <section className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green-700">
                Wellness Snapshot
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-3xl bg-green-50 p-4">
                  <p className="text-sm text-green-700">Primary Constitution</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{tempData.prakriti || "Not added"}</p>
                </div>
                <div className="rounded-3xl bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">Current BMI</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{tempData.bmi || "Auto when height and weight are filled"}</p>
                </div>
                <div className="rounded-3xl bg-amber-50 p-4">
                  <p className="text-sm text-amber-700">Latest BMI Record</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">
                    {latestBmiEntry ? latestBmiEntry.value.toFixed(1) : "No history yet"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {latestBmiEntry ? latestBmiEntry.date : "Saved automatically when you update your profile."}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-green-700">
                BMI History
              </p>
              <div className="mt-5 space-y-3">
                {tempData.bmiHistory.length > 0 ? (
                  tempData.bmiHistory.slice(0, 6).map((entry, idx) => (
                    <div
                      key={`${entry.date}-${idx}`}
                      className="flex items-center justify-between rounded-2xl border border-green-100 bg-green-50 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-gray-700">{entry.date}</span>
                      <span className="text-base font-semibold text-green-700">
                        {entry.value.toFixed(1)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
                    Your BMI history will appear here after you save height and weight updates.
                  </div>
                )}
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
