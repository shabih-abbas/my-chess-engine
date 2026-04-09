#include <stdio.h>
#include "defs.h"

U64 GeneratePosKey(const BOARD *pos){
    int sq = 0;
    U64 finalKey = 0;
    int piece = EMPTY;

    for(sq = 0; sq < BRD_SQRS; ++sq){
        piece = pos->squares[sq];
        if(piece!=NO_SQR && piece!=EMPTY && piece!=OFFBOARD) {
            // printf("%d",piece);
            ASSERT(piece >= wP && piece <= bK);
            finalKey ^= PieceKeys[piece][sq];
        }
    }
    if(pos->turn == WHITE) {
        finalKey ^= SideKey;
    }

    if(pos->enPas != NO_SQR) {
        ASSERT(pos->enPas>=0 && pos->enPas<BRD_SQRS);
        finalKey ^= PieceKeys[EMPTY][pos->enPas];
    }
    ASSERT(pos->castlePerm>=0 && pos->castlePerm<=15);
    finalKey ^= CastleKeys[pos->castlePerm];

    return finalKey;
}