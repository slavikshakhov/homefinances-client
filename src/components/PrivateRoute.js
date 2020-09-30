import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { DataContext } from "./DataProvider";
const PrivateRoute = ({ component: Component, path, ...rest }) => {
  const { isAuth } = useContext(DataContext);
  //const isAuth = true;
  return (
    <Route
      {...rest}
      path={path}
      render={(props) =>
        isAuth ? <Component {...props} /> : <Redirect to={"/"} />
      }
    />
  );
};

export default PrivateRoute;
