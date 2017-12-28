import {UserId} from "./user";

export interface LoginCredentials {
  id: UserId;
  name: string;
  first_name?: string;
  last_name?: string;
  screenName?: string;
  gender?: string;
  email: string;
  link?: string;
  [index: string]: string | number;
}

export const guest: LoginCredentials = {
  email: "guest@jswars.com",
  first_name: null,
  id: null,
  last_name: null,
  link: null,
  name: "Guest",
};

export const test: LoginCredentials = {
  email: "testUser@test.com",
  first_name: "Testy",
  id: "10152784238931286",
  last_name: "McTesterson",
  link: "https://www.facebook.com/app_scoped_user_id/10156284235761286/",
  name: "Testy McTesterson",
};
