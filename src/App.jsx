import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { supabase } from "./supabase";

const DEFAULT_COLUMNS = [
  { id: "wishlist",  label: "Wishlist",   color: "#6366f1", position: 0 },
  { id: "applied",   label: "Applied",    color: "#3B82F6", position: 1 },
  { id: "interview", label: "Interview",  color: "#F59E0B", position: 2 },
  { id: "offer",     label: "Offer",      color: "#10B981", position: 3 },
  { id: "rejected",  label: "Rejected",   color: "#EF4444", position: 4 },
];

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputStyle = {
  background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10,
  padding: "10px 13px", fontSize: 14, color: "#111827", outline: "none",
  fontFamily: "inherit", width: "100%", transition: "border-color 0.15s",
};
const labelStyle = { fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.06em", textTransform: "uppercase" };
const btnPrimary = {
  padding: "10px 20px", borderRadius: 10, border: "none",
  background: "linear-gradient(135deg, #6366f1, #818cf8)",
  color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
  fontFamily: "inherit", boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
};

// ─── Auth helpers ─────────────────────────────────────────────────────────────
function AuthCard({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#f9fafb", fontFamily: "Inter, -apple-system, sans-serif" }}>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 24, padding: 40, width: "100%", maxWidth: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
        {children}
      </div>
    </div>
  );
}

function LogoRow({ icon, title, sub }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", marginTop: 8 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #6366f1, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 8px 20px rgba(99,102,241,0.3)" }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>{title}</div>
        <div style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>{sub}</div>
      </div>
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ position: "absolute", top: 20, left: 20, background: "none", border: "1px solid #e5e7eb", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: "#6b7280", cursor: "pointer", fontFamily: "inherit" }}>
      ← Back
    </button>
  );
}

function Msg({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ padding: "11px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, background: msg.type === "error" ? "#fef2f2" : "#f0fdf4", border: `1px solid ${msg.type === "error" ? "#fecaca" : "#bbf7d0"}`, color: msg.type === "error" ? "#EF4444" : "#059669" }}>
      {msg.text}
    </div>
  );
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
function ForgotPasswordScreen({ onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const handleSubmit = async () => {
    if (!email) { setMsg({ type: "error", text: "Please enter your email." }); return; }
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "?reset=true" });
    if (error) setMsg({ type: "error", text: error.message });
    else setMsg({ type: "success", text: "✓ Check your inbox! We've sent a password reset link." });
    setLoading(false);
  };
  return (
    <AuthCard>
      <BackBtn onClick={onBack} />
      <LogoRow icon="🔑" title="Reset password" sub="We'll send you a reset link" />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={labelStyle}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle}
          onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          onKeyDown={e => e.key === "Enter" && handleSubmit()} />
      </div>
      <Msg msg={msg} />
      <button onClick={handleSubmit} disabled={loading} style={{ ...btnPrimary, width: "100%", opacity: loading ? 0.7 : 1 }}>
        {loading ? "Sending…" : "Send reset link →"}
      </button>
    </AuthCard>
  );
}

// ─── Set New Password ─────────────────────────────────────────────────────────
function SetNewPasswordScreen({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const handleSubmit = async () => {
    if (!password || !confirm) { setMsg({ type: "error", text: "Please fill in both fields." }); return; }
    if (password !== confirm) { setMsg({ type: "error", text: "Passwords don't match." }); return; }
    if (password.length < 6) { setMsg({ type: "error", text: "Password must be at least 6 characters." }); return; }
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMsg({ type: "error", text: error.message });
    else { setMsg({ type: "success", text: "✓ Password updated!" }); setTimeout(onDone, 1500); }
    setLoading(false);
  };
  return (
    <AuthCard>
      <LogoRow icon="🔒" title="New password" sub="Choose a strong password" />
      {[["New password", password, setPassword], ["Confirm password", confirm, setConfirm]].map(([lbl, val, setter]) => (
        <div key={lbl} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle}>{lbl}</label>
          <input type="password" value={val} onChange={e => setter(e.target.value)} placeholder="••••••••" style={inputStyle}
            onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
        </div>
      ))}
      <Msg msg={msg} />
      <button onClick={handleSubmit} disabled={loading} style={{ ...btnPrimary, width: "100%", opacity: loading ? 0.7 : 1 }}>
        {loading ? "Updating…" : "Update password →"}
      </button>
    </AuthCard>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onBack, onForgotPassword }) {
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const handleSubmit = async () => {
    if (!email || !password) { setMsg({ type: "error", text: "Please fill in all fields." }); return; }
    setLoading(true); setMsg(null);
    if (tab === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ type: "error", text: error.message });
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMsg({ type: "error", text: error.message });
      else setMsg({ type: "success", text: "✓ Account created! Check your email to confirm." });
    }
    setLoading(false);
  };
  return (
    <AuthCard>
      <BackBtn onClick={onBack} />
      <LogoRow icon="💼" title="Job Tracker" sub={tab === "signin" ? "Sign in to your account" : "Create your account"} />
      <div style={{ display: "flex", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 10, padding: 3, gap: 3 }}>
        {[["signin", "Sign in"], ["signup", "Create account"]].map(([key, lbl]) => (
          <button key={key} onClick={() => { setTab(key); setMsg(null); }}
            style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: tab === key ? "linear-gradient(135deg, #6366f1, #818cf8)" : "transparent", color: tab === key ? "#fff" : "#9ca3af" }}>
            {lbl}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={labelStyle}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle}
          onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          onKeyDown={e => e.key === "Enter" && handleSubmit()} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={labelStyle}>Password</label>
          {tab === "signin" && <button onClick={onForgotPassword} style={{ background: "none", border: "none", fontSize: 12, color: "#6366f1", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Forgot password?</button>}
        </div>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle}
          onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          onKeyDown={e => e.key === "Enter" && handleSubmit()} />
      </div>
      <Msg msg={msg} />
      <button onClick={handleSubmit} disabled={loading} style={{ ...btnPrimary, width: "100%", opacity: loading ? 0.7 : 1 }}>
        {loading ? "Please wait…" : tab === "signin" ? "Sign in →" : "Create account →"}
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
        <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>OR</span>
        <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
      </div>
      <button onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
        style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
        Continue with Google
      </button>
    </AuthCard>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
function HomeScreen({ onOpen, session }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "Inter, -apple-system, sans-serif", position: "relative" }}>
      <div style={{ position: "absolute", top: "10%", left: "15%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 100, padding: "6px 16px", marginBottom: 32 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
        <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 700, letterSpacing: "0.08em" }}>YOUR CAREER COMMAND CENTER</span>
      </div>

      <h1 style={{ margin: 0, fontSize: "clamp(42px, 8vw, 76px)", fontWeight: 900, letterSpacing: "-0.04em", textAlign: "center", lineHeight: 1.0, marginBottom: 24 }}>
        <span style={{ color: "#111827", display: "block" }}>Land your</span>
        <span style={{ background: "linear-gradient(135deg, #6366f1, #818cf8, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "block" }}>dream job.</span>
      </h1>

      <p style={{ margin: 0, fontSize: 18, color: "#6b7280", marginBottom: 40, textAlign: "center", lineHeight: 1.7, maxWidth: 420 }}>
        Track every application, follow-up, and offer — all in one place.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 44, flexWrap: "wrap", justifyContent: "center" }}>
        {["Kanban board", "Syncs across devices", "No spreadsheets", "Completely free"].map(f => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 100, padding: "8px 16px", fontSize: 12, color: "#6b7280", fontWeight: 500, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <span style={{ color: "#6366f1" }}>✦</span> {f}
          </div>
        ))}
      </div>

      <button onClick={onOpen} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ padding: "18px 52px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", boxShadow: hovered ? "0 16px 40px rgba(99,102,241,0.4)" : "0 8px 24px rgba(99,102,241,0.3)", transform: hovered ? "translateY(-2px) scale(1.02)" : "none", transition: "all 0.2s", fontFamily: "inherit" }}>
        {session ? "Open Tracker →" : "Get Started →"}
      </button>


    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ screen, setScreen, session, onSignOut, newLeads = 0 }) {
  const email = session?.user?.email || "";
  const initial = email.charAt(0).toUpperCase();
  const navItems = [
    { id: "board", icon: "📋", label: "Board" },
    { id: "leads", icon: "🎯", label: "Potential roles", badge: newLeads },
    { id: "documents", icon: "📁", label: "My Documents" },
    { id: "trash", icon: "🗑️", label: "Trash" },
  ];
  return (
    <div style={{ width: 220, flexShrink: 0, background: "#f9fafb", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", padding: "20px 12px", height: "100vh", position: "fixed", left: 0, top: 0, zIndex: 10 }}>
      <div onClick={() => setScreen("board")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", marginBottom: 20, cursor: "pointer", borderRadius: 10, transition: "background 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>💼</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>Job Tracker</div>
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px 6px", marginTop: 4 }}>Menu</div>

      {navItems.map(({ id, icon, label, badge }) => (
        <button key={id} onClick={() => setScreen(id)}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, border: "none", width: "100%", textAlign: "left", fontFamily: "inherit", marginBottom: 2, transition: "all 0.15s", background: screen === id ? "#eef2ff" : "none", color: screen === id ? "#6366f1" : "#9ca3af" }}
          onMouseEnter={e => { if (screen !== id) e.currentTarget.style.background = "#f3f4f6"; if (screen !== id) e.currentTarget.style.color = "#6b7280"; }}
          onMouseLeave={e => { if (screen !== id) e.currentTarget.style.background = "none"; if (screen !== id) e.currentTarget.style.color = "#9ca3af"; }}>
          <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>{icon}</span>
          {label}
          {badge > 0
            ? <span style={{ marginLeft: "auto", background: "#6366f1", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "2px 7px" }}>{badge}</span>
            : screen === id && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", marginLeft: "auto" }} />}
        </button>
      ))}

      <div style={{ marginTop: "auto", borderTop: "1px solid #e5e7eb", paddingTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg, #6366f1, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{initial}</div>
          <div style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</div>
        </div>
        <button onClick={onSignOut} style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "none", background: "none", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#d1d5db", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
          onMouseEnter={e => { e.target.style.color = "#EF4444"; e.target.style.background = "#fef2f2"; }}
          onMouseLeave={e => { e.target.style.color = "#d1d5db"; e.target.style.background = "none"; }}>
          → Sign out
        </button>
      </div>
    </div>
  );
}

// ─── Card Modal ───────────────────────────────────────────────────────────────
const DRAFT_KEY = "jt_card_draft";

function CardForm({ card, onSave, onClose, onDelete, columnId, columns, userId, cv, onOpenCv }) {
  const [form, setForm] = useState(() => {
    if (card?.id) return card;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed._columnId === columnId) return parsed;
      }
    } catch(_) {}
    return { company: "", role: "", location: "", salary: "", url: "", date: new Date().toISOString().split("T")[0], notes: "" };
  });

  // Stable id so an attached PDF can be uploaded to a real path before Save is clicked
  const [cardId] = useState(() => card?.id || Date.now().toString());

  // ── Status (which column this card is/will be in) ──
  const [statusId, setStatusId] = useState(card?.column_id || columnId);
  const currentCol = columns.find(c => c.id === statusId) || columns[0] || {};

  // ── Job description PDF attachment ──
  const [jdPath, setJdPath] = useState(card?.jd_file_path || null);
  const [jdName, setJdName] = useState(card?.jd_file_path ? card.jd_file_path.split("/").pop().replace(/^jd_[^_]+_/, "") : null);
  const [jdUploading, setJdUploading] = useState(false);
  const jdFileRef = useRef();

  const handleJdSelect = async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") { alert("Please attach a PDF file."); e.target.value = ""; return; }
    if (file.size > 10 * 1024 * 1024) { alert("File is too large (max 10MB)."); e.target.value = ""; return; }
    setJdUploading(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${userId}/jd_${cardId}_${safeName}`;
    const { error } = await supabase.storage.from("Documents").upload(path, file, { upsert: true });
    if (error) { alert("Upload failed: " + error.message); setJdUploading(false); e.target.value = ""; return; }
    setJdPath(path);
    setJdName(file.name);
    setJdUploading(false);
    e.target.value = "";
  };

  const handleJdRemove = async () => {
    if (jdPath) await supabase.storage.from("Documents").remove([jdPath]);
    setJdPath(null);
    setJdName(null);
  };

  const handleJdView = async () => {
    const { data } = await supabase.storage.from("Documents").createSignedUrl(jdPath, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const set = k => e => {
    const updated = { ...form, [k]: e.target.value };
    setForm(updated);
    // Auto-save draft on every keystroke
    if (!card?.id) localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...updated, _columnId: columnId }));
  };

  const handleClose = () => {
    localStorage.removeItem(DRAFT_KEY);
    onClose();
  };
  const handleSave = (data) => {
    localStorage.removeItem(DRAFT_KEY);
    onSave(data);
  };
  const inp = { ...inputStyle };
  const lbl = { ...labelStyle };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#f9fafb", zIndex: 1000, overflowY: "auto" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 24px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <button onClick={handleClose} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, color: "#6b7280", cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>{card?.id ? "Edit Application" : "New Application"}</h2>
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={lbl}>Status</label>
          <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: currentCol.color, flexShrink: 0 }} />
              <div style={{ position: "relative", flex: 1 }}>
                <select value={statusId} onChange={e => setStatusId(e.target.value)}
                  style={{ width: "100%", appearance: "none", WebkitAppearance: "none", background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 32px 9px 13px", fontSize: 14, fontWeight: 700, color: currentCol.color, fontFamily: "inherit", cursor: "pointer", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e5e7eb"}>
                  {columns.map(col => <option key={col.id} value={col.id}>{col.label}</option>)}
                </select>
                <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>This card will be {card?.id ? "moved to" : "added to"} the <strong>{currentCol.label}</strong> column.</span>
          </div>
        </div>
        {[
          { k: "company", label: "Company *" },
          { k: "role", label: "Role *" },
          { k: "location", label: "Location" },
          { k: "salary", label: "Salary" },
          { k: "url", label: "Job URL" },
        ].map(({ k, label }) => (
          <div key={k} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={lbl}>{label}</label>
            <input value={form[k] || ""} onChange={set(k)} style={inp}
              onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
          </div>
        ))}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={lbl}>Job Description (PDF)</label>
          {!jdPath ? (
            <div onClick={() => jdFileRef.current.click()}
              style={{ border: "2px dashed #c7d2fe", borderRadius: 12, padding: "18px 16px", textAlign: "center", background: "#eef2ff55", cursor: "pointer" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>📎</div>
              <div style={{ fontSize: 13, color: "#6366f1", fontWeight: 600 }}>{jdUploading ? "Uploading…" : "Click to attach the job description PDF"}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>Keeps a copy in case the listing gets taken down · Max 10MB</div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>📄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{jdName}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Attached</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={handleJdView} style={{ border: "1px solid #e5e7eb", background: "#f9fafb", borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "#6b7280", cursor: "pointer", fontFamily: "inherit" }}>↓ View</button>
                <button onClick={handleJdRemove} style={{ border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "#EF4444", cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
              </div>
            </div>
          )}
          <input ref={jdFileRef} type="file" accept="application/pdf" onChange={handleJdSelect} style={{ display: "none" }} />
        </div>
        {card?.id && <CvSection card={{ ...card, url: form.url }} columnId={card.column_id || columnId} cv={cv} onOpen={() => onOpenCv(card)} />}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={lbl}>Date Applied</label>
          <input type="date" value={form.date || ""} onChange={set("date")} style={inp}
            onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={lbl}>Notes</label>
          <textarea value={form.notes || ""} onChange={set("notes")} placeholder="Anything to remember about this role..." rows={3}
            style={{ ...inp, resize: "vertical" }}
            onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {card?.id && <button onClick={() => onDelete(card.id)} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #fecaca", background: "#fef2f2", color: "#EF4444", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>}
          <button onClick={handleClose} style={{ marginLeft: "auto", padding: "10px 18px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={() => {
            if (!form.company?.trim() || !form.role?.trim()) { alert("Company and Role are required."); return; }
            handleSave({ ...form, id: cardId, column_id: statusId, jd_file_path: jdPath });
          }} style={{ ...btnPrimary }}>Save →</button>
        </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tailored CV ──────────────────────────────────────────────────────────────
const CV_CSS = `
.cvdoc{font-family:Inter,-apple-system,sans-serif;color:#111827;font-size:12.5px;line-height:1.45}
.cvdoc h1{font-size:24px;font-weight:800;letter-spacing:-.02em;margin:0 0 4px}
.cvdoc h2{font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#6366f1;border-bottom:1.5px solid #e0e7ff;padding-bottom:3px;margin:16px 0 8px}
.cvdoc h3{font-size:13px;font-weight:700;margin:10px 0 1px}
.cvdoc p{margin:2px 0 4px}
.cvdoc ul{margin:3px 0 6px;padding-left:16px}
.cvdoc li{margin:1px 0}
.cvdoc em{color:#6b7280}
.cvdoc a{color:#4f46e5;text-decoration:none}
.cvdoc.letter{font-size:13.5px;line-height:1.6}
.cvdoc.letter p{margin:0 0 12px}
`;

// breaks: true keeps the header lines (headline, contact, languages) on separate lines
const mdToHtml = md => DOMPurify.sanitize(marked.parse(md || "", { breaks: true }));

function printDoc(title, md, isLetter) {
  const w = window.open("", "_blank");
  if (!w) { alert("Allow pop-ups to download the PDF."); return; }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title.replace(/</g, "")}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>@page{size:A4;margin:14mm 15mm}body{margin:0}${CV_CSS}</style></head>
<body><div class="cvdoc${isLetter ? " letter" : ""}">${mdToHtml(md)}</div>
<script>document.fonts.ready.then(()=>setTimeout(()=>window.print(),150))<\/script></body></html>`);
  w.document.close();
}

function CvViewer({ card, onClose, onChanged }) {
  const [versions, setVersions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [tab, setTab] = useState("cv");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [request, setRequest] = useState("");
  const [makeRule, setMakeRule] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("tailored_docs").select("*").eq("application_id", card.id).order("version", { ascending: false });
    setVersions(data || []);
    setIdx(0);
  };
  useEffect(() => { load(); }, [card.id]);

  const doc = versions[idx];
  const isLatest = doc?.is_latest;
  const field = tab === "cv" ? "cv_markdown" : "cover_letter_markdown";
  const pending = versions[0]?.change_status === "pending";

  const startEdit = () => { setDraft(doc[field] || ""); setEditing(true); };
  const saveEdit = async () => {
    setBusy(true);
    const { error } = await supabase.from("tailored_docs").update({ [field]: draft, updated_at: new Date().toISOString() }).eq("id", doc.id);
    setBusy(false);
    if (error) { alert("Couldn't save: " + error.message); return; }
    setVersions(prev => prev.map(v => v.id === doc.id ? { ...v, [field]: draft } : v));
    setEditing(false);
  };

  const sendRequest = async () => {
    if (!request.trim()) return;
    setBusy(true);
    const latest = versions[0];
    const { error } = await supabase.from("tailored_docs").update({ change_request: request.trim(), make_rule: makeRule, change_status: "pending", updated_at: new Date().toISOString() }).eq("id", latest.id);
    setBusy(false);
    if (error) { alert("Couldn't send: " + error.message); return; }
    setVersions(prev => prev.map((v, i) => i === 0 ? { ...v, change_request: request.trim(), make_rule: makeRule, change_status: "pending" } : v));
    setRequest(""); setMakeRule(false);
    onChanged && onChanged();
  };

  const cancelRequest = async () => {
    const latest = versions[0];
    await supabase.from("tailored_docs").update({ change_status: null, change_request: null, make_rule: false }).eq("id", latest.id);
    setVersions(prev => prev.map((v, i) => i === 0 ? { ...v, change_status: null, change_request: null, make_rule: false } : v));
    onChanged && onChanged();
  };

  const tabBtn = key => ({ padding: "7px 14px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: tab === key ? "linear-gradient(135deg, #6366f1, #818cf8)" : "transparent", color: tab === key ? "#fff" : "#9ca3af" });
  const smallBtn = { border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 700, color: "#6b7280", cursor: "pointer", fontFamily: "inherit" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#f3f4f6", zIndex: 1100, overflowY: "auto" }}>
      <style>{CV_CSS}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 20px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <button onClick={onClose} style={smallBtn}>← Back</button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>Tailored CV · {card.company}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{card.role}</div>
          </div>
          {versions.length > 1 && (
            <select value={idx} onChange={e => { setIdx(Number(e.target.value)); setEditing(false); }}
              style={{ marginLeft: "auto", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 12, fontWeight: 600, fontFamily: "inherit", color: "#374151" }}>
              {versions.map((v, i) => <option key={v.id} value={i}>Version {v.version}{v.is_latest ? " (latest)" : ""} · {new Date(v.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</option>)}
            </select>
          )}
        </div>

        {!doc ? (
          <div style={{ background: "#fff", borderRadius: 14, padding: 40, textAlign: "center", color: "#9ca3af", border: "1px solid #e5e7eb" }}>Loading…</div>
        ) : doc.status === "needs_link" ? (
          <div style={{ background: "#fffbeb", borderRadius: 14, padding: 24, color: "#92400e", border: "1px solid #fde68a", fontSize: 14 }}>
            <b>No posting found.</b> {doc.note || "Add the job posting link to this card; the CV will be written on the next run."}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 18, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <div style={{ display: "flex", background: "#e5e7eb", borderRadius: 10, padding: 3 }}>
                  <button style={tabBtn("cv")} onClick={() => { setTab("cv"); setEditing(false); }}>CV</button>
                  <button style={tabBtn("letter")} onClick={() => { setTab("letter"); setEditing(false); }}>Cover letter</button>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  {doc[field] && !editing && isLatest && <button style={smallBtn} onClick={startEdit}>✎ Edit</button>}
                  {editing && <button style={smallBtn} onClick={() => setEditing(false)}>Cancel</button>}
                  {editing && <button disabled={busy} style={{ ...smallBtn, background: "#6366f1", color: "#fff", border: "none" }} onClick={saveEdit}>Save</button>}
                  {doc[field] && !editing && <button style={{ ...smallBtn, background: "#6366f1", color: "#fff", border: "none" }} onClick={() => printDoc(`${tab === "cv" ? "CV" : "Cover letter"} - Theo Bender - ${card.company}`, doc[field], tab === "letter")}>↓ PDF</button>}
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: 6, boxShadow: "0 4px 18px rgba(17,24,39,0.08)", padding: editing ? 0 : "36px 40px", minHeight: 500 }}>
                {editing ? (
                  <textarea value={draft} onChange={e => setDraft(e.target.value)}
                    style={{ width: "100%", minHeight: 700, border: "none", outline: "none", padding: 24, fontSize: 13, lineHeight: 1.6, fontFamily: "ui-monospace, Menlo, monospace", resize: "vertical", borderRadius: 6, boxSizing: "border-box" }} />
                ) : doc[field] ? (
                  <div className={`cvdoc${tab === "letter" ? " letter" : ""}`} dangerouslySetInnerHTML={{ __html: mdToHtml(doc[field]) }} />
                ) : (
                  <div style={{ color: "#9ca3af", fontSize: 14 }}>
                    No cover letter for this role.{doc.cover_letter_reason ? ` ${doc.cover_letter_reason}` : ""}
                    <div style={{ fontSize: 12, marginTop: 6 }}>Want one anyway? Ask for it in "Request changes".</div>
                  </div>
                )}
              </div>
              {editing && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}># name · ## section · ### role · "- " bullet · **bold** · *italic*</div>}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #e5e7eb" }}>
                <div style={{ ...labelStyle, marginBottom: 8 }}>Request changes</div>
                {pending ? (
                  <div style={{ fontSize: 13, color: "#374151" }}>
                    <div style={{ background: "#eef2ff", borderRadius: 10, padding: "10px 12px", color: "#4338ca", marginBottom: 8 }}>
                      <b>Waiting for the next run.</b>
                      <div style={{ marginTop: 4, whiteSpace: "pre-wrap" }}>"{versions[0].change_request}"</div>
                      {versions[0].make_rule && <div style={{ marginTop: 4, fontSize: 12 }}>✓ Will also become a rule for every future CV</div>}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Can't wait? Ask Claude: "run the CV tailoring task now".</div>
                    <button style={smallBtn} onClick={cancelRequest}>Cancel request</button>
                  </div>
                ) : (
                  <>
                    <textarea value={request} onChange={e => setRequest(e.target.value)} rows={5}
                      placeholder={'e.g. "Put the Nice launch first, shorten the summary, make the letter less formal"'}
                      style={{ ...inputStyle, fontSize: 13, resize: "vertical", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
                    <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "#374151", margin: "10px 0", cursor: "pointer" }}>
                      <input type="checkbox" checked={makeRule} onChange={e => setMakeRule(e.target.checked)} style={{ marginTop: 2 }} />
                      <span><b>Make this a rule</b> — apply it to every future CV too</span>
                    </label>
                    <button disabled={busy || !request.trim()} onClick={sendRequest} style={{ ...btnPrimary, width: "100%", fontSize: 13, opacity: request.trim() ? 1 : 0.5 }}>Send request</button>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>Applied on the next run, as a new version. This one is kept.</div>
                  </>
                )}
              </div>
              {doc.match_notes && (
                <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #e5e7eb" }}>
                  <div style={{ ...labelStyle, marginBottom: 8 }}>Notes for you</div>
                  <div className="cvdoc" style={{ fontSize: 12.5 }} dangerouslySetInnerHTML={{ __html: mdToHtml(doc.match_notes) }} />
                  {doc.cover_letter_reason && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}><b>Cover letter:</b> {doc.cover_letter_reason}</div>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CvSection({ card, columnId, cv, onOpen }) {
  const box = { display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 14px" };
  let icon = "📝", title, sub, action = null;
  if (cv && cv.status === "needs_link") { icon = "⚠️"; title = "Posting link needed"; sub = "Add the job URL above and save; the CV is written on the next run."; }
  else if (cv) {
    title = `Tailored CV ready · v${cv.version}`;
    sub = cv.change_status === "pending" ? "Changes requested — applied on the next run" : cv.has_letter ? "CV + cover letter" : "CV only";
    action = <button onClick={onOpen} style={{ ...btnPrimary, padding: "8px 14px", fontSize: 12 }}>Open</button>;
  } else if (columnId === "wishlist") { icon = "⏳"; title = "Tailored CV coming"; sub = card.url ? "Written on the next run of the CV tailoring task." : "Add the job URL first so the posting can be read."; }
  else { title = "No tailored CV"; sub = "Move this card to Wishlist to get one."; }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={labelStyle}>Tailored CV</label>
      <div style={box}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{title}</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{sub}</div>
        </div>
        {action}
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function KanbanCard({ card, cv, onClick, onDragStart, onDragEnd }) {
  const [hovered, setHovered] = useState(false);
  const date = card.date ? new Date(card.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, card)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: "#fff", borderRadius: 10, padding: "11px 13px", cursor: "grab", border: `1px solid ${hovered ? "#c7d2fe" : "#e5e7eb"}`, transform: hovered ? "translateY(-1px)" : "none", boxShadow: hovered ? "0 4px 12px rgba(99,102,241,0.12)" : "0 1px 3px rgba(0,0,0,0.06)", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{card.company}</div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{card.role}</div>
      {card.location && <div style={{ fontSize: 11, color: "#9ca3af" }}>📍 {card.location}</div>}
      {card.salary && <div style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>{card.salary}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {date && <div style={{ fontSize: 10, color: "#d1d5db", marginTop: 2 }}>{date}</div>}
        {card.jd_file_path && <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>📎 JD</div>}
        {cv && cv.status === "ready" && <div style={{ fontSize: 10, color: cv.change_status === "pending" ? "#b45309" : "#6366f1", fontWeight: 700, marginTop: 2 }}>{cv.change_status === "pending" ? "✎ CV changes pending" : "📄 CV ready"}</div>}
        {cv && cv.status === "needs_link" && <div style={{ fontSize: 10, color: "#b45309", fontWeight: 700, marginTop: 2 }}>⚠️ Add posting link</div>}
      </div>
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────
function Column({ col, colCards, cvMap = {}, onAddCard, onEditCard, onDeleteColumn, onDrop, onDragOver, onDragLeave, isDragOver }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [addHovered, setAddHovered] = useState(false);
  const [dragCard, setDragCard] = useState(null);
  const c = col.color;
  return (
    <div style={{ minWidth: 240, width: 240, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 13px", background: "#fff", borderRadius: "12px 12px 0 0", border: "1px solid #e5e7eb", borderBottom: `2px solid ${c}`, position: "relative" }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: 11, color: c, letterSpacing: "0.06em", textTransform: "uppercase" }}>{col.label}</span>
        <span style={{ background: c + "18", color: c, borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{colCards.length}</span>
        <button onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#d1d5db", fontSize: 15 }}>⋯</button>
        {menuOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setMenuOpen(false)} />
            <div style={{ position: "absolute", right: 0, top: "100%", zIndex: 100, background: "#fff", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 140, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <button onClick={() => { onDeleteColumn(col.id); setMenuOpen(false); }}
                style={{ display: "block", width: "100%", padding: "9px 14px", background: "none", border: "none", textAlign: "left", fontSize: 13, color: "#EF4444", cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={e => e.target.style.background = "#fef2f2"}
                onMouseLeave={e => e.target.style.background = "none"}>Delete column</button>
            </div>
          </>
        )}
      </div>
      <div
        onDrop={e => onDrop(e, col.id)}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{ background: isDragOver ? c + "0a" : "#f9fafb", border: `1px solid ${isDragOver ? c + "44" : "#e5e7eb"}`, borderTop: "none", borderRadius: "0 0 12px 12px", padding: 8, display: "flex", flexDirection: "column", gap: 7, minHeight: 80, transition: "all 0.15s" }}>
        {colCards.map(card => (
          <KanbanCard key={card.id} card={card} cv={cvMap[card.id]}
            onClick={() => onEditCard(col.id, card)}
            onDragStart={(e, c) => { setDragCard(c); e.dataTransfer.setData("cardId", c.id); e.dataTransfer.setData("fromColumnId", col.id); }}
            onDragEnd={() => setDragCard(null)} />
        ))}
        <button onClick={() => onAddCard(col.id)}
          onMouseEnter={() => setAddHovered(true)} onMouseLeave={() => setAddHovered(false)}
          style={{ background: addHovered ? c + "0a" : "transparent", border: `1.5px dashed ${addHovered ? c : c + "66"}`, borderRadius: 9, padding: "8px 12px", cursor: "pointer", fontSize: 12, color: addHovered ? c : c + "99", textAlign: "center", transition: "all 0.15s", fontFamily: "inherit", fontWeight: 600 }}>
          + Add card
        </button>
      </div>
    </div>
  );
}

// ─── List (Table) View ────────────────────────────────────────────────────────
const LIST_COLS = "2.2fr 0.9fr 1.1fr 1.6fr 1fr";

function ListView({ columns, cards, onEditCard }) {
  const [collapsed, setCollapsed] = useState({});
  const toggle = id => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));

  const daysSince = dateStr => {
    if (!dateStr) return null;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {columns.map(col => {
        const colCards = cards[col.id] || [];
        const isCollapsed = collapsed[col.id];
        return (
          <div key={col.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div onClick={() => toggle(col.id)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: col.color + "0d", borderBottom: isCollapsed ? "none" : "1px solid #e5e7eb", cursor: "pointer" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: 12, color: col.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{col.label}</span>
              <span style={{ background: col.color + "18", color: col.color, borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>{colCards.length}</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af" }}>{isCollapsed ? "▸" : "▾"}</span>
            </div>
            {!isCollapsed && colCards.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: LIST_COLS, padding: "8px 16px", background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                {["Company / Role", "Applied", "Last Activity", "Notes", "Salary"].map(h => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
                ))}
              </div>
            )}
            {!isCollapsed && colCards.length === 0 && (
              <div style={{ padding: "16px", fontSize: 12, color: "#d1d5db" }}>No applications in this stage</div>
            )}
            {!isCollapsed && colCards.map(card => {
              const days = daysSince(card.date);
              const stale = days !== null && days > 14 && col.id !== "offer" && col.id !== "rejected";
              return (
                <div key={card.id} onClick={() => onEditCard(col.id, card)}
                  style={{ display: "grid", gridTemplateColumns: LIST_COLS, alignItems: "center", padding: "13px 16px", borderBottom: "1px solid #f3f4f6", cursor: "pointer", fontSize: 13, transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#111827" }}>{card.company}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{card.role}</div>
                  </div>
                  <div style={{ color: "#6b7280" }}>{card.date ? new Date(card.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}</div>
                  <div style={{ color: stale ? "#F59E0B" : "#9ca3af", fontWeight: stale ? 700 : 400 }}>{days !== null ? `${stale ? "⚠ " : ""}${days}d ago` : "—"}</div>
                  <div style={{ color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.notes || "—"}</div>
                  <div style={{ color: "#059669", fontWeight: 600 }}>{card.salary || "—"}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Board Screen ─────────────────────────────────────────────────────────────
const VIEW_KEY = "jt_board_view";

function BoardScreen({ columns, cards, setCards, setColumns, session, saveStatus }) {
  const [modal, setModal] = useState(null);
  const [cvMap, setCvMap] = useState({});
  const [cvCard, setCvCard] = useState(null);

  const loadCvMap = async () => {
    const { data } = await supabase.from("tailored_docs").select("application_id, version, status, change_status, cover_letter_markdown").eq("user_id", session.user.id).eq("is_latest", true);
    const map = {};
    (data || []).forEach(d => { map[d.application_id] = { version: d.version, status: d.status, change_status: d.change_status, has_letter: !!d.cover_letter_markdown }; });
    setCvMap(map);
  };
  useEffect(() => { loadCvMap(); }, []);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [view, setView] = useState(() => localStorage.getItem(VIEW_KEY) || "kanban");
  const total = Object.values(cards).flat().length;

  const changeView = v => { setView(v); localStorage.setItem(VIEW_KEY, v); };

  // Auto-reopen draft if one exists when board loads
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        const colId = draft._columnId || columns[0]?.id;
        if (colId) setModal({ columnId: colId, card: null });
      }
    } catch(_) {}
  }, [columns]);

  const handleDrop = async (e, toColId) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");
    const fromColId = e.dataTransfer.getData("fromColumnId");
    if (!cardId || fromColId === toColId) { setDragOverCol(null); return; }
    const card = (cards[fromColId] || []).find(c => c.id === cardId);
    if (!card) return;
    const updated = { ...card, column_id: toColId };
    await supabase.from("applications").update({ column_id: toColId }).eq("id", cardId);
    setCards(prev => ({
      ...prev,
      [fromColId]: (prev[fromColId] || []).filter(c => c.id !== cardId),
      [toColId]: [...(prev[toColId] || []), updated],
    }));
    setDragOverCol(null);
  };

  const saveCard = async cardData => {
    const fromColumnId = modal.columnId;
    const toColumnId = cardData.column_id || fromColumnId;
    const userId = session.user.id;
    const row = { id: cardData.id, column_id: toColumnId, user_id: userId, company: cardData.company, role: cardData.role, location: cardData.location || null, salary: cardData.salary || null, url: cardData.url || null, date: cardData.date || null, notes: cardData.notes || null, jd_file_path: cardData.jd_file_path || null };
    if (modal.card?.id) {
      await supabase.from("applications").update(row).eq("id", cardData.id);
      setCards(prev => {
        const next = { ...prev };
        if (fromColumnId !== toColumnId) {
          next[fromColumnId] = (next[fromColumnId] || []).filter(c => c.id !== cardData.id);
          next[toColumnId] = [...(next[toColumnId] || []), row];
        } else {
          next[toColumnId] = (next[toColumnId] || []).map(c => c.id === cardData.id ? { ...c, ...row } : c);
        }
        return next;
      });
    } else {
      await supabase.from("applications").insert(row);
      setCards(prev => ({ ...prev, [toColumnId]: [...(prev[toColumnId] || []), row] }));
    }
    setModal(null);
  };

  const deleteCard = async cardId => {
    if (!window.confirm("Delete this application? You can restore it later from Trash.")) return;
    const { columnId } = modal;
    await supabase.from("applications").update({ deleted_at: new Date().toISOString() }).eq("id", cardId);
    setCards(prev => ({ ...prev, [columnId]: (prev[columnId] || []).filter(c => c.id !== cardId) }));
    setModal(null);
  };

  const deleteColumn = async colId => {
    if (!window.confirm("Delete this column and all its cards?")) return;
    await supabase.from("applications").delete().eq("column_id", colId);
    await supabase.from("columns_config").delete().eq("id", colId);
    setColumns(prev => prev.filter(c => c.id !== colId));
    setCards(prev => { const n = { ...prev }; delete n[colId]; return n; });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>Board</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>{total === 0 ? "No applications yet — add your first!" : `${total} application${total !== 1 ? "s" : ""} tracked`}</div>
        </div>
        <div style={{ display: "flex", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 10, padding: 3, gap: 3 }}>
          {[["kanban", "📋 Kanban"], ["list", "☰ Table"]].map(([key, lbl]) => (
            <button key={key} onClick={() => changeView(key)}
              style={{ padding: "6px 14px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: view === key ? "linear-gradient(135deg, #6366f1, #818cf8)" : "transparent", color: view === key ? "#fff" : "#9ca3af", transition: "all 0.15s" }}>
              {lbl}
            </button>
          ))}
        </div>
        {view === "list" && (
          <button onClick={() => setModal({ columnId: columns[0]?.id, card: null })} style={{ ...btnPrimary, padding: "8px 16px", fontSize: 13 }}>+ Add Application</button>
        )}
        <div style={{ marginLeft: view === "list" ? 0 : "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {columns.map(col => {
            const count = (cards[col.id] || []).length;
            return count > 0 ? <span key={col.id} style={{ background: col.color + "18", color: col.color, border: `1px solid ${col.color}33`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{col.label}: {count}</span> : null;
          })}
        </div>
      </div>

      {view === "kanban" ? (
        <div style={{ display: "flex", gap: 14, padding: "24px", overflowX: "auto", alignItems: "flex-start", flex: 1, background: "#f9fafb" }}>
          {columns.map(col => (
            <Column key={col.id} col={col} colCards={cards[col.id] || []} cvMap={cvMap}
              onAddCard={colId => setModal({ columnId: colId, card: null })}
              onEditCard={(colId, card) => setModal({ columnId: colId, card })}
              onDeleteColumn={deleteColumn}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOverCol(col.id); }}
              onDragLeave={() => setDragOverCol(null)}
              isDragOver={dragOverCol === col.id} />
          ))}
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: 24, background: "#f9fafb" }}>
          <ListView columns={columns} cards={cards} onEditCard={(colId, card) => setModal({ columnId: colId, card })} />
        </div>
      )}
      {modal && <CardForm card={modal.card} onSave={saveCard} onClose={() => setModal(null)} onDelete={deleteCard} columnId={modal.columnId} columns={columns} userId={session.user.id}
        cv={modal.card?.id ? cvMap[modal.card.id] : null} onOpenCv={c => setCvCard(c)} />}
      {cvCard && <CvViewer card={cvCard} onClose={() => { setCvCard(null); loadCvMap(); }} onChanged={loadCvMap} />}
    </div>
  );
}

// ─── Stats Screen ─────────────────────────────────────────────────────────────
function StatsScreen({ cards }) {
  const allCards = Object.entries(cards).flatMap(([colId, colCards]) => colCards.map(c => ({ ...c, column_id: colId })));
  const total = allCards.length;
  const applied = allCards.filter(c => c.column_id !== "wishlist").length;
  const interviews = (cards["interview"] || []).length;
  const offers = (cards["offer"] || []).length;
  const interviewRate = applied > 0 ? Math.round((interviews / applied) * 100) : 0;
  const offerRate = interviews > 0 ? Math.round((offers / interviews) * 100) : 0;

  // Weekly chart
  const weeks = {};
  allCards.forEach(c => {
    if (!c.date) return;
    const d = new Date(c.date);
    const week = `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString("default", { month: "short" })}`;
    weeks[week] = (weeks[week] || 0) + 1;
  });
  const weekEntries = Object.entries(weeks).slice(-6);
  const maxWeek = Math.max(...weekEntries.map(([, v]) => v), 1);

  // Top roles
  const roles = {};
  allCards.forEach(c => { if (c.role) roles[c.role] = (roles[c.role] || 0) + 1; });
  const topRoles = Object.entries(roles).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxRole = Math.max(...topRoles.map(([, v]) => v), 1);

  const StatCard = ({ label, value, sub, badge, badgeColor }) => (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: "#111827", letterSpacing: "-0.03em" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{sub}</div>}
      {badge && <div style={{ display: "inline-flex", alignItems: "center", background: badgeColor + "18", color: badgeColor, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, marginTop: 8 }}>{badge}</div>}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 24px", flexShrink: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>Stats</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>Based on {total} application{total !== 1 ? "s" : ""}</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 24, background: "#f9fafb" }}>
        {total === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#6b7280" }}>No data yet</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Add some applications on the Board to see your stats!</div>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 20 }}>
              <StatCard label="Interview Rate" value={`${interviewRate}%`} sub={`${interviews} of ${applied} applications`} badge={interviewRate >= 30 ? "↑ Great!" : "Keep going!"} badgeColor={interviewRate >= 30 ? "#059669" : "#F59E0B"} />
              <StatCard label="Offer Rate" value={`${offerRate}%`} sub={`${offers} of ${interviews} interviews`} badge={offers > 0 ? "🎉 Offer received!" : "In progress"} badgeColor={offers > 0 ? "#059669" : "#3B82F6"} />
            </div>

            {/* Weekly chart */}
            {weekEntries.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20, marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 20 }}>Applications per week</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
                  {weekEntries.map(([week, count]) => (
                    <div key={week} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                      <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700 }}>{count}</div>
                      <div style={{ width: "100%", borderRadius: "5px 5px 0 0", background: `linear-gradient(180deg, #818cf8, #6366f1)`, height: `${(count / maxWeek) * 80}px`, minHeight: 4 }} />
                      <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, textAlign: "center" }}>{week}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top roles */}
            {topRoles.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 14 }}>Most applied roles</div>
                {topRoles.map(([role, count]) => (
                  <div key={role} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", width: 120, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{role}</div>
                    <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 4, height: 6, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #6366f1, #818cf8)", width: `${(count / maxRole) * 100}%` }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, width: 20, textAlign: "right" }}>{count}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Documents Screen ─────────────────────────────────────────────────────────
function DocumentsScreen({ session }) {
  const [tab, setTab] = useState("cvs");
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tagModal, setTagModal] = useState(null);
  const [tagValue, setTagValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    setLoading(true);
    const { data } = await supabase.from("Documents").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
    setDocs(data || []);
    setLoading(false);
  };

  const handleUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "docx"].includes(ext)) { alert("Only PDF and Word (.docx) files are supported."); return; }
    setTagModal({ file, ext });
    setNameValue(file.name.replace(/\.[^/.]+$/, ""));
    setTagValue("");
    e.target.value = "";
  };

  const confirmUpload = async () => {
    const { file, ext } = tagModal;
    setUploading(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${session.user.id}/${Date.now()}_${safeName}`;
    const { error: uploadError } = await supabase.storage.from("Documents").upload(filePath, file);
    if (uploadError) { alert("Upload failed: " + uploadError.message); setUploading(false); return; }
    const id = Date.now().toString();
    await supabase.from("Documents").insert({
      id, user_id: session.user.id,
      name: nameValue || file.name,
      type: tab === "cvs" ? "cv" : "cover_letter",
      tag: tagValue || null,
      file_path: filePath,
      file_type: ext,
    });
    setTagModal(null); setUploading(false);
    loadDocs();
  };

  const handleDownload = async doc => {
    const { data } = await supabase.storage.from("Documents").createSignedUrl(doc.file_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  const handleDelete = async doc => {
    if (!window.confirm("Delete this document?")) return;
    await supabase.storage.from("Documents").remove([doc.file_path]);
    await supabase.from("Documents").delete().eq("id", doc.id);
    loadDocs();
  };

  const filtered = docs.filter(d => d.type === (tab === "cvs" ? "cv" : "cover_letter"));

  const TAG_COLORS = { Product: "#6366f1", Engineering: "#F59E0B", Marketing: "#EC4899", General: "#10B981", Design: "#3B82F6", Finance: "#8B5CF6" };
  const getTagColor = tag => TAG_COLORS[tag] || "#6366f1";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 24px", display: "flex", alignItems: "center", flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>My Documents</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>{docs.length} document{docs.length !== 1 ? "s" : ""} stored</div>
        </div>
        <button onClick={() => fileRef.current.click()}
          style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 6 }}>
          + Upload
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.docx" onChange={handleUpload} style={{ display: "none" }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 24, background: "#f9fafb" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 10, padding: 3, marginBottom: 20, width: "fit-content" }}>
          {[["cvs", "CVs"], ["cls", "Cover Letters"]].map(([key, lbl]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding: "7px 18px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: tab === key ? "linear-gradient(135deg, #6366f1, #818cf8)" : "transparent", color: tab === key ? "#fff" : "#9ca3af", transition: "all 0.15s" }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Drop zone */}
        <div
          onClick={() => fileRef.current.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "#eef2ff"; }}
          onDragLeave={e => { e.currentTarget.style.borderColor = "#c7d2fe"; e.currentTarget.style.background = "#eef2ff55"; }}
          onDrop={async e => {
            e.preventDefault();
            e.currentTarget.style.borderColor = "#c7d2fe";
            e.currentTarget.style.background = "#eef2ff55";
            const file = e.dataTransfer.files[0];
            if (file) { const fakeEvt = { target: { files: [file], value: "" } }; handleUpload(fakeEvt); }
          }}
          style={{ border: "2px dashed #c7d2fe", borderRadius: 14, padding: "28px 20px", textAlign: "center", background: "#eef2ff55", marginBottom: 20, cursor: "pointer", transition: "all 0.15s" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{tab === "cvs" ? "📎" : "✍️"}</div>
          <div style={{ fontSize: 13, color: "#6366f1", fontWeight: 600 }}>Drop your {tab === "cvs" ? "CV" : "cover letter"} here or click to browse</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>PDF or Word (.docx) · Max 10MB</div>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{tab === "cvs" ? "📄" : "✉️"}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#6b7280" }}>No {tab === "cvs" ? "CVs" : "cover letters"} yet</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Upload one to get started!</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(doc => (
              <div key={doc.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: doc.file_type === "pdf" ? "#fef2f2" : "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {doc.file_type === "pdf" ? "📄" : "📝"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{new Date(doc.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
                </div>
                {doc.tag && (
                  <span style={{ background: getTagColor(doc.tag) + "18", color: getTagColor(doc.tag), borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{doc.tag}</span>
                )}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => handleDownload(doc)} style={{ border: "1px solid #e5e7eb", background: "#f9fafb", borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "#6b7280", cursor: "pointer", fontFamily: "inherit" }}>↓ Download</button>
                  <button onClick={() => handleDelete(doc)} style={{ border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "#EF4444", cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tag/Name modal */}
      {tagModal && (
        <div onClick={e => e.target === e.currentTarget && setTagModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 400, maxWidth: "95vw", boxShadow: "0 24px 60px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", gap: 18 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#111827" }}>Name your {tab === "cvs" ? "CV" : "cover letter"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Name</label>
              <input value={nameValue} onChange={e => setNameValue(e.target.value)} placeholder="e.g. Product Designer CV" style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Tag <span style={{ color: "#9ca3af", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional — e.g. Product, Engineering)</span></label>
              <input value={tagValue} onChange={e => setTagValue(e.target.value)} placeholder="e.g. Product, Engineering, Marketing..." style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setTagModal(null)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", color: "#6b7280", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={confirmUpload} disabled={uploading} style={{ ...btnPrimary, flex: 1, opacity: uploading ? 0.7 : 1 }}>
                {uploading ? "Uploading…" : "Upload →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Trash Screen ─────────────────────────────────────────────────────────────
function TrashScreen({ session, onRestore }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("applications").select("*").eq("user_id", session.user.id).not("deleted_at", "is", null).order("deleted_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRestore = async item => {
    await supabase.from("applications").update({ deleted_at: null }).eq("id", item.id);
    setItems(prev => prev.filter(c => c.id !== item.id));
    onRestore(item);
  };

  const handlePermanentDelete = async item => {
    if (!window.confirm(`Permanently delete "${item.company} – ${item.role}"? This can't be undone.`)) return;
    if (item.jd_file_path) await supabase.storage.from("Documents").remove([item.jd_file_path]);
    await supabase.from("applications").delete().eq("id", item.id);
    setItems(prev => prev.filter(c => c.id !== item.id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 24px", flexShrink: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>Trash</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>{items.length} deleted application{items.length !== 1 ? "s" : ""}</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 24, background: "#f9fafb" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🗑️</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#6b7280" }}>Trash is empty</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Deleted applications will show up here.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map(item => (
              <div key={item.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.company}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{item.role}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Deleted {new Date(item.deleted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => handleRestore(item)} style={{ border: "1px solid #c7d2fe", background: "#eef2ff", borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "#6366f1", cursor: "pointer", fontFamily: "inherit" }}>↺ Restore</button>
                  <button onClick={() => handlePermanentDelete(item)} style={{ border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 600, color: "#EF4444", cursor: "pointer", fontFamily: "inherit" }}>Delete forever</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Potential Roles Screen ───────────────────────────────────────────────────
const ROLE_TYPES = [
  { id: "all", label: "All types" },
  { id: "founder_associate", label: "Founder Associate" },
  { id: "chief_of_staff", label: "Chief of Staff" },
  { id: "ai_deployment", label: "AI Deployment" },
];
const ROLE_TYPE_LABEL = { founder_associate: "Founder Associate", chief_of_staff: "Chief of Staff", ai_deployment: "AI Deployment", other: "Other" };
const CITIES = ["All cities", "Paris", "Barcelona"];

function Seg({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", background: "#f3f4f6", borderRadius: 10, padding: 3 }}>
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)}
          style={{ padding: "6px 12px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: value === o.id ? "linear-gradient(135deg, #6366f1, #818cf8)" : "transparent", color: value === o.id ? "#fff" : "#9ca3af", transition: "all 0.15s" }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function LeadCard({ lead, isFresh, onAdd, onKeep, onDelete, busy }) {
  const strong = lead.fit === "strong";
  const btn = { border: "none", borderRadius: 9, padding: "9px 10px", fontSize: 12, fontWeight: 700, cursor: busy ? "default" : "pointer", fontFamily: "inherit", opacity: busy ? 0.6 : 1 };
  const chip = { fontSize: 11, fontWeight: 600, color: "#6b7280", background: "#f3f4f6", borderRadius: 6, padding: "3px 8px" };
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>
            {lead.company}
            {isFresh && <span style={{ fontSize: 9, fontWeight: 800, color: "#059669", background: "#ecfdf5", borderRadius: 4, padding: "1px 5px", marginLeft: 6 }}>NEW</span>}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginTop: 2, lineHeight: 1.3 }}>{lead.role}</div>
        </div>
        {lead.fit && (
          <span style={{ fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "3px 9px", whiteSpace: "nowrap", background: strong ? "#ecfdf5" : "#fffbeb", color: strong ? "#059669" : "#b45309" }}>
            {strong ? "Strong fit" : "Worth a look"}
          </span>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {lead.role_type && <span style={{ ...chip, background: "#eef2ff", color: "#6366f1" }}>{ROLE_TYPE_LABEL[lead.role_type] || lead.role_type}</span>}
        {(lead.location || lead.city) && <span style={chip}>📍 {lead.location || lead.city}</span>}
        <span style={chip}>{lead.salary || "Salary not listed"}</span>
      </div>
      {lead.why_fit && (
        <div style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.5, background: "#f9fafb", borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 3 }}>Why it fits</div>
          {lead.why_fit}
        </div>
      )}
      <div style={{ fontSize: 11, color: "#9ca3af" }}>
        {lead.source ? `Source: ${lead.source}` : ""}{lead.posted_on ? ` · posted ${lead.posted_on}` : ""} · found {new Date(lead.first_seen_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button disabled={busy} onClick={() => onAdd(lead)} style={{ ...btn, flex: 1, background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "#fff" }}>＋ Add to Wishlist</button>
        {lead.status === "new" && (
          <button disabled={busy} onClick={() => onKeep(lead)} style={{ ...btn, background: "#eef2ff", color: "#6366f1" }}>Keep in list</button>
        )}
        {lead.url && (
          <a href={lead.url} target="_blank" rel="noopener noreferrer" style={{ ...btn, background: "#f3f4f6", color: "#6b7280", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Open ↗</a>
        )}
        <button disabled={busy} onClick={() => onDelete(lead)} title="Delete from list" style={{ ...btn, background: "none", color: "#d1d5db" }}
          onMouseEnter={e => e.currentTarget.style.color = "#EF4444"} onMouseLeave={e => e.currentTarget.style.color = "#d1d5db"}>✕</button>
      </div>
    </div>
  );
}

function LeadsScreen({ session, columns, setCards, onCountChange, showStatus }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("All cities");
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("role_leads").select("*").eq("user_id", session.user.id).in("status", ["new", "kept"]).order("first_seen_at", { ascending: false });
    setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { onCountChange(leads.filter(l => l.status === "new").length); }, [leads]);

  const setStatus = async (lead, status) => {
    const { error } = await supabase.from("role_leads").update({ status, status_changed_at: new Date().toISOString() }).eq("id", lead.id);
    if (error) { showStatus("Couldn't save — try again"); return false; }
    return true;
  };

  const handleAdd = async lead => {
    setBusyId(lead.id);
    const wishlistId = (columns.find(c => c.id === "wishlist") || columns[0]).id;
    const row = {
      id: Date.now().toString(), column_id: wishlistId, user_id: session.user.id,
      company: lead.company, role: lead.role, location: lead.location || lead.city || null,
      salary: lead.salary || null, url: lead.url || null, date: null,
      notes: [lead.why_fit, lead.source ? `Found via ${lead.source}` : null].filter(Boolean).join("\n") || null,
      jd_file_path: null,
    };
    const { error } = await supabase.from("applications").insert(row);
    if (error) { showStatus("Couldn't add to Wishlist"); setBusyId(null); return; }
    await setStatus(lead, "added");
    setCards(prev => ({ ...prev, [wishlistId]: [...(prev[wishlistId] || []), row] }));
    setLeads(prev => prev.filter(l => l.id !== lead.id));
    showStatus(`${lead.company} added to Wishlist`);
    setBusyId(null);
  };

  const handleKeep = async lead => {
    setBusyId(lead.id);
    if (await setStatus(lead, "kept")) setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: "kept" } : l));
    setBusyId(null);
  };

  const handleDelete = async lead => {
    setBusyId(lead.id);
    if (await setStatus(lead, "deleted")) {
      setLeads(prev => prev.filter(l => l.id !== lead.id));
      showStatus("Removed — it won't come back");
    }
    setBusyId(null);
  };

  const q = query.trim().toLowerCase();
  const visible = leads.filter(l =>
    (city === "All cities" || (l.city || "").toLowerCase().includes(city.toLowerCase())) &&
    (type === "all" || l.role_type === type) &&
    (!q || `${l.company} ${l.role}`.toLowerCase().includes(q))
  );
  const newOnes = visible.filter(l => l.status === "new");
  const kept = visible.filter(l => l.status === "kept");
  const latestRun = leads.reduce((m, l) => Math.max(m, new Date(l.first_seen_at).getTime()), 0);
  const isFresh = l => latestRun && Date.now() - new Date(l.first_seen_at).getTime() < 26 * 3600 * 1000;

  const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 };
  const sectionTitle = (label, n) => (
    <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", margin: "4px 0 10px" }}>{label} · {n}</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 24px", flexShrink: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>Potential roles</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>
          Found automatically every evening · {leads.filter(l => l.status === "new").length} new to review · {leads.filter(l => l.status === "kept").length} kept
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
          <Seg options={CITIES.map(c => ({ id: c, label: c }))} value={city} onChange={setCity} />
          <Seg options={ROLE_TYPES} value={type} onChange={setType} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search company or role…"
            style={{ marginLeft: "auto", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 12px", fontSize: 13, width: 220, fontFamily: "inherit", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 24, background: "#f9fafb" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>Loading…</div>
        ) : leads.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#6b7280" }}>Nothing to review</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>New roles show up here after each evening's search.</div>
          </div>
        ) : (
          <>
            {sectionTitle("New to review", newOnes.length)}
            {newOnes.length === 0
              ? <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24 }}>All caught up.</div>
              : <div style={{ ...grid, marginBottom: 28 }}>{newOnes.map(l => <LeadCard key={l.id} lead={l} isFresh={isFresh(l)} busy={busyId === l.id} onAdd={handleAdd} onKeep={handleKeep} onDelete={handleDelete} />)}</div>}
            {sectionTitle("In your list", kept.length)}
            {kept.length === 0
              ? <div style={{ fontSize: 13, color: "#9ca3af" }}>Roles you choose to keep will stay here.</div>
              : <div style={grid}>{kept.map(l => <LeadCard key={l.id} lead={l} isFresh={false} busy={busyId === l.id} onAdd={handleAdd} onKeep={handleKeep} onDelete={handleDelete} />)}</div>}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(undefined);
  const [screen, setScreen] = useState("home");
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [cards, setCards] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [newLeads, setNewLeads] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (window.location.search.includes("reset=true") && session) setScreen("reset");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && _event === "SIGNED_IN") setScreen("board");
      if (_event === "PASSWORD_RECOVERY") setScreen("reset");
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    async function loadData() {
      setLoading(true);
      const userId = session.user.id;
      const { data: colData } = await supabase.from("columns_config").select("*").eq("user_id", userId).order("position");
      const { data: appData } = await supabase.from("applications").select("*").eq("user_id", userId).is("deleted_at", null).order("created_at");
      const { count: leadCount } = await supabase.from("role_leads").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "new");
      setNewLeads(leadCount || 0);
      if (colData && colData.length > 0) setColumns(colData);
      else await supabase.from("columns_config").insert(DEFAULT_COLUMNS.map(c => ({ ...c, user_id: userId })));
      if (appData) {
        const grouped = {};
        appData.forEach(app => {
          if (!grouped[app.column_id]) grouped[app.column_id] = [];
          grouped[app.column_id].push(app);
        });
        setCards(grouped);
      }
      setLoading(false);
    }
    loadData();
  }, [session]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setCards({}); setColumns(DEFAULT_COLUMNS); setScreen("home");
  };

  const showStatus = msg => { setSaveStatus(msg); setTimeout(() => setSaveStatus(null), 2000); };

  const restoreCard = card => {
    setCards(prev => ({ ...prev, [card.column_id]: [...(prev[card.column_id] || []), { ...card, deleted_at: null }] }));
  };

  if (session === undefined) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", fontFamily: "Inter, sans-serif" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 16 }}>💼</div><div style={{ color: "#6b7280", fontSize: 14 }}>Loading…</div></div>
    </div>
  );

  if (screen === "reset") return <SetNewPasswordScreen onDone={() => setScreen("board")} />;
  if (screen === "forgot") return <ForgotPasswordScreen onBack={() => setScreen("auth")} />;
  if (screen === "auth") return <AuthScreen onBack={() => setScreen("home")} onForgotPassword={() => setScreen("forgot")} />;
  if (screen === "home") return <HomeScreen onOpen={() => session ? setScreen("board") : setScreen("auth")} session={session} />;

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", fontFamily: "Inter, sans-serif" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 16 }}>💼</div><div style={{ color: "#6b7280", fontSize: 14 }}>Loading your tracker…</div></div>
    </div>
  );

  const appScreens = ["board", "stats", "leads", "documents", "trash"];
  if (!appScreens.includes(screen)) setScreen("board");

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, -apple-system, sans-serif" }}>
      <Sidebar screen={screen} setScreen={setScreen} session={session} onSignOut={signOut} newLeads={newLeads} />
      <div style={{ marginLeft: 220, flex: 1, overflow: "hidden" }}>
        {screen === "board" && <BoardScreen columns={columns} cards={cards} setCards={setCards} setColumns={setColumns} session={session} saveStatus={saveStatus} />}

        {screen === "leads" && <LeadsScreen session={session} columns={columns} setCards={setCards} onCountChange={setNewLeads} showStatus={showStatus} />}

        {screen === "documents" && <DocumentsScreen session={session} />}

        {screen === "trash" && <TrashScreen session={session} onRestore={restoreCard} />}
      </div>
      {saveStatus && (
        <div style={{ position: "fixed", bottom: 20, right: 20, background: "#111827", color: "#fff", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", zIndex: 2000 }}>
          {saveStatus}
        </div>
      )}
    </div>
  );
}
