#include <stdio.h>
#include "defs.h"

#define MOVE(f,t,ca,pro,fl) ((f) | ((t) << 7) | ((ca) << 14) | ((pro) << 20) | (fl))
#define SQOFFBOARD(sq) (FilesBrd[(sq)] == OFFBOARD)

const int LoopSlidePce[8] = {wB, wR, wQ, 0, bB, bR, bQ, 0};
const int LoopSlideIndex[2] = {0, 4};

const int LoopNonSlidePce[6] = {wN, wK, 0, bN, bK, 0};
const int LoopNonSlideIndex[2] = {0, 3};

const int PceDir[13][8]{
    {0, 0, 0, 0, 0, 0, 0},
    {0, 0, 0, 0, 0, 0, 0},
    {-8, -19, -21, -12, 8, 19, 21, 12},
    {-9, -11, 11, 9, 0, 0, 0, 0},
    {-1, -10, 1, 10, 0, 0, 0, 0},
    {-1, -10, 1, 10, -9, -11, 11, 9},
    {-1, -10, 1, 10, -9, -11, 11, 9},
    {0, 0, 0, 0, 0, 0, 0},
    {-8, -19, -21, -12, 8, 19, 21, 12},
    {-9, -11, 11, 9, 0, 0, 0, 0},
    {-1, -10, 1, 10, 0, 0, 0, 0},
    {-1, -10, 1, 10, -9, -11, 11, 9},
    {-1, -10, 1, 10, -9, -11, 11, 9},
};

int NumDir[13] = {0, 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8};

const int VictimScore[13] = {0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600};
static int MvvLvaScores[13][13];

int InitMvvLva() {
    int Attacker;
    int Victim;
    for(Attacker = wP; Attacker <= bK; ++Attacker){
        for(Victim = wP; Victim <= bK; ++Victim){
            MvvLvaScores[Victim][Attacker] = VictimScore[Victim] + 6 - (VictimScore[Attacker] / 100);
        }
    }
    return 0;
}

int MoveExists(BOARD *pos, const int move){
    MOVELIST list[1];
    GenerateAllMoves(pos, list);

    int MoveNum = 0;
    for(MoveNum = 0; MoveNum < list->count; ++MoveNum){
        if(!MakeMove(pos, list->moves[MoveNum].move)){
            continue;
        }
        TakeMove(pos);
        if(list->moves[MoveNum].move == move){
            return TRUE;
        }
    }
    return FALSE;
}
static void AddQuietMove(const BOARD *pos, int move, MOVELIST *list) {
    
    ASSERT(SqOnBoard(FROMSQ(move)));
    ASSERT(SqOnBoard(TOSQ(move)));

    list->moves[list->count].move = move;

    if(pos->searchKillers[0][pos->ply] == move){
        list->moves[list->count].score = 900000;
    }else if(pos->searchKillers[1][pos->ply] == move){
        list->moves[list->count].score = 800000;
    }else {
        list->moves[list->count].score = pos->searchHistory[pos->squares[FROMSQ(move)]][TOSQ(move)];
    }
    list->count++;
}

static void AddCaptureMove(const BOARD *pos, int move, MOVELIST *list) {
    
    ASSERT(SqOnBoard(FROMSQ(move)));
    ASSERT(SqOnBoard(TOSQ(move)));
    ASSERT(PieceValid(CAPTURED(move)));
    
    list->moves[list->count].move = move;
    list->moves[list->count].score = MvvLvaScores[CAPTURED(move)][pos->squares[FROMSQ(move)]] + 1000000;
    list->count++;
}

static void AddEnPassantMove(const BOARD *pos, int move, MOVELIST *list) {
    
    ASSERT(SqOnBoard(FROMSQ(move)));
    ASSERT(SqOnBoard(TOSQ(move)));
    
    list->moves[list->count].move = move;
    list->moves[list->count].score = 105 + 1000000;
    list->count++;
}

static void AddWhitePawnCapMove(const BOARD *pos, const int from, const int to, const int cap, MOVELIST *list){
    ASSERT(PieceValidEmpty(cap));
    ASSERT(SqOnBoard(from));
    ASSERT(SqOnBoard(to));

    if(RanksBrd[from] == RANK_7){
        AddCaptureMove(pos, MOVE(from, to, cap, wQ, 0), list);
        AddCaptureMove(pos, MOVE(from, to, cap, wR, 0), list);
        AddCaptureMove(pos, MOVE(from, to, cap, wB, 0), list);
        AddCaptureMove(pos, MOVE(from, to, cap, wN, 0), list);
    }else {
        AddCaptureMove(pos, MOVE(from, to, cap, EMPTY, 0), list);
    }
}

static void AddWhitePawnMove(const BOARD *pos, const int from, const int to, MOVELIST *list){
    ASSERT(SqOnBoard(from));
    ASSERT(SqOnBoard(to));

    if(RanksBrd[from] == RANK_7){
        AddQuietMove(pos, MOVE(from, to, EMPTY, wQ, 0), list);
        AddQuietMove(pos, MOVE(from, to, EMPTY, wR, 0), list);
        AddQuietMove(pos, MOVE(from, to, EMPTY, wB, 0), list);
        AddQuietMove(pos, MOVE(from, to, EMPTY, wN, 0), list);
    } else {
        AddQuietMove(pos, MOVE(from, to, EMPTY, EMPTY, 0), list);
    }
}

static void AddBlackPawnCapMove(const BOARD *pos, const int from, const int to, const int cap, MOVELIST *list){
    ASSERT(PieceValidEmpty(cap));
    ASSERT(SqOnBoard(from));
    ASSERT(SqOnBoard(to));

    if(RanksBrd[from] == RANK_2){
        AddCaptureMove(pos, MOVE(from, to, cap, bQ, 0), list);
        AddCaptureMove(pos, MOVE(from, to, cap, bR, 0), list);
        AddCaptureMove(pos, MOVE(from, to, cap, bB, 0), list);
        AddCaptureMove(pos, MOVE(from, to, cap, bN, 0), list);
    }else {
        AddCaptureMove(pos, MOVE(from, to, cap, EMPTY, 0), list);
    }
}

static void AddBlackPawnMove(const BOARD *pos, const int from, const int to, MOVELIST *list){
    ASSERT(SqOnBoard(from));
    ASSERT(SqOnBoard(to));

    if(RanksBrd[from] == RANK_2){
        AddQuietMove(pos, MOVE(from, to, EMPTY, bQ, 0), list);
        AddQuietMove(pos, MOVE(from, to, EMPTY, bR, 0), list);
        AddQuietMove(pos, MOVE(from, to, EMPTY, bB, 0), list);
        AddQuietMove(pos, MOVE(from, to, EMPTY, bN, 0), list);
    } else {
        AddQuietMove(pos, MOVE(from, to, EMPTY, EMPTY, 0), list);
    }
}


void GenerateAllMoves(const BOARD *pos, MOVELIST *list){
    ASSERT(CheckBoard(pos));

    list->count = 0;

    int piece = EMPTY;
    int side = pos->turn;
    int sq = 0; int t_sq = 0;
    int pceNum = 0;
    int dir = 0;
    int index = 0;
    int pceIndex = 0;

    if(side == WHITE) {
        for(pceNum = 0; pceNum < pos->pceNum[wP]; ++pceNum){
            sq = pos->pList[wP][pceNum];
            ASSERT(SqOnBoard(sq));

            if(pos->squares[sq + 10] == EMPTY){
                AddWhitePawnMove(pos, sq, sq + 10, list);
                if(RanksBrd[sq] == RANK_2 && pos->squares[sq + 20] == EMPTY){
                    AddQuietMove(pos, MOVE(sq, (sq + 20), EMPTY, EMPTY, MFLAGPS), list);
                }
            }

            if(!SQOFFBOARD(sq + 9) && PieceCol[pos->squares[sq + 9]] == BLACK){
                AddWhitePawnCapMove(pos, sq, sq + 9, pos->squares[sq + 9], list);
            }
            if(!SQOFFBOARD(sq + 11) && PieceCol[pos->squares[sq + 11]] == BLACK){
                AddWhitePawnCapMove(pos, sq, sq + 11, pos->squares[sq + 11], list);
            }

            if(pos->enPas != NO_SQR){
                if((sq + 9) == pos->enPas) {
                    AddEnPassantMove(pos, MOVE(sq, sq + 9, EMPTY, EMPTY, MFLAGEP), list);
                }
                if((sq + 11) == pos->enPas) {
                    AddEnPassantMove(pos, MOVE(sq, sq + 11, EMPTY, EMPTY, MFLAGEP), list);
                }
            }
        }

        if(pos->castlePerm & WKSC){
            if(pos->squares[F1] == EMPTY && pos->squares[G1] == EMPTY){
                if(!SqAttacked(E1, BLACK, pos) && !SqAttacked(F1, BLACK, pos)){
                    AddQuietMove(pos, MOVE(E1, G1, EMPTY, EMPTY, MFLAGCA), list);
                }
            }
        }

        if(pos->castlePerm & WQSC){
            if(pos->squares[D1] == EMPTY && pos->squares[C1] == EMPTY && pos->squares[B1] == EMPTY){
                if(!SqAttacked(E1, BLACK, pos) && !SqAttacked(D1, BLACK, pos)){
                    AddQuietMove(pos, MOVE(E1, C1, EMPTY, EMPTY, MFLAGCA), list);
                }
            }
        }

    } else {
        for(pceNum = 0; pceNum < pos->pceNum[bP]; ++pceNum){
            sq = pos->pList[bP][pceNum];
            ASSERT(SqOnBoard(sq));

            if(pos->squares[sq - 10] == EMPTY){
                AddBlackPawnMove(pos, sq, sq - 10, list);
                if(RanksBrd[sq] == RANK_7 && pos->squares[sq - 20] == EMPTY){
                    AddQuietMove(pos, MOVE(sq, (sq - 20), EMPTY, EMPTY, MFLAGPS), list);
                }
            }

            if(!SQOFFBOARD(sq - 9) && PieceCol[pos->squares[sq - 9]] == WHITE){
                AddBlackPawnCapMove(pos, sq, sq - 9, pos->squares[sq - 9], list);
            }
            if(!SQOFFBOARD(sq - 11) && PieceCol[pos->squares[sq - 11]] == WHITE){
                AddBlackPawnCapMove(pos, sq, sq - 11, pos->squares[sq - 11], list);
            }

            if(pos->enPas != NO_SQR) {
                if((sq - 9) == pos->enPas) {
                    AddEnPassantMove(pos, MOVE(sq, sq - 9, EMPTY, EMPTY, MFLAGEP), list);
                }
                if((sq - 11) == pos->enPas) {
                    AddEnPassantMove(pos, MOVE(sq, sq - 11, EMPTY, EMPTY, MFLAGEP), list);
                }
            }
        }

        if(pos->castlePerm & BKSC){
            if(pos->squares[F8] == EMPTY && pos->squares[G8] == EMPTY){
                if(!SqAttacked(E8, WHITE, pos) && !SqAttacked(F8, WHITE, pos)){
                    AddQuietMove(pos, MOVE(E8, G8, EMPTY, EMPTY, MFLAGCA), list);
                }
            }
        }

        if(pos->castlePerm & BQSC){
            if(pos->squares[D8] == EMPTY && pos->squares[C8] == EMPTY && pos->squares[B8] == EMPTY){
                if(!SqAttacked(E8, WHITE, pos) && !SqAttacked(D8, WHITE, pos)){
                    AddQuietMove(pos, MOVE(E8, C8, EMPTY, EMPTY, MFLAGCA), list);
                }
            }
        }
    }

    pceIndex = LoopSlideIndex[side];
    piece = LoopSlidePce[pceIndex++];
    while( piece != 0){
        ASSERT(PieceValid(piece));

        for(pceNum = 0; pceNum < pos->pceNum[piece]; ++pceNum){
            sq = pos->pList[piece][pceNum];
            ASSERT(SqOnBoard(sq));

            for(index = 0; index < NumDir[piece]; ++index){
                dir = PceDir[piece][index];
                t_sq = sq + dir;

                while(!SQOFFBOARD(t_sq)){

                    if(pos->squares[t_sq] != EMPTY){
                        if(PieceCol[pos->squares[t_sq]] == side ^ 1){
                            AddCaptureMove(pos, MOVE(sq, t_sq, pos->squares[t_sq], EMPTY, 0), list);
                        }
                        break;
                    }
                    AddQuietMove(pos, MOVE(sq, t_sq, EMPTY, EMPTY, 0), list);
                    t_sq += dir;
                }
            }
        }
        piece = LoopSlidePce[pceIndex++];
    }

    pceIndex = LoopNonSlideIndex[side];
    piece = LoopNonSlidePce[pceIndex++];
    while( piece != 0){
        ASSERT(PieceValid(piece));

        for(pceNum = 0; pceNum < pos->pceNum[piece]; ++pceNum){
            sq = pos->pList[piece][pceNum];
            ASSERT(SqOnBoard(sq));

            for(index = 0; index < NumDir[piece]; ++index){
                dir = PceDir[piece][index];
                t_sq = sq + dir;

                if(SQOFFBOARD(t_sq)){
                    continue;
                }

                if(pos->squares[t_sq] != EMPTY){
                    if(PieceCol[pos->squares[t_sq]] == side ^ 1){
                        AddCaptureMove(pos, MOVE(sq, t_sq, pos->squares[t_sq], EMPTY, 0), list);
                    }
                    continue;
                }
                AddQuietMove(pos, MOVE(sq, t_sq, EMPTY, EMPTY, 0), list);
            }
        }
        piece = LoopNonSlidePce[pceIndex++];
    }
}

void GenerateAllCaps(const BOARD *pos, MOVELIST *list){
    ASSERT(CheckBoard(pos));

    list->count = 0;

    int piece = EMPTY;
    int side = pos->turn;
    int sq = 0; int t_sq = 0;
    int pceNum = 0;
    int dir = 0;
    int index = 0;
    int pceIndex = 0;

    if(side == WHITE) {
        for(pceNum = 0; pceNum < pos->pceNum[wP]; ++pceNum){
            sq = pos->pList[wP][pceNum];
            ASSERT(SqOnBoard(sq));

            if(!SQOFFBOARD(sq + 9) && PieceCol[pos->squares[sq + 9]] == BLACK){
                AddWhitePawnCapMove(pos, sq, sq + 9, pos->squares[sq + 9], list);
            }
            if(!SQOFFBOARD(sq + 11) && PieceCol[pos->squares[sq + 11]] == BLACK){
                AddWhitePawnCapMove(pos, sq, sq + 11, pos->squares[sq + 11], list);
            }

            if(pos->enPas != NO_SQR){
                if((sq + 9) == pos->enPas) {
                    AddEnPassantMove(pos, MOVE(sq, sq + 9, EMPTY, EMPTY, MFLAGEP), list);
                }
                if((sq + 11) == pos->enPas) {
                    AddEnPassantMove(pos, MOVE(sq, sq + 11, EMPTY, EMPTY, MFLAGEP), list);
                }
            }
        }

    } else {
        for(pceNum = 0; pceNum < pos->pceNum[bP]; ++pceNum){
            sq = pos->pList[bP][pceNum];
            ASSERT(SqOnBoard(sq));

            if(!SQOFFBOARD(sq - 9) && PieceCol[pos->squares[sq - 9]] == WHITE){
                AddBlackPawnCapMove(pos, sq, sq - 9, pos->squares[sq - 9], list);
            }
            if(!SQOFFBOARD(sq - 11) && PieceCol[pos->squares[sq - 11]] == WHITE){
                AddBlackPawnCapMove(pos, sq, sq - 11, pos->squares[sq - 11], list);
            }

            if(pos->enPas != NO_SQR) {
                if((sq - 9) == pos->enPas) {
                    AddEnPassantMove(pos, MOVE(sq, sq - 9, EMPTY, EMPTY, MFLAGEP), list);
                }
                if((sq - 11) == pos->enPas) {
                    AddEnPassantMove(pos, MOVE(sq, sq - 11, EMPTY, EMPTY, MFLAGEP), list);
                }
            }
        }
    }

    pceIndex = LoopSlideIndex[side];
    piece = LoopSlidePce[pceIndex++];
    while( piece != 0){
        ASSERT(PieceValid(piece));

        for(pceNum = 0; pceNum < pos->pceNum[piece]; ++pceNum){
            sq = pos->pList[piece][pceNum];
            ASSERT(SqOnBoard(sq));

            for(index = 0; index < NumDir[piece]; ++index){
                dir = PceDir[piece][index];
                t_sq = sq + dir;

                while(!SQOFFBOARD(t_sq)){

                    if(pos->squares[t_sq] != EMPTY){
                        if(PieceCol[pos->squares[t_sq]] == side ^ 1){
                            AddCaptureMove(pos, MOVE(sq, t_sq, pos->squares[t_sq], EMPTY, 0), list);
                        }
                        break;
                    }
                    t_sq += dir;
                }
            }
        }
        piece = LoopSlidePce[pceIndex++];
    }

    pceIndex = LoopNonSlideIndex[side];
    piece = LoopNonSlidePce[pceIndex++];
    while( piece != 0){
        ASSERT(PieceValid(piece));

        for(pceNum = 0; pceNum < pos->pceNum[piece]; ++pceNum){
            sq = pos->pList[piece][pceNum];
            ASSERT(SqOnBoard(sq));

            for(index = 0; index < NumDir[piece]; ++index){
                dir = PceDir[piece][index];
                t_sq = sq + dir;

                if(SQOFFBOARD(t_sq)){
                    continue;
                }

                if(pos->squares[t_sq] != EMPTY){
                    if(PieceCol[pos->squares[t_sq]] == side ^ 1){
                        AddCaptureMove(pos, MOVE(sq, t_sq, pos->squares[t_sq], EMPTY, 0), list);
                    }
                    continue;
                }
            }
        }
        piece = LoopNonSlidePce[pceIndex++];
    }
}