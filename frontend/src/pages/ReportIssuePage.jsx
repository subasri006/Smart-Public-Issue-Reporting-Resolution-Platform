import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { 
  PlusCircle, 
  Upload, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  X, 
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { MapPicker } from '../components/maps/MapPicker';
import { StatusBadge } from '../components/common/StatusBadge';

export const ReportIssuePage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    severity: 'MEDIUM',
    latitude: 12.9716,
    longitude: 77.5946,
    address: '',
    landmark: '',
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Duplicate Check State
  const [duplicateResult, setDuplicateResult] = useState(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [acknowledgedDuplicate, setAcknowledgedDuplicate] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) {
          setCategories(res.data.data);
          if (res.data.data.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: String(res.data.data[0].id) }));
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Reset duplicate check on major text change
    if (name === 'title' || name === 'description' || name === 'categoryId') {
      setDuplicateResult(null);
      setAcknowledgedDuplicate(false);
    }
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    setDuplicateResult(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const fileName = file.name || '';
      const dotIndex = fileName.lastIndexOf('.');
      const ext = dotIndex !== -1 ? fileName.substring(dotIndex).toLowerCase() : '';

      if (!allowedExtensions.includes(ext) || (file.type && !allowedMimes.includes(file.type.toLowerCase()))) {
        setError(`Unsupported image format (${ext || 'unknown'}). Only JPG, JPEG, PNG, and WEBP images are accepted.`);
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size exceeds 5MB limit");
        e.target.value = '';
        return;
      }
      setPhoto(file);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  // Run duplicate check
  const handleCheckDuplicates = async () => {
    if (!formData.title || formData.title.trim().length < 5) {
      setError("Please enter a descriptive title before checking for duplicates");
      return;
    }

    setCheckingDuplicate(true);
    setError(null);

    try {
      const res = await api.post('/complaints/check-duplicate', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      if (res.data?.success) {
        setDuplicateResult(res.data.data);
      }
    } catch (err) {
      console.error("Duplicate check error:", err);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || !formData.description.trim() || !formData.categoryId) {
      setError("Please fill all required fields");
      return;
    }

    // If potential duplicate detected and user hasn't explicitly acknowledged
    if (duplicateResult?.isPotentialDuplicate && !acknowledgedDuplicate) {
      setError("Please review the matching issues detected below or confirm this report is distinct.");
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('categoryId', formData.categoryId);
      data.append('severity', formData.severity);
      if (formData.latitude) data.append('latitude', formData.latitude);
      if (formData.longitude) data.append('longitude', formData.longitude);
      if (formData.address) data.append('address', formData.address.trim());
      if (formData.landmark) data.append('landmark', formData.landmark.trim());
      if (photo) data.append('photo', photo);

      const res = await api.post('/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        const created = res.data.data;
        navigate(`/complaints/${created.id}?new=true`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint. Please check your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
          New Incident Report
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Report a Public Issue
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Provide accurate details, location coordinates, and photo evidence to help municipal authorities dispatch repair crews rapidly.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 shadow-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Duplicate Warning Banner */}
      {duplicateResult?.isPotentialDuplicate && (
        <div className="p-5 bg-amber-50/90 border border-amber-300 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-900">
                Potential Duplicate Report Detected ({duplicateResult.highestSimilarity}% Match)
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                {duplicateResult.explanation}
              </p>
            </div>
          </div>

          <div className="space-y-2 border-t border-amber-200 pt-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
              Matching Existing Reports Nearby:
            </span>
            <div className="grid grid-cols-1 gap-2">
              {duplicateResult.matches.map(m => (
                <div key={m.complaintId} className="bg-white p-3 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700">{m.referenceId}</span>
                      <StatusBadge status={m.status} size="sm" />
                      <span className="font-semibold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                        {m.similarityScore}% Similarity
                      </span>
                      {m.distanceMeters != null && (
                        <span className="text-slate-500 text-[11px]">
                          ~{m.distanceMeters}m away
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-800 mt-1">{m.title}</p>
                  </div>
                  <Link
                    to={`/complaints/${m.complaintId}`}
                    target="_blank"
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 flex-shrink-0"
                  >
                    Inspect Report <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-100/60 p-3 rounded-xl border border-amber-200">
            <p className="text-xs text-amber-900">
              Does your report describe a distinct issue not addressed by the above?
            </p>
            <button
              type="button"
              onClick={() => setAcknowledgedDuplicate(true)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                acknowledgedDuplicate 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-amber-700 text-white hover:bg-amber-800'
              }`}
            >
              {acknowledgedDuplicate ? '✓ Confirmed as Distinct Issue' : 'Confirm & Continue Submitting'}
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Issue Title *
          </label>
          <input
            type="text"
            name="title"
            required
            maxLength={150}
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Deep pothole cluster at 80 Feet Road flyover turn"
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
            <span>Be clear and specific to aid rapid categorization</span>
            <span>{formData.title.length}/150</span>
          </div>
        </div>

        {/* Category & Severity Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Issue Category *
            </label>
            <select
              name="categoryId"
              required
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (Priority Weight: {c.weight})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Reported Severity *
            </label>
            <select
              name="severity"
              required
              value={formData.severity}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
            >
              <option value="LOW">Low (Minor cosmetic issue / nuisance)</option>
              <option value="MEDIUM">Medium (Moderate traffic or health impact)</option>
              <option value="HIGH">High (Significant hazard or infrastructure outage)</option>
              <option value="CRITICAL">Critical (Immediate life/safety danger)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Detailed Description *
          </label>
          <textarea
            rows={4}
            name="description"
            required
            maxLength={3000}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the condition, size, duration, visible hazards, and surrounding impact..."
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
            <span>Include observable dimensions or duration if known</span>
            <span>{formData.description.length}/3000</span>
          </div>
        </div>

        {/* Check Duplicates Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleCheckDuplicates}
            disabled={checkingDuplicate || !formData.title}
            className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Info className="w-3.5 h-3.5" />
            {checkingDuplicate ? 'Scanning nearby complaints...' : 'Check for Existing Similar Reports'}
          </button>
        </div>

        {/* Photo Upload with Preview */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Issue Photo Evidence (Recommended)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Upload clear daytime photos of the damage or hazard (Max 5MB, JPG/PNG/WEBP)
          </p>

          {!photoPreview ? (
            <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition">
              <Upload className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-xs font-bold text-slate-700">Click to upload or drag photo here</span>
              <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, or WEBP up to 5MB</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative w-full sm:w-64 h-48 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
              <img src={photoPreview} alt="Issue preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full shadow hover:bg-rose-700 transition"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Map Pin Selection */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-0.5">
              Exact Incident Location *
            </label>
            <p className="text-xs text-slate-500">
              Pick the exact pin on the interactive map below or click "Use My Current Location".
            </p>
          </div>

          <MapPicker
            initialLat={formData.latitude}
            initialLng={formData.longitude}
            onSelectLocation={handleLocationSelect}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Landmark / Cross Street (Optional)
              </label>
              <input
                type="text"
                name="landmark"
                maxLength={150}
                value={formData.landmark}
                onChange={handleChange}
                placeholder="e.g. Opposite Sony World Junction"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Street Address / Ward (Optional)
              </label>
              <input
                type="text"
                name="address"
                maxLength={255}
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 14th Cross, Malleshwaram"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            By submitting, you confirm that this public incident report is accurate to the best of your knowledge.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? 'Registering Issue...' : 'Submit Incident Report'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
