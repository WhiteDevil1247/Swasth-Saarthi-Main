import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNGOs } from "@/hooks/useNGOs";
import { Users, ExternalLink } from "lucide-react";

export default function NGOHub() {
  const [q, setQ] = useState("");
  const { list } = useNGOs();
  const data = (list.data || []).filter((n) =>
    q ? (n.name?.toLowerCase().includes(q.toLowerCase()) || n.city?.toLowerCase().includes(q.toLowerCase())) : true
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">NGO Hub</h1>
        <p className="text-muted-foreground">Access healthcare support from NGOs</p>
      </div>

      <div className="flex gap-2">
        <Input placeholder="Search NGOs by name or city" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {list.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse h-24" />
          ))}
        </div>
      )}

      {!list.isLoading && data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No NGOs found. Try adjusting your search.</p>
        </div>
      )}

      <div className="grid gap-3">
        {data.map((n) => (
          <Card key={n.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-lg">{n.name}</div>
                <div className="text-sm text-muted-foreground">{n.city || ""}</div>
                <p className="text-sm mt-2">{n.description}</p>
              </div>
              <div className="flex gap-2">
                {n.website && (
                  <Button asChild size="sm" variant="outline">
                    <a target="_blank" rel="noreferrer" href={n.website}>
                      Visit <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </Button>
                )}
                <Button size="sm" onClick={() => alert("Thanks for your interest! We will connect you with this NGO.")}>Join / Support</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
