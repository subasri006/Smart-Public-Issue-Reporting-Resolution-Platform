import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  Layers, 
  Plus, 
  Edit2, 
  CheckCircle2, 
  XCircle, 
  X, 
  AlertCircle, 
  Zap,
  HelpCircle
} from 'lucide-react';

export const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    weight: 15,
    icon: 'Layers',
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories?onlyActive=false');
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      weight: 15,
      icon: 'Layers',
      active: true,
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      code: cat.code,
      description: cat.description || '',
      weight: cat.weight,
      icon: cat.icon || 'Layers',
      active: cat.active,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      await api.put(`/categories/${cat.id}`, {
        ...cat,
        active: !cat.active
      });
      fetchCategories();
    } catch (err) {
      alert("Failed to toggle category active status");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
            Priority Engine Rules
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Complaint Categories & Priority Weights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure municipal categories and the numerical weights assigned in priority score calculations.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
        <Zap className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>How Category Weights Work:</strong> In CivicFix's rule-based formula, <code>priority_score = severity_weight + age_weight + category_weight</code>. Categories with higher weights (e.g. Public Safety = 30 pts, Water = 25 pts) naturally elevate tickets in staff dispatch queues.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((c) => (
          <div
            key={c.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {c.code}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Weight: {c.weight} pts
                  </span>
                  {c.active ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-rose-500" title="Inactive"></span>
                  )}
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                {c.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => handleToggleActive(c)}
                className={`font-semibold ${
                  c.active ? 'text-slate-500 hover:text-slate-800' : 'text-emerald-600 hover:text-emerald-700'
                }`}
              >
                {c.active ? 'Disable' : 'Enable'}
              </button>

              <button
                onClick={() => openEditModal(c)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Rule
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Water Supply Leaks"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unique Code *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCategory}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="WATER"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-mono disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority Weight (1-50) *</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain what civic issues fall under this category..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="activeCheck" className="font-semibold text-slate-800 cursor-pointer">
                  Category is Active for New Citizen Reports
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
