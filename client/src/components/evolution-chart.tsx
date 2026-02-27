import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EvolutionChartProps {
    history: any[];
    currentPoints: number;
    accountId: string;
}

export function EvolutionChart({ history, currentPoints, accountId }: EvolutionChartProps) {
    // Reconstruct points history
    // history is already sorted by date DESC (latest first)
    const reversedHistory = [...history].reverse(); // oldest first

    let points = 0; // Starting point reconstruction
    // To get the real "starting" points, we'd need more data, 
    // but we can show the "progression" relative to matches documented.
    // Let's calculate the current points after all these matches and offset.

    let totalDelta = 0;
    reversedHistory.forEach(match => {
        if (match.winnerId === accountId) totalDelta += 50;
        else totalDelta -= 20;
    });

    let runningPoints = Math.max(0, currentPoints - totalDelta);

    const chartData = [
        {
            date: 'Início',
            points: runningPoints
        },
        ...reversedHistory.map((match, index) => {
            if (match.winnerId === accountId) runningPoints += 50;
            else runningPoints = Math.max(0, runningPoints - 20);

            return {
                date: format(new Date(match.createdAt), 'dd/MM', { locale: ptBR }),
                fullDate: format(new Date(match.createdAt), "dd 'de' MMM", { locale: ptBR }),
                points: runningPoints,
                result: match.winnerId === accountId ? 'VITÓRIA' : 'DERROTA'
            };
        })
    ];

    if (chartData.length <= 1) {
        return (
            <div className="h-40 flex items-center justify-center border border-dashed border-white/10 rounded-3xl">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Histórico insuficiente para gerar gráfico</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[250px] bg-white/5 border border-white/5 backdrop-blur-md rounded-3xl p-6">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.3)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.3)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#020617',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}
                        itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                        labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                        formatter={(value: any, name: any, props: any) => [
                            `${value} PTS`,
                            props.payload.result || 'PONTUAÇÃO'
                        ]}
                        labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                    />
                    <Area
                        type="monotone"
                        dataKey="points"
                        stroke="#f59e0b"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorPoints)"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

