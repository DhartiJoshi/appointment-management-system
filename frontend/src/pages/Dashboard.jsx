import { useEffect, useState } from "react";
import api from "../api/axios";

const inputClass =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

const CARDS = [
  {
    key: "totalDoctors",
    label: "Total Doctors",
    color: "bg-indigo-50 text-indigo-700",
  },
  {
    key: "totalAppointments",
    label: "Total Appointments",
    color: "bg-sky-50 text-sky-700",
  },
  {
    key: "pendingAppointments",
    label: "Pending Appointments",
    color: "bg-amber-50 text-amber-700",
  },
  {
    key: "completedAppointments",
    label: "Completed Appointments",
    color: "bg-green-50 text-green-700",
  },
  {
    key: "cancelledAppointments",
    label: "Cancelled Appointments",
    color: "bg-red-50 text-red-700",
  },
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ fromDate: "", toDate: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filters.fromDate) params.fromDate = filters.fromDate;
        if (filters.toDate) params.toDate = filters.toDate;
        const { data } = await api.get("/dashboard", { params });
        setStats(data.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]);

  const handleChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>

        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-slate-600">From</label>
          <input
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleChange}
            className={inputClass}
          />
          <label className="text-sm text-slate-600">To</label>
          <input
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={handleChange}
            className={inputClass}
          />
          <button
            onClick={() => setFilters({ fromDate: "", toDate: "" })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => (
          <div
            key={c.key}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{c.label}</p>
            <p
              className={`mt-2 inline-block rounded-lg px-3 py-1 text-3xl font-bold ${c.color}`}
            >
              {loading || !stats ? "–" : stats[c.key]}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Date range filters the appointment counts. Total Doctors is not
        date-based.
      </p>
    </div>
  );
};

export default Dashboard;
