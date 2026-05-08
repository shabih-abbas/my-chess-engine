# My Chess Engine & Web Platform

A full-stack chess application featuring a custom chess engine written in **C**, a high-performance **Node.js** backend, and a **React** frontend. This platform supports both guest play and persistent, authenticated games.

---

## 🚀 Features

### **Custom C Engine**
*   **Mailbox Engine:** Acurrate move generation using mailbox representations.
*   **UCI Integration:** Communicates with the web server via the Universal Chess Interface protocol.
*   **Search & Eval:** Implements Alpha-Beta pruning and iterative deepening with positional evaluation tables.

### **Web Gameplay**
*   **Hybrid Logic:** Seamless switching between an in-memory **Opening Book** for instant responses and the **C Engine** for deep calculation.
*   **Persistence:** Registered users can save, resume, or track game history via **MongoDB**.
*   **Real-time:** Full-duplex communication using **Socket.io** for move synchronization and game-state updates.
*   **Move Validation:** Client-side legal move enforcement using `chess.js`.

### **Modern UI**
*   **Glassmorphism Design:** A clean, dark-themed interface built with **Tailwind CSS**.
*   **Interactive Board:** Drag-and-drop or click-to-move support via `react-chessboard`.
*   **Visual Indicators:** Real-time check alerts and move highlights.

---

## 🛠️ Tech Stack

*   **Frontend:** React, Tailwind CSS, Socket.io-client.
*   **Backend:** Node.js, Express, MongoDB, Mongoose.
*   **Engine:** C (Compiled binary).

---

## 🛡️ Credits

The core logic of the chess engine—including move generation and search algorithms—was developed following the "Programming a Chess Engine in C" educational series by **Bluefever Software**.

