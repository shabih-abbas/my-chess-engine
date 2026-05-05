#include <stdio.h>
#include <string.h>
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
#define FEN11 "r1b1k2r/ppppnppp/2n2q2/2b5/3NP3/2P1B3/PP3PPP/RN1QKB1R w KQkq - 0 1"

int main(){
    AllInit();

    BOARD pos[1];
    pos->PvTable->pTable = NULL;
    SEARCHINFO info[1];
    InitPvTable(pos->PvTable);

    printf("Welcome to My Chess Engine! Type 'engine' for console mode...\n");
    char line[256];
    while(TRUE){
        memset(&line[0], 0, sizeof(line));

        fflush(stdout);
        if(!fgets(line, 256, stdin)) continue;
        if(line[0] == '\n') continue;
        if(!strncmp(line, "uci", 3)){
            Uci_Loop(pos, info);
            if(info->quit == TRUE) break;
            continue;
        } else if(!strncmp(line, "xboard", 6)){
            XBoard_Loop(pos, info);
            if(info->quit == TRUE) break;
            continue;
        } else if(!strncmp(line, "engine", 6)){
            Console_Loop(pos, info);
            if(info->quit == TRUE) break;
            continue;
        } else if(!strncmp(line, "quit", 4)){
            break;
        }
    }
    free(pos->PvTable->pTable);
    return 0;
}