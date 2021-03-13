import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

import { BrowserRouter as Router, Route } from "react-router-dom";
import Login from "./screens/login/Login";
import Home from "./screens/home/Home";
import Profile from "./screens/profile/profile";

ReactDOM.render(
  <Router>
    <Route exact path="/" component={Login} />
    <Route exact path="/home" component={Home} />
    <Route exact path="/profile" component={Profile} />
  </Router>,
  document.getElementById("root")
);