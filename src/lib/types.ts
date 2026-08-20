export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  userid: string; // References the logged-in User's ID
}

export interface Session {
  userId: string;
  userName: string;
  email: string;
}
