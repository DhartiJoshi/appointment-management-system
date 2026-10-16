import { useState } from "react";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

const SERVICE_TYPES = ["New Case", "Follow Up", "Consultation", "Other"];
const STATUSES = ["Pending", "Completed", "Cancelled"];

// Build 15-minute slots: 00:00, 00:15, ... 23:45
const TIME_SLOTS = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 15, 30, 45]) {
    const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const label = `${hour12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
    TIME_SLOTS.push({ value, label });
  }
}

const AppointmentForm = ({
  initial,
  doctors,
  onSubmit,
  onCancel,
  loading,
  serverError,
}) => {
  const isEdit = !!initial;

  const [form, setForm] = useState({
    firstName: initial?.firstName || "",
    lastName: initial?.lastName || "",
    mobile: initial?.mobile || "",
    email: initial?.email || "",
    doctor: initial?.doctor?._id || "",
    serviceType: initial?.serviceType || "",
    appointmentDate: initial?.appointmentDate || "",
    appointmentTime: initial?.appointmentTime || "",
    notes: initial?.notes || "",
    status: initial?.status || "Pending",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.mobile.trim()) e.mobile = "Mobile number is required";
    else if (!/^[0-9]{10}$/.test(form.mobile))
      e.mobile = "Mobile number must be exactly 10 digits";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Please enter a valid email";
    if (!form.doctor) e.doctor = "Doctor is required";
    if (!form.serviceType) e.serviceType = "Service type is required";
    if (!form.appointmentDate)
      e.appointmentDate = "Appointment date is required";
    if (!form.appointmentTime)
      e.appointmentTime = "Appointment time is required";
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    onSubmit({
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      notes: form.notes.trim(),
    });
  };

  const Error = ({ name }) =>
    errors[name] ? (
      <p className="mt-1 text-xs text-red-600">{errors[name]}</p>
    ) : null;

  // Active doctors for new bookings; on edit also keep the current doctor
  const doctorOptions = doctors.filter(
    (d) => d.status === "Active" || d._id === initial?.doctor?._id,
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">
            First Name
          </label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className={inputClass}
          />
          <Error name="firstName" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Last Name
          </label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className={inputClass}
          />
          <Error name="lastName" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Mobile Number
          </label>
          <input
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            maxLength={10}
            className={inputClass}
          />
          <Error name="mobile" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
          />
          <Error name="email" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Doctor</label>
          <select
            name="doctor"
            value={form.doctor}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select doctor</option>
            {doctorOptions.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.specialization})
              </option>
            ))}
          </select>
          <Error name="doctor" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Service Type
          </label>
          <select
            name="serviceType"
            value={form.serviceType}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select service type</option>
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Error name="serviceType" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Appointment Date
          </label>
          <input
            type="date"
            name="appointmentDate"
            value={form.appointmentDate}
            onChange={handleChange}
            className={inputClass}
          />
          <Error name="appointmentDate" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Appointment Time
          </label>
          <select
            name="appointmentTime"
            value={form.appointmentTime}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select time</option>
            {TIME_SLOTS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <Error name="appointmentTime" />
        </div>
      </div>

      {isEdit && (
        <div>
          <label className="text-sm font-medium text-slate-700">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={inputClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-slate-700">Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          className={inputClass}
        />
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

export default AppointmentForm;
