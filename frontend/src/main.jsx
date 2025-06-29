import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ApiStatusProvider } from "./contexts/ApiStatusContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ApiStatusProvider checkInterval={60000}>
      <App />
    </ApiStatusProvider>
  </React.StrictMode>,
);
