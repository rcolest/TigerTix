TigerTix Clemson Campus Event Ticketing System - CPSC 3720 Section 3

How To Run/Test App:
1.
Open a terminal in backend/client-service and enter:
node server.js

2.
Open a terminal in backend/llm-driven-booking and enter:
node server.js

3.
Open a new terminal in the frontend folder and enter:
>Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
>npm start
(This sometimes takes a second)
If you want to run tests, use "npm test" instead of "npm start"