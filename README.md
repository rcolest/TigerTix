TigerTix Clemson Campus Event Ticketing System - CPSC 3720 Section 3
Created by: Jonah Colestock, Christopher Skelly
Under Dr. Julian Brinkley, and TAs Colt Doster and Atik Enam

                    GNU GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007

    Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
    Everyone is permitted to copy and distribute verbatim copies
    of this license document, but changing it is not allowed.

How To Run/Test App:
1. Open a terminal in backend/client-service and enter: node server.js
2. Open a terminal in backend/llm-driven-booking and enter: node server.js
3. Open a terminal in backend/user-authentication and enter: node server.js
4. Open a new terminal in the frontend folder and enter:
>Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
>npm start
This command will have a delay before it completes.

If you want to run regression tests instead of starting the program, use "npm test" instead of "npm start" in Step 4.

This software runs using Node.js to operate the backend systems, and React to operate the frontend systems. An SQL database is used to store
user authentication and ticket market information. Express is used as a router system to connect frontend requests from the user to the backend.
An LLM model chatbot using Ollama accepts input from the frontend and uses its own Express router connections into the backend.
