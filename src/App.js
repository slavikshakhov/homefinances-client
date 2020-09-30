import React, { useContext, useEffect } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import "./App.css";
import Start from "./components/Start/Start";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./components/Home/Home";
import { DataProvider } from "./components/DataProvider";

const App = () => {
  return (
    <BrowserRouter>
      <DataProvider>
        <Switch>
          <Route exact path="/" component={Start} />
          <PrivateRoute exact path="/home" component={Home} />
          <Redirect from="*" to="/" />
        </Switch>
      </DataProvider>
    </BrowserRouter>
  );
};

export default App;
