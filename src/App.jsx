import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const DEFAULT_COLUMNS = [
  { id: "wishlist",  label: "Wishlist",   color: "#7C6FCD", position: 0 },
  { id: "applied",   label: "Applied",    color: "#3B82F6", position: 1 },
  { id: "interview", label: "Interview",  color: "#F59E0B", position: 2 },
  { id: "offer",     label: "Offer",      color: "#10B981", position: 3 },
  { id: "rejected",  label: "Rejected",   color: "#EF4444", position: 4 },
];

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onBack }) {
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async () => {
    if (!email || !password) { setMessage({ type: "error", text: "Please fill in all fields." }); return; }
    setLoading(true);
    setMessage(null);
    if (tab === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage({ type: "error", text: error.message });
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage({ type: "error", text: error.message });
      else setMessage({ type: "success", text: "Account created! Check your email to confirm your account." });
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const inp = {
    background: "#07070f", border: "1px solid #2a2a4a", borderRadius: 10,
    padding: "12px 14px", fontSize: 14, color: "#fff", outline: "none",
    fontFamily: "inherit", width: "100%", transition: "border-color 0.15s",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#050508", position: "relative", overflow: "hidden", fontFamily: "Inter, -apple-system, sans-serif" }}>
      <div style={{ position: "absolute", top: "5%", left: "10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,111,205,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ background: "#0a0a14", border: "1px solid #2a2a4a", borderRadius: 24, padding: 40, width: "100%", maxWidth: 420, boxShadow: "0 32px 80px rgba(0,0,0,0.5)", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Back button */}
        <button onClick={onBack}
          style={{ position: "absolute", top: 20, left: 20, background: "none", border: "1px solid #2a2a4a", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: "#6060a0", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
          onMouseEnter={e => { e.target.style.borderColor = "rgba(255,255,255,0.3)"; e.target.style.color = "#fff"; }}
          onMouseLeave={e => { e.target.style.borderColor = "#2a2a4a"; e.target.style.color = "#6060a0"; }}>
          ← Back
        </button>

        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", marginTop: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #7C6FCD, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 8px 24px rgba(124,111,205,0.35)" }}>💼</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Job Tracker</div>
            <div style={{ fontSize: 14, color: "#9090b0", marginTop: 4 }}>{tab === "signin" ? "Sign in to your account" : "Create your account"}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#07070f", border: "1px solid #2a2a4a", borderRadius: 10, padding: 3, gap: 3 }}>
          {[["signin", "Sign in"], ["signup", "Create account"]].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setMessage(null); }}
              style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", background: tab === key ? "linear-gradient(135deg, #7C6FCD, #a78bfa)" : "transparent", color: tab === key ? "#fff" : "#6060a0" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6060a0", letterSpacing: "0.08em", textTransform: "uppercase" }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" style={inp}
              onFocus={e => e.target.style.borderColor = "#7C6FCD"}
              onBlur={e => e.target.style.borderColor = "#2a2a4a"}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6060a0", letterSpacing: "0.08em", textTransform: "uppercase" }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={inp}
              onFocus={e => e.target.style.borderColor = "#7C6FCD"}
              onBlur={e => e.target.style.borderColor = "#2a2a4a"}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{ padding: "12px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, background: message.type === "error" ? "#1a0a0a" : "#0a1a0f", border: `1px solid ${message.type === "error" ? "#EF444433" : "#10B98133"}`, color: message.type === "error" ? "#EF4444" : "#10B981" }}>
            {message.text}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #7C6FCD, #a78bfa)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1, boxShadow: "0 4px 20px rgba(124,111,205,0.4)", transition: "all 0.2s" }}>
          {loading ? "Please wait…" : tab === "signin" ? "Sign in →" : "Create account →"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: "#2a2a4a" }} />
          <span style={{ fontSize: 11, color: "#3a3a5a", fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "#2a2a4a" }} />
        </div>

        {/* Google */}
        <button onClick={handleGoogle}
          style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #2a2a4a", background: "#07070f", color: "#9090b0", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#3a3a6a"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "#0e0e1e"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a4a"; e.currentTarget.style.color = "#9090b0"; e.currentTarget.style.background = "#07070f"; }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

// ─── Card Modal ───────────────────────────────────────────────────────────────
function CardModal({ card, onSave, onClose, onDelete }) {
  const [form, setForm] = useState(
    card || { company: "", role: "", location: "", salary: "", url: "", date: new Date().toISOString().split("T")[0], notes: "" }
  );
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const inp = { border: "1.5px solid #2a2a3a", borderRadius: 8, padding: "8px 11px", fontSize: 14, outline: "none", color: "#fff", fontFamily: "inherit", width: "100%", background: "#13131f", transition: "border-color 0.15s" };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase" };
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#0e0e1a", border: "1px solid #2a2a3a", borderRadius: 20, padding: 32, width: 480, maxWidth: "95vw", boxShadow: "0 32px 80px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", gap: 16, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{card?.id ? "Edit Application" : "New Application"}</h2>
          <button onClick={onClose} style={{ background: "#1a1a2e", border: "1px solid #2a2a3a", borderRadius: 8, width: 32, height: 32, fontSize: 18, cursor: "pointer", color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        {[
          { k: "company", label: "Company *", placeholder: "e.g. Stripe" },
          { k: "role", label: "Role *", placeholder: "e.g. Product Designer" },
          { k: "location", label: "Location", placeholder: "e.g. London / Remote" },
          { k: "salary", label: "Salary", placeholder: "e.g. £80k–£100k" },
          { k: "url", label: "Job URL", placeholder: "https://..." },
        ].map(({ k, label, placeholder }) => (
          <div key={k} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>{label}</label>
            <input value={form[k] || ""} onChange={set(k)} placeholder={placeholder} style={inp}
              onFocus={e => e.target.style.borderColor = "#7C6FCD"}
              onBlur={e => e.target.style.borderColor = "#2a2a3a"} />
          </div>
        ))}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle}>Date Applied</label>
          <input type="date" value={form.date || ""} onChange={set("date")} style={inp}
            onFocus={e => e.target.style.borderColor = "#7C6FCD"}
            onBlur={e => e.target.style.borderColor = "#2a2a3a"} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={labelStyle}>Notes</label>
          <textarea value={form.notes || ""} onChange={set("notes")} placeholder="Anything to remember about this role..." rows={3}
            style={{ ...inp, resize: "vertical" }}
            onFocus={e => e.target.style.borderColor = "#7C6FCD"}
            onBlur={e => e.target.style.borderColor = "#2a2a3a"} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          {card?.id && <button onClick={() => onDelete(card.id)} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #3a1a1a", background: "#1a0a0a", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>}
          <button onClick={onClose} style={{ marginLeft: "auto", padding: "10px 20px", borderRadius: 10, border: "1px solid #2a2a3a", background: "#1a1a2e", color: "#888", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={() => {
            if (!form.company?.trim() || !form.role?.trim()) { alert("Company and Role are required."); return; }
            onSave({ ...form, id: card?.id || Date.now().toString() });
          }} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #7C6FCD, #a78bfa)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 20px rgba(124,111,205,0.4)" }}>Save →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ card, onClick }) {
  const [hovered, setHovered] = useState(false);
  const date = card.date ? new Date(card.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? "#13132a" : "#0e0e1e", borderRadius: 11, padding: "12px 13px", cursor: "pointer", border: "1px solid #2a2a4a", transform: hovered ? "translateY(-2px)" : "none", boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.4)" : "none", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{card.company}</div>
      <div style={{ fontSize: 12, color: "#7070a0" }}>{card.role}</div>
      {card.location && <div style={{ fontSize: 11, color: "#555" }}>📍 {card.location}</div>}
      {card.salary && <div style={{ fontSize: 11, color: "#10B981", fontWeight: 600 }}>{card.salary}</div>}
      {date && <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{date}</div>}
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────
function Column({ col, colCards, onAddCard, onEditCard, onDeleteColumn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [addHovered, setAddHovered] = useState(false);
  const c = col.color;
  return (
    <div style={{ minWidth: 240, width: 240, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", background: "#0a0a18", borderRadius: "14px 14px 0 0", border: `1px solid ${c}44`, borderBottom: `2px solid ${c}`, position: "relative" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: c, boxShadow: `0 0 8px ${c}`, flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: 11, color: c, letterSpacing: "0.06em", textTransform: "uppercase" }}>{col.label}</span>
        <span style={{ background: c + "22", color: c, borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700, marginLeft: 2 }}>{colCards.length}</span>
        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: c + "88", fontSize: 16, lineHeight: 1 }}>⋯</button>
        {menuOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setMenuOpen(false)} />
            <div style={{ position: "absolute", right: 0, top: "100%", zIndex: 100, background: "#0e0e1a", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", minWidth: 140, border: "1px solid #2a2a3a", overflow: "hidden" }}>
              <button onClick={() => { onDeleteColumn(col.id); setMenuOpen(false); }}
                style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", textAlign: "left", fontSize: 13, color: "#ef4444", cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={e => e.target.style.background = "#1a0a0a"}
                onMouseLeave={e => e.target.style.background = "none"}>Delete column</button>
            </div>
          </>
        )}
      </div>
      <div style={{ background: "#07070f", border: `1px solid ${c}44`, borderTop: "none", borderRadius: "0 0 14px 14px", padding: 8, display: "flex", flexDirection: "column", gap: 7, minHeight: 80 }}>
        {colCards.map(card => <Card key={card.id} card={card} onClick={() => onEditCard(col.id, card)} />)}
        <button onClick={() => onAddCard(col.id)}
          onMouseEnter={() => setAddHovered(true)} onMouseLeave={() => setAddHovered(false)}
          style={{ background: addHovered ? c + "0a" : "transparent", border: `1px dashed ${addHovered ? c : c + "66"}`, borderRadius: 10, padding: "9px 12px", cursor: "pointer", fontSize: 12, color: addHovered ? c : c + "99", textAlign: "center", transition: "all 0.15s", fontFamily: "inherit", fontWeight: 600 }}>
          + Add card
        </button>
      </div>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
function HomeScreen({ onOpen, session, onSignOut }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#050508", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", position: "relative", overflow: "hidden", fontFamily: "Inter, -apple-system, sans-serif" }}>
      <div style={{ position: "absolute", top: "10%", left: "15%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,111,205,0.13) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,111,205,0.05) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* Top right: sign in or sign out */}
      <div style={{ position: "absolute", top: 20, right: 24, zIndex: 1 }}>
        {session ? (
          <button onClick={onSignOut}
            style={{ background: "none", border: "1px solid #2a2a4a", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#6060a0", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
            onMouseEnter={e => { e.target.style.borderColor = "#EF444444"; e.target.style.color = "#EF4444"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#2a2a4a"; e.target.style.color = "#6060a0"; }}>
            Sign out
          </button>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(124,111,205,0.1)", border: "1px solid rgba(124,111,205,0.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 32, position: "relative", zIndex: 1 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
        <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, letterSpacing: "0.08em" }}>YOUR CAREER COMMAND CENTER</span>
      </div>

      <h1 style={{ margin: 0, fontSize: "clamp(42px, 8vw, 76px)", fontWeight: 900, letterSpacing: "-0.04em", textAlign: "center", lineHeight: 1.0, marginBottom: 24, position: "relative", zIndex: 1 }}>
        <span style={{ color: "#fff", display: "block" }}>Land your</span>
        <span style={{ background: "linear-gradient(135deg, #7C6FCD, #a78bfa, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "block" }}>dream job.</span>
      </h1>

      <p style={{ margin: 0, fontSize: 18, color: "#9090b0", marginBottom: 40, textAlign: "center", lineHeight: 1.7, maxWidth: 420, position: "relative", zIndex: 1 }}>
        Track every application, follow-up, and offer — all in one place. Never lose track of an opportunity again.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 44, flexWrap: "wrap", justifyContent: "center", position: "relative", zIndex: 1 }}>
        {["Kanban board", "Syncs across devices", "No spreadsheets", "Completely free"].map(f => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid #2a2a4a", borderRadius: 100, padding: "8px 16px", fontSize: 12, color: "#8888aa", fontWeight: 500 }}>
            <span style={{ color: "#7C6FCD" }}>✦</span> {f}
          </div>
        ))}
      </div>

      {/* CTA: if logged in go straight to board, else go to login */}
      <button onClick={onOpen} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ padding: "18px 52px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #7C6FCD, #a78bfa)", color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em", boxShadow: hovered ? "0 16px 48px rgba(124,111,205,0.55)" : "0 8px 32px rgba(124,111,205,0.4)", transform: hovered ? "translateY(-3px) scale(1.02)" : "none", transition: "all 0.2s", fontFamily: "inherit", marginBottom: 48, position: "relative", zIndex: 1 }}>
        {session ? "Open Tracker →" : "Get Started →"}
      </button>

      <p style={{ margin: 0, fontSize: 11, color: "#4a4a6a", letterSpacing: "0.1em", fontWeight: 600, position: "relative", zIndex: 1 }}>FREE · SYNC ACROSS DEVICES · NO SPREADSHEETS</p>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(undefined);
  const [screen, setScreen] = useState("home"); // "home" | "auth" | "board"
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [cards, setCards] = useState({});
  const [modal, setModal] = useState(null);
  const [addingCol, setAddingCol] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // When user logs in, go straight to board
      if (session) setScreen("board");
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load data when session available
  useEffect(() => {
    if (!session) return;
    async function loadData() {
      setLoading(true);
      const userId = session.user.id;
      const { data: colData } = await supabase.from("columns_config").select("*").eq("user_id", userId).order("position");
      const { data: appData } = await supabase.from("applications").select("*").eq("user_id", userId).order("created_at");
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

  const showStatus = (msg) => { setSaveStatus(msg); setTimeout(() => setSaveStatus(null), 2000); };

  const handleOpen = () => {
    if (session) setScreen("board");
    else setScreen("auth");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCards({}); setColumns(DEFAULT_COLUMNS); setScreen("home");
  };

  const saveCard = async (cardData) => {
    const { columnId } = modal;
    const userId = session.user.id;
    const row = { id: cardData.id, column_id: columnId, user_id: userId, company: cardData.company, role: cardData.role, location: cardData.location || null, salary: cardData.salary || null, url: cardData.url || null, date: cardData.date || null, notes: cardData.notes || null };
    if (modal.card?.id) {
      await supabase.from("applications").update(row).eq("id", cardData.id);
      setCards(prev => ({ ...prev, [columnId]: (prev[columnId] || []).map(c => c.id === cardData.id ? { ...c, ...row } : c) }));
    } else {
      await supabase.from("applications").insert(row);
      setCards(prev => ({ ...prev, [columnId]: [...(prev[columnId] || []), row] }));
    }
    showStatus("✓ Saved");
    setModal(null);
  };

  const deleteCard = async (cardId) => {
    const { columnId } = modal;
    await supabase.from("applications").delete().eq("id", cardId);
    setCards(prev => ({ ...prev, [columnId]: (prev[columnId] || []).filter(c => c.id !== cardId) }));
    showStatus("Deleted");
    setModal(null);
  };

  const deleteColumn = async (colId) => {
    if (!window.confirm("Delete this column and all its cards?")) return;
    await supabase.from("applications").delete().eq("column_id", colId);
    await supabase.from("columns_config").delete().eq("id", colId);
    setColumns(prev => prev.filter(c => c.id !== colId));
    setCards(prev => { const n = { ...prev }; delete n[colId]; return n; });
  };

  const addColumn = async () => {
    if (!newColName.trim()) return;
    const COLORS = ["#06B6D4", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];
    const id = newColName.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    const newCol = { id, label: newColName.trim(), color: COLORS[columns.length % COLORS.length], position: columns.length, user_id: session.user.id };
    await supabase.from("columns_config").insert(newCol);
    setColumns(prev => [...prev, newCol]);
    setNewColName(""); setAddingCol(false);
  };

  const total = Object.values(cards).flat().length;

  // Loading auth
  if (session === undefined) return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050508", fontFamily: "Inter, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>💼</div>
        <div style={{ color: "#9090b0", fontSize: 14 }}>Loading…</div>
      </div>
    </div>
  );

  // Flow: home → auth → board
  if (screen === "home") return <HomeScreen onOpen={handleOpen} session={session} onSignOut={signOut} />;
  if (screen === "auth") return <AuthScreen onBack={() => setScreen("home")} />;

  // Loading board data
  if (loading) return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050508", fontFamily: "Inter, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>💼</div>
        <div style={{ color: "#9090b0", fontSize: 14 }}>Loading your tracker…</div>
      </div>
    </div>
  );

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#050508", display: "flex", flexDirection: "column", fontFamily: "Inter, -apple-system, sans-serif" }}>
      <div style={{ background: "#050508", borderBottom: "1px solid #2a2a4a", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={() => setScreen("home")}
          style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
          onMouseEnter={e => { e.target.style.borderColor = "rgba(255,255,255,0.5)"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
          onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; e.target.style.background = "none"; }}>
          ← Home
        </button>
        <div style={{ marginLeft: 8 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Job Tracker</div>
          <div style={{ fontSize: 12, color: "#9090b0", marginTop: 2 }}>{total === 0 ? "No applications yet — add your first!" : `${total} application${total !== 1 ? "s" : ""} tracked`}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {columns.map(col => {
            const count = (cards[col.id] || []).length;
            return count > 0 ? <span key={col.id} style={{ background: col.color + "18", color: col.color, border: `1px solid ${col.color}33`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{col.label}: {count}</span> : null;
          })}
          <button onClick={signOut}
            style={{ background: "none", border: "1px solid #2a2a4a", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 600, color: "#6060a0", cursor: "pointer", fontFamily: "inherit", marginLeft: 8, transition: "all 0.15s" }}
            onMouseEnter={e => { e.target.style.borderColor = "#EF444444"; e.target.style.color = "#EF4444"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#2a2a4a"; e.target.style.color = "#6060a0"; }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, padding: "28px 24px", overflowX: "auto", alignItems: "flex-start", flex: 1 }}>
        {columns.map(col => (
          <Column key={col.id} col={col} colCards={cards[col.id] || []}
            onAddCard={(colId) => setModal({ columnId: colId, card: null })}
            onEditCard={(colId, card) => setModal({ columnId: colId, card })}
            onDeleteColumn={deleteColumn} />
        ))}
        <div style={{ minWidth: 215, flexShrink: 0 }}>
          {addingCol ? (
            <div style={{ background: "#0e0e1a", border: "1px solid #2a2a3a", borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <input autoFocus value={newColName} onChange={e => setNewColName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addColumn(); if (e.key === "Escape") setAddingCol(false); }}
                placeholder="Column name…"
                style={{ border: "1px solid #7C6FCD", borderRadius: 8, padding: "8px 10px", fontSize: 14, outline: "none", color: "#fff", fontFamily: "inherit", background: "#13131f" }} />
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={addColumn} style={{ flex: 1, padding: 8, borderRadius: 8, border: "none", background: "linear-gradient(135deg, #7C6FCD, #a78bfa)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Add</button>
                <button onClick={() => { setAddingCol(false); setNewColName(""); }} style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #2a2a3a", background: "transparent", color: "#666", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingCol(true)}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 14, border: "1px dashed #3a3a5a", background: "transparent", color: "#6060a0", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
              onMouseEnter={e => { e.target.style.borderColor = "#7C6FCD"; e.target.style.color = "#a78bfa"; e.target.style.background = "#7C6FCD0a"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#3a3a5a"; e.target.style.color = "#6060a0"; e.target.style.background = "transparent"; }}>
              + Add Column
            </button>
          )}
        </div>
      </div>

      {modal && <CardModal card={modal.card} onSave={saveCard} onClose={() => setModal(null)} onDelete={deleteCard} />}

      {saveStatus && (
        <div style={{ position: "fixed", bottom: 20, right: 20, background: "#0e0e1a", border: "1px solid #2a2a3a", color: "#a78bfa", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 2000 }}>
          {saveStatus}
        </div>
      )}
    </div>
  );
}
