#include <stdio.h>
#include "defs.h"

#define FEN1 "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2"
#define FEN2 "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"

int main(){
    AllInit();

    BOARD board[1];

    ParseFen(START_FEN, board);
    PrintBoard(board);
    ParseFen(FEN1, board);
    PrintBoard(board);
    ParseFen(FEN2, board);
    PrintBoard(board);
    return 0;
}