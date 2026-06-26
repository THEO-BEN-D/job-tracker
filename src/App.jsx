import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const DEFAULT_COLUMNS = [
  { id: "wishlist",  label: "Wishlist",   color: "#7C6FCD", position: 0 },
  { id: "applied",   label: "Applied",    color: "#3B82F6", position: 1 },
  { id: "interview", label: "Interview",  color: "#F59E0B", position: 2 },
  { id: "offer",     label: "Offer",      color: "#10B981", position: 3 },
  { id: "rejected",  label: "Rejected",   color: "#EF4444", position: 4 },
];

function CardModal({ card, onSave, onClose, onDelete }) {
  const [form, setForm] = useState(
    card || { company: "", role: "", location: "", salary: "", url: "", date: new Date().toISOString().split("T")[0], notes: "" }
  );
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const inp = {
    border: "1.5px solid #2a2a3a", borderRadius: 8, padding: "8px 11px",
    fontSize: 14, outline: "none", color: "#fff", fontFamily: "inherit",
    width: "100%", background: "#13131f", transition: "border-color 0.15s",
  };
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
          {card?.id && (
            <button onClick={() => onDelete(card.id)} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid #3a1a1a", background: "#1a0a0a", color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
          )}
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

function Card({ card, onClick }) {
  const [hovered, setHovered] = useState(false);
  const date = card.date ? new Date(card.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? "#16162a" : "#0e0e1a", borderRadius: 12, padding: "12px 14px", boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.4)" : "none", cursor: "pointer", border: `1px solid ${hovered ? "#7C6FCD44" : "#2a2a3a"}`, transform: hovered ? "translateY(-2px)" : "none", transition: "all 0.15s", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{card.company}</div>
      <div style={{ fontSize: 12, color: "#888" }}>{card.role}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        {card.location && <div style={{ fontSize: 11, color: "#555" }}>📍 {card.location}</div>}
        {date && <div style={{ fontSize: 11, color: "#444", marginLeft: "auto" }}>{date}</div>}
      </div>
      {card.salary && <div style={{ fontSize: 11, color: "#10B981", fontWeight: 600 }}>{card.salary}</div>}
    </div>
  );
}

function Column({ col, colCards, onAddCard, onEditCard, onDeleteColumn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [addHovered, setAddHovered] = useState(false);
  return (
    <div style={{ minWidth: 240, width: 240, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#0e0e1a", borderRadius: "14px 14px 0 0", border: "1px solid #2a2a3a", borderBottom: `2px solid ${col.color}`, position: "relative" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color, boxShadow: `0 0 8px ${col.color}` }} />
        <span style={{ fontWeight: 700, fontSize: 12, color: "#ccc", letterSpacing: "0.05em", textTransform: "uppercase" }}>{col.label}</span>
        <span style={{ background: col.color + "22", color: col.color, borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700, marginLeft: 2 }}>{colCards.length}</span>
        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#444", fontSize: 16, lineHeight: 1 }}>⋯</button>
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
      <div style={{ background: "#0a0a14", border: "1px solid #2a2a3a", borderTop: "none", borderRadius: "0 0 14px 14px", padding: 8, display: "flex", flexDirection: "column", gap: 6, minHeight: 80 }}>
        {colCards.map(card => <Card key={card.id} card={card} onClick={() => onEditCard(col.id, card)} />)}
        <button onClick={() => onAddCard(col.id)}
          onMouseEnter={() => setAddHovered(true)} onMouseLeave={() => setAddHovered(false)}
          style={{ background: addHovered ? "#16162a" : "transparent", border: `1px dashed ${addHovered ? col.color + "88" : "#2a2a3a"}`, borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontSize: 12, color: addHovered ? col.color : "#444", textAlign: "center", transition: "all 0.15s", fontFamily: "inherit", fontWeight: 600 }}>
          + Add card
        </button>
      </div>
    </div>
  );
}

function HomeScreen({ onOpen, cards }) {
  const [hovered, setHovered] = useState(false);
  const total = Object.values(cards).flat().length;
  const interviews = (cards["interview"] || []).length;
  const offers = (cards["offer"] || []).length;

  return (
    <div style={{ minHeight: "100vh", background: "#050508", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", position: "relative", overflow: "hidden", fontFamily: "Inter, -apple-system, sans-serif" }}>
      {/* Glow blobs */}
      <div style={{ position: "absolute", top: "10%", left: "15%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,111,205,0.13) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,111,205,0.05) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(124,111,205,0.1)", border: "1px solid rgba(124,111,205,0.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 32, position: "relative", zIndex: 1 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
        <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 700, letterSpacing: "0.08em" }}>YOUR CAREER COMMAND CENTER</span>
      </div>

      {/* Headline */}
      <h1 style={{ margin: 0, fontSize: "clamp(42px, 8vw, 76px)", fontWeight: 900, letterSpacing: "-0.04em", textAlign: "center", lineHeight: 1.0, marginBottom: 24, position: "relative", zIndex: 1 }}>
        <span style={{ color: "#fff", display: "block" }}>Land your</span>
        <span style={{ background: "linear-gradient(135deg, #7C6FCD, #a78bfa, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "block" }}>dream job.</span>
      </h1>

      {/* Subtitle */}
      <p style={{ margin: 0, fontSize: 18, color: "#9090b0", marginBottom: 40, textAlign: "center", lineHeight: 1.7, maxWidth: 420, position: "relative", zIndex: 1 }}>
        Track every application, follow-up, and offer — all in one place. Never lose track of an opportunity again.
      </p>

      {/* Feature pills */}
      <div style={{ display: "flex", gap: 10, marginBottom: 44, flexWrap: "wrap", justifyContent: "center", position: "relative", zIndex: 1 }}>
        {["Kanban board", "Syncs across devices", "No spreadsheets", "Completely free"].map(f => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid #2a2a4a", borderRadius: 100, padding: "8px 16px", fontSize: 12, color: "#8888aa", fontWeight: 500 }}>
            <span style={{ color: "#7C6FCD" }}>✦</span> {f}
          </div>
        ))}
      </div>

      {/* CTA */}
      <button onClick={onOpen} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ padding: "18px 52px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #7C6FCD, #a78bfa)", color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em", boxShadow: hovered ? "0 16px 48px rgba(124,111,205,0.55)" : "0 8px 32px rgba(124,111,205,0.4)", transform: hovered ? "translateY(-3px) scale(1.02)" : "none", transition: "all 0.2s", fontFamily: "inherit", marginBottom: 56, position: "relative", zIndex: 1 }}>
        Open Tracker →
      </button>

      {/* Stats */}
      <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "1px solid #2a2a4a", borderRadius: 18, overflow: "hidden", marginBottom: 36, position: "relative", zIndex: 1 }}>
        {[
          { num: total, label: "Applications", icon: "📋" },
          { num: interviews, label: "Interviews", icon: "🎯" },
          { num: offers, label: "Offers", icon: "🏆" },
        ].map(({ num, label, icon }, i) => (
          <div key={label} style={{ textAlign: "center", padding: "22px 44px", borderRight: i < 2 ? "1px solid #2a2a4a" : "none" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>{num}</div>
            <div style={{ fontSize: 11, color: "#9090b0", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 6, fontWeight: 700 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tagline */}
      <p style={{ margin: 0, fontSize: 11, color: "#4a4a6a", letterSpacing: "0.1em", fontWeight: 600, position: "relative", zIndex: 1 }}>
        FREE · SYNC ACROSS DEVICES · NO SPREADSHEETS
      </p>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [cards, setCards] = useState({});
  const [modal, setModal] = useState(null);
  const [addingCol, setAddingCol] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: colData } = await supabase.from("columns_config").select("*").order("position");
      const { data: appData } = await supabase.from("applications").select("*").order("created_at");
      if (colData && colData.length > 0) setColumns(colData);
      else await supabase.from("columns_config").insert(DEFAULT_COLUMNS);
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

  const saveCard = async (cardData) => {
    const { columnId } = modal;
    const row = { id: cardData.id, column_id: columnId, company: cardData.company, role: cardData.role, location: cardData.location || null, salary: cardData.salary || null, url: cardData.url || null, date: cardData.date || null, notes: cardData.notes || null };
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
    const newCol = { id, label: newColName.trim(), color: COLORS[columns.length % COLORS.length], position: columns.length };
    await supabase.from("columns_config").insert(newCol);
    setColumns(prev => [...prev, newCol]);
    setNewColName("");
    setAddingCol(false);
  };

  const total = Object.values(cards).flat().length;

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050508", fontFamily: "Inter, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>💼</div>
        <div style={{ color: "#444", fontSize: 14, letterSpacing: "0.05em" }}>Loading your tracker…</div>
      </div>
    </div>
  );

  if (screen === "home") return <HomeScreen onOpen={() => setScreen("board")} cards={cards} />;

  return (
    <div style={{ minHeight: "100vh", background: "#050508", display: "flex", flexDirection: "column", fontFamily: "Inter, -apple-system, sans-serif" }}>
      <div style={{ background: "#0a0a14", borderBottom: "1px solid #2a2a3a", padding: "12px 24px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={() => setScreen("home")}
          style={{ background: "none", border: "1px solid #2a2a3a", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: "#666", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
          onMouseEnter={e => { e.target.style.borderColor = "#7C6FCD"; e.target.style.color = "#a78bfa"; }}
          onMouseLeave={e => { e.target.style.borderColor = "#2a2a3a"; e.target.style.color = "#666"; }}>
          ← Home
        </button>
        <div style={{ marginLeft: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>Job Tracker</div>
          <div style={{ fontSize: 12, color: "#9090b0" }}>{total === 0 ? "No applications yet — add your first!" : `${total} application${total !== 1 ? "s" : ""} tracked`}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {columns.map(col => {
            const count = (cards[col.id] || []).length;
            return count > 0 ? (
              <span key={col.id} style={{ background: col.color + "18", color: col.color, border: `1px solid ${col.color}33`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{col.label}: {count}</span>
            ) : null;
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, padding: "24px 20px", overflowX: "auto", alignItems: "flex-start", flex: 1 }}>
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
              style={{ width: "100%", padding: "11px 14px", borderRadius: 14, border: "1px dashed #2a2a3a", background: "transparent", color: "#444", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
              onMouseEnter={e => { e.target.style.borderColor = "#7C6FCD88"; e.target.style.color = "#a78bfa"; e.target.style.background = "#7C6FCD11"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#2a2a3a"; e.target.style.color = "#444"; e.target.style.background = "transparent"; }}>
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
