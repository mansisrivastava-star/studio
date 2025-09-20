import type { Player } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Crown, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoreboardProps {
  players: Player[];
}

export default function Scoreboard({ players }: ScoreboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const topScore = sortedPlayers.length > 0 ? sortedPlayers[0].score : 1;

  return (
    <Card className="w-72 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <span>Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {sortedPlayers.map((player, index) => (
            <li key={player.id} className="flex items-center gap-4">
              <span className="font-bold text-lg w-6 text-center text-muted-foreground">
                {index + 1}
              </span>
              <Avatar className="h-10 w-10">
                <AvatarFallback
                  style={{ backgroundColor: player.color }}
                  className="text-primary-foreground font-bold"
                >
                  {player.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                    <p className={cn(
                        "font-semibold truncate",
                        player.status === 'winning' && 'text-primary',
                        player.status === 'losing' && 'text-destructive'
                    )}>
                        {player.name}
                    </p>
                    {index === 0 && <Crown className="h-5 w-5 text-yellow-400" />}
                </div>
                <div className="flex items-center gap-2">
                    <Progress value={(player.score / topScore) * 100} className="h-2" indicatorclassname={player.color}/>
                    <span className="text-xs font-mono text-muted-foreground">{player.score}m²</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
