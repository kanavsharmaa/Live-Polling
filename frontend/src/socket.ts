import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL =
  import.meta.env.MODE === "production"
    ? undefined
    : "http://localhost:3001";

export const socket = io(URL, {
  autoConnect: false,
});
