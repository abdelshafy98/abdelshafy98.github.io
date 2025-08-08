// variables
let dayList = new Set();
let ml = [
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
// functions
function setDate() {
  let today = document.getElementById("today");
  let todate = document.getElementById("todate");
  today.textContent = gd("day");
  todate.textContent = `${gd("md")} ${gd("month")} ${gd("year")}`;
}
function gd(d = "md") {
  let dt = new Date();
  let wl = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  switch (d) {
    case "year":
      return dt.getFullYear();
    case "month":
      return ml[dt.getMonth()];
    case "monthNum":
      return dt.getMonth() + 1;
    case "day":
      return wl[dt.getDay()];
    case "md":
      return dt.getDate();
  }
}

// invock functions
setDate();
// variables
let dayNav = document.getElementById("day-nav");
let today = document.getElementById("today");
let next = document.getElementById("next");
let prev = document.getElementById("prev");
let prsVal = document.getElementById("prs-val");
let absVal = document.getElementById("abs-val");
let prsList = new Set();
let absList = new Set();
let m = gd("monthNum");
let y = gd("year");
// functions
dayNav.textContent = `${gd("md")}`;
if (!window.localStorage.getItem("tac-wage")) {
  window.localStorage.setItem("tac-wage", 2600);
}
function setMonth() {
  let tomonth = document.getElementById("month");
  tomonth.textContent = `${ml[m - 1]} ${y}`;
}

function monthData() {
  function monthLingth() {
    for (let i = 28; i <= 31; i++) {
      let ln = new Date(`${y} ${m} ${i}`).getDate();
      if (ln < i) return i - 1;
      if (ln == 31) return i;
    }
  }
  function daysBefore() {
    let fd = new Date(`${y} ${m} 1`).getDay();
    return fd + 1 < 7 ? fd + 1 : 0;
  }
  function days() {
    return Math.ceil((daysBefore() + monthLingth()) / 7) * 7;
  }
  return [daysBefore(), monthLingth(), days()];
}

function setDays() {
  prsList.clear();
  absList.clear();
  let daysAfter = monthData()[2] - monthData()[0] - monthData()[1];
  let monthBox = document.getElementById("mb");
  let monthFrag = new DocumentFragment();
  for (let i = 0; i < monthData()[0]; i++) {
    let p = document.createElement("p");
    p.className = "day";
    p.textContent = ".";
    monthFrag.append(p);
  }
  for (let i = 0; i < monthData()[1]; i++) {
    let p = document.createElement("p");
    p.className = `day act ${i + 1}-${m}-${y}`;
    if (window.localStorage.getItem(`tac-day-${i + 1}-${m}-${y}`)) {
      let clas = window.localStorage.getItem(`tac-day-${i + 1}-${m}-${y}`);
      p.classList.add(clas);
      clas == "present"
        ? prsList.add(`${i + 1}-${m}-${y}`)
        : absList.add(`${i + 1}-${m}-${y}`);
    }
    if (y == gd("year") && m == gd("monthNum") && i + 1 == gd("md")) {
      p.classList.add("today");
    }
    if (new Date(`${y} ${m} ${i + 1}`).getDay() == 5) p.classList.add("fryday");
    p.textContent = i + 1;
    monthFrag.append(p);
  }
  prsVal.textContent = prsList.size;
  absVal.textContent = absList.size;
  for (let i = 0; i < daysAfter; i++) {
    let p = document.createElement("p");
    p.className = "day";
    p.textContent = ".";
    monthFrag.append(p);
  }
  monthBox.innerHTML = "";
  monthBox.append(monthFrag);
  if (window.localStorage.getItem(`tac-month-${m}-${y}`)) {
    let val = window.localStorage.getItem(`tac-month-${m}-${y}`);
    document.getElementById("month-cut").textContent = val;
  } else {
    document.getElementById("month-cut").textContent = "0";
  }
}

// nav function-----------------
// -----------------------------
function thisMonth() {
  if (m != gd("monthNum") || y != gd("year")) {
    m = gd("monthNum");
    y = gd("year");
    deselect();
    setMonth();
    setDays();
    updateWage();
  }
}
function nextMonth() {
  if (m == 12) {
    m = 1;
    y++;
  } else m++;
  deselect();
  setMonth();
  setDays();
  updateWage();
}
function prevMonth() {
  if (m == 1) {
    m = 12;
    y--;
  } else m--;
  deselect();
  setMonth();
  setDays();
  updateWage();
}
// invock functions
setMonth();
setDays();
dayNav.addEventListener("click", thisMonth);
today.addEventListener("click", thisMonth);
next.addEventListener("click", nextMonth);
prev.addEventListener("click", prevMonth);

// -------------------------------------------------
// -------------------------------------------------
// -------------------------------------------------
// variables
let mb = document.getElementById("mb");
let control = document.getElementById("control");
let dSelect = document.getElementById("deselect");
let options = document.querySelectorAll(".opt");
let wage = document.getElementById("wage");
let sb = document.getElementById("sb");
let closeSettings = document.getElementById("close-settings");

// function
function select(e) {
  if (e.target.classList[2]) {
    e.target.classList.toggle("selected");
    dayList.has(e.target.classList[2])
      ? dayList.delete(e.target.classList[2])
      : dayList.add(e.target.classList[2]);
  }
  if (dayList.size > 0) {
    dSelect.innerHTML = "&#9932; إلغاء";
    dSelect.className = "on";
    options.forEach((e) => {
      e.classList.remove("gry");
    });
  } else {
    dSelect.textContent = "تحديد";
    dSelect.className = "off";
    options.forEach((e) => {
      e.classList.add("gry");
    });
  }
}
function deselect() {
  dSelect.textContent = "تحديد";
  dSelect.className = "off";
  let p = document.querySelectorAll(".month-box .day");
  p.forEach((e) => {
    e.classList.remove("selected");
  });
  options.forEach((e) => {
    e.classList.add("gry");
  });
  dayList.clear();
}
function displayWage() {
  let w = +window.localStorage.getItem("tac-wage") / 26;
  if (+absVal.textContent > 13) {
    if (window.localStorage.getItem(`tac-month-${m}-${y}`)) {
      let cut = +window.localStorage.getItem(`tac-month-${m}-${y}`);
      val = +prsVal.textContent * w - cut;
    } else val = +prsVal.textContent * w;
  } else {
    if (window.localStorage.getItem(`tac-month-${m}-${y}`)) {
      let cut = +window.localStorage.getItem(`tac-month-${m}-${y}`);
      val = (26 - +absVal.textContent) * w - cut;
    } else val = (26 - +absVal.textContent) * w;
  }
  if (window.localStorage.getItem(`tac-month-${m}-${y}`)) {
    let cut = +window.localStorage.getItem(`tac-month-${m}-${y}`);
    val2 = +prsVal.textContent * w - cut;
  } else val2 = +prsVal.textContent * w;
  if (wage.className == "off") {
    wage.className = "on";
    document.getElementById("w").textContent = Math.ceil(val);
  } else if (wage.className == "on") {
    wage.className = "off";
    document.getElementById("w").innerHTML = "---";
  }
}
function updateWage() {
  if (wage.className == "on") {
    let w = +window.localStorage.getItem("tac-wage") / 26;
    if (+absVal.textContent > 13) {
      if (window.localStorage.getItem(`tac-month-${m}-${y}`)) {
        let cut = +window.localStorage.getItem(`tac-month-${m}-${y}`);
        val = +prsVal.textContent * w - cut;
      } else val = +prsVal.textContent * w;
    } else {
      if (window.localStorage.getItem(`tac-month-${m}-${y}`)) {
        let cut = +window.localStorage.getItem(`tac-month-${m}-${y}`);
        val = (26 - +absVal.textContent) * w - cut;
      } else val = (26 - +absVal.textContent) * w;
    }
    if (window.localStorage.getItem(`tac-month-${m}-${y}`)) {
      let cut = +window.localStorage.getItem(`tac-month-${m}-${y}`);
      val2 = +prsVal.textContent * w - cut;
    } else val2 = +prsVal.textContent * w;
    document.getElementById("w").textContent = Math.ceil(val);
  }
}
// control
function controlData(e) {
  if (e.target.className == "sts") {
    sb.classList.add("on");
    cover.classList.add("on");
  } else if (dayList.size > 0) {
    if (e.target.classList[1] == "prs" || e.target.className == "o-p") {
      for (let day of dayList) {
        document.getElementsByClassName(day)[0].classList.remove("absent");
        document.getElementsByClassName(day)[0].classList.add("present");
        window.localStorage.setItem(`tac-day-${day}`, "present");
      }
    } else if (e.target.classList[1] == "abs" || e.target.className == "o-a") {
      for (let day of dayList) {
        document.getElementsByClassName(day)[0].classList.remove("present");
        document.getElementsByClassName(day)[0].classList.add("absent");
        window.localStorage.setItem(`tac-day-${day}`, "absent");
      }
    } else if (e.target.classList[1] == "clr" || e.target.className == "o-c") {
      for (let day of dayList) {
        document.getElementsByClassName(day)[0].classList.remove("present");
        document.getElementsByClassName(day)[0].classList.remove("absent");
        window.localStorage.removeItem(`tac-day-${day}`);
      }
    }
    setDays();
    deselect();
    updateWage();
  }
}

// invock functions
mb.addEventListener("click", select);
dSelect.addEventListener("click", deselect);
control.addEventListener("click", controlData);
wage.addEventListener("click", displayWage);
// test code
// -------------------------------------
let cb = document.getElementById("cb");
let cuts = document.getElementById("cuts");
let cover = document.getElementById("cover");
let closeCuts = document.getElementById("close-cuts");
let updateCuts = document.getElementById("update-cuts");
let addCuts = document.getElementById("add-cuts");

function runCut() {
  cover.classList.add("on");
  cb.classList.add("on");
  document.getElementById("cut-val").value = "";
  document.getElementById("cut-val").focus();
}
function endCut() {
  cover.classList.remove("on");
  cb.classList.remove("on");
  sb.classList.remove("on");
  endOu();
}
function updatingCuts() {
  let val = document.getElementById("cut-val").value;
  if (val != "") {
    if (val == 0) {
      window.localStorage.removeItem(`tac-month-${m}-${y}`);
    } else window.localStorage.setItem(`tac-month-${m}-${y}`, val);
    document.getElementById("month-cut").textContent = val;
    endCut();
    updateWage();
  }
}
function addingCuts() {
  let val = document.getElementById("cut-val").value;
  if (val != "") {
    if (window.localStorage.getItem(`tac-month-${m}-${y}`)) {
      let curentVal = +window.localStorage.getItem(`tac-month-${m}-${y}`);
      let newVal = +val + curentVal;
      window.localStorage.setItem(`tac-month-${m}-${y}`, newVal);
      document.getElementById("month-cut").textContent = newVal;
    } else {
      window.localStorage.setItem(`tac-month-${m}-${y}`, val);
      document.getElementById("month-cut").textContent = val;
    }
    endCut();
    updateWage();
  }
}

cuts.addEventListener("click", runCut);
cover.addEventListener("click", endCut);
closeCuts.addEventListener("click", endCut);
updateCuts.addEventListener("click", updatingCuts);
addCuts.addEventListener("click", addingCuts);
closeSettings.addEventListener("click", endCut);
// -------------------------------------------

let uw = document.getElementById("uw");
let ouwb = document.getElementById("ouwb");
let cancelUw = document.getElementById("cancel-uw");

function ou() {
  let inp = document.getElementById("uw-val");
  inp.value = "";
  inp.placeholder = window.localStorage.getItem("tac-wage");
  document.getElementById("ub").classList.remove("off");
  inp.focus();
}
function endOu() {
  document.getElementById("ub").classList.add("off");
}
function uWage() {
  let inp = document.getElementById("uw-val");
  if (inp.value != "" && +inp.value >= 0) {
    window.localStorage.setItem("tac-wage", inp.value);
    endOu();
    updateWage();
  }
}

uw.addEventListener("click", uWage);
ouwb.addEventListener("click", ou);
cancelUw.addEventListener("click", endOu);
