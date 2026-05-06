#include <stdio.h>
#include "defs.h"

#define MATE 29000
static void CheckUp(SEARCHINFO *info){
    if(info->timeset == TRUE && GetTimeMs() > info->stoptime){
        info->stopped = TRUE;
    }
    ReadInput(info);
}

static void PickNextMove(int moveNum, MOVELIST *list){
    MOVE temp;
    int index = 0;
    int bestScore = 0;
    int bestNum = moveNum;

    for(index = moveNum; index < list->count; ++index){
        if(list->moves[index].score > bestScore){
            bestScore = list->moves[index].score;
            bestNum = index;
        }
    }
    temp = list->moves[moveNum];
    list->moves[moveNum] = list->moves[bestNum];
    list->moves[bestNum] = temp;    
}

static int IsRepetition(const BOARD *pos){
    int index = 0;

    for(index = pos->hisPly - pos->fiftyMoves; index < pos->hisPly - 1; ++index){
        ASSERT(index >= 0 && index < MAXGAMEMOVES);
        if(pos->posKey == pos->history[index].posKey){
            return TRUE;
        }
    }
    return FALSE;
}

static void ClearForSearch(BOARD *pos, SEARCHINFO *info){
    int index = 0;
    int index2 = 0;

    for(index = 0; index < 13; ++index) {
        for(index2 = 0; index2 < BRD_SQRS; ++index2){
            pos->searchHistory[index][index2] = 0;
        }
    }
    for(index = 0; index < 2; ++index) {
        for(index2 = 0; index2 < MAXDEPTH; ++index2){
            pos->searchKillers[index][index2] = 0;
        }
    }

    ClearPvTable(pos->PvTable);

    pos->ply = 0;

    info->stopped = 0;
    info->nodes = 0;
    info->fh = 0;
    info->fhf = 0;
}

static int Quiescence(int alpha, int beta, BOARD *pos, SEARCHINFO *info){
    
    ASSERT(CheckBoard(pos));

    if((info->nodes & 2047) == 0){
        CheckUp(info);
    }
    info->nodes++;

    if(IsRepetition(pos) || pos->fiftyMoves >= 100){
        return 0;
    }
    if(pos->ply > MAXDEPTH - 1){
        return EvalPosition(pos);
    }
    int Score = EvalPosition(pos);

    if(Score >= beta){
        return beta;
    }

    if(Score > alpha){
        alpha = Score;
    }

    MOVELIST list[1];
    GenerateAllCaps(pos, list);

    int MoveNum = 0;
    int Legal = 0;
    int OldAlpha = alpha;
    int BestMove = NOMOVE;
    Score = -INFINITE;
    int PvMove = ProbePvTable(pos);

    for(MoveNum = 0; MoveNum < list->count; ++MoveNum){
        
        PickNextMove(MoveNum, list);

        if(!MakeMove(pos, list->moves[MoveNum].move)){
            continue;
        }
        Legal++;
        Score = -Quiescence(-beta, -alpha, pos, info);
        TakeMove(pos);

        if(Score > alpha) {
            if(Score >= beta){
                if(Legal == 1){
                    info->fhf++;
                }
                info->fh++;
                return beta;
            }
            alpha = Score;
            BestMove = list->moves[MoveNum].move;
        }
    }

    if(alpha != OldAlpha){
        StorePvMove(pos, BestMove);
    }
    return alpha;
}

static int AlphaBeta(int alpha, int beta, int depth, BOARD *pos, SEARCHINFO *info, int DoNull){
    ASSERT(CheckBoard(pos));

    if(depth == 0){
        return Quiescence(alpha, beta, pos, info);
    }
    if((info->nodes & 2047) == 0){
        CheckUp(info);
    }
    info->nodes++;

    if((IsRepetition(pos) || pos->fiftyMoves >= 100) && pos->ply) {
        return 0;
    }

    if(pos->ply > MAXDEPTH - 1){
        return EvalPosition(pos); 
    }

    MOVELIST list[1];
    GenerateAllMoves(pos, list);

    int MoveNum = 0;
    int Legal = 0;
    int OldAlpha = alpha;
    int BestMove = NOMOVE;
    int Score = -INFINITE;
    int PvMove = ProbePvTable(pos);

    if(PvMove != NOMOVE) {
        for(MoveNum = 0; MoveNum < list->count; ++MoveNum){
            if(list->moves[MoveNum].move == PvMove){
                list->moves[MoveNum].score = 2000000;
                break;
            }
        }
    }

    for(MoveNum = 0; MoveNum < list->count; ++MoveNum){
        
        PickNextMove(MoveNum, list);

        if(!MakeMove(pos, list->moves[MoveNum].move)){
            continue;
        }
        Legal++;
        Score = -AlphaBeta(-beta, -alpha, depth - 1, pos, info, TRUE);
        TakeMove(pos);
        if(info->stopped == TRUE){
            return 0;
        }
        if(Score > alpha) {
            if(Score >= beta){
                if(Legal == 1){
                    info->fhf++;
                }
                info->fh++;

                if(!(list->moves[MoveNum].move & MFLAGCAP)){
                    pos->searchKillers[1][pos->ply] = pos->searchKillers[0][pos->ply];
                    pos->searchKillers[0][pos->ply] = list->moves[MoveNum].move;
                }
                return beta;
            }
            alpha = Score;
            BestMove = list->moves[MoveNum].move;
            if(!(list->moves[MoveNum].move & MFLAGCAP)){
                pos->searchHistory[pos->squares[FROMSQ(BestMove)]][TOSQ(BestMove)] += depth;
            }
        }
    }

    if(Legal == 0){
        if(SqAttacked(pos->KingSq[pos->turn], pos->turn ^ 1, pos)){
            return -MATE + pos->ply;
        } else {
            return 0;
        }
    }
    if(alpha != OldAlpha) {
        StorePvMove(pos, BestMove);
    }
    return alpha;
}

void SearchPosition(BOARD *pos, SEARCHINFO *info){
    int bestMove = NOMOVE;
    int bestScore = -INFINITE;
    int currentDepth = 0;
    int pvMoves = 0;
    int pvNum = 0;
    ClearForSearch(pos, info);

    for(currentDepth = 1; currentDepth <= info->depth; ++currentDepth){
        bestScore = AlphaBeta(-INFINITE, INFINITE, currentDepth, pos, info, TRUE);
        
        if(info->stopped == TRUE){
            break;
        }
        pvMoves = GetPvLine(currentDepth, pos);
        bestMove = pos->PvArray[0];
        if(info->GAME_MODE == UCIMODE){
            printf("info score cp %d depth %d nodes %ld time %d", bestScore, currentDepth, info->nodes, GetTimeMs() - info->starttime);
        } else if(info->GAME_MODE == XBOARDMODE && info->POST_THINKING == TRUE){
            printf("%d %d %d %ld", currentDepth, bestScore, (GetTimeMs() - info->starttime)/10, info->nodes);
        } else if(info->POST_THINKING == TRUE){
            printf("score:%d depth:%d nodes:%ld time:%d(ms)", bestScore, currentDepth, info->nodes, GetTimeMs() - info->starttime);
        }
        if(info->GAME_MODE == UCIMODE || info->POST_THINKING == TRUE){
            pvMoves = GetPvLine(currentDepth, pos);
            printf(" pv");
            for(pvNum = 0; pvNum < pvMoves; ++pvNum){
                printf(" %s", PrMove(pos->PvArray[pvNum]));
            }
            printf("\n");
        }
    }
    if(info->GAME_MODE == UCIMODE){
        printf("bestmove %s\n", PrMove(bestMove));
    } else if(info->GAME_MODE == XBOARDMODE){
        printf("move %s\n", PrMove(bestMove));
        MakeMove(pos, bestMove);
    } else{
        printf("\n\n***!! engine makes move %s !!***\n\n", PrMove(bestMove));
        MakeMove(pos, bestMove);
        PrintBoard(pos);
    }
}