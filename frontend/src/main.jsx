import React from "react";
import ReactDOM from "react-dom/client";
import History from "./History";
import Analytics from "./Analytics";
import Settings from "./Settings";

import {
  BrowserRouter,
  Routes,
  Route
}
  from "react-router-dom";

import App from "./App";
import WaitingRoom from "./WaitingRoom";

ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <BrowserRouter>

    <Routes>

      <Route
        path="/"
        element={<App />}
      />

      <Route
        path="/waiting-room"
        element={
          <WaitingRoom />
        }
      />

      <Route
        path="/history"
        element={
          <History />
        }
      />

      <Route
        path="/analytics"
        element={<Analytics />}
      />

      <Route
        path="/settings"
        element={<Settings />}
      />

    </Routes>

  </BrowserRouter>

);