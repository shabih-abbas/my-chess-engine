#include "defs.h"

const int KnDir[8] = {-8, -19, -21, -12, 8, 19, 21, 12};
const int RkDir[4] = {-1, -10, 1, 10};
const int BiDir[4] = {-9, -11, 11, 9};
const int KiDir[8] = {-1, -10, 1, 10, -9, -11, 11, 9};

int SqAttacked(const int sq, const int side, const BOARD *pos){
    int piece, index, t_sq, dir;

    ASSERT(SqOnBoard(sq));
    ASSERT(SideValid(side));
    ASSERT(CheckBoard(pos));

    if(side == WHITE) {
        if(pos->squares[sq - 11] == wP || pos->squares[sq - 9] == wP) {
            return TRUE;
        }
    } else {
        if(pos->squares[sq + 11] == bP || pos->squares[sq + 9] == bP) {
            return TRUE;
        }
    }

    for(index = 0; index < 8; ++ index){
        piece = pos->squares[sq + KnDir[index]];
        if(IsKn(piece) && PieceCol[piece] == side){
            return TRUE;
        }
    }

    for(index = 0; index < 4; ++index) {
        dir = RkDir[index];
        t_sq = sq + dir;
        piece = pos->squares[t_sq];
        while(piece != OFFBOARD) {
            if(piece != EMPTY){
                if(IsRQ(piece) && PieceCol[piece] == side) {
                    return TRUE;
                }
                break;
            }
            t_sq += dir;
            piece = pos->squares[t_sq];
        }
    }

    for(index = 0; index < 4; ++index){
        dir = BiDir[index];
        t_sq = sq + dir;
        piece = pos->squares[t_sq];

        while(piece != OFFBOARD){
            if(piece != EMPTY){
                if(IsBQ(piece) && PieceCol[piece] == side){
                    return TRUE;
                }
                break;
            }
            t_sq += dir;
            piece = pos->squares[t_sq];
        }
    }

    for(index = 0; index < 8; ++ index){
        piece = pos->squares[sq + KiDir[index]];
        if(IsKi(piece) && PieceCol[piece] == side){
            return TRUE;
        }
    }

    return FALSE;
}