import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { apiAuth } from "./utils/api";
import { useAuth } from "./utils/context";
import { Navbar, PrivateRoute } from "./components";
import { Home, Login, Register, Profile, NoMatch } from "./pages";

function App() {
  const [state, setState] = useState({
    isReady: false,
  });
  const { auth, setAuth } = useAuth();

  useEffect(() => {
    const res = apiAuth.getAuth();
    if (res) {
      setAuth({ ...auth, ...res });
    }
    setState({ ...state, isReady: true });
  }, []);

  if (!state.isReady) {
    return null;
  }

  return (
    <Router>
      <div>
        <Navbar />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <PrivateRoute exact path="/profile" component={Profile} />
          <Route component={NoMatch} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
