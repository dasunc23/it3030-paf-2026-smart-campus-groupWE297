import React, { useState } from "react";
import {
  Building2,
  FlaskConical,
  Camera,
  Monitor,
  Video,
  Users,
  MapPin,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Plus,
  Loader2,
} from "lucide-react";

const RESOURCE_TYPES = [
  {
    value: "LECTURE_HALL",
    label: "Lecture Hall",
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    value: "MEETING_ROOM",
    label: "Meeting Room",
    icon: <Users className="w-4 h-4" />,
  },
  { value: "LAB", label: "Lab", icon: <FlaskConical className="w-4 h-4" /> },
  {
    value: "EQUIPMENT",
    label: "Equipment",
    icon: <Monitor className="w-4 h-4" />,
  },
  {
    value: "PROJECTOR",
    label: "Projector",
    icon: <Video className="w-4 h-4" />,
  },
  { value: "CAMERA", label: "Camera", icon: <Camera className="w-4 h-4" /> },
];

const COMMON_TAGS = [
  "Air-conditioned",
  "Multimedia-enabled",
  "Wheelchair accessible",
  "WiFi",
  "Projector",
  "Whiteboard",
  "Computer Lab",
  "Sound System",
  "Smart Board",
  "Video Conference",
  "Parking Available",
  "24/7 Access",
  "Kitchen",
  "Shower",
  "Lockers",
  "Security",
  "Elevator Access",
];

const TAG_CATEGORIES = {
  Accessibility: [
    "Wheelchair accessible",
    "Elevator Access",
    "Ramp Access",
    "Disabled Parking",
  ],
  Technology: [
    "WiFi",
    "Smart Board",
    "Video Conference",
    "Multimedia-enabled",
    "Computer Lab",
  ],
  Comfort: ["Air-conditioned", "Heating", "Sound System", "Lighting Control"],
  Equipment: [
    "Projector",
    "Whiteboard",
    "Sound System",
    "Microphone",
    "Podium",
  ],
  Facilities: ["Parking Available", "Kitchen", "Shower", "Lockers", "Security"],
  Access: ["24/7 Access", "Key Card Access", "Security Guard", "CCTV"],
};

const TAG_CATEGORY_COLORS = {
  Accessibility: { bg: "#eff6ff", color: "#1d4ed8", activeBg: "#dbeafe" },
  Technology: { bg: "#f5f3ff", color: "#6d28d9", activeBg: "#ede9fe" },
  Comfort: { bg: "#ecfdf5", color: "#065f46", activeBg: "#d1fae5" },
  Equipment: { bg: "#fff7ed", color: "#9a3412", activeBg: "#fed7aa" },
  Facilities: { bg: "#fdf2f8", color: "#9d174d", activeBg: "#fce7f3" },
  Access: { bg: "#f0fdf4", color: "#166534", activeBg: "#bbf7d0" },
};

function Field({ label, required, error, children }) {
  return (
    <div>
      <label
        className="block text-xs font-bold uppercase tracking-widest mb-2"
        style={{ color: "#475569" }}
      >
        {label} {required && <span style={{ color: "#059669" }}>*</span>}
      </label>
      {children}
      {error && (
        <p
          className="mt-1.5 flex items-center gap-1 text-xs font-medium"
          style={{ color: "#ef4444" }}
        >
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}

const inputBase = {
  backgroundColor: "white",
  border: "1px solid #e2e8f0",
  color: "#1e293b",
  width: "100%",
  padding: "10px 14px",
  borderRadius: "12px",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const inputError = {
  borderColor: "#fca5a5",
  backgroundColor: "#fff7f7",
};

const inputDisabled = {
  backgroundColor: "#f8fafc",
  color: "#94a3b8",
  cursor: "not-allowed",
};

function StyledInput({ error, disabled, style = {}, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      disabled={disabled}
      style={{
        ...inputBase,
        ...(error ? inputError : {}),
        ...(disabled ? inputDisabled : {}),
        ...(focused && !error && !disabled
          ? {
              borderColor: "#059669",
              boxShadow: "0 0 0 3px rgba(5,150,105,0.08)",
            }
          : {}),
        ...style,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function StyledSelect({ error, children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <select
        {...props}
        style={{
          ...inputBase,
          appearance: "none",
          paddingRight: "36px",
          ...(error ? inputError : {}),
          ...(focused
            ? {
                borderColor: "#059669",
                boxShadow: "0 0 0 3px rgba(5,150,105,0.08)",
              }
            : {}),
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {children}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: "#94a3b8" }}
      />
    </div>
  );
}

function AddResourceForm({ onResourceAdded }) {
  const apiBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    capacity: "",
    location: "",
    availabilityStart: "",
    availabilityEnd: "",
    status: "ACTIVE",
    tags: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  }

  function validateForm() {
    const newErrors = {};
    const isEquipmentType = ["EQUIPMENT", "PROJECTOR", "CAMERA"].includes(
      formData.type,
    );
    if (!formData.type) newErrors.type = "Resource type is required";
    if (!formData.name.trim()) newErrors.name = "Resource name is required";
    if (!isEquipmentType) {
      if (!formData.capacity || formData.capacity < 1)
        newErrors.capacity = "Capacity must be at least 1";
    }
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.availabilityStart)
      newErrors.availabilityStart = "Start time is required";
    if (!formData.availabilityEnd)
      newErrors.availabilityEnd = "End time is required";
    if (formData.availabilityStart && formData.availabilityEnd) {
      if (formData.availabilityStart >= formData.availabilityEnd)
        newErrors.availabilityEnd = "End time must be after start time";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function addTag(tag) {
    const currentTags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    if (!currentTags.includes(tag)) {
      setFormData({ ...formData, tags: [...currentTags, tag].join(", ") });
    }
  }

  function handleTagInputChange(e) {
    const value = e.target.value;
    setFormData({ ...formData, tags: value });
    if (value.length > 0) {
      const currentTags = value.split(",").map((t) => t.trim());
      const lastTag = currentTags[currentTags.length - 1];
      if (lastTag) {
        const suggestions = COMMON_TAGS.filter(
          (tag) =>
            tag.toLowerCase().includes(lastTag.toLowerCase()) &&
            !currentTags.includes(tag),
        );
        setTagSuggestions(suggestions.slice(0, 5));
        setShowTagSuggestions(suggestions.length > 0);
      } else {
        setShowTagSuggestions(false);
      }
    } else {
      setShowTagSuggestions(false);
    }
  }

  function addSuggestedTag(tag) {
    const currentTags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    const newTags = [...currentTags, tag].join(", ");
    setFormData({ ...formData, tags: newTags });
    setShowTagSuggestions(false);
    setTagSuggestions([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setMessage("");
    try {
      // ✅ FIX: Send null capacity for equipment types instead of parseInt("") = NaN
      const isEquipmentType = ["EQUIPMENT", "PROJECTOR", "CAMERA"].includes(
        formData.type,
      );
      const res = await fetch(`${apiBase}/api/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          capacity: isEquipmentType ? null : parseInt(formData.capacity),
          availability: `${formData.availabilityStart}-${formData.availabilityEnd}`,
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t),
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setMessage("success");
        setFormData({
          type: "",
          name: "",
          capacity: "",
          location: "",
          availabilityStart: "",
          availabilityEnd: "",
          status: "ACTIVE",
          tags: "",
        });
        setErrors({});
        if (onResourceAdded) onResourceAdded();
      } else {
        setMessage(`error:${data?.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Request failed:", err);
      setMessage("error:Could not connect to backend.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isEquipment = ["EQUIPMENT", "PROJECTOR", "CAMERA"].includes(
    formData.type,
  );
  const activeTags = formData.tags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t);

  return (
    <div
      style={{
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
        padding: "32px 16px",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Page header */}
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{
              backgroundColor: "#ecfdf5",
              color: "#059669",
              border: "1px solid #d1fae5",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#34d399" }}
            />
            Resource Management
          </div>
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: "#064e3b" }}
          >
            Add New Resource
          </h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            Fill in the details below to register a new campus resource.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Section 1: Basic Info ── */}
          <div
            className="rounded-2xl mb-5 overflow-hidden"
            style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
          >
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#ecfdf5" }}
              >
                <Building2 className="w-4 h-4" style={{ color: "#059669" }} />
              </div>
              <span className="text-sm font-bold" style={{ color: "#064e3b" }}>
                Basic Information
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Resource Type */}
              <Field label="Resource Type" required error={errors.type}>
                <StyledSelect
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  error={errors.type}
                  required
                >
                  <option value="">Select a type…</option>
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </StyledSelect>
              </Field>

              {/* Resource Name */}
              <Field label="Resource Name" required error={errors.name}>
                <StyledInput
                  name="name"
                  value={formData.name}
                  placeholder="e.g., Computer Lab 101"
                  onChange={handleChange}
                  error={errors.name}
                  required
                />
              </Field>

              {/* Capacity */}
              <Field
                label={`Capacity${isEquipment ? " (not applicable)" : ""}`}
                required={!isEquipment}
                error={errors.capacity}
              >
                <StyledInput
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  placeholder={isEquipment ? "Not applicable" : "e.g., 50"}
                  onChange={handleChange}
                  error={errors.capacity}
                  disabled={isEquipment}
                  required={!isEquipment}
                />
              </Field>

              {/* Location */}
              <Field label="Location" required error={errors.location}>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "#94a3b8" }}
                  />
                  <StyledInput
                    name="location"
                    value={formData.location}
                    placeholder="e.g., Building A, Floor 2"
                    onChange={handleChange}
                    error={errors.location}
                    required
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* ── Section 2: Availability & Status ── */}
          <div
            className="rounded-2xl mb-5 overflow-hidden"
            style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
          >
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#ecfdf5" }}
              >
                <Clock className="w-4 h-4" style={{ color: "#059669" }} />
              </div>
              <span className="text-sm font-bold" style={{ color: "#064e3b" }}>
                Availability & Status
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Available From */}
              <Field
                label="Available From"
                required
                error={errors.availabilityStart}
              >
                <StyledInput
                  name="availabilityStart"
                  type="time"
                  value={formData.availabilityStart}
                  onChange={handleChange}
                  error={errors.availabilityStart}
                  required
                />
              </Field>

              {/* Available Until */}
              <Field
                label="Available Until"
                required
                error={errors.availabilityEnd}
              >
                <StyledInput
                  name="availabilityEnd"
                  type="time"
                  value={formData.availabilityEnd}
                  onChange={handleChange}
                  error={errors.availabilityEnd}
                  required
                />
              </Field>

              {/* Status */}
              <Field label="Status">
                <StyledSelect
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </StyledSelect>
              </Field>
            </div>
          </div>

          {/* ── Section 3: Tags ── */}
          <div
            className="rounded-2xl mb-6 overflow-hidden"
            style={{ backgroundColor: "white", border: "1px solid #e2e8f0" }}
          >
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#ecfdf5" }}
              >
                <Tag className="w-4 h-4" style={{ color: "#059669" }} />
              </div>
              <span className="text-sm font-bold" style={{ color: "#064e3b" }}>
                Tags
                {isEquipment && (
                  <span
                    className="ml-2 text-xs font-medium"
                    style={{ color: "#94a3b8" }}
                  >
                    (Optional for equipment)
                  </span>
                )}
              </span>
            </div>

            <div className="p-6">
              {/* Tag text input with autocomplete */}
              <div className="relative mb-5">
                <label
                  className="block text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "#475569" }}
                >
                  Type Tags
                </label>
                <StyledInput
                  name="tags"
                  value={formData.tags}
                  placeholder={
                    isEquipment
                      ? "Optional for equipment"
                      : "e.g., Air-conditioned, WiFi"
                  }
                  onChange={handleTagInputChange}
                  onFocus={() => setShowTagSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowTagSuggestions(false), 200)
                  }
                />
                {showTagSuggestions && tagSuggestions.length > 0 && (
                  <div
                    className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden z-10"
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    }}
                  >
                    {tagSuggestions.map((tag, i) => (
                      <div
                        key={i}
                        onClick={() => addSuggestedTag(tag)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer transition-all"
                        style={{ color: "#1e293b" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f0fdf4";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "white";
                        }}
                      >
                        <Plus
                          className="w-3.5 h-3.5"
                          style={{ color: "#059669" }}
                        />
                        {tag}
                      </div>
                    ))}
                  </div>
                )}

                {/* Active tags preview */}
                {activeTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {activeTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: "#ecfdf5",
                          color: "#065f46",
                          border: "1px solid #d1fae5",
                        }}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick-add by category */}
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: "#94a3b8" }}
                >
                  Quick add by category
                </p>
                <div className="space-y-3">
                  {Object.entries(TAG_CATEGORIES).map(([category, tags]) => {
                    const palette = TAG_CATEGORY_COLORS[category];
                    return (
                      <div key={category}>
                        <p
                          className="text-xs font-semibold mb-2"
                          style={{ color: palette.color }}
                        >
                          {category}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {tags.map((tag) => {
                            const isActive = activeTags.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => addTag(tag)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                style={{
                                  backgroundColor: isActive
                                    ? palette.activeBg
                                    : palette.bg,
                                  color: palette.color,
                                  border: `1px solid ${isActive ? palette.color + "40" : "transparent"}`,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    palette.activeBg;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    isActive ? palette.activeBg : palette.bg;
                                }}
                              >
                                {isActive ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <Plus className="w-3 h-3" />
                                )}
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer: submit + message ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all"
              style={{
                backgroundColor: isSubmitting ? "#6ee7b7" : "#064e3b",
                color: "white",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting)
                  e.currentTarget.style.backgroundColor = "#065f46";
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting)
                  e.currentTarget.style.backgroundColor = "#064e3b";
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Adding Resource…
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add Resource
                </>
              )}
            </button>

            {message === "success" && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
                style={{
                  backgroundColor: "#ecfdf5",
                  color: "#065f46",
                  border: "1px solid #d1fae5",
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                Resource added successfully!
              </div>
            )}
            {message.startsWith("error:") && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
                style={{
                  backgroundColor: "#fff7f7",
                  color: "#b91c1c",
                  border: "1px solid #fecaca",
                }}
              >
                <AlertCircle className="w-4 h-4" />
                {message.replace("error:", "")}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddResourceForm;
