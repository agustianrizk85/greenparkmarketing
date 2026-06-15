import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import { App } from "./App";
import "./styles.base.css";
import "./styles.marketing.css";

const container = document.getElementById("root");
if (!container) throw new Error("#root mount point not found");

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
