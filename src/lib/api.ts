import axios from "axios";
import { User, Contact } from "./types";

const API_URL = "http://localhost:3001";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const dbService = {
  // User endpoints
  async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>("/user");
    return response.data;
  },

  async createUser(user: Omit<User, "id">): Promise<User> {
    const response = await api.post<User>("/user", user);
    return response.data;
  },

  // Contact endpoints
  async getContacts(): Promise<Contact[]> {
    const response = await api.get<Contact[]>("/contact");
    return response.data;
  },

  async getContactById(id: string): Promise<Contact> {
    const response = await api.get<Contact>(`/contact/${id}`);
    return response.data;
  },

  async createContact(contact: Omit<Contact, "id">): Promise<Contact> {
    const response = await api.post<Contact>("/contact", contact);
    return response.data;
  },

  async updateContact(id: string, contact: Omit<Contact, "id" | "userid"> & { userid: string }): Promise<Contact> {
    const response = await api.put<Contact>(`/contact/${id}`, contact);
    return response.data;
  },

  async deleteContact(id: string): Promise<void> {
    await api.delete(`/contact/${id}`);
  },
};
