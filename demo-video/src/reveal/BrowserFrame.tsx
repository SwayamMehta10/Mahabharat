import React from "react";
import { AbsoluteFill } from "remotion";
import { COLOR, ui } from "../fonts";

/**
 * A minimal browser-chrome window that unmistakably signals "this is a website."
 * Wraps real site footage during the Act 2 reveal; the address bar reads the URL.
 */
export const BrowserFrame: React.FC<{
  children: React.ReactNode;
  scale?: number;
  opacity?: number;
}> = ({ children, scale = 1, opacity = 1 }) => {
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity }}>
      <div
        style={{
          width: "74%",
          transform: `scale(${scale})`,
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(140,133,119,0.25)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.7), 0 0 60px rgba(201,164,55,0.08)",
          background: COLOR.void,
        }}
      >
        <div
          style={{
            height: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 14px",
            background: "#0d1018",
            borderBottom: "1px solid rgba(140,133,119,0.18)",
          }}
        >
          {["#cf4a1f", "#c9a437", "#8c8577"].map((c) => (
            <span key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: 0.7 }} />
          ))}
          <div
            style={{
              flex: 1,
              margin: "0 10px",
              height: 22,
              borderRadius: 6,
              background: "#12151f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: ui,
              fontSize: 12,
              letterSpacing: "0.12em",
              color: COLOR.ash,
            }}
          >
            mahabharat-ten.vercel.app
          </div>
        </div>
        <div style={{ aspectRatio: "16 / 9", position: "relative" }}>{children}</div>
      </div>
    </AbsoluteFill>
  );
};
