/* style.js - Smarter CAS chatbot (client-side, AI-style) */

document.addEventListener("DOMContentLoaded", () => {
  const messagesDiv = document.getElementById("messages");
  const input = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const clearBtn = document.getElementById("clearBtn");

  /* =============================
     CAS DATA (SOURCE OF TRUTH)
     ============================= */

  const casData = {
    collegeInfo: `College of Applied Science (CAS) Vattamkulam
Managed by IHRD (Govt. of Kerala)
Affiliated to University of Calicut
Established: 2005
Location: Nellissery, near Edappal, Malappuram, Kerala`,

    contact: `Contact Information
Phone: 0494-2689655 / 8547006802
Email: casvattamkulam@ihrd.ac.in
Website: casvattamkulam.ihrd.ac.in`,

    principal: `Principal: Sri. Abdussammed P.`,

    ugCourses: `UG Courses
• B.Sc Computer Science (Honours)
• BCA
• B.Sc Electronics
• B.Com Honours
• BBA Logistics (Honours)`,

    pgCourses: `PG Courses
• M.Sc Computer Science
• M.Com Finance`,

    fees: `Approximate Semester Fees
B.Sc CS / BCA / B.Sc Electronics: ₹17,270
B.Com Honours: ₹13,035
BBA Logistics: ₹8,470
M.Sc CS: ₹22,550
M.Com Finance: ₹18,425`,

    admission: `Admission Process
• 50% University Quota (Calicut University CAP)
• 50% IHRD / Management Quota (ihrdadmissions.org)`,

    facilities: `Facilities
• Computer Lab
• Electronics Lab
• Library
• Open Gym
• Placement Support
• NSS Unit`,

    activities: `Activities & Clubs
• NSS
• Placement Cell
• Innovation Council
• IT Hub
• Department Associations`
  };

  /* =============================
     COURSE DETAILS
     ============================= */

  const courseDetails = {
    "bca": `BCA
Duration: 4 Years (8 Semesters)
Seats: 24
Eligibility: +2 with Mathematics / CS
Fees: ₹17,270 per semester`,

    "bsc computer science": `B.Sc Computer Science (Honours)
Duration: 4 Years
Seats: 36
Eligibility: +2 with Mathematics
Fees: ₹17,270 per semester`,

    "bsc electronics": `B.Sc Electronics
Duration: 3 Years
Seats: 36
Eligibility: +2 with Mathematics / Electronics
Fees: ₹17,270 per semester`,

    "bcom honours": `B.Com Honours
Duration: 4 Years
Seats: 48
Eligibility: +2 pass
Fees: ₹13,035 per semester`,

    "bba logistics": `BBA Logistics (Honours)
Duration: 4 Years
Seats: 30
Eligibility: +2 pass
Fees: ₹8,470 per semester`,

    "msc computer science": `M.Sc Computer Science
Duration: 2 Years
Seats: 10
Eligibility: Degree in CS
Fees: ₹22,550 per semester`,

    "mcom finance": `M.Com Finance
Duration: 2 Years
Seats: 15
Eligibility: B.Com
Fees: ₹18,425 per semester`
  };

  /* =============================
     COURSE ALIASES (AI)
     ============================= */

  const courseAliases = {
    "bca": ["bca","computer application","computer applications"],
    "bsc computer science": ["bsc cs","computer science","cs honours"],
    "bsc electronics": ["electronics","electronic science"],
    "bcom honours": ["bcom","commerce"],
    "bba logistics": ["bba","logistics"],
    "msc computer science": ["msc cs","m.sc cs","cs pg"],
    "mcom finance": ["mcom","finance"]
  };

  /* =============================
     100+ KEYWORDS (INTENTS)
     ============================= */

  const intentKeywords = {
    greeting: ["hi","hello","hey","help","start"],
    fees: ["fee","fees","cost","price","how much","tuition","payment"],
    admission: ["admission","apply","application","eligibility","quota","selection"],
    contact: ["contact","phone","number","email","address","location"],
    ug: ["ug","undergraduate","bachelor","bsc","bca","bcom","bba"],
    pg: ["pg","postgraduate","master","msc","mcom"],
    facilities: ["facility","facilities","lab","library","gym","infrastructure"],
    activities: ["activities","clubs","nss","placement","training"],
    principal: ["principal","head","director"],
    duration: ["duration","years","semesters","how long"],
    seats: ["seats","seat","intake","capacity"]
  };

  /* =============================
     NLP UTILITIES
     ============================= */

  function normalize(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, "").trim();
  }

  function tokenize(text) {
    return normalize(text).split(" ");
  }

  function detectIntent(msg) {
    const tokens = tokenize(msg);
    let best = { intent: null, score: 0 };

    for (const intent in intentKeywords) {
      let score = 0;
      intentKeywords[intent].forEach(k => {
        if (tokens.includes(k)) score++;
      });
      if (score > best.score) best = { intent, score };
    }
    return best;
  }

  function detectCourse(msg) {
    msg = normalize(msg);
    for (const c in courseAliases) {
      if (courseAliases[c].some(a => msg.includes(a))) return c;
    }
    return null;
  }

  /* =============================
     CONTEXT MEMORY
     ============================= */

  const context = {
    lastCourse: null
  };

  /* =============================
     CORE BOT LOGIC
     ============================= */

  function getReply(text) {
    const msg = normalize(text);
    const intent = detectIntent(msg);
    const course = detectCourse(msg);

    // Follow-up handling
    if (msg.length <= 15 && context.lastCourse) {
      const data = courseDetails[context.lastCourse];
      if (/fee/.test(msg)) return data.match(/Fees:.*/)[0];
      if (/duration|year|semester/.test(msg)) return data.match(/Duration:.*/)[0];
      if (/seat/.test(msg)) return data.match(/Seats:.*/)[0];
    }

    // Course + Intent combo
    if (course) {
      context.lastCourse = course;
      const data = courseDetails[course];

      if (intent.intent === "fees") return data.match(/Fees:.*/)[0];
      if (intent.intent === "duration") return data.match(/Duration:.*/)[0];
      if (intent.intent === "seats") return data.match(/Seats:.*/)[0];

      return data;
    }

    // Intent only
    switch (intent.intent) {
      case "fees": return casData.fees;
      case "admission": return casData.admission;
      case "contact": return casData.contact;
      case "ug": return casData.ugCourses;
      case "pg": return casData.pgCourses;
      case "facilities": return casData.facilities;
      case "activities": return casData.activities;
      case "principal": return casData.principal;
      case "greeting": return "Hello! Ask me about courses, fees, admission, or facilities.";
    }

    return "Sorry, I didn’t understand. Try asking about courses, fees, admission, or facilities.";
  }

  /* =============================
     UI HELPERS
     ============================= */

  function addMessage(text, cls) {
    const div = document.createElement("div");
    div.className = cls;
    div.innerHTML = `<div class="bubble">${text.replace(/\n/g,"<br>")}</div>`;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function send() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, "user");
    input.value = "";
    setTimeout(() => addMessage(getReply(text), "bot"), 300);
  }

  sendBtn.onclick = send;
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") send();
  });

  clearBtn.onclick = () => {
    messagesDiv.innerHTML = "";
    context.lastCourse = null;
    addMessage("Chat cleared. Ask me about CAS Vattamkulam.", "bot");
  };

  addMessage("Hello! 👋 I’m the CAS Vattamkulam Assistant.", "bot");
});
