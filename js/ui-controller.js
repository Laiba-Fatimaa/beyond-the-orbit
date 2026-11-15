(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  
  const state = {
    screen: "intro",
    destination: "moon",
    objective: "geology",
    craft: "pathfinder",
    fuel: 70,
    power: 65,
    supplies: 60,
    eventIndex: 0,
    decisions: [],
    score: 60,
    progress: 18,
    playerX: 50,
    shipVisualX: 50,
    gameStage: null,
    hull: 100,
    scanCount: 0,
    approachSpeed: 30,
    thrusting: false,
    missionOver: false,
    failReason: "",
    hits: 0,
    backendState: null
  };

  const data = window.BO_DATA || {};
  const keys = { left: false, right: false };
  let modalTimer = null, eventTimer = null, gameTimer = null, flightRaf = 0, flightLast = 0;

  // -------------------------------------------------------------
  // AUDIO WRAPPER
  // -------------------------------------------------------------
  const audio = {
    playHover: () => window.AudioFX && window.AudioFX.playHover(),
    playClick: () => window.AudioFX && window.AudioFX.playClick(),
    playSelect: () => window.AudioFX && window.AudioFX.playSelect(),
    playConfirmDestination: () => window.AudioFX && window.AudioFX.playConfirmDestination(),
    playCraftSelect: () => window.AudioFX && window.AudioFX.playCraftSelect(),
    playSlider: () => window.AudioFX && window.AudioFX.playSliderTick(),
    playIgnition: () => window.AudioFX && window.AudioFX.playIgnition(),
    playThrust: (engaged) => window.AudioFX && window.AudioFX.playThrust(engaged),
    playCollision: () => window.AudioFX && window.AudioFX.playCollision(),
    playWarning: () => window.AudioFX && window.AudioFX.playWarning(),
    playScan: () => window.AudioFX && window.AudioFX.playScan(),
    playAlert: () => window.AudioFX && window.AudioFX.playEventAlert(),
    playSuccess: () => window.AudioFX && window.AudioFX.playSuccess(),
    playFailure: () => window.AudioFX && window.AudioFX.playFailure(),
    startLandingAmbience: () => window.AudioFX && window.AudioFX.startLandingAmbience(),
    startFlightAmbience: () => window.AudioFX && window.AudioFX.startFlightAmbience(),
    stopAmbience: () => window.AudioFX && window.AudioFX.stopAmbience()
  };

  // -------------------------------------------------------------
  // STREAMLIT BACKEND MESSAGING BRIDGE
  // -------------------------------------------------------------
  const isStreamlit = window.parent && window.parent !== window;

  function sendBackend(action, payload = {}) {
    if (isStreamlit) {
      window.parent.postMessage({
        isStreamlitMessage: true,
        type: "streamlit:setComponentValue",
        value: { action, payload, timestamp: Date.now() }
      }, "*");
    }
  }

  function initStreamlitBridge() {
    if (!isStreamlit) return;

    // 1. Announce ready to Streamlit
    window.parent.postMessage({
      isStreamlitMessage: true,
      type: "streamlit:componentReady",
      apiVersion: 1
    }, "*");

    // 2. Adjust frame height to fill window
    const reportHeight = () => {
      const h = Math.max(window.innerHeight, document.documentElement.scrollHeight || 0);
      window.parent.postMessage({
        isStreamlitMessage: true,
        type: "streamlit:setFrameHeight",
        height: h
      }, "*");
    };
    reportHeight();
    window.addEventListener("resize", reportHeight);

    // 3. Listen for state dispatched from Python Streamlit app
    window.addEventListener("message", (e) => {
      if (e.data && e.data.type === "streamlit:render") {
        const bState = e.data.args && e.data.args.backend_state;
        if (bState) {
          handleBackendStateUpdate(bState);
        }
      }
    });
  }

  function handleBackendStateUpdate(bState) {
    state.backendState = bState;

    // Synchronize HTML / PDF report download links if present
    if (bState.html_report_data_uri) {
      const hBtn = $("#download-html-report");
      if (hBtn) hBtn.href = bState.html_report_data_uri;
    }
    if (bState.pdf_report_base64) {
      const pBtn = $("#download-pdf-report");
      if (pBtn) pBtn.href = "data:application/pdf;base64," + bState.pdf_report_base64;
    }

    // Synchronize Debrief score if evaluated by backend
    if (bState.score_report) {
      const sr = bState.score_report;
      if (typeof sr.total_score === "number") {
        state.score = sr.total_score;
        $("#final-score").innerHTML = Math.round(sr.total_score) + '<span>/100</span>';
        $("#score-bar").style.width = Math.min(100, Math.round(sr.total_score)) + "%";
      }
      if (sr.grade) {
        $("#grade-badge").textContent = sr.grade;
      }
      if (sr.summary_text) {
        $("#debrief-insight").textContent = sr.summary_text;
      }
    }
  }

  // -------------------------------------------------------------
  // UI CORE: SCREEN & MODAL MANAGEMENT
  // -------------------------------------------------------------
  const screens = ["intro", "destination", "spacecraft", "flight", "debrief"];

  function showScreen(name) {
    if (name !== "flight") stopFlightLoop();
    state.screen = name;
    screens.forEach(s => $("#screen-" + s).classList.toggle("active", s === name));

    if (name === "flight") {
      audio.startFlightAmbience();
    } else if (name === "intro") {
      audio.startLandingAmbience();
    } else {
      audio.playSelect();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openModal(id) {
    const el = $("#" + id);
    if (!el) return;
    if (modalTimer) clearTimeout(modalTimer);
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("is-visible"));
  }

  function closeModal(id) {
    const el = $("#" + id);
    if (!el) return;
    el.classList.remove("is-visible");
    modalTimer = setTimeout(() => { el.hidden = true; }, 420);
  }

  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2200);
  }

  // -------------------------------------------------------------
  // DESTINATION SELECTION
  // -------------------------------------------------------------
  function updateDestination(animate = true) {
    const d = data.destinations[state.destination] || {};
    const profile = data.destinationProfiles[state.destination] || {};
    const labels = { moon: "LUNAR-01", mars: "MARS-02", europa: "EUROPA-03" };

    const put = (id, value) => { const el = $("#" + id); if (el && value) el.textContent = value; };
    put("destination-modal-title", d.name);
    put("destination-modal-description", d.description);
    put("destination-modal-distance", profile.distance);
    put("destination-modal-window", d.window);
    put("destination-modal-challenge", d.challenge);
    put("destination-modal-science", d.science);
    put("destination-modal-profile", profile.profile);
    put("destination-modal-risk", profile.risk);
    put("destination-modal-code", labels[state.destination]);

    const planet = $("#destination-modal-planet");
    if (planet) planet.className = "destination-modal-planet " + state.destination;
    const art = $("#destination-modal-visual");
    if (art) art.dataset.destination = state.destination;

    $$(".destination-card").forEach(card => {
      const active = card.dataset.destination === state.destination;
      card.classList.toggle("selected", active);
      card.setAttribute("aria-pressed", String(active));
    });

    const modal = $("#destination-modal-card");
    if (animate && modal) {
      modal.classList.remove("profile-changed");
      void modal.offsetWidth;
      modal.classList.add("profile-changed");
    }
  }

  function chooseDestination(id) {
    if (!data.destinations || !data.destinations[id]) return;
    state.destination = id;
    updateDestination(true);
    audio.playSelect();
    openModal("destination-modal");
  }

  // -------------------------------------------------------------
  // SPACECRAFT CONFIGURATION & LOADOUT
  // -------------------------------------------------------------
  function chooseCraft(id) {
    state.craft = id;
    const c = data.spacecraft[id];
    if (!c) return;

    $("#craft-name").textContent = c.name;
    $("#craft-class").textContent = c.class;
    $("#fuel-range").value = c.fuel;
    $("#power-range").value = c.power;
    $("#supplies-range").value = c.supplies;
    state.fuel = c.fuel;
    state.power = c.power;
    state.supplies = c.supplies;

    $$(".craft-option").forEach(x => x.classList.toggle("selected", x.dataset.craft === id));
    const stage = $(".craft-stage");
    if (stage) stage.dataset.craft = id;
    const hud = $("#hud-vehicle");
    if (hud) hud.textContent = "BO-01 / " + c.name.split(" ")[0].toUpperCase();

    audio.playCraftSelect();
    updateLoadout();
  }

  function updateLoadout() {
    state.fuel = +$("#fuel-range").value;
    state.power = +$("#power-range").value;
    state.supplies = +$("#supplies-range").value;

    $("#fuel-value").textContent = state.fuel;
    $("#power-value").textContent = state.power;
    $("#supplies-value").textContent = state.supplies;

    const mass = Math.round((state.fuel + state.power + state.supplies) / 3);
    $("#mass-value").textContent = mass;

    const readiness = mass > 78 ? "HEAVY" : mass < 43 ? "LIMITED" : "GOOD";
    const el = $("#readiness-value");
    el.textContent = readiness;
    el.className = mass > 78 ? "readiness-warn" : mass < 43 ? "readiness-low" : "readiness-good";
  }

  // -------------------------------------------------------------
  // FLIGHT SIMULATION DECK
  // -------------------------------------------------------------
  function startFlight() {
    state.eventIndex = 0;
    state.decisions = [];
    state.score = 60;
    state.progress = 8;
    state.hull = 100;
    state.playerX = 50;
    state.shipVisualX = 50;
    state.scanCount = 0;
    state.approachSpeed = 30;
    state.thrusting = false;
    state.missionOver = false;
    state.failReason = "";
    state.hits = 0;
    keys.left = keys.right = false;

    if (gameTimer) clearInterval(gameTimer);
    if (eventTimer) clearTimeout(eventTimer);

    // Audio & Visual cues
    audio.playIgnition();
    audio.startFlightAmbience();

    const d = data.destinations[state.destination] || {};
    const p = data.destinationProfiles[state.destination] || {};
    $("#flight-destination-art").className = "flight-destination " + state.destination;
    const fScene = $("#flight-scene");
    if (fScene) fScene.className = "flight-scene dest-" + state.destination;
    $("#flight-scene-caption").textContent = d.scene || "INTERPLANETARY TRANSFER";
    $("#flight-vector").textContent = p.vector || "NOMINAL APPROACH VECTOR";
    $("#flight-scene").style.setProperty("--flight-progress", state.progress + "%");
    setShipPosition(true);
    $("#flight-scene-subtitle").textContent = "DESTINATION LOCKED · SYSTEMS NOMINAL";

    updateTelemetry();
    showScreen("flight");

    // Sync with backend
    sendBackend("CONFIGURE_SPACECRAFT", {
      destination: state.destination,
      objective: state.objective,
      craft: state.craft,
      fuel: state.fuel,
      power: state.power,
      supplies: state.supplies
    });

    beginGameStage("navigate");
    startFlightLoop();
  }

  function updateTelemetry() {
    $("#telemetry-fuel").innerHTML = Math.max(0, Math.round(state.fuel)) + '<span>%</span>';
    $("#telemetry-power").innerHTML = Math.max(0, Math.round(state.power)) + '<span>%</span>';
    $("#telemetry-supplies").innerHTML = Math.max(0, Math.round(state.supplies)) + '<span>%</span>';
    const hull = $('#telemetry-hull');
    if (hull) hull.textContent = Math.max(0, Math.round(state.hull ?? 100)) + "%";

    ["fuel", "power", "supplies"].forEach(k => {
      const el = $("#telemetry-" + k);
      if (el) el.style.color = state[k] < 25 ? "#e58c83" : state[k] < 45 ? "#e7bd82" : "#e8f0f6";
    });
  }

  function checkResourceFailure() {
    if (state.screen !== "flight" || state.missionOver) return false;
    const depleted = [];
    if (state.fuel <= 0) depleted.push("PROPULSION FUEL");
    if (state.power <= 0) depleted.push("ELECTRICAL POWER");
    if (state.hull <= 0) depleted.push("HULL STRUCTURAL INTEGRITY");

    if (!depleted.length) return false;

    state.failReason = depleted.join(" AND ") + " DEPLETED";
    if (gameTimer) { clearInterval(gameTimer); gameTimer = null; }
    if (eventTimer) { clearTimeout(eventTimer); eventTimer = null; }

    setFeedback(state.failReason + " · MISSION ABORTED");
    completeFlight(true);
    return true;
  }

  function setProgress(value) {
    state.progress = value;
    $("#progress-value").textContent = value + "%";
    $("#progress-bar").style.width = value + "%";
    $("#flight-scene").style.setProperty("--flight-progress", value + "%");
  }

  function setObjective(title, hint, step) {
    $("#flight-objective-title").textContent = title;
    $("#flight-objective-hint").textContent = hint;
    $("#flight-objective-step").textContent = step;
  }

  function setFeedback(message) {
    $("#flight-feedback").textContent = message;
  }

  function setShipPosition(immediate = false) {
    const ships = $$(".flight-spacecraft"), scene = $("#flight-scene");
    if (!ships.length || !scene) return;
    if (typeof state.shipVisualX !== "number" || immediate) state.shipVisualX = state.playerX;
    const offset = (state.shipVisualX - 50) * scene.clientWidth / 100;
    ships.forEach(ship => ship.style.setProperty("--ship-x", offset + "px"));
  }

  function startFlightLoop() {
    stopFlightLoop();
    flightLast = 0;
    const frame = (now) => {
      if (state.screen !== "flight" || state.missionOver) { flightRaf = 0; return; }
      const dt = flightLast ? Math.min((now - flightLast) / 1000, 0.05) : 0;
      flightLast = now;

      if (!$("#event-modal").classList.contains("is-visible")) {
        if (keys.left) state.playerX = Math.max(8, state.playerX - 42 * dt);
        if (keys.right) state.playerX = Math.min(92, state.playerX + 42 * dt);
      }
      const current = typeof state.shipVisualX === "number" ? state.shipVisualX : state.playerX;
      state.shipVisualX = current + (state.playerX - current) * (1 - Math.exp(-15 * dt));
      setShipPosition();
      flightRaf = requestAnimationFrame(frame);
    };
    flightRaf = requestAnimationFrame(frame);
  }

  function stopFlightLoop() {
    if (flightRaf) cancelAnimationFrame(flightRaf);
    flightRaf = 0;
    flightLast = 0;
    keys.left = keys.right = false;
  }

  function movePlayer(delta) {
    if (state.screen !== "flight" || !state.gameStage || state.missionOver) return;
    state.playerX = Math.max(8, Math.min(92, state.playerX + delta));
    audio.playClick();
  }

  // -------------------------------------------------------------
  // GAMEPLAY PHASES: NAVIGATE, SCAN, APPROACH
  // -------------------------------------------------------------
  function beginGameStage(stage) {
    if (state.missionOver) return;
    if (gameTimer) clearInterval(gameTimer);
    state.gameStage = stage;
    state.playerX = stage === "approach" ? 50 : state.playerX;

    const hazards = $("#flight-hazards");
    hazards.innerHTML = "";
    ["stage-nav", "stage-scan", "stage-approach"].forEach((id, i) => {
      const el = $("#" + id);
      if (!el) return;
      el.classList.toggle("active", ["navigate", "scan", "approach"][i] === stage);
      el.classList.toggle("done", ["navigate", "scan", "approach"].indexOf(stage) > i);
      const tag = el.querySelector("i");
      if (tag) tag.textContent = el.classList.contains("done") ? "COMPLETE" : el.classList.contains("active") ? "IN PROGRESS" : "STANDBY";
    });

    hazards.classList.toggle("active", stage === "navigate");
    $("#flight-action").hidden = false;
    $("#flight-scan").hidden = true;
    $("#flight-stabilize").hidden = true;
    $("#approach-readout").hidden = true;
    $("#flight-scene").dataset.stage = stage;

    if (stage === "navigate") {
      state.stageTime = 0;
      state.hits = 0;
      state.hazardList = [
        { x: 22, y: -10, hit: false },
        { x: 43, y: -42, hit: false },
        { x: 67, y: -75, hit: false },
        { x: 84, y: -110, hit: false },
        { x: 55, y: -150, hit: false }
      ];
      state.hazardList.forEach((h, i) => {
        const el = document.createElement("span");
        el.className = "flight-hazard-rock rock-" + (i + 1);
        el.style.left = h.x + "%";
        el.style.top = h.y + "%";
        hazards.appendChild(el);
        h.el = el;
      });

      setObjective("PILOT THROUGH THE DEBRIS FIELD", "Steer with ← → or A / D. Avoid the incoming rocks for 16 seconds.", "01 / 03");
      $("#flight-phase").textContent = "DEBRIS NAVIGATION";
      $("#flight-action").textContent = "ENGAGE THRUST";
      $("#flight-action").onclick = () => {
        state.thrusting = !state.thrusting;
        $("#flight-action").classList.toggle("engaged", state.thrusting);
        $("#flight-action").textContent = state.thrusting ? "THRUST ENGAGED" : "ENGAGE THRUST";
        audio.playThrust(state.thrusting);
        setFeedback(state.thrusting ? "MAIN ENGINE FIRING · VELOCITY INCREASING" : "COASTING · MANUAL STEERING ACTIVE");
      };
      setFeedback("FLIGHT CONTROLS ONLINE · AVOID COLLISION");

      gameTimer = setInterval(() => {
        state.stageTime += 0.1;
        state.hazardList.forEach(h => {
          h.y += state.thrusting ? 1.05 : 0.72;
          h.el.style.top = h.y + "%";
          if (!h.hit && h.y > 74 && h.y < 95 && Math.abs(state.playerX - h.x) < 8.5) {
            h.hit = true;
            state.hits++;
            state.hull = Math.max(0, state.hull - 20);
            state.fuel = Math.max(0, state.fuel - 4);
            h.el.classList.add("impact");
            updateTelemetry();
            audio.playCollision();
            setFeedback("IMPACT DETECTED · HULL " + state.hull + "% · STEER CLEAR");
            if (checkResourceFailure()) return;
          }
        });

        setProgress(Math.min(34, 8 + Math.floor(state.stageTime / 16 * 26)));

        if (state.stageTime >= 16) {
          clearInterval(gameTimer);
          gameTimer = null;
          state.thrusting = false;
          audio.playThrust(false);
          $("#flight-action").classList.remove("engaged");
          state.score += Math.max(0, 14 - state.hits * 3);
          state.fuel = Math.max(0, state.fuel - 2);
          updateTelemetry();
          if (checkResourceFailure()) return;
          hazards.classList.remove("active");
          setFeedback("DEBRIS FIELD CLEARED · FLIGHT PATH STABLE");
          $("#event-title").textContent = "Debris field cleared";
          $("#event-description").textContent = "Navigation complete. Priority transmission incoming from Mission Control.";
          setTimeout(() => loadEvent(), 850);
        }
      }, 100);

    } else if (stage === "scan") {
      state.scanCount = 0;
      state.targetX = 50;
      state.stageTime = 0;
      const target = document.createElement("div");
      target.className = "scan-target";
      target.innerHTML = '<span></span><b>SCIENCE TARGET</b>';
      hazards.appendChild(target);
      state.scanTarget = target;

      $("#flight-action").hidden = true;
      $("#flight-scan").hidden = false;
      setObjective("ACQUIRE SCIENCE DATA", "Track the moving signal. Align your ship with the target, then scan it 3 times.", "02 / 03");
      $("#flight-phase").textContent = "SCIENCE OPERATIONS";
      setFeedback("TARGET SIGNAL ACQUIRED · ALIGN AND SCAN");

      gameTimer = setInterval(() => {
        state.stageTime += 0.1;
        state.targetX = 50 + Math.sin(state.stageTime * 0.72) * 31;
        target.style.left = state.targetX + "%";
        setProgress(Math.min(70, 42 + state.scanCount * 9));
      }, 80);

      $("#flight-scan").onclick = () => {
        if (Math.abs(state.playerX - state.targetX) < 11) {
          state.scanCount++;
          state.score += 7;
          state.power = Math.max(0, state.power - 2);
          setFeedback("SCAN LOCK " + state.scanCount + " / 3 · DATA STORED");
          audio.playScan();
        } else {
          state.power = Math.max(0, state.power - 4);
          setFeedback("SCAN MISSED · REALIGN WITH THE SIGNAL");
          audio.playWarning();
        }
        updateTelemetry();
        if (checkResourceFailure()) return;

        if (state.scanCount >= 3) {
          clearInterval(gameTimer);
          gameTimer = null;
          $("#flight-scan").disabled = true;
          setProgress(72);
          setFeedback("SCIENCE PACKAGE COMPLETE · 3 DATA SETS STORED");
          $("#event-title").textContent = "Science package secured";
          $("#event-description").textContent = "Three high-priority data sets stored. Mission update arriving.";
          setTimeout(() => {
            $("#flight-scan").disabled = false;
            loadEvent();
          }, 1000);
        }
      };

    } else if (stage === "approach") {
      state.stageTime = 0;
      state.approachSpeed = 30;
      setProgress(82);
      $("#flight-phase").textContent = "DESTINATION APPROACH";
      $("#flight-action").hidden = false;
      $("#flight-action").textContent = "+ INCREASE THRUST";
      $("#flight-action").onclick = () => {
        state.approachSpeed = Math.min(70, state.approachSpeed + 5);
        $("#approach-speed-value").textContent = state.approachSpeed;
        setFeedback("APPROACH VELOCITY · " + state.approachSpeed + " M/S");
        audio.playClick();
      };

      $("#flight-stabilize").hidden = false;
      $("#approach-readout").hidden = false;
      $("#approach-speed-value").textContent = state.approachSpeed;
      setObjective("FINAL APPROACH & ORBIT INSERTION", "Set approach speed to 45–55 m/s. Align near the center and stabilize.", "03 / 03");
      setFeedback("DESTINATION IN RANGE · PREPARE ORBIT INSERTION");
      $("#event-title").textContent = "Destination in range";
      $("#event-description").textContent = "Tune approach velocity, align spacecraft, and stabilize orbit insertion.";

      gameTimer = setInterval(() => {
        state.stageTime = (state.stageTime || 0) + 0.1;
        setProgress(Math.min(96, 82 + Math.floor(state.stageTime / 20 * 14)));
      }, 100);

      $("#flight-stabilize").onclick = () => {
        const aligned = state.playerX >= 43 && state.playerX <= 57;
        const speed = state.approachSpeed >= 45 && state.approachSpeed <= 55;
        if (aligned && speed) {
          clearInterval(gameTimer);
          gameTimer = null;
          state.score += 16;
          state.fuel = Math.max(0, state.fuel - 3);
          updateTelemetry();
          if (checkResourceFailure()) return;
          setProgress(100);
          setFeedback("ORBIT INSERTION SUCCESSFUL · DESTINATION SECURED");
          audio.playSuccess();
          setTimeout(() => completeFlight(false), 1400);
        } else {
          state.fuel = Math.max(0, state.fuel - 5);
          updateTelemetry();
          audio.playWarning();
          if (checkResourceFailure()) return;
          setFeedback(!aligned ? "ALIGNMENT OUTSIDE SAFE CORRIDOR · STEER TO CENTER" : "VELOCITY OUT OF RANGE · TARGET 45–55 M/S");
        }
      };
    }
    setShipPosition(true);
  }

  // -------------------------------------------------------------
  // IN-FLIGHT EVENTS & DECISIONS
  // -------------------------------------------------------------
  function loadEvent() {
    const eventsList = (data.missionEvents && data.missionEvents[state.destination]) || data.events || [];
    const ev = eventsList[state.eventIndex];
    if (!ev) {
      beginGameStage("approach");
      return;
    }

    $("#event-title").textContent = ev.title;
    $("#event-description").textContent = ev.description;
    $("#popup-event-title").textContent = ev.title;
    $("#popup-event-description").textContent = ev.description;

    const choicesHtml = ev.choices.map((c, i) => `
      <button class="event-choice" data-choice="${c.id}" data-index="${i}">
        <span class="choice-index">${String.fromCharCode(65 + i)}</span>
        <span><b>${c.title}</b><small>${c.detail}</small></span>
        <span class="choice-arrow">↗</span>
      </button>
    `).join("");

    $("#popup-event-choices").innerHTML = choicesHtml;
    $("#event-outcome").hidden = true;
    $("#popup-event-choices").hidden = false;
    $("#popup-next-event").disabled = true;
    $("#popup-next-event").textContent = "SELECT AN ACTION TO CONTINUE";

    openModal("event-modal");
    audio.playAlert();

    $$("#popup-event-choices .event-choice").forEach(btn => {
      btn.addEventListener("click", () => makeDecision(ev, btn.dataset.choice, parseInt(btn.dataset.index, 10), btn));
    });
  }

  function makeDecision(ev, choiceId, choiceIdx, button) {
    if (button.classList.contains("selected")) return;
    const choice = ev.choices.find(c => c.id === choiceId) || ev.choices[choiceIdx];
    if (!choice) return;

    audio.playSelect();
    $$("#popup-event-choices .event-choice").forEach(b => {
      b.classList.remove("selected");
      b.disabled = true;
    });
    button.classList.add("selected");

    const eff = choice.effects || {};
    state.fuel = Math.max(0, Math.min(100, state.fuel + (eff.fuel || 0)));
    state.power = Math.max(0, Math.min(100, state.power + (eff.power || 0)));
    state.supplies = Math.max(0, Math.min(100, state.supplies + (eff.supplies || 0)));
    state.score += (choice.score || 8);
    state.decisions.push(choice.title);

    updateTelemetry();

    // Inform backend of the decision
    sendBackend("APPLY_DECISION", {
      destination: state.destination,
      event_idx: state.eventIndex,
      choice_idx: choiceIdx,
      choice_id: choiceId,
      telemetry: {
        fuel: state.fuel,
        power: state.power,
        supplies: state.supplies,
        hull: state.hull,
        score: state.score
      }
    });

    if (checkResourceFailure()) return;

    $("#flight-scene-subtitle").textContent = "COMMAND ACCEPTED · SYSTEMS RECONFIGURED";
    $("#console-log").innerHTML = `<span>12:0${state.eventIndex + 5}:18</span> ${choice.log}`;
    $("#event-outcome-text").textContent = choice.log + ` Telemetry Status: Fuel ${Math.round(state.fuel)}%, Power ${Math.round(state.power)}%, Supplies ${Math.round(state.supplies)}%.`;
    $("#event-outcome").hidden = false;
    $("#popup-next-event").disabled = false;
    $("#popup-next-event").textContent = "RESUME FLIGHT ↗";

    if (eventTimer) clearTimeout(eventTimer);
    eventTimer = setTimeout(advanceFlight, 2400);
  }

  function advanceFlight() {
    closeModal("event-modal");
    eventTimer = setTimeout(() => {
      state.eventIndex++;
      if (state.eventIndex === 1) beginGameStage("scan");
      else beginGameStage("approach");
    }, 460);
  }

  // -------------------------------------------------------------
  // MISSION COMPLETION & DEBRIEF EVALUATION
  // -------------------------------------------------------------
  function completeFlight(emergency = false) {
    if (state.missionOver) return;
    state.missionOver = true;
    stopFlightLoop();

    if (gameTimer) { clearInterval(gameTimer); gameTimer = null; }
    if (eventTimer) { clearTimeout(eventTimer); eventTimer = null; }
    audio.playThrust(false);

    // Calculate score addition from resource conservation
    state.score += Math.round((state.fuel + state.power + state.supplies) / 16);
    state.score = Math.max(0, Math.min(100, state.score));

    const success = !emergency && state.hull > 0 && state.score >= 60 && state.fuel > 0 && state.power > 0;
    if (success) state.progress = 100;

    const grade = state.score >= 90 ? "A+" : state.score >= 80 ? "A" : state.score >= 70 ? "B" : state.score >= 60 ? "C" : "D";

    $("#final-score").innerHTML = Math.round(state.score) + '<span>/100</span>';
    $("#grade-badge").textContent = grade;
    $("#score-bar").style.width = Math.min(100, Math.round(state.score)) + "%";

    const destObj = data.destinations[state.destination] || { name: state.destination.toUpperCase() };
    $("#debrief-destination").textContent = destObj.name.toUpperCase();
    $("#debrief-planet").className = "debrief-planet " + state.destination;

    $("#result-science").textContent = state.objective === "resources" ? "Resource Survey (Targeted)" : state.objective === "environment" ? "Environmental Dynamics" : "Topographical Geology";
    $("#result-resources").textContent = (state.fuel + state.power + state.supplies) > 175 ? "Optimal Reserves" : "Constrained Allocation";
    $("#result-decisions").textContent = state.decisions.length + " Critical Calls Logged";

    $("#debrief-insight").textContent = success ?
      "Outstanding mission planning and execution. Your operational decisions successfully balanced spacecraft hardware resilience with scientific returns." :
      "Mission terminated prematurely. " + (state.failReason || "Resource depletion prevented completion of primary scientific objectives.") + " Systems telemetry has been captured for debrief analysis.";

    $("#progress-value").textContent = state.progress + "%";
    $("#progress-bar").style.width = state.progress + "%";

    $("#result-modal-title").textContent = success ? "MISSION SUCCESSFUL" : "MISSION FAILED";
    $("#result-modal-kicker").textContent = success ? "MISSION CONTROL // OBJECTIVES ACHIEVED" : "MISSION CONTROL // FLIGHT TERMINATED";
    $("#result-modal-summary").textContent = success ?
      `Your ${destObj.name} spacecraft has successfully inserted into orbit and completed all core science milestones.` :
      (state.failReason ? state.failReason + ". Critical system failure prevented completion of the flight profile." : "Mission objectives could not be met. Systems data has been archived for engineering debrief.");

    $("#popup-final-score").textContent = Math.round(state.score) + " / 100";
    $("#popup-final-fuel").textContent = Math.round(state.fuel) + "%";
    $("#popup-final-power").textContent = Math.round(state.power) + "%";
    $("#popup-final-supplies").textContent = Math.round(state.supplies) + "%";
    $("#popup-result-note").textContent = `${state.decisions.length} operational decisions · ${destObj.name.toUpperCase()} · Grade ${grade}`;

    $("#result-modal-card").classList.toggle("failed", !success);
    $("#success-stamp").textContent = success ? "✦ MISSION SUCCESSFUL" : "⚠ MISSION FAILED";
    $("#success-stamp").classList.toggle("failed", !success);

    openModal("result-modal");
    if (success) audio.playSuccess(); else audio.playFailure();

    // Send complete evaluation request to Python backend
    sendBackend("EVALUATE_MISSION", {
      destination: state.destination,
      craft: state.craft,
      objective: state.objective,
      emergency: emergency,
      failReason: state.failReason,
      telemetry: {
        fuel: state.fuel,
        power: state.power,
        supplies: state.supplies,
        hull: state.hull,
        score: state.score,
        decisions: state.decisions
      }
    });
  }

  function reset() {
    stopFlightLoop();
    state.missionOver = false;
    if (eventTimer) clearTimeout(eventTimer);
    if (gameTimer) clearInterval(gameTimer);
    state.failReason = "";
    state.destination = "moon";
    state.objective = "geology";
    chooseCraft("pathfinder");
    $("#science-objective").value = "geology";
    closeModal("result-modal");
    audio.playClick();
    sendBackend("RESET_MISSION", {});
    showScreen("intro");
  }

  // -------------------------------------------------------------
  // DOM EVENT BINDINGS
  // -------------------------------------------------------------
  $("#begin-mission").addEventListener("click", () => {
    audio.playClick();
    showScreen("destination");
  });

  $("#how-to-play").addEventListener("click", () => {
    audio.playClick();
    openModal("help-modal");
  });

  $$("[data-close-modal]").forEach(b => b.addEventListener("click", () => {
    audio.playClick();
    closeModal("help-modal");
  }));

  $("#help-modal").addEventListener("click", e => {
    if (e.target.id === "help-modal") closeModal("help-modal");
  });

  $$(".destination-card").forEach(c => c.addEventListener("click", () => chooseDestination(c.dataset.destination)));

  $("#science-objective").addEventListener("change", e => {
    state.objective = e.target.value;
    audio.playSelect();
  });

  $("#continue-destination").addEventListener("click", () => {
    state.objective = $("#science-objective").value;
    audio.playConfirmDestination();
    closeModal("destination-modal");

    sendBackend("SELECT_DESTINATION", {
      destination: state.destination,
      objective: state.objective
    });

    setTimeout(() => showScreen("spacecraft"), 220);
  });

  $("#close-destination-modal").addEventListener("click", () => {
    audio.playClick();
    closeModal("destination-modal");
  });

  $("#destination-modal").addEventListener("click", e => {
    if (e.target.id === "destination-modal") closeModal("destination-modal");
  });

  $$(".craft-option").forEach(c => c.addEventListener("click", () => chooseCraft(c.dataset.craft)));

  ["fuel-range", "power-range", "supplies-range"].forEach(id => {
    const el = $("#" + id);
    if (el) {
      el.addEventListener("input", () => {
        updateLoadout();
        audio.playSlider();
      });
    }
  });

  $("#back-destination").addEventListener("click", () => {
    audio.playClick();
    showScreen("destination");
  });

  $("#continue-flight").addEventListener("click", startFlight);

  $("#steer-left").addEventListener("click", () => movePlayer(-8));
  $("#steer-right").addEventListener("click", () => movePlayer(8));

  document.addEventListener("keydown", e => {
    if (state.screen !== "flight" || state.missionOver || $("#event-modal").classList.contains("is-visible")) return;
    if (["ArrowLeft", "a", "A"].includes(e.key)) { e.preventDefault(); keys.left = true; }
    if (["ArrowRight", "d", "D"].includes(e.key)) { e.preventDefault(); keys.right = true; }
  });

  document.addEventListener("keyup", e => {
    if (["ArrowLeft", "a", "A"].includes(e.key)) keys.left = false;
    if (["ArrowRight", "d", "D"].includes(e.key)) keys.right = false;
  });

  window.addEventListener("blur", () => { keys.left = keys.right = false; });
  window.addEventListener("resize", () => setShipPosition(true));

  $("#popup-next-event").addEventListener("click", () => {
    if ($("#popup-next-event").disabled) return;
    audio.playClick();
    if (eventTimer) clearTimeout(eventTimer);
    advanceFlight();
  });

  $("#view-debrief").addEventListener("click", () => {
    audio.playClick();
    closeModal("result-modal");
    setTimeout(() => showScreen("debrief"), 220);
  });

  $("#replay-mission").addEventListener("click", () => {
    audio.playClick();
    closeModal("result-modal");
    chooseCraft(state.craft);
    setTimeout(() => showScreen("spacecraft"), 220);
  });

  $("#new-mission").addEventListener("click", reset);

  // Sound toggle button in header
  const soundToggle = $("#sound-toggle");
  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      const isMutedNow = window.AudioFX ? window.AudioFX.toggleMute() : false;
      soundToggle.setAttribute("aria-pressed", String(!isMutedNow));
      soundToggle.innerHTML = !isMutedNow ?
        '<span class="sound-icon">♫</span><span> SOUND ON</span>' :
        '<span class="sound-icon">♫</span><span> SOUND OFF</span>';
      toast(!isMutedNow ? "Mission audio online" : "Audio muted");
    });
  }

  // Hover sound on interactive elements
  document.addEventListener("pointerover", e => {
    if (e.target.closest("button, .destination-card, .craft-option, .event-choice")) {
      audio.playHover();
    }
  });

  // Global click sound for buttons
  document.addEventListener("click", e => {
    if (e.target.closest("button") && !e.target.closest("#sound-toggle")) {
      audio.playClick();
    }
  });

  // Initialization
  initStreamlitBridge();
  updateDestination(false);
  chooseCraft("pathfinder");
  updateLoadout();

  const clock = $("#system-clock");
  if (clock) {
    setInterval(() => {
      const d = new Date();
      clock.textContent = d.toISOString().slice(11, 19) + " UTC";
    }, 1000);
  }
})();
