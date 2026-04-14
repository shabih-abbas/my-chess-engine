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

void ShowSqAtBySide(const int side, const BOARD *pos){
    int rank = 0;
    int file = 0;
    int sq = 0;

    printf("\n\nSquares attacked by: %c\n", SideChar[side]);
    for(rank = RANK_8; rank >= RANK_1; --rank){
        for(file = FILE_A; file <= FILE_H; ++file){
            sq = FR2SQ(file, rank);
            if(SqAttacked(sq, side, pos) == TRUE){
                printf("X");
            } else {
                printf("-");
            }
        }
        printf("\n");
    }
    printf("\n\n");
}

int main(){
    AllInit();

    // BOARD board[1];

    // ParseFen(FEN1, board);

    // MOVELIST list[1];

    // GenerateAllMoves(board, list);
    // PrintMoveList(list);

    return 0;
}