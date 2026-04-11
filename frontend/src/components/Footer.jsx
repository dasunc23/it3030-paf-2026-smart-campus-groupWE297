import React from "react";
import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="mt-6 py-7 px-6"
      style={{ borderTop: "1px solid #e2e8f0", backgroundColor: "white" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ backgroundColor: "#064e3b" }}
          >
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold" style={{ color: "#064e3b" }}>
            Smart Campus Operations Hub
          </span>
        </div>
        <div
          className="flex items-center gap-5 text-xs"
          style={{ color: "#94a3b8" }}
        >
          <span>Enterprise Resource Management</span>
          <span>·</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
