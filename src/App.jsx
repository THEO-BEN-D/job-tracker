<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Job Tracker — Design Preview</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; background: #050508; }

.home {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 40px 20px; position: relative; overflow: hidden;
}

.blob { position: absolute; border-radius: 50%; pointer-events: none; }
.blob1 { top: 10%; left: 15%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(124,111,205,0.13) 0%, transparent 70%); }
.blob2 { bottom: 5%; right: 10%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%); }
.blob3 { top: 50%; left: 50%; transform: translate(-50%,-50%); width: 900px; height: 900px; background: radial-gradient(circle, rgba(124,111,205,0.05) 0%, transparent 60%); }

.badge {
  display: flex; align-items: center; gap: 8px;
  background: rgba(124,111,205,0.1); border: 1px solid rgba(124,111,205,0.3);
  border-radius: 100px; padding: 6px 16px; margin-bottom: 32px; position: relative; z-index: 1;
}
.badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
.badge-text { font-size: 11px; color: #a78bfa; font-weight: 700; letter-spacing: 0.08em; }

.headline { font-size: 76px; font-weight: 900; letter-spacing: -0.04em; text-align: center; line-height: 1.0; margin-bottom: 24px; position: relative; z-index: 1; }
.white { color: #fff; display: block; }
.gradient { background: linear-gradient(135deg, #7C6FCD, #a78bfa, #c4b5fd); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; display: block; }

.subtitle { font-size: 18px; color: #4a4a6a; margin-bottom: 40px; text-align: center; line-height: 1.7; max-width: 420px; position: relative; z-index: 1; }

.features { display: flex; gap: 10px; margin-bottom: 44px; flex-wrap: wrap; justify-content: center; position: relative; z-index: 1; }
.pill { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.02); border: 1px solid #1a1a2e; border-radius: 100px; padding: 8px 16px; font-size: 12px; color: #555; font-weight: 500; }
.pill b { color: #7C6FCD; }

.cta {
  padding: 18px 52px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #7C6FCD, #a78bfa);
  color: #fff; font-size: 17px; font-weight: 700; cursor: pointer;
  box-shadow: 0 8px 32px rgba(124,111,205,0.4), 0 0 0 1px rgba(124,111,205,0.2);
  transition: all 0.2s; margin-bottom: 56px; position: relative; z-index: 1;
  font-family: inherit; letter-spacing: -0.01em;
}
.cta:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 16px 48px rgba(124,111,205,0.55); }

.stats { display: flex; background: rgba(255,255,255,0.02); border: 1px solid #1a1a2e; border-radius: 18px; overflow: hidden; margin-bottom: 36px; position: relative; z-index: 1; }
.stat { text-align: center; padding: 22px 44px; border-right: 1px solid #1a1a2e; }
.stat:last-child { border-right: none; }
.stat-icon { font-size: 14px; margin-bottom: 8px; }
.stat-n { font-size: 30px; font-weight: 900; color: #222; letter-spacing: -0.03em; }
.stat-l { font-size: 10px; color: #333; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; font-weight: 700; }

.tagline { font-size: 11px; color: #2a2a3a; letter-spacing: 0.1em; font-weight: 600; position: relative; z-index: 1; }
</style>
</head>
<body>
<div class="home">
  <div class="blob blob1"></div>
  <div class="blob blob2"></div>
  <div class="blob blob3"></div>

  <div class="badge">
    <div class="badge-dot"></div>
    <span class="badge-text">YOUR CAREER COMMAND CENTER</span>
  </div>

  <h1 class="headline">
    <span class="white">Land your</span>
    <span class="gradient">dream job.</span>
  </h1>

  <p class="subtitle">Track every application, follow-up, and offer — all in one place. Never lose track of an opportunity again.</p>

  <div class="features">
    <div class="pill"><b>✦</b> Kanban board</div>
    <div class="pill"><b>✦</b> Syncs across devices</div>
    <div class="pill"><b>✦</b> No spreadsheets</div>
    <div class="pill"><b>✦</b> Completely free</div>
  </div>

  <button class="cta">Open Tracker →</button>

  <div class="stats">
    <div class="stat"><div class="stat-icon">📋</div><div class="stat-n">0</div><div class="stat-l">Applications</div></div>
    <div class="stat"><div class="stat-icon">🎯</div><div class="stat-n">0</div><div class="stat-l">Interviews</div></div>
    <div class="stat"><div class="stat-icon">🏆</div><div class="stat-n">0</div><div class="stat-l">Offers</div></div>
  </div>

  <div class="tagline">FREE · SYNC ACROSS DEVICES · NO SPREADSHEETS</div>
</div>
</body>
</html>
