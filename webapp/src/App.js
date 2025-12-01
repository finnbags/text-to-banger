import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import {
  faBolt,
  faShuffle,
  faFire,
  faShareNodes,
  faMobileScreenButton,
} from "@fortawesome/free-solid-svg-icons";
import ReactGA from "react-ga";
import logo from "./default.png";

import "./App.css";

const VIBE_LIBRARY = [
  { label: "Turbo Degen", helper: "caps-lock threats + rockets" },
  { label: "AI Cult Leader", helper: "techno-optimist prophecy" },
  { label: "Wholesome Chaos", helper: "cozy internet but feral" },
  { label: "Crypto Historian", helper: "alpha-thread lore drops" },
  { label: "IRL Stunt Team", helper: "flash mobs & projections" },
];

const UTILITY_LIBRARY = [
  "Community raid-to-earn quests",
  "IRL pop-up antics",
  "Loot-box governance",
  "Chain-agnostic points system",
  "AI meme pipeline",
];

const IDEA_STARTERS = [
  "memecoin for night-shift devs who ship after midnight",
  "coin that rewards people for touching grass between mints",
  "post-scarcity meme money for restaking maxis",
  "pet-owners DAO that deploys snacks + airdrops",
  "nostalgia token tied to early internet forums",
  "solarpunk vs doomer battle coin with two factions",
  "friend.tech exit liquidity revenge coin",
  "meme ETF for people who refuse to read whitepapers",
];

const randomItem = (list) => list[Math.floor(Math.random() * list.length)];

function App() {
  useEffect(() => {
    ReactGA.initialize("G-SZEJEE5GGC");
    ReactGA.pageview(window.location.pathname);
  }, []);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

  const [idea, setIdea] = useState(IDEA_STARTERS[0]);
  const [tone, setTone] = useState(VIBE_LIBRARY[0].label);
  const [utility, setUtility] = useState(UTILITY_LIBRARY[0]);
  const [memecoins, setMemecoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoPilot, setAutoPilot] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const generateMemecoin = useCallback(
    async ({ mode = "manual" } = {}) => {
      const payload =
        mode === "auto" || mode === "seed"
          ? {
              idea: randomItem(IDEA_STARTERS),
              tone: randomItem(VIBE_LIBRARY).label,
              utility: randomItem(UTILITY_LIBRARY),
            }
          : {
              idea: idea.trim() || randomItem(IDEA_STARTERS),
              tone,
              utility,
            };

      if (mode === "manual") {
        setLoading(true);
      }
      setError("");

      try {
        const { data } = await axios.post(`${API_URL}/generate-memecoin`, payload);
        if (!data?.memecoin) {
          throw new Error("Empty memecoin payload");
        }

        const minted = {
          ...data.memecoin,
          vibe: payload.tone,
          utilityFocus: payload.utility,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        };

        setMemecoins((prev) => [minted, ...prev].slice(0, 15));

        if (mode === "manual") {
          ReactGA.event({
            category: "Memecoin",
            action: "Manual Mint",
            label: payload.tone,
          });
        }
      } catch (err) {
        console.error("Unable to mint memecoin", err);
        setError("Model is rate-limited. Try again in a sec.");
      } finally {
        if (mode === "manual") {
          setLoading(false);
        }
      }
    },
    [API_URL, idea, tone, utility]
  );

  useEffect(() => {
    generateMemecoin({ mode: "seed" });
  }, [generateMemecoin]);

  useEffect(() => {
    if (!autoPilot) return undefined;
    const interval = setInterval(() => generateMemecoin({ mode: "auto" }), 15000);
    return () => clearInterval(interval);
  }, [autoPilot, generateMemecoin]);

  const randomizeInputs = () => {
    setIdea(randomItem(IDEA_STARTERS));
    setTone(randomItem(VIBE_LIBRARY).label);
    setUtility(randomItem(UTILITY_LIBRARY));
  };

  const toggleAuto = () => {
    setAutoPilot((prev) => !prev);
  };

  const handleCopy = async (coin) => {
    if (!navigator?.clipboard) return;
    try {
      const shareText = `Name: ${coin.name} ($${coin.ticker})\nTagline: ${coin.tagline}\nLore: ${coin.lore}\nUtility: ${coin.utility.join(
        " • "
      )}\nVirality hooks: ${coin.viralityHooks.join(" • ")}`;
      await navigator.clipboard.writeText(shareText);
      setCopiedId(coin.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (copyError) {
      console.error("Clipboard unsupported", copyError);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="hero">
          <div className="logo-stack">
            <img src={logo} alt="intern.gg" className="App-logo" />
            <div>
              <p className="eyebrow">custom finetuned model</p>
              <h1>Memecoin Launch Foundry</h1>
              <p className="subtitle">
                Turn chaotic vibes into fully weaponized memecoin briefs in seconds. Feed updates live
                while your phone watches.
              </p>
            </div>
          </div>
          <a
            className="ghost-link"
            href="https://github.com/effectiveaccelerationism/text-to-banger"
            target="_blank"
            rel="noreferrer"
          >
            <FontAwesomeIcon icon={faGithub} />
            <span>Source</span>
          </a>
        </div>

        <div className="mobile-tip">
          <FontAwesomeIcon icon={faMobileScreenButton} />
          <span>
            Need to preview on your phone? Run <code>npm run mobile-preview</code> after <code>npm start</code> and use the
            tunnel URL it prints.
          </span>
        </div>

        <section className="controls-panel">
          <label htmlFor="idea-input">What's the vibe today?</label>
          <textarea
            id="idea-input"
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            placeholder="memecoin that pays people for touching grass"
          />

          <div className="select-row">
            <div className="select-field">
              <span className="label">Tone</span>
              <select value={tone} onChange={(event) => setTone(event.target.value)}>
                {VIBE_LIBRARY.map((vibe) => (
                  <option key={vibe.label} value={vibe.label}>
                    {vibe.label} · {vibe.helper}
                  </option>
                ))}
              </select>
            </div>

            <div className="select-field">
              <span className="label">Utility focus</span>
              <select value={utility} onChange={(event) => setUtility(event.target.value)}>
                {UTILITY_LIBRARY.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="button-cluster">
            <button className="primary" onClick={() => generateMemecoin()} disabled={loading}>
              <FontAwesomeIcon icon={faBolt} />
              {loading ? "Minting..." : "Mint memecoin"}
            </button>
            <button className="ghost" onClick={randomizeInputs}>
              <FontAwesomeIcon icon={faShuffle} /> Remix prompt
            </button>
            <button className={`ghost ${autoPilot ? "active" : ""}`} onClick={toggleAuto}>
              <FontAwesomeIcon icon={faFire} /> {autoPilot ? "Stop auto-drip" : "Auto-drip feed"}
            </button>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="status-row">
            <div className="status-pill">{memecoins.length} live briefs</div>
            <div className={`status-pill ${autoPilot ? "live" : "idle"}`}>
              {autoPilot ? "Auto stream live" : "Manual mode"}
            </div>
          </div>
        </section>

        <section className="memecoin-feed">
          {memecoins.length === 0 ? (
            <p className="placeholder">Memecoin feed warming up...</p>
          ) : (
            <div className="memecoin-grid">
              {memecoins.map((coin) => (
                <article className="memecoin-card" key={coin.id}>
                  <header className="card-header">
                    <div>
                      <p className="ticker">${coin.ticker}</p>
                      <h3>{coin.name}</h3>
                    </div>
                    <button className="share" onClick={() => handleCopy(coin)}>
                      <FontAwesomeIcon icon={faShareNodes} />
                      <span>{copiedId === coin.id ? "Copied" : "Copy brief"}</span>
                    </button>
                  </header>

                  <p className="tagline">{coin.tagline}</p>
                  <p className="lore">{coin.lore}</p>

                  <div className="pill-row">
                    {coin.utility.map((item) => (
                      <span className="pill" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="list-block">
                    <h4>Virality hacks</h4>
                    <ul>
                      {coin.viralityHooks.map((hook) => (
                        <li key={hook}>{hook}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="list-block">
                    <h4>Launch sprint</h4>
                    <ol>
                      {coin.launchPlan.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </header>
    </div>
  );
}

export default App;
