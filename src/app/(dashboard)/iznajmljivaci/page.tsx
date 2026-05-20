import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function IznajmljivaciPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Iznajmljivači</h1>
        <Button asChild>
          <Link href="/iznajmljivaci/novi">+ Novi iznajmljivač</Link>
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">Popis iznajmljivača bit će prikazan ovdje.</p>
    </div>
  )
}
