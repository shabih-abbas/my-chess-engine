#include <stdio.h>
#include "defs.h"

#define FEN1 "rnbqkb1r/pp1p1pPp/8/2p1pP2/1P1P4/3P3P/P1P1P3/RNBQKBNR w KQkq e6 0 1"
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

    ParseFen(FEN1, board);
    PrintBoard(board);

    MOVELIST list[1];

    GenerateAllMoves(board, list);

    PrintMoveList(list);
    return 0;
}