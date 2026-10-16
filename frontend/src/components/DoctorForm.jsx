import { useState } from "react";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

const DoctorForm = ({ initial, onSubmit, onCancel, loading, serverError }) => {
  const [form, setForm] = useState({
    name: initial?.name || "",
    specialization: initial?.specialization || "",
    status: initial?.status || "Active",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Doctor name is required";
    if (!form.specialization.trim())
      newErrors.specialization = "Specialization is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit({
      name: form.name.trim(),
      specialization: form.specialization.trim(),
      status: form.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">
          Doctor Name
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Dr. Anita Sharma"
          className={inputClass}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Specialization
        </label>
        <input
          name="specialization"
          value={form.specialization}
          onChange={handleChange}
          placeholder="Cardiologist"
          className={inputClass}
        />
        {errors.specialization && (
          <p className="mt-1 text-xs text-red-600">{errors.specialization}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default DoctorForm;
