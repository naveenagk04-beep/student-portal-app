import { useState } from "react";
import { AppShell } from "@/components/vcet/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  PAID: "bg-[#E8F6E9] text-[#3E7A28]",
  PENDING: "bg-[#FDF3E7] text-[#B4690E]",
  OVERDUE: "bg-[#FDECEA] text-[#C0392B]",
};

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Payments() {
  const fees = useQuery(api.portal.getPayments, {});
  const payFee = useMutation(api.portal.payFee);
  const [paying, setPaying] = useState<string | null>(null);

  const feeList = fees ?? [];
  const totalDue = feeList
    .filter((f) => f.status !== "PAID")
    .reduce((acc, f) => acc + f.amount, 0);

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0F2542]">Payments</h1>
            <p className="text-sm text-[#5B6B83]">Fee dues, receipts and payment history.</p>
          </div>
          <div className="rounded-xl bg-[#0B3B78] px-5 py-3 text-white">
            <p className="text-xs text-white/70">Total outstanding</p>
            <p className="text-xl font-bold">
              ₹ {totalDue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {fees === undefined ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : feeList.length === 0 ? (
          <Card className="vcet-card p-10 text-center">
            <CreditCard className="mx-auto size-8 text-[#9AA7BC]" />
            <p className="mt-3 text-sm text-[#5B6B83]">No fee records yet.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {feeList.map((f) => (
              <Card
                key={f._id}
                className="vcet-card vcet-card-hover border-[#E5EAF2] shadow-none"
              >
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-[15px] font-semibold text-[#0F2542]">{f.title}</h2>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                          STATUS_STYLE[f.status] ?? "bg-[#F1F5FB] text-[#5B6B83]",
                        )}
                      >
                        {f.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#5B6B83]">
                      Due {fmtDate(f.dueDate)}
                      {f.paidAt && ` · Paid on ${fmtDate(f.paidAt)}`}
                      {f.transactionId && ` · ${f.transactionId}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-[#0B3B78]">
                      ₹ {f.amount.toLocaleString("en-IN")}
                    </p>
                    {f.status === "PAID" ? (
                      <CheckCircle2 className="size-5 text-[#5BAA3C]" />
                    ) : (
                      <Button
                        size="sm"
                        disabled={paying === f._id}
                        className="bg-[#0B3B78] hover:bg-[#08315F]"
                        onClick={async () => {
                          setPaying(f._id);
                          try {
                            const res = await payFee({ feeId: f._id });
                            toast.success(
                              res?.transactionId
                                ? `Payment successful · ${res.transactionId}`
                                : "Payment successful",
                            );
                          } catch {
                            toast.error("Payment failed. Try again.");
                          } finally {
                            setPaying(null);
                          }
                        }}
                      >
                        {paying === f._id ? (
                          <>
                            <Loader2 className="mr-2 size-3.5 animate-spin" /> Paying…
                          </>
                        ) : (
                          "Pay now"
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
