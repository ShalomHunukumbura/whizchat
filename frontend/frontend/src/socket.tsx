import { io } from "socket.io-client" // this library allows us to create a connection to the backend's socket.io server

//establish connection to the backend server
const socket = io("http://localhost:5000")



export default socket