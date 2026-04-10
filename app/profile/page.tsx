"use client";

import React, { useState, useCallback, useEffect } from "react";
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

// Section Header Component
const SectionHeader = ({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) => (
  <div className="flex items-center bg-gray-100 px-4 py-2 border-b border-gray-200">
    <Icon className="w-5 h-5 text-green-600 mr-2" />
    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
  </div>
);

// Basic Input Component
const InputField = ({
  label,
  field,
  value,
  type = "text",
  options = null,
  disabled,
  onChange,
}: {
  label: string;
  field: ProfileField;
  value: string | number;
  type?: string;
  options?: string[] | null;
  disabled: boolean;
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-600"
        >
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-600"
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
  const [patientId, setPatientId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
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
  });

  const [tempData, setTempData] = useState<ProfileData>(profileData);

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

  const handleSave = useCallback(async () => {
    if (!patientId) {
      setSaveError("Unable to save profile: missing patient information.");
      return;
    }

    setIsSaving(true);
    setSaveError("");

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
        }
      }

      const patientPayload: Record<string, unknown> = {
        age: tempData.age,
        gender: tempData.gender,
        height: tempData.height ? Number(tempData.height) : undefined,
        weight: tempData.weight ? Number(tempData.weight) : undefined,
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
        bmiHistory: JSON.stringify(tempData.bmiHistory || []),
      };

      const patientResponse = await patientApi.updateProfile(patientId, patientPayload);
      if (!patientResponse.success) {
        throw new Error(patientResponse.message || "Failed to save patient profile.");
      }

      setProfileData(tempData);
      setIsEditing(false);
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
  }, [profileData]);

  useEffect(() => {
    const loadProfile = async () => {
      const token = getAuthToken();
      const authUser = getAuthUser();

      if (!token || !authUser) {
        router.replace("/login");
        return;
      }

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
          name: authUser.name,
          age: 0,
          gender: authUser.role === "PATIENT" ? "" : "",
          phone: "",
          email: authUser.email,
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
        setProfileData(fallbackProfile);
        setTempData(fallbackProfile);
      }

      setIsLoading(false);
    };

    loadProfile();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            {!isEditing ? (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setTempData(profileData);
                }}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-lg transition shadow-lg font-medium"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center space-x-2 rounded-lg px-6 py-2 transition shadow-lg font-medium text-white ${isSaving ? 'bg-green-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'}`}
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition shadow-lg font-medium"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {saveError && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">
            {saveError}
          </div>
        )}
        {/* Personal Information */}
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <SectionHeader icon={User} title="Personal Information" />
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Full Name"
              field="name"
              value={tempData.name}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Age"
              field="age"
              type="number"
              value={tempData.age}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Gender"
              field="gender"
              options={["Male", "Female", "Other"]}
              value={tempData.gender}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Phone"
              field="phone"
              value={tempData.phone}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Email"
              field="email"
              type="email"
              value={tempData.email}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Address"
              field="address"
              value={tempData.address}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Ayurvedic Assessment */}
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <SectionHeader icon={Heart} title="Ayurvedic Assessment" />
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Prakriti (Constitution)"
              field="prakriti"
              options={["Vata", "Pitta", "Kapha", "Vata-Pitta", "Pitta-Kapha", "Vata-Kapha"]}
              value={tempData.prakriti}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Vikriti (Current Imbalance)"
              field="vikriti"
              options={["Vata", "Pitta", "Kapha", "Vata-Pitta", "Pitta-Kapha", "Vata-Kapha"]}
              value={tempData.vikriti}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Body Constitution"
              field="constitution"
              options={["Slim", "Medium", "Stocky"]}
              value={tempData.constitution}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Health Metrics */}
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <SectionHeader icon={Activity} title="Health Metrics" />
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Height (cm)"
                field="height"
                value={tempData.height}
                disabled={!isEditing}
                onChange={handleChange}
              />
              <InputField
                label="Weight (kg)"
                field="weight"
                value={tempData.weight}
                disabled={!isEditing}
                onChange={handleChange}
              />
              <InputField
                label="BMI"
                field="bmi"
                value={tempData.bmi}
                disabled={!isEditing}
                onChange={handleChange}
              />
            </div>
            <InputField
              label="Blood Pressure"
              field="bloodPressure"
              value={tempData.bloodPressure}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Pulse Rate (bpm)"
              field="pulseRate"
              value={tempData.pulseRate}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Dietary & Lifestyle */}
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <SectionHeader icon={Droplets} title="Dietary & Lifestyle" />
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Dietary Preference"
              field="dietaryPreference"
              options={["Vegetarian", "Non-Vegetarian", "Vegan", "Flexitarian"]}
              value={tempData.dietaryPreference}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Food Allergies"
              field="allergies"
              value={tempData.allergies}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Meal Frequency"
              field="mealFrequency"
              value={tempData.mealFrequency}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Daily Water Intake"
              field="waterIntake"
              value={tempData.waterIntake}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Sleep Pattern"
              field="sleepPattern"
              value={tempData.sleepPattern}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Exercise Frequency"
              field="exerciseFrequency"
              value={tempData.exerciseFrequency}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Stress Level"
              field="stressLevel"
              options={["Low", "Moderate", "High", "Very High"]}
              value={tempData.stressLevel}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Bowel Movement"
              field="bowelMovement"
              value={tempData.bowelMovement}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Medical History */}
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <SectionHeader icon={TrendingUp} title="Medical History" />
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Medical Conditions"
              field="medicalConditions"
              value={tempData.medicalConditions}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Current Medications"
              field="currentMedications"
              value={tempData.currentMedications}
              disabled={!isEditing}
              onChange={handleChange}
            />
            <InputField
              label="Last Consultation"
              field="lastConsultation"
              type="date"
              value={tempData.lastConsultation}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* BMI History Chart */}
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <SectionHeader icon={Clock} title="BMI History" />
          <div className="p-6">
            <div className="space-y-3">
              {tempData.bmiHistory.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <span className="font-medium text-gray-700">{entry.date}</span>
                  <span className="text-lg font-bold text-green-600">
                    {entry.value.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
