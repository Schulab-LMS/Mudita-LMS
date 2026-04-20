"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { updateParticipantScore, calculateCompetitionRanks } from "@/actions/competition.actions";
import { Trophy, RefreshCw } from "lucide-react";

interface Participant {
  id: string;
  score: number | null;
  rank: number | null;
  user: { id: string; name: string | null; avatar: string | null };
}

interface ScoreFormProps {
  competitionId: string;
  participants: Participant[];
}

function ScoreInput({ registrationId, initialScore }: { registrationId: string; initialScore: number | null }) {
  const [value, setValue] = useState(initialScore?.toString() ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleBlur() {
    const num = parseFloat(value);
    if (!isNaN(num) && num !== initialScore) {
      startTransition(async () => {
        const res = await updateParticipantScore(registrationId, num);
        if (res.success) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      });
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        max={100}
        step={0.1}
        value={value}
        onChange={(e) => { setValue(e.target.value); setSaved(false); }}
        onBlur={handleBlur}
        className="w-24 rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        placeholder="—"
        disabled={isPending}
      />
      {isPending && <span className="text-xs text-muted-foreground animate-pulse">saving…</span>}
      {saved && <span className="text-xs text-green-600">✓ saved</span>}
    </div>
  );
}

export function ScoreForm({ competitionId, participants }: ScoreFormProps) {
  const [isPending, startTransition] = useTransition();
  const [rankMsg, setRankMsg] = useState<string | null>(null);

  function handleCalculateRanks() {
    startTransition(async () => {
      const res = await calculateCompetitionRanks(competitionId);
      setRankMsg(res.success ? "Rankings updated!" : (res.error ?? "Failed"));
      setTimeout(() => setRankMsg(null), 3000);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Participants &amp; Scores</h2>
        <div className="flex items-center gap-3">
          {rankMsg && (
            <span className={`text-sm ${rankMsg.includes("updated") ? "text-green-600" : "text-red-600"}`}>
              {rankMsg}
            </span>
          )}
          <button
            onClick={handleCalculateRanks}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            Calculate Rankings
          </button>
        </div>
      </div>

      {participants.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
          <Trophy className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No participants registered yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Rank</th>
                <th className="px-4 py-3 text-left font-medium">Participant</th>
                <th className="px-4 py-3 text-left font-medium">Score (0–100)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {participants.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.rank != null ? (
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        p.rank === 1 ? "bg-yellow-100 text-yellow-800" :
                        p.rank === 2 ? "bg-gray-100 text-gray-700" :
                        p.rank === 3 ? "bg-orange-100 text-orange-700" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {p.rank}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.user.avatar ? (
                        <Image
                          src={p.user.avatar}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {(p.user.name ?? "?")[0].toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium">{p.user.name ?? "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ScoreInput registrationId={p.id} initialScore={p.score} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
