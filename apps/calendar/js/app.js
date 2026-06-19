/* =============================================
   The Awesome Calendar — app.js
   Author: Abdelshafy Ghareeb
   ============================================= */

// ── Constants & State ──────────────────────────────────────────
const MONTH_NAMES = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];
const DAY_NAMES = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
const LS = window.localStorage;

// Current view month/year
let viewMonth = getCurrentMonth();
let viewYear = getCurrentYear();

// Selection state
let dayList = new Set();
let prsList = new Set();
let absList = new Set();

// Settings
let fridayOff = LS.getItem("tac-friday-off") !== "false"; // default true

// ── Helpers: current date ───────────────────────────────────────
function getCurrentDay() {
  return new Date().getDay();
}
function getCurrentDate() {
  return new Date().getDate();
}
function getCurrentMonth() {
  return new Date().getMonth() + 1;
}
function getCurrentYear() {
  return new Date().getFullYear();
}
function getCurrentDayName() {
  return DAY_NAMES[getCurrentDay()];
}

// ── LocalStorage helpers ────────────────────────────────────────
function getWage() {
  return +(LS.getItem("tac-wage") || 2600);
}
function setWage(val) {
  LS.setItem("tac-wage", val);
}
function getDayStat(key) {
  return LS.getItem(`tac-day-${key}`);
}
function setDayStat(key, val) {
  LS.setItem(`tac-day-${key}`, val);
}
function removeDayStat(key) {
  LS.removeItem(`tac-day-${key}`);
}
function getMonthCut(m, y) {
  return +(LS.getItem(`tac-month-${m}-${y}`) || 0);
}
function setMonthCut(m, y, val) {
  if (val <= 0) LS.removeItem(`tac-month-${m}-${y}`);
  else LS.setItem(`tac-month-${m}-${y}`, val);
}

// ── DOM Refs ────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const el = {
  today: $("today"),
  todate: $("todate"),
  dayNav: $("day-nav"),
  month: $("month"),
  mb: $("mb"),
  prsVal: $("prs-val"),
  absVal: $("abs-val"),
  monthCut: $("month-cut"),
  wage: $("wage"),
  wageVal: $("w"),
  deselect: $("deselect"),
  control: $("control"),
  cover: $("cover"),
  sb: $("sb"),
  cb: $("cb"),
  cuts: $("cuts"),
  next: $("next"),
  prev: $("prev"),
  closeSettings: $("close-settings"),
  closeCuts: $("close-cuts"),
  updateCuts: $("update-cuts"),
  addCuts: $("add-cuts"),
  cutVal: $("cut-val"),
  uw: $("uw"),
  ouwb: $("ouwb"),
  cancelUw: $("cancel-uw"),
  uwVal: $("uw-val"),
  ub: $("ub"),
  fridayToggle: $("toggle-friday"),
  fridayLabel: $("friday-label"),
  fridayInd: $("friday-indicator"),
  selectAllBtn: $("select-all-btn"),
  progressBar: $("progress-bar"),
  progPrs: $("progress-label-prs"),
  progAbs: $("progress-label-abs"),
  attendRate: $("attendance-rate"),
};

// ── Header: today's info ────────────────────────────────────────
function renderHeader() {
  el.today.textContent = getCurrentDayName();
  el.todate.textContent = `${getCurrentDate()} ${MONTH_NAMES[getCurrentMonth() - 1]} ${getCurrentYear()}`;
  el.dayNav.textContent = getCurrentDate();
}

// ── Calendar: month data ────────────────────────────────────────
function getMonthLength(y, m) {
  return new Date(y, m, 0).getDate(); // elegant: day 0 of next month
}
function getDaysBefore(y, m) {
  const fd = new Date(y, m - 1, 1).getDay(); // 0=Sun
  return (fd + 1) % 7; // shift so Saturday=0 for RTL Arabic layout
}

// ── Calendar: render ────────────────────────────────────────────
function renderCalendar() {
  prsList.clear();
  absList.clear();

  const m = viewMonth,
    y = viewYear;
  const monthLen = getMonthLength(y, m);
  const daysBefore = getDaysBefore(y, m);
  const totalCells = Math.ceil((daysBefore + monthLen) / 7) * 7;
  const daysAfter = totalCells - daysBefore - monthLen;

  const frag = new DocumentFragment();

  // Empty cells before month start
  for (let i = 0; i < daysBefore; i++) {
    const p = document.createElement("p");
    p.className = "day";
    p.textContent = "";
    frag.append(p);
  }

  // Actual days
  for (let d = 1; d <= monthLen; d++) {
    const key = `${d}-${m}-${y}`;
    const p = document.createElement("p");
    p.className = `day act ${key}`;

    const stat = getDayStat(key);
    if (stat) {
      p.classList.add(stat);
      stat === "present" ? prsList.add(key) : absList.add(key);
    }

    const isToday =
      y === getCurrentYear() &&
      m === getCurrentMonth() &&
      d === getCurrentDate();
    if (isToday) p.classList.add("today");

    const dow = new Date(y, m - 1, d).getDay();
    if (fridayOff && dow === 5) p.classList.add("fryday");

    p.textContent = d;
    frag.append(p);
  }

  // Empty cells after month end
  for (let i = 0; i < daysAfter; i++) {
    const p = document.createElement("p");
    p.className = "day";
    p.textContent = "";
    frag.append(p);
  }

  el.mb.innerHTML = "";
  el.mb.append(frag);

  el.month.textContent = `${MONTH_NAMES[m - 1]} ${y}`;
  el.prsVal.textContent = prsList.size;
  el.absVal.textContent = absList.size;

  const cut = getMonthCut(m, y);
  el.monthCut.textContent = cut || "0";

  renderProgress();
  updateWageDisplay();
}

// ── Progress bar ────────────────────────────────────────────────
function renderProgress() {
  const prs = prsList.size;
  const abs = absList.size;
  const total = prs + abs;
  const rate = total > 0 ? Math.round((prs / total) * 100) : 0;

  el.progressBar.style.width = `${rate}%`;
  el.progPrs.textContent = `حضور: ${prs}`;
  el.progAbs.textContent = `غياب: ${abs}`;
  el.attendRate.textContent = total > 0 ? `${rate}%` : "—";
}

// ── Wage calculation ────────────────────────────────────────────
function calcWage() {
  const dailyRate = getWage() / 26;
  const prs = prsList.size;
  const abs = absList.size;
  const cut = getMonthCut(viewMonth, viewYear);

  // If absent > half the working days, count actual present days
  const effectiveDays = abs > 13 ? prs : 26 - abs;
  return Math.ceil(effectiveDays * dailyRate - cut);
}

function updateWageDisplay() {
  if (el.wage.classList.contains("on")) {
    el.wageVal.textContent = calcWage().toLocaleString("ar-EG") + " ج.م";
  }
}

function toggleWage() {
  const isOn = el.wage.classList.toggle("on");
  el.wage.classList.toggle("off", !isOn);
  el.wageVal.textContent = isOn
    ? calcWage().toLocaleString("ar-EG") + " ج.م"
    : "اضغط";
}

// ── Navigation ──────────────────────────────────────────────────
function goToCurrentMonth() {
  if (viewMonth !== getCurrentMonth() || viewYear !== getCurrentYear()) {
    viewMonth = getCurrentMonth();
    viewYear = getCurrentYear();
    deselect();
    renderCalendar();
  }
}
function goNextMonth() {
  viewMonth === 12 ? ((viewMonth = 1), viewYear++) : viewMonth++;
  deselect();
  renderCalendar();
}
function goPrevMonth() {
  viewMonth === 1 ? ((viewMonth = 12), viewYear--) : viewMonth--;
  deselect();
  renderCalendar();
}

// ── Selection ───────────────────────────────────────────────────
function handleDayClick(e) {
  const target = e.target;
  const key = target.classList[2]; // e.g. "5-6-2025"
  if (!key || !target.classList.contains("act")) return;

  target.classList.toggle("selected");
  dayList.has(key) ? dayList.delete(key) : dayList.add(key);
  updateDeselectBtn();
}

function deselect() {
  dayList.clear();
  document
    .querySelectorAll(".month-box .day.selected")
    .forEach((p) => p.classList.remove("selected"));
  updateDeselectBtn();
}

function updateDeselectBtn() {
  const hasSelection = dayList.size > 0;
  el.deselect.className = hasSelection ? "deselect-btn on" : "deselect-btn off";
  el.deselect.innerHTML = hasSelection ? "✕ إلغاء" : "تحديد";
  document.querySelectorAll(".opt").forEach((btn) => {
    btn.classList.toggle("gry", !hasSelection);
  });
}

// Select all active days in the current month
function selectAll() {
  closePanel();
  document.querySelectorAll(".month-box .day.act").forEach((p) => {
    const key = p.classList[2];
    if (key) {
      p.classList.add("selected");
      dayList.add(key);
    }
  });
  updateDeselectBtn();
}

// ── Apply attendance ────────────────────────────────────────────
function handleControl(e) {
  const t = e.target;

  // Settings button
  if (t.classList.contains("sts")) {
    openPanel(el.sb);
    return;
  }

  if (dayList.size === 0) return;

  const isPrs = t.classList.contains("prs") || t.classList.contains("o-p");
  const isAbs = t.classList.contains("abs") || t.classList.contains("o-a");
  const isClr = t.classList.contains("clr") || t.classList.contains("o-c");

  for (const key of dayList) {
    const cell = document.querySelector(`.${CSS.escape(key)}`);
    if (!cell) continue;
    cell.classList.remove("present", "absent");
    if (isPrs) {
      cell.classList.add("present");
      setDayStat(key, "present");
    } else if (isAbs) {
      cell.classList.add("absent");
      setDayStat(key, "absent");
    } else if (isClr) {
      removeDayStat(key);
    }
  }

  deselect();
  renderCalendar();
}

// ── Panels ──────────────────────────────────────────────────────
function openPanel(panel) {
  panel.classList.add("on");
  el.cover.classList.add("on");
}
function closePanel() {
  el.sb.classList.remove("on");
  el.cb.classList.remove("on");
  el.cover.classList.remove("on");
  el.ub.classList.add("off");
}

// ── Cuts ────────────────────────────────────────────────────────
function openCuts() {
  el.cutVal.value = "";
  el.cutVal.placeholder = getMonthCut(viewMonth, viewYear) || "0";
  openPanel(el.cb);
  el.cutVal.focus();
}
function setCuts() {
  const val = +el.cutVal.value;
  if (el.cutVal.value === "") return;
  setMonthCut(viewMonth, viewYear, val);
  el.monthCut.textContent = val || "0";
  closePanel();
  updateWageDisplay();
}
function addCuts() {
  const val = +el.cutVal.value;
  if (el.cutVal.value === "") return;
  const current = getMonthCut(viewMonth, viewYear);
  const newVal = current + val;
  setMonthCut(viewMonth, viewYear, newVal);
  el.monthCut.textContent = newVal;
  closePanel();
  updateWageDisplay();
}

// ── Wage update ─────────────────────────────────────────────────
function openWageInput() {
  el.uwVal.value = "";
  el.uwVal.placeholder = getWage();
  el.ub.classList.remove("off");
  el.uwVal.focus();
}
function closeWageInput() {
  el.ub.classList.add("off");
}
function saveWage() {
  const val = +el.uwVal.value;
  if (el.uwVal.value === "" || val < 0) return;
  setWage(val);
  closeWageInput();
  updateWageDisplay();
}

// ── Friday toggle ───────────────────────────────────────────────
function toggleFriday() {
  fridayOff = !fridayOff;
  LS.setItem("tac-friday-off", fridayOff);
  el.fridayLabel.textContent = fridayOff ? "الجمعة: إجازة" : "الجمعة: يوم عمل";
  el.fridayInd.textContent = fridayOff ? "✓" : "✗";
  el.fridayInd.style.color = fridayOff
    ? "var(--present-color)"
    : "var(--absent-color)";
  renderCalendar();
}

// ── Init ────────────────────────────────────────────────────────
function init() {
  // Ensure wage default
  if (!LS.getItem("tac-wage")) setWage(2600);

  // Sync friday toggle UI
  el.fridayLabel.textContent = fridayOff ? "الجمعة: إجازة" : "الجمعة: يوم عمل";
  el.fridayInd.textContent = fridayOff ? "✓" : "✗";
  el.fridayInd.style.color = fridayOff
    ? "var(--present-color)"
    : "var(--absent-color)";

  renderHeader();
  renderCalendar();

  // Nav
  el.next.addEventListener("click", goNextMonth);
  el.prev.addEventListener("click", goPrevMonth);
  el.dayNav.addEventListener("click", goToCurrentMonth);
  el.today.addEventListener("click", goToCurrentMonth);

  // Calendar interaction
  el.mb.addEventListener("click", handleDayClick);
  el.deselect.addEventListener("click", deselect);
  el.control.addEventListener("click", handleControl);

  // Wage
  el.wage.addEventListener("click", toggleWage);
  el.ouwb.addEventListener("click", openWageInput);
  el.uw.addEventListener("click", saveWage);
  el.cancelUw.addEventListener("click", closeWageInput);
  el.uwVal.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveWage();
  });

  // Cuts
  el.cuts.addEventListener("click", openCuts);
  el.cuts.addEventListener("keydown", (e) => {
    if (e.key === "Enter") openCuts();
  });
  el.updateCuts.addEventListener("click", setCuts);
  el.addCuts.addEventListener("click", addCuts);
  el.closeCuts.addEventListener("click", closePanel);
  el.cutVal.addEventListener("keydown", (e) => {
    if (e.key === "Enter") setCuts();
  });

  // Settings
  el.closeSettings.addEventListener("click", closePanel);
  el.cover.addEventListener("click", closePanel);
  el.fridayToggle.addEventListener("click", toggleFriday);
  el.selectAllBtn.addEventListener("click", selectAll);
}

init();
