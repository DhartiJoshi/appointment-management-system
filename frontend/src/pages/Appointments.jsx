import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import AppointmentForm from "../components/AppointmentForm";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

const statusBadge = (status) =>
  ({
    Pending: "bg-amber-100 text-amber-700",
    Completed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  })[status] || "bg-slate-100 text-slate-600";

const formatTime = (t) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

const formatDate = (d) => {
  const [y, m, day] = d.split("-");
  return `${day}-${m}-${y}`;
};

const emptyFilters = {
  search: "",
  doctor: "",
  status: "",
  fromDate: "",
  toDate: "",
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  // modal = { type: "add" | "edit" | "view" | "delete", appointment? }
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const fetchAppointments = async (activeFilters = filters) => {
    try {
      const params = {};
      Object.entries(activeFilters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });
      const { data } = await api.get("/appointments", { params });
      setAppointments(data.data);
      setPageError("");
    } catch (err) {
      setPageError(
        err.response?.data?.message || "Failed to load appointments",
      );
    } finally {
      setLoading(false);
    }
  };

  // load doctors once (for the filter and the form)
  useEffect(() => {
    api.get("/doctors").then(({ data }) => setDoctors(data.data));
  }, []);

  // reload whenever filters change (small delay while typing in search)
  useEffect(() => {
    const timer = setTimeout(() => fetchAppointments(filters), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilter = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const closeModal = () => {
    setModal(null);
    setServerError("");
  };

  const handleSave = async (values) => {
    try {
      setSaving(true);
      setServerError("");
      if (modal.type === "edit") {
        await api.put(`/appointments/${modal.appointment._id}`, values);
      } else {
        await api.post("/appointments", values);
      }
      closeModal();
      fetchAppointments();
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await api.delete(`/appointments/${modal.appointment._id}`);
      closeModal();
      fetchAppointments();
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to delete");
    } finally {
      setSaving(false);
    }
  };

  const a = modal?.appointment;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Appointments</h2>
        <button
          onClick={() => setModal({ type: "add" })}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add Appointment
        </button>
      </div>

      {/* Search and filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
        <input
          name="search"
          value={filters.search}
          onChange={handleFilter}
          placeholder="Search patient name or mobile"
          className={`${inputClass} lg:col-span-2`}
        />
        <select
          name="doctor"
          value={filters.doctor}
          onChange={handleFilter}
          className={inputClass}
        >
          <option value="">All doctors</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          value={filters.status}
          onChange={handleFilter}
          className={inputClass}
        >
          <option value="">All status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          name="fromDate"
          value={filters.fromDate}
          onChange={handleFilter}
          title="From date"
          className={inputClass}
        />
        <input
          type="date"
          name="toDate"
          value={filters.toDate}
          onChange={handleFilter}
          title="To date"
          className={inputClass}
        />
        <button
          onClick={() => setFilters(emptyFilters)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:col-span-2 lg:col-span-6 lg:justify-self-end"
        >
          Clear filters
        </button>
      </div>

      {pageError && (
        <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {pageError}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Patient Name</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Service Type</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Loading...
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No appointments found
                </td>
              </tr>
            ) : (
              appointments.map((ap) => (
                <tr key={ap._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {ap.firstName} {ap.lastName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {ap.doctor?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{ap.serviceType}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(ap.appointmentDate)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatTime(ap.appointmentTime)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(ap.status)}`}
                    >
                      {ap.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      onClick={() =>
                        setModal({ type: "view", appointment: ap })
                      }
                      className="mr-3 text-slate-600 hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() =>
                        setModal({ type: "edit", appointment: ap })
                      }
                      className="mr-3 text-indigo-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setModal({ type: "delete", appointment: ap })
                      }
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(modal?.type === "add" || modal?.type === "edit") && (
        <Modal
          title={modal.type === "add" ? "Add Appointment" : "Edit Appointment"}
          onClose={closeModal}
        >
          <AppointmentForm
            initial={modal.appointment}
            doctors={doctors}
            onSubmit={handleSave}
            onCancel={closeModal}
            loading={saving}
            serverError={serverError}
          />
        </Modal>
      )}

      {modal?.type === "view" && (
        <Modal title="Appointment Details" onClose={closeModal}>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {[
              ["Patient", `${a.firstName} ${a.lastName}`],
              ["Mobile", a.mobile],
              ["Email", a.email],
              ["Doctor", a.doctor?.name || "—"],
              ["Service Type", a.serviceType],
              ["Status", a.status],
              ["Date", formatDate(a.appointmentDate)],
              ["Time", formatTime(a.appointmentTime)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-slate-500">{label}</dt>
                <dd className="break-words font-medium text-slate-900">
                  {value}
                </dd>
              </div>
            ))}
            <div className="col-span-2">
              <dt className="text-slate-500">Notes</dt>
              <dd className="font-medium text-slate-900">{a.notes || "—"}</dd>
            </div>
          </dl>
          <div className="mt-6 flex justify-end">
            <button
              onClick={closeModal}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {modal?.type === "delete" && (
        <ConfirmDialog
          message={`Are you sure you want to delete the appointment of ${a.firstName} ${a.lastName}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={closeModal}
          loading={saving}
        />
      )}
    </div>
  );
};

export default Appointments;
