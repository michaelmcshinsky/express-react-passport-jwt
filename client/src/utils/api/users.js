import axios from "axios";

const BASE_URL = process.env.REACT_APP_HOST || '';

function getProfile() {
  return axios.get(BASE_URL + "/api/users/profile");
}

export const apiUsers = {
  getProfile,
};
