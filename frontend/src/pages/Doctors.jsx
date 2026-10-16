import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import DoctorForm from "../components/DoctorForm";

const statusBadge = (status) =>
  status === "Active"
    ? "bg-green-100 text-green-700"
    : "bg-slate-200 text-slate-600";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  // modal = { type: "add" | "edit" | "view" | "delete", doctor? }
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get("/doctors");
      setDoctors(data.data);
      setPageError("");
    } catch (err) {
      setPageError(err.response?.data?.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const closeModal = () => {
    setModal(null);
    setServerError("");
  };

  const handleSave = async (values) => {
    try {
      setSaving(true);
      setServerError("");
      if (modal.type === "edit") {
        await api.put(`/doctors/${modal.doctor._id}`, values);
      } else {
        await api.post("/doctors", values);
      }
      closeModal();
      fetchDoctors();
    } catch (err) {
      setServerError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await api.delete(`/doctors/${modal.doctor._id}`);
      closeModal();
      fetchDoctors();
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to delete");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Doctors</h2>
        <button
          onClick={() => setModal({ type: "add" })}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add Doctor
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
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Doctor Name</th>
              <th className="px-4 py-3">Specialization</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Loading...
                </td>
              </tr>
            ) : doctors.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No doctors found
                </td>
              </tr>
            ) : (
              doctors.map((d, i) => (
                <tr key={d._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {d.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {d.specialization}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(d.status)}`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setModal({ type: "view", doctor: d })}
                      className="mr-3 text-slate-600 hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setModal({ type: "edit", doctor: d })}
                      className="mr-3 text-indigo-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setModal({ type: "delete", doctor: d })}
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
          title={modal.type === "add" ? "Add Doctor" : "Edit Doctor"}
          onClose={closeModal}
        >
          <DoctorForm
            initial={modal.doctor}
            onSubmit={handleSave}
            onCancel={closeModal}
            loading={saving}
            serverError={serverError}
          />
        </Modal>
      )}

      {modal?.type === "view" && (
        <Modal title="Doctor Details" onClose={closeModal}>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Doctor Name</dt>
              <dd className="font-medium text-slate-900">
                {modal.doctor.name}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Specialization</dt>
              <dd className="font-medium text-slate-900">
                {modal.doctor.specialization}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium text-slate-900">
                {modal.doctor.status}
              </dd>
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
          message={`Are you sure you want to delete ${modal.doctor.name}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={closeModal}
          loading={saving}
          error={serverError}
        />
      )}
    </div>
  );
};

export default Doctors;
