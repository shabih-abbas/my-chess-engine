#include <stdio.h>
#include "defs.h"

int IsRepetition(const BOARD *pos){
    int index = 0;

    for(index = pos->hisPly - pos->fiftyMoves; index < pos->hisPly - 1; ++index){
        ASSERT(index >= 0 && index < MAXGAMEMOVES);
        if(pos->posKey == pos->history[index].posKey){
            return TRUE;
        }
    }
    return FALSE;
}

void SearchPosition(BOARD *pos){}