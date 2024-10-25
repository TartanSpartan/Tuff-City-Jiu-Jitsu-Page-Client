import React from "react";
import { User } from "../requests";
import { Route, Redirect } from "react-router-dom";

export const getUser= () =>  {
  console.log("Where is the point of failure?")
  User.current()
  .then(data => {
    if (typeof data.id !== "number") {
      this.setState({ loading: false });
    } else {
      this.setState({ loading: false, currentUser: data });
    }
    console.log("This is the current user from data", data)
    return data;
  })
  .catch((err) => {
    console.log(err);
    this.setState({ loading: false });
  });
};

const AuthRoute = props => {
  const {
    isAuthenticated = false,
    component: Component,
    render,
    ...restProps
  } = props;

  return (
    <Route
      {...restProps}
      render={routeProps => {
        if (isAuthenticated) {
            if (typeof render === "function") {
                return render(routeProps);
            } else {
                return <Component user={isAuthenticated} {...routeProps} />;
            }
        } else {
          return <Redirect to="/sign_in" />;
        }
      }}
    />
  );
};

export default AuthRoute;