import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const DEFAULT_COLUMNS = [
  { id: "wishlist",  label: "Wishlist",   color: "#7C6FCD", position: 0 },
  { id: "applied",   label: "Applied",    color: "#3B82F6", position: 1 },
  { id: "interview", label: "Interview",  color: "#F59E0B", position: 2 },
  { id: "offer",     label: "Offer",      color: "#10B981", position: 3 },
  { id: "rejected",  label: "Rejected",   color: "#EF4444", position: 4 },
];

// ─── Card Modal ───────────────────────────────────────────────────────────────
function CardModal({ card, onSave, onClose, onDelete }) {
  const [form, setForm] = useState(
    card || { company: "", role: "", location: "", salary: "", url: "", date: new Date().toISOString().split("T")[0], notes: "" }
  );
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const inp = {
    border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "8px 11px",
    fontSize: 14, outline: "none", color: "#1a1a2e", fontFamily: "inherit",
    width: "100%", background: "#fff",
  };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase" };

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 460, maxWidth: "95vw", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: 14, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: "#1a1a2e" }}>{card?.id ? "Edit Application" : "Add Application"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888" }}>×</button>
        </div>
        {[
          { k: "company", label: "Company *", placeholder: "e.g. Anthropic" },
          { k: "role", label: "Role *", placeholder: "e.g. Software Engineer" },
          { k: "location", label: "Location", placeholder: "e.g. London / Remote" },
          { k: "salary", label: "Salary", placeholder: "e.g. £80k–£100k" },
          { k: "url", label: "Job URL", placeholder: "https://..." },
        ].map(({ k, label, placeholder }) => (
          <div key={k} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={labelStyle}>{label}</label>
            <input value={form[k] || ""} onChange={set(k)} placeholder={placeholder} style={inp}
              onFocus={e => e.target.style.borderColor = "#7C6FCD"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
          </div>
        ))}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={labelStyle}>Date Applied</label>
          <input type="date" value={form.date || ""} onChange={set("date")} style={inp}
            onFocus={e => e.target.style.borderColor = "#7C6FCD"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={labelStyle}>Notes</label>
          <textarea value={form.notes || ""} onChange={set("notes")} placeholder="Any notes about this role..." rows={3}
            style={{ ...inp, resize: "vertical" }}
            onFocus={e => e.target.style.borderColor = "#7C6FCD"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          {card?.id && (
            <button onClick={() => onDelete(card.id)} style={{ padding: "10px 14px", borderRadius: 8, border: "1.5px solid #FEE2E2", background: "#FFF5F5", color: "#EF4444", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
          )}
          <button onClick={onClose} style={{ marginLeft: "auto", padding: "10px 18px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#f9fafb", color: "#555", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={() => {
            if (!form.company?.trim() || !form.role?.trim()) { alert("Company and Role are required."); return; }
            onSave({ ...form, id: card?.id || Date.now().toString() });
          }} style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #7C6FCD, #a78bfa)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ card, onClick }) {
  const [hovered, setHovered] = useState(false);
  const date = card.date ? new Date(card.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: "#fff", borderRadius: 10, padding: "11px 13px", boxShadow: hovered ? "0 4px 16px rgba(124,111,205,0.18)" : "0 1px 4px rgba(0,0,0,0.07)", cursor: "pointer", border: `1.5px solid ${hovered ? "#c4b5fd" : "transparent"}`, transform: hovered ? "translateY(-1px)" : "none", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>{card.company}</div>
      <div style={{ fontSize: 13, color: "#6b7280" }}>{card.role}</div>
      {card.location && <div style={{ fontSize: 12, color: "#9ca3af" }}>📍 {card.location}</div>}
      {card.salary && <div style={{ fontSize: 12, color: "#9ca3af" }}>💰 {card.salary}</div>}
      {date && <div style={{ fontSize: 11, color: "#d1d5db", marginTop: 4 }}>{date}</div>}
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────
function Column({ col, colCards, onAddCard, onEditCard, onDeleteColumn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [addHovered, setAddHovered] = useState(false);
  return (
    <div style={{ minWidth: 236, width: 236, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 13px", background: "#fff", borderRadius: "12px 12px 0 0", borderBottom: `3px solid ${col.color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", position: "relative" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color, flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e" }}>{col.label}</span>
        <span style={{ background: col.color + "22", color: col.color, borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{colCards.length}</span>
        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 16 }}>⋯</button>
        {menuOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setMenuOpen(false)} />
            <div style={{ position: "absolute", right: 0, top: "100%", zIndex: 100, background: "#fff", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", minWidth: 140, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <button onClick={() => { onDeleteColumn(col.id); setMenuOpen(false); }}
                style={{ display: "block", width: "100%", padding: "9px 14px", background: "none", border: "none", textAlign: "left", fontSize: 13, color: "#EF4444", cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={e => e.target.style.background = "#FFF5F5"}
                onMouseLeave={e => e.target.style.background = "none"}>Delete column</button>
            </div>
          </>
        )}
      </div>
      <div style={{ background: col.color + "11", borderRadius: "0 0 12px 12px", padding: 8, display: "flex", flexDirection: "column", gap: 7, minHeight: 60 }}>
        {colCards.map(card => <Card key={card.id} card={card} onClick={() => onEditCard(col.id, card)} />)}
        <button onClick={() => onAddCard(col.id)}
          onMouseEnter={() => setAddHovered(true)} onMouseLeave={() => setAddHovered(false)}
          style={{ background: addHovered ? "#fff" : "rgba(255,255,255,0.7)", border: `1.5px dashed ${addHovered ? col.color : "#d1d5db"}`, borderRadius: 8, padding: "9px 12px", cursor: "pointer", fontSize: 13, color: addHovered ? col.color : "#9ca3af", textAlign: "center", transition: "all 0.15s", fontFamily: "inherit" }}>
          + Add card
        </button>
      </div>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
function HomeScreen({ onOpen, cards }) {
  const [hovered, setHovered] = useState(false);
  const total = Object.values(cards).flat().length;
  const interviews = (cards["interview"] || []).length;
  const offers = (cards["offer"] || []).length;
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", padding: "40px 20px" }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg, #7C6FCD, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 24, boxShadow: "0 12px 40px rgba(124,111,205,0.4)" }}>💼</div>
      <h1 style={{ margin: 0, fontSize: 40, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 10, textAlign: "center" }}>Job Tracker</h1>
      <p style={{ margin: 0, fontSize: 16, color: "#94a3b8", marginBottom: 48, textAlign: "center", lineHeight: 1.6, maxWidth: 360 }}>Track every application, interview, and offer in one place.</p>
      <button onClick={onOpen} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ padding: "18px 48px", borderRadius: 16, border: "none", background: "linear-gradient(135deg, #7C6FCD, #a78bfa)", color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", boxShadow: hovered ? "0 12px 40px rgba(124,111,205,0.55)" : "0 8px 32px rgba(124,111,205,0.45)", transform: hovered ? "translateY(-2px)" : "none", transition: "all 0.15s", fontFamily: "inherit" }}>
        Open Tracker →
      </button>
      <div style={{ display: "flex", gap: 40, marginTop: 48 }}>
        {[{ num: total, label: "Applications" }, { num: interviews, label: "Interviews" }, { num: offers, label: "Offers" }].map(({ num, label }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#fff" }}>{num}</div>
            <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [cards, setCards] = useState({});
  const [modal, setModal] = useState(null);
  const [addingCol, setAddingCol] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);

  // ── Load data from Supabase on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: colData } = await supabase.from("columns_config").select("*").order("position");
      const { data: appData } = await supabase.from("applications").select("*").order("created_at");

      if (colData && colData.length > 0) setColumns(colData);
      else {
        // First time: insert default columns
        await supabase.from("columns_config").insert(DEFAULT_COLUMNS);
      }

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
  }, []);

  const showStatus = (msg) => { setSaveStatus(msg); setTimeout(() => setSaveStatus(null), 2000); };

  // ── Save card
  const saveCard = async (cardData) => {
    const { columnId } = modal;
    const row = { id: cardData.id, column_id: columnId, company: cardData.company, role: cardData.role, location: cardData.location || null, salary: cardData.salary || null, url: cardData.url || null, date: cardData.date || null, notes: cardData.notes || null };
    const isEdit = !!modal.card?.id;
    if (isEdit) {
      await supabase.from("applications").update(row).eq("id", cardData.id);
      setCards(prev => ({ ...prev, [columnId]: (prev[columnId] || []).map(c => c.id === cardData.id ? { ...c, ...row } : c) }));
    } else {
      await supabase.from("applications").insert(row);
      setCards(prev => ({ ...prev, [columnId]: [...(prev[columnId] || []), { ...row }] }));
    }
    showStatus("✓ Saved");
    setModal(null);
  };

  // ── Delete card
  const deleteCard = async (cardId) => {
    const { columnId } = modal;
    await supabase.from("applications").delete().eq("id", cardId);
    setCards(prev => ({ ...prev, [columnId]: (prev[columnId] || []).filter(c => c.id !== cardId) }));
    showStatus("Deleted");
    setModal(null);
  };

  // ── Delete column
  const deleteColumn = async (colId) => {
    if (!window.confirm("Delete this column and all its cards?")) return;
    await supabase.from("applications").delete().eq("column_id", colId);
    await supabase.from("columns_config").delete().eq("id", colId);
    setColumns(prev => prev.filter(c => c.id !== colId));
    setCards(prev => { const n = { ...prev }; delete n[colId]; return n; });
  };

  // ── Add column
  const addColumn = async () => {
    if (!newColName.trim()) return;
    const COLORS = ["#06B6D4", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];
    const id = newColName.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    const newCol = { id, label: newColName.trim(), color: COLORS[columns.length % COLORS.length], position: columns.length };
    await supabase.from("columns_config").insert(newCol);
    setColumns(prev => [...prev, newCol]);
    setNewColName("");
    setAddingCol(false);
  };

  const total = Object.values(cards).flat().length;

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a2e", color: "#94a3b8", fontSize: 16, fontFamily: "Inter, sans-serif" }}>
      Loading your tracker…
    </div>
  );

  if (screen === "home") return <HomeScreen onOpen={() => setScreen("board")} cards={cards} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", display: "flex", flexDirection: "column", fontFamily: "Inter, -apple-system, sans-serif" }}>
      {/* Topbar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={() => setScreen("home")}
          style={{ background: "none", border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#555", cursor: "pointer", fontFamily: "inherit" }}
          onMouseEnter={e => { e.target.style.borderColor = "#7C6FCD"; e.target.style.color = "#7C6FCD"; }}
          onMouseLeave={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.color = "#555"; }}>
          ← Home
        </button>
        <div style={{ marginLeft: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e", letterSpacing: "-0.02em" }}>Job Tracker</div>
          <div style={{ fontSize: 13, color: "#9ca3af" }}>{total === 0 ? "No applications yet" : `${total} application${total !== 1 ? "s" : ""} tracked`}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {columns.map(col => {
            const count = (cards[col.id] || []).length;
            return count > 0 ? (
              <span key={col.id} style={{ background: col.color + "18", color: col.color, borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>{col.label}: {count}</span>
            ) : null;
          })}
        </div>
      </div>

      {/* Board */}
      <div style={{ display: "flex", gap: 14, padding: "24px 20px", overflowX: "auto", alignItems: "flex-start", flex: 1 }}>
        {columns.map(col => (
          <Column key={col.id} col={col} colCards={cards[col.id] || []}
            onAddCard={(colId) => setModal({ columnId: colId, card: null })}
            onEditCard={(colId, card) => setModal({ columnId: colId, card })}
            onDeleteColumn={deleteColumn} />
        ))}
        <div style={{ minWidth: 215, flexShrink: 0 }}>
          {addingCol ? (
            <div style={{ background: "#fff", borderRadius: 12, padding: 13, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
              <input autoFocus value={newColName} onChange={e => setNewColName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addColumn(); if (e.key === "Escape") setAddingCol(false); }}
                placeholder="Column name…"
                style={{ border: "1.5px solid #7C6FCD", borderRadius: 7, padding: "8px 10px", fontSize: 14, outline: "none", color: "#1a1a2e", fontFamily: "inherit" }} />
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={addColumn} style={{ flex: 1, padding: 7, borderRadius: 7, border: "none", background: "#7C6FCD", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Add</button>
                <button onClick={() => { setAddingCol(false); setNewColName(""); }} style={{ flex: 1, padding: 7, borderRadius: 7, border: "1.5px solid #e5e7eb", background: "#f9fafb", color: "#555", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingCol(true)}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px dashed #d1d5db", background: "rgba(255,255,255,0.5)", color: "#9ca3af", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={e => { e.target.style.background = "#fff"; e.target.style.borderColor = "#7C6FCD"; e.target.style.color = "#7C6FCD"; }}
              onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.5)"; e.target.style.borderColor = "#d1d5db"; e.target.style.color = "#9ca3af"; }}>
              + Add Column
            </button>
          )}
        </div>
      </div>

      {modal && <CardModal card={modal.card} onSave={saveCard} onClose={() => setModal(null)} onDelete={deleteCard} />}

      {saveStatus && (
        <div style={{ position: "fixed", bottom: 20, right: 20, background: "#1a1a2e", color: "#fff", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", zIndex: 2000 }}>
          {saveStatus}
        </div>
      )}
    </div>
  );
}
