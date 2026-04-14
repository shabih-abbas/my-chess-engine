#include "defs.h"

#define HASH_PCE(pce, sq) (pos->posKey ^= (PieceKeys[(pce)][(sq)]))
#define HASH_CA (pos->posKey ^= (CastleKeys[(pos->castlePerm)]))
#define HASH_SIDE (pos->posKey ^= (SideKey))
#define HASH_EP (pos->posKey ^= (PieceKeys[EMPTY][(pos->enPas)]))

const int CastlePerm[120] = {
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 13, 15, 15, 15, 12, 15, 15, 14, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15,  7, 15, 15, 15,  3, 15, 15, 11, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 
};

static void ClearPiece(const int sq, BOARD *pos){
    ASSERT(SqOnBoard(sq));

    int pce = pos->squares[sq];

    ASSERT(PieceValid(pce));

    int col = PieceCol[pce];
    int index = 0;
    int t_pceNum = -1;

    HASH_PCE(pce, sq);

    pos->squares[sq] = EMPTY;
    pos->material[col] -= PieceVal[pce];

    if(PieceBig[pce]) {
        pos->bigPce[col]--;
        if(PieceMaj[pce]) {
            pos->majPce[col]--;
        } else {
            pos->minPce[col]--;
        }
    } else {
        CLRBIT(pos->pawns[col], SQ64(sq));
        CLRBIT(pos->pawns[BOTH], SQ64(sq));
    }

    for(index = 0; index < pos->pceNum[pce]; ++index){
        if(pos->pList[pce][index] == sq) {
            t_pceNum = index;
            break;
        }
    }

    ASSERT(t_pceNum != -1);

    pos->pceNum[pce]--;
    pos->pList[pce][t_pceNum] = pos->pList[pce][pos->pceNum[pce]];
}

static void AddPiece(const int sq, BOARD *pos, const int pce){
    ASSERT(PieceValid(pce));
    ASSERT(SqOnBoard(sq));

    int col = PieceCol[pce];

    HASH_PCE(pce, sq);

    pos->squares[sq] = pce;

    if(PieceBig[pce]){
        pos->bigPce[col]++;
        if(PieceMaj[pce]){
            pos->majPce[col]++;
        } else {
            pos->minPce[col]++;
        }
    } else {
        SETBIT(pos->pawns[col], SQ64(sq));
        SETBIT(pos->pawns[BOTH], SQ64(sq));
    }
    pos->material[col] += PieceVal[pce];
    pos->pList[pce][pos->pceNum[pce]++] = sq;
}

static void MovePiece(const int from, const int to, BOARD *pos) {
    ASSERT(SqOnBoard(from));
    ASSERT(SqOnBoard(to));
    int index = 0;
    int pce = pos->squares[from];
    int col = PieceCol[pce];
#ifdef DEBUG
    int t_PieceNum = FALSE;
#endif
    HASH_PCE(pce, from);
    pos->squares[from] = EMPTY;

    HASH_PCE(pce, to);
    pos->squares[to] = pce;

    if(!PieceBig[pce]){
        CLRBIT(pos->pawns[col], SQ64(from));
        CLRBIT(pos->pawns[BOTH], SQ64(from));
        SETBIT(pos->pawns[col], SQ64(to));
        SETBIT(pos->pawns[BOTH], SQ64(to));
    }

    for(index = 0; index < pos->pceNum[pce]; ++index){
        if(pos->pList[pce][index] == from){
            pos->pList[pce][index] == to;
#ifdef DEBUG
            t_PieceNum = TRUE;
#endif
            break;
        }
    }
    ASSERT(t_PieceNum);
}