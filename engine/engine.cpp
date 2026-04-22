#include <stdio.h>
#include "defs.h"

#define FEN1 "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"
#define FEN2 "rnbqkbnr/p1p1p3/3p3p/1p1p4/2P1Pp2/8/PP1P1PpP/RNBQKB1R b KQkq e3 0 1"
#define FEN3 "5k2/1n6/4n3/6N1/8/3N4/8/5K2 w - - 0 1"
#define FEN4 "6k1/8/5r2/8/1nR5/5N2/8/6K1 b - - 0 1"
#define FEN5 "6k1/8/4nq2/8/1nQ5/5N2/1N6/6K1 b - - 0 1"
#define FEN6 "6k1/1b6/4n3/8/1n4B1/1B3N2/1N6/2b3K1 b - - 0 1"
#define FEN7 "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1"
#define FEN8 "3rk2r/8/8/8/8/8/6p1/R3K2R b KQk - 0 1"
#define FEN9 "n1n5/PPPk4/8/8/8/8/4Kppp/5N1N w - - 0 1"
#define FEN10 "2rr3k/pp3pp1/1nnqbN1p/3pN3/2pP4/2P3Q1/PPB4P/R4RK1 w - -"
#define PERFTFEN "r3k2r/p1pp"

int main(){
    AllInit();
 
    BOARD board[1];
    board->PvTable->pTable = NULL;
    MOVELIST list[1];
    SEARCHINFO info[1];

    ParseFen(FEN10, board);

    char input[6];
    int Move = NOMOVE;
    int PvNum = 0;
    int Max = 0;

    while(TRUE){
        PrintBoard(board);
        printf("Please enter a move >");
        fgets(input, 6, stdin);

        if(input[0] == 'q'){
            break;
        } else if(input[0] == 't'){
            TakeMove(board);
        } else if(input[0] == 's'){
            info->depth = 4;
            SearchPosition(board, info); 
        } else {
            Move = ParseMove(input, board);
            if(Move != NOMOVE){
                StorePvMove(board, Move);
                MakeMove(board, Move);
            } else {
                printf("Move not parsed:%s\n", input);
            }
        }
        fflush(stdin);
    }
    
    return 0;
}