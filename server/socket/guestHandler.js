
import { spawn } from 'child_process';
import { getBookMove } from '../utils/openingBook.js';
import { getEnginePath, getEnginePwd } from '../utils/enginePath.js';

export const registerGuestHandlers = (io, socket) => {
    socket.guestSession = {
        history: [],
        opening: null,
        side: 'white'
    };

    socket.on('guest:start_game', ({ openingName, userColor }) => {
        socket.guestSession.opening = openingName;
        socket.guestSession.side = userColor;
        socket.guestSession.history = [];

        console.log(`Guest ${socket.id} started ${openingName} as ${userColor}`);

        if (userColor === 'black') {
            const firstMove = getBookMove(openingName, []);
            if (firstMove) {
                socket.guestSession.history.push(firstMove);
                socket.emit('guest:engine_move', { move: firstMove });
            }
        }
    });

    socket.on('guest:move', (move) => {
        const session = socket.guestSession;
        session.history.push(move);
        const bookMove = getBookMove(session.opening, session.history);
        if (bookMove) {
            session.history.push(bookMove);
            return socket.emit('guest:engine_move', { move: bookMove });
        }

        const engine = spawn(getEnginePath(), [], {cwd: getEnginePwd()});
        
        let commandsSent = false;
        engine.stdin.write("uci\n");
        let wholeOutput = '';
        engine.stdout.on('data', (data) => {
            const output = data.toString();
            // console.log("Engine Output:", output);

            if (output.includes("uciok") && !commandsSent) {
                commandsSent = true;
                engine.stdin.write(`position startpos moves ${session.history.join(' ')}\n`);
                engine.stdin.write("go movetime 3000\n");
            }
            wholeOutput += output;
            const match = wholeOutput.match(/bestmove\s(\w{4,5})/);
            if (match) {
                const engineMove = match[1];
                console.log("engine move:", engineMove);
                session.history.push(engineMove);
                socket.emit('guest:engine_move', { move: engineMove });
                engine.kill();
            }
        });

        engine.on('error', (err) => {
            console.error("Engine Spawn Error:", err);
            socket.emit('guest:error', "Chess engine failed to initialize.");
        });
    });
};