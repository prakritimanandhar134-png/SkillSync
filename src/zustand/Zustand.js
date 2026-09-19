import { create } from "zustand";
import { api } from "../api/Axios";

const usestore = create((set) => ({
  authstore: null,

  check: async () => {
    try {
      const res = await api.get("/checkauth");

      console.log("checkauth:", res.data);

      set({
        authstore: res.data,
      });

      return res.data;
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("User is not authenticated");

        set({
          authstore: null,
        });
      } else {
        console.error("Check authentication failed:", error);
      }

      return null;
    }
  },
}));

export default usestore;