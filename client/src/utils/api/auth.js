import axios from "axios";

const BASE_URL = process.env.REACT_APP_HOST || '';

function login(username, password) {
  return axios
    .post(BASE_URL + "/api/auth/login", {
      username,
      password,
    })
    .then((res) => {
      setAuth({ token: res.data.token });
      return res.data.token;
    });
}

function register(username, password) {
  return axios
    .post(BASE_URL + "/api/auth/register", {
      username,
      password,
    })
    .then((res) => {
      setAuth({ token: res.data.token });
      return res.data.token;
    });
}

function logout() {
  localStorage.removeItem("authentication");
}

function getAuth() {
  const auth = JSON.parse(localStorage.getItem("authentication"));
  if (auth) {
    setDefaults(auth.token);
    return auth;
  }
  return null;
}

function setAuth(obj = {}) {
  localStorage.setItem("authentication", JSON.stringify(obj));
  setDefaults(obj.token);
}

function setDefaults(token) {
  axios.defaults.headers.common = { Authorization: `Bearer ${token}` };
}

export const apiAuth = {
  login,
  logout,
  register,
  getAuth,
  setAuth,
};
