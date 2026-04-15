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
            pos->pList[pce][index] = to;
#ifdef DEBUG
            t_PieceNum = TRUE;
#endif
            break;
        }
    }
    ASSERT(t_PieceNum);
}

void TakeMove(BOARD *pos){
    ASSERT(CheckBoard(pos));

    pos->hisPly--;
    pos->ply--;

    int move = pos->history[pos->hisPly].move;
    int from = FROMSQ(move);
    int to = TOSQ(move);

    ASSERT(SqOnBoard(from));
    ASSERT(SqOnBoard(to));

    if(pos->enPas != NO_SQR) HASH_EP;
    HASH_CA;

    pos->castlePerm = pos->history[pos->hisPly].castlePerm;
    pos->fiftyMoves = pos->history[pos->hisPly].fiftyMoves;
    pos->enPas = pos->history[pos->hisPly].enPas;

    if(pos->enPas != NO_SQR) HASH_EP;
    HASH_CA;

    pos->turn ^= 1;
    HASH_SIDE;

    if(MFLAGEP & move) {
        if(pos->turn == WHITE){
            AddPiece(to - 10, pos, bP);
        } else {
            AddPiece(to + 10, pos, wP);
        }
    } else if(MFLAGCA & move) {
        switch(to) {
            case C1: MovePiece(D1, A1, pos); break;
            case C8: MovePiece(D8, A8, pos); break;
            case G1: MovePiece(F1, H1, pos); break;
            case G8: MovePiece(F8, H8, pos); break;
            default: ASSERT(FALSE); break;
        }
    }
    MovePiece(to, from, pos);

    if(PieceKing[pos->squares[from]]){
        pos->KingSq[pos->turn] = from;
    }

    int captured = CAPTURED(move);
    if(captured != EMPTY){
        ASSERT(PieceValid(captured));
        AddPiece(to, pos, captured);
    }
    
    if(PROMOTED(move) != EMPTY) {
        ASSERT(PieceValid(PROMOTED(move)) && !PiecePawn[PROMOTED(move)]);
        ClearPiece(from, pos);
        AddPiece(from, pos, (PieceCol[PROMOTED(move)] == WHITE ? wP : bP));
    }
    ASSERT(CheckBoard(pos));
}

int MakeMove(BOARD *pos, int move){
    ASSERT(CheckBoard(pos));

    int from = FROMSQ(move);
    int to = TOSQ(move);
    int side = pos->turn;

    ASSERT(SqOnBoard(from));
    ASSERT(SqOnBoard(to));
    ASSERT(SideValid(side));
    ASSERT(PieceValid(pos->squares[from]));

    pos->history[pos->hisPly].posKey = pos->posKey;

    if(move & MFLAGEP) {
        if(side == WHITE) {
            ClearPiece(to - 10, pos);
        } else {
            ClearPiece(to + 10, pos);
        }
    } else if(move & MFLAGCA){
        switch(to){
            case C1:
                MovePiece(A1, D1, pos);
                break;
            case C8:
                MovePiece(A8, D8, pos);
                break;
            case G1:
                MovePiece(H1, F1, pos);
                break;
            case G8:
                MovePiece(H8, F8, pos);
                break;
            default: 
                ASSERT(FALSE); 
                break;   
        }
    }

    if(pos->enPas != NO_SQR) HASH_EP;
    HASH_CA;

    pos->history[pos->hisPly].move = move;
    pos->history[pos->hisPly].fiftyMoves = pos->fiftyMoves;
    pos->history[pos->hisPly].enPas = pos->enPas;
    pos->history[pos->hisPly].castlePerm = pos->castlePerm;

    pos->castlePerm &= CastlePerm[from];
    pos->castlePerm &= CastlePerm[to];
    pos->enPas = NO_SQR;

    HASH_CA;

    int captured = CAPTURED(move);
    pos->fiftyMoves++;

    if(captured != EMPTY) {
        ASSERT(PieceValid(captured));
        ClearPiece(to, pos);
        pos->fiftyMoves = 0;
    }

    pos->hisPly++;
    pos->ply++;

    if(PiecePawn[pos->squares[from]]){
        pos->fiftyMoves = 0;
        if(move & MFLAGPS){
            if(side == WHITE){
                pos->enPas = from + 10;
                ASSERT(RanksBrd[pos->enPas] == RANK_3);
            } else {
                pos->enPas = from - 10;
                ASSERT(RanksBrd[pos->enPas] == RANK_6);
            }
            HASH_EP;
        }
    }
    MovePiece(from, to, pos);

    int prPce = PROMOTED(move);
    if(prPce != EMPTY){
        ASSERT(PieceValid(prPce) && !PiecePawn[prPce]);
        ClearPiece(to, pos);
        AddPiece(to, pos, prPce);
    }

    if(PieceKing[pos->squares[to]]) {
        pos->KingSq[pos->turn] = to;
    }

    pos->turn ^= 1;
    HASH_SIDE;

    ASSERT(CheckBoard(pos));

    if(SqAttacked(pos->KingSq[side], pos->turn, pos)){
        TakeMove(pos);
        return FALSE;
    }
    return TRUE;
}
