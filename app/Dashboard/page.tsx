"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FiPlus,
  FiUsers,
  FiActivity,
  FiAlertTriangle,
  FiRefreshCw,
  FiClipboard,
  FiUser,
  FiSearch,
  FiArrowRight,
} from "react-icons/fi";
import Navbar from "../components/Navbar";
import { getAuthUser, getAuthToken, clearAuthSession, patientApi } from "../lib/api";

type Patient = {
  id: string;
  name: string;
  age?: number;
  sex?: "M" | "F" | "O";
  dosha: "Vata" | "Pitta" | "Kapha" | "Mixed";
  status: "On Plan" | "Follow-up Due" | "New" | "Completed";
  adherence?: number;
};

type NewPatientForm = {
  name: string;
  email: string;
  password: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  dosha: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(getAuthUser());
  const [isLoading, setIsLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [doshaFilter, setDoshaFilter] = useState<"" | Patient["dosha"]>("");
  const [statusFilter, setStatusFilter] = useState<"" | Patient["status"]>("");
  const [showAdd, setShowAdd] = useState(false);
  const [newPatient, setNewPatient] = useState<NewPatientForm>({
    name: "",
    email: "",
    password: "patient123",
    age: 25,
    gender: "Male",
    height: 165,
    weight: 60,
    dosha: "Vata",
  });
  const [message, setMessage] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [assessmentDone, setAssessmentDone] = useState<boolean>(false);
  const [dietPlanAssigned, setDietPlanAssigned] = useState<boolean>(false);
  const [patientStatusLoading, setPatientStatusLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    const storedUser = getAuthUser();
    if (!storedUser) {
      clearAuthSession();
      router.replace('/login');
      return;
    }

    setUser(storedUser);
    setIsLoading(false);
  }, [router]);

  type RawDoctorPatient = {
    id: string;
    user?: { name?: string };
    age?: number;
    gender?: string;
    dosha?: string;
  };

  useEffect(() => {
    if (!user || user.role !== 'DOCTOR') return;

    async function fetchPatients() {
      const response = await patientApi.getDoctorPatients();
      if (response.success && response.data) {
        const doctorPatients = ((response.data as { patients?: unknown }).patients ?? []) as RawDoctorPatient[];
        const normalized = doctorPatients.map((patient) => ({
          id: patient.id,
          name: patient.user?.name || 'Unnamed Patient',
          age: patient.age || undefined,
          sex: (
            patient.gender === 'Male'
              ? 'M'
              : patient.gender === 'Female'
              ? 'F'
              : 'O'
          ) as Patient['sex'],
          dosha: (patient.dosha as Patient['dosha']) || 'Vata',
          status: 'New' as Patient['status'],
          adherence: 0,
        }));
        setPatients(normalized);
      } else {
        setPatients([]);
      }
    }

    fetchPatients();
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'PATIENT') return;

    const loadPatientStatus = async () => {
      setPatientStatusLoading(true);
      const response = await patientApi.getMyProfile();
      if (response.success && response.data?.patient) {
        const patient = response.data.patient as {
          assessments?: unknown;
          dietPlans?: unknown;
        };
        setAssessmentDone(
          Array.isArray(patient.assessments) && patient.assessments.length > 0
        );
        setDietPlanAssigned(
          Array.isArray(patient.dietPlans) && patient.dietPlans.length > 0
        );
      }
      setPatientStatusLoading(false);
    };

    loadPatientStatus();
  }, [user]);

  const filteredPatients = useMemo(
    () =>
      patients.filter((patient) => {
        if (query && !patient.name.toLowerCase().includes(query.toLowerCase())) return false;
        if (doshaFilter && patient.dosha !== doshaFilter) return false;
        if (statusFilter && patient.status !== statusFilter) return false;
        return true;
      }),
    [patients, query, doshaFilter, statusFilter]
  );

  const totals = useMemo(
    () => ({
      totalPatients: patients.length,
      activePlans: patients.filter((p) => p.status === 'On Plan').length,
      followUps: patients.filter((p) => p.status === 'Follow-up Due').length,
      alerts: patients.filter((p) => (p.adherence ?? 0) < 50).length,
    }),
    [patients]
  );

  const handleAddPatient = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    setMessage('');

    if (!newPatient.name.trim() || !newPatient.email.trim()) {
      setFormError('Name and email are required.');
      return;
    }

    const response = await patientApi.createPatient({
      email: newPatient.email,
      name: newPatient.name,
      password: newPatient.password,
      age: newPatient.age,
      gender: newPatient.gender,
      height: newPatient.height,
      weight: newPatient.weight,
      dosha: newPatient.dosha,
    });

    if (!response.success) {
      setFormError(response.message || 'Unable to add patient.');
      return;
    }

    const patient = (response.data as { patient?: {
      id: string;
      user: { name: string };
      age?: number;
      gender?: string;
      dosha?: string;
    } }).patient;
    if (patient) {
      setPatients((current) => [
        {
          id: patient.id,
          name: patient.user.name,
          age: patient.age,
          sex: (
            patient.gender === 'Male'
              ? 'M'
              : patient.gender === 'Female'
              ? 'F'
              : 'O'
          ) as Patient['sex'],
          dosha: (patient.dosha as Patient['dosha']) || 'Vata',
          status: 'New' as Patient['status'],
          adherence: 0,
        },
        ...current,
      ]);
      setShowAdd(false);
      setNewPatient({
        name: '',
        email: '',
        password: 'patient123',
        age: 25,
        gender: 'Male',
        height: 165,
        weight: 60,
        dosha: 'Vata',
      });
      setMessage('Patient added successfully.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role === 'PATIENT') {
    const dietPlanCompleted = dietPlanAssigned || assessmentDone;
    const assessmentTitle = assessmentDone ? 'Completed' : 'Pending';
    const assessmentNote = assessmentDone
      ? 'Your assessment has been completed.'
      : 'Complete the quiz to generate your plan.';

    const dietPlanTitle = dietPlanCompleted ? 'Completed' : 'Not assigned';
    const dietPlanNote = dietPlanCompleted
      ? 'Your weekly diet plan is ready. Open it now to review your meals.'
      : 'Your weekly diet will appear here after a plan is created.';

    const dashboardNote = dietPlanCompleted
      ? 'Your assessment is complete and your weekly diet plan is ready. Open it below.'
      : 'Your personal dashboard is ready. Complete an assessment to receive a diet plan or ask your doctor to assign one.';

    const primaryActionHref = dietPlanCompleted
      ? '/diet-plan'
      : '/assessment';
    const primaryActionLabel = dietPlanCompleted
      ? 'View Your Diet Plan'
      : 'Take Assessment';

    if (patientStatusLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      );
    }

    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(187,247,208,0.25),_transparent_30%),linear-gradient(180deg,#f8fdf8_0%,#f3f6fb_100%)] p-6">
          <section className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[1.7fr_0.9fr]">
            <div className="space-y-6">
              <div className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-[0_24px_70px_-36px_rgba(22,101,52,0.32)]">
                <div className="bg-[linear-gradient(135deg,rgba(21,128,61,0.08),rgba(224,242,254,0.5))] p-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/85 px-4 py-2 text-sm font-medium text-green-800 shadow-sm">
                    <FiClipboard />
                    Personal dashboard
                  </div>
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}.</h1>
                      <p className="mt-3 max-w-2xl text-gray-600">{dashboardNote}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={() => router.push(primaryActionHref)}
                        className="rounded-full bg-green-600 px-6 py-3 text-white font-semibold transition hover:bg-green-700"
                      >
                        {primaryActionLabel}
                      </button>
                      <button
                        onClick={() => router.push('/profile')}
                        className="rounded-full border border-green-600 bg-white px-6 py-3 text-green-700 font-semibold transition hover:bg-green-50"
                      >
                        Manage Profile
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-green-100 p-8 sm:grid-cols-2">
                  <PatientCard title="Assessment" value={assessmentTitle} note={assessmentNote} color="green" />
                  <PatientCard title="Diet Plan" value={dietPlanTitle} note={dietPlanNote} color="blue" />
                </div>
              </div>

              <section className="bg-white rounded-[2rem] border border-green-100 shadow-sm p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Quick Actions</h2>
                    <p className="mt-2 text-gray-600">Access the most important steps in one place.</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <DashboardActionCard
                    onClick={() => router.push(assessmentDone ? '/diet-plan' : '/assessment')}
                    title={assessmentDone ? 'Open Diet Plan' : 'Dosha Assessment'}
                    note={assessmentDone
                      ? 'Your assessment is complete. Go straight to your weekly diet plan.'
                      : 'Finish your quiz for a tailored diet plan.'}
                    icon={<FiClipboard className="text-green-700 text-xl" />}
                    tone="green"
                  />
                  <DashboardActionCard
                    onClick={() => router.push('/diet-plan')}
                    title="Weekly Diet Plan"
                    note="Review your current meal recommendations and daily meal structure."
                    icon={<FiActivity className="text-sky-700 text-xl" />}
                    tone="blue"
                  />
                  <DashboardActionCard
                    onClick={() => router.push('/contact')}
                    title="Need Help?"
                    note="Contact support or ask your doctor for guidance if anything feels unclear."
                    icon={<FiUsers className="text-amber-700 text-xl" />}
                    tone="amber"
                  />
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <div className="bg-white rounded-[2rem] border border-green-100 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Progress</h2>
                <p className="mt-2 text-gray-600">Quick overview of your current milestones.</p>
                <div className="mt-6 grid gap-4">
                  <div className="rounded-3xl bg-green-50 p-5">
                    <p className="text-sm text-green-700">Assessment Status</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{assessmentTitle}</p>
                  </div>
                  <div className="rounded-3xl bg-blue-50 p-5">
                    <p className="text-sm text-blue-700">Diet Plan Status</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{dietPlanTitle}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-green-100 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900">Navigation</h2>
                <div className="mt-5 grid gap-3">
                  <button
                    onClick={() => router.push('/assessment')}
                    className="rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-900 transition hover:bg-white"
                  >Assessment</button>
                  <button
                    onClick={() => router.push('/diet-plan')}
                    className="rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-900 transition hover:bg-white"
                  >Diet Plan</button>
                  <button
                    onClick={() => router.push('/profile')}
                    className="rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-900 transition hover:bg-white"
                  >Profile</button>
                </div>
              </div>
            </aside>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(187,247,208,0.25),_transparent_30%),linear-gradient(180deg,#f8fdf8_0%,#f3f6fb_100%)]">
        <main className="flex-1 p-6 space-y-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <section className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-[0_24px_70px_-36px_rgba(22,101,52,0.32)]">
              <div className="grid gap-6 bg-[linear-gradient(135deg,rgba(21,128,61,0.08),rgba(224,242,254,0.55))] p-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/85 px-4 py-2 text-sm font-medium text-green-800 shadow-sm">
                    <FiUser />
                    Doctor workspace
                  </div>
                  <h1 className="mt-4 text-3xl font-bold text-gray-900">
                    Dr. {user.name}&apos;s Dashboard
                  </h1>
                  <p className="mt-3 max-w-2xl text-gray-600">
                    Manage patients, create plans, and stay on top of follow-ups from one clean workspace.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white/90 p-5 shadow-sm">
                    <p className="text-sm text-green-700">Patient Records</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{totals.totalPatients}</p>
                  </div>
                  <div className="rounded-3xl bg-white/90 p-5 shadow-sm">
                    <p className="text-sm text-blue-700">Active Plans</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">{totals.activePlans}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard title="Total Patients" value={totals.totalPatients} icon={<FiUsers className="text-green-600 text-2xl" />} />
              <StatCard title="Active Plans" value={totals.activePlans} icon={<FiActivity className="text-blue-600 text-2xl" />} />
              <StatCard title="Follow-ups" value={totals.followUps} icon={<FiRefreshCw className="text-yellow-500 text-2xl" />} />
              <StatCard title="Alerts" value={totals.alerts} icon={<FiAlertTriangle className="text-red-500 text-2xl" />} />
            </section>

            <section className="rounded-[2rem] border border-green-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Patient Management</h2>
                  <p className="mt-2 text-gray-600">Search, filter, and jump into patient records or plan creation quickly.</p>
                </div>
                <button
                  onClick={() => setShowAdd(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-700/20 transition hover:bg-green-700"
                >
                  <FiPlus />
                  Add Patient
                </button>
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.6fr_0.6fr]">
                <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <FiSearch className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                  />
                </label>
                <select value={doshaFilter} onChange={(e) => setDoshaFilter(e.target.value as Patient["dosha"] | "")} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none">
                  <option value="">All Doshas</option>
                  <option value="Vata">Vata</option>
                  <option value="Pitta">Pitta</option>
                  <option value="Kapha">Kapha</option>
                  <option value="Mixed">Mixed</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Patient["status"] | "")} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none">
                  <option value="">All Status</option>
                  <option value="New">New</option>
                  <option value="On Plan">On Plan</option>
                  <option value="Follow-up Due">Follow-up Due</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </section>

            <section className="bg-white p-6 rounded-[2rem] border border-green-100 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Patient List</h2>
                  <p className="text-gray-500 mt-1">View patient details and assign diet plans.</p>
                </div>
                <span className="inline-flex w-fit rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                  {filteredPatients.length} results
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-3 text-sm">
                  <thead>
                    <tr className="text-gray-500">
                      <th className="p-3 text-left font-medium">Name</th>
                      <th className="p-3 font-medium">Age / Sex</th>
                      <th className="p-3 font-medium">Dosha</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Adherence</th>
                      <th className="p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="rounded-3xl bg-gray-50 shadow-sm">
                        <td className="rounded-l-2xl p-4 font-medium text-gray-800">{patient.name}</td>
                        <td className="p-4 text-center text-gray-600">{patient.age ?? '-'} / {patient.sex}</td>
                        <td className="p-4 text-center text-gray-600">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                            {patient.dosha}
                          </span>
                        </td>
                        <td className="p-4 text-center text-gray-600">{patient.status}</td>
                        <td className="p-4">
                          <div className="w-28 bg-gray-200 rounded-full h-2 overflow-hidden mx-auto">
                            <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${patient.adherence ?? 0}%`, background: patient.adherence ?? 0 >= 75 ? '#10b981' : patient.adherence ?? 0 >= 50 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                          <span className="text-xs text-gray-400 mt-2 block text-center">{patient.adherence ?? 0}%</span>
                        </td>
                        <td className="rounded-r-2xl p-4">
                          <div className="flex gap-2 justify-center">
                            <button onClick={() => router.push(`/patient-details?patientId=${patient.id}`)} className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100">View</button>
                            <button onClick={() => router.push('/diet-doc')} className="rounded-full bg-green-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-green-700">Create Plan</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredPatients.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">No patients assigned yet. Add a patient to begin.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <form onSubmit={handleAddPatient} className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Add New Patient</h3>
              <button type="button" onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-gray-900">Cancel</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input value={newPatient.name} onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} placeholder="Full Name" className="border rounded-xl px-4 py-3" required />
              <input value={newPatient.email} onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })} placeholder="Email" type="email" className="border rounded-xl px-4 py-3" required />
              <input value={newPatient.password} onChange={(e) => setNewPatient({ ...newPatient, password: e.target.value })} placeholder="Temporary Password" type="password" className="border rounded-xl px-4 py-3" required />
              <select value={newPatient.gender} onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })} className="border rounded-xl px-4 py-3">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <input value={newPatient.age} onChange={(e) => setNewPatient({ ...newPatient, age: Number(e.target.value) })} placeholder="Age" type="number" min={1} className="border rounded-xl px-4 py-3" />
              <input value={newPatient.height} onChange={(e) => setNewPatient({ ...newPatient, height: Number(e.target.value) })} placeholder="Height (cm)" type="number" min={1} className="border rounded-xl px-4 py-3" />
              <input value={newPatient.weight} onChange={(e) => setNewPatient({ ...newPatient, weight: Number(e.target.value) })} placeholder="Weight (kg)" type="number" min={1} className="border rounded-xl px-4 py-3" />
              <select value={newPatient.dosha} onChange={(e) => setNewPatient({ ...newPatient, dosha: e.target.value })} className="border rounded-xl px-4 py-3">
                <option>Vata</option>
                <option>Pitta</option>
                <option>Kapha</option>
              </select>
            </div>
            {formError && <p className="text-sm text-red-600 mt-4">{formError}</p>}
            {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-3 rounded-xl border border-gray-300">Cancel</button>
              <button type="submit" className="px-5 py-3 rounded-xl bg-green-600 text-white">Add Patient</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function PatientCard({
  title,
  value,
  note,
  color,
}: {
  title: string;
  value: string;
  note: string;
  color: 'green' | 'blue';
}) {
  return (
    <div className={`rounded-[1.75rem] border p-6 shadow-sm ${
      color === 'green'
        ? 'border-green-100 bg-[linear-gradient(180deg,#f4fbf5_0%,#ffffff_100%)]'
        : 'border-blue-100 bg-[linear-gradient(180deg,#f3f8ff_0%,#ffffff_100%)]'
    }`}>
      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
        color === 'green' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
      }`}>
        {title}
      </div>
      <p className="mt-4 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-3 text-sm leading-6 text-gray-600">{note}</p>
    </div>
  );
}

function DashboardActionCard({
  onClick,
  title,
  note,
  icon,
  tone,
}: {
  onClick: () => void;
  title: string;
  note: string;
  icon: React.ReactNode;
  tone: 'green' | 'blue' | 'amber';
}) {
  const toneClasses = {
    green: 'bg-emerald-50 border-emerald-100',
    blue: 'bg-sky-50 border-sky-100',
    amber: 'bg-amber-50 border-amber-100',
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-[1.5rem] border p-5 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm ${toneClasses[tone]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
          {icon}
        </div>
        <FiArrowRight className="mt-1 text-gray-400" />
      </div>
      <p className="mt-4 text-base font-semibold text-gray-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-gray-600">{note}</p>
    </button>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-gray-50 p-3">{icon}</div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
