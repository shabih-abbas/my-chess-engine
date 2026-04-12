#include <stdio.h>
#include "defs.h"

#define FEN1 "8/3q1p2/8/5P2/4Q3/8/8/8 w - - 0 2"
#define FEN2 "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2"

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

    BOARD board[1];

    ParseFen(FEN2, board);
    PrintBoard(board);
    
    ASSERT(CheckBoard(board));

    int move = 0;
    int from = 6; int to = 12;
    int cap = wR; int prom = bR;
    move = ((from) | (to << 7) | (cap << 14) | (prom << 20));
    printf("\ndec: %d hex:%X\n", move, move);

    printf("from:%d to:%d cap:%d prom:%d\n", FROMSQ(move), TOSQ(move), CAPTURED(move), PROMOTED(move));
    return 0;
}