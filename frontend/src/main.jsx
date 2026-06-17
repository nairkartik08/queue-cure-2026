import React from "react";
import ReactDOM from "react-dom/client";
import History from "./History";

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

    </Routes>

  </BrowserRouter>

);