import { useState } from "react";
import { AppShell } from "@/components/vcet/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { LifeBuoy, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Academics", "Hostel", "Library", "IT Support", "Administration"];

const STATUS_STYLE: Record<string, string> = {
  OPEN: "bg-[#EAF2FC] text-[#0B3B78]",
  IN_PROGRESS: "bg-[#FDF3E7] text-[#B4690E]",
  RESOLVED: "bg-[#E8F6E9] text-[#3E7A28]",
};

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
};

export default function Feedback() {
  const tickets = useQuery(api.portal.getFeedback, {});
  const createTicket = useMutation(api.portal.createFeedback);

  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <AppShell>
      <div className="grid gap-5 lg:grid-cols-5">
        {/* New ticket form */}
        <div className="space-y-5 lg:col-span-2">
          <div>
            <h1 className="text-xl font-bold text-[#0F2542]">Feedback & Support</h1>
            <p className="text-sm text-[#5B6B83]">
              Raise a ticket and the office will follow up.
            </p>
          </div>

          <Card className="vcet-card border-[#E5EAF2] shadow-none">
            <CardContent className="space-y-4 p-5">
              <div className="space-y-1.5">
                <Label className="text-[#0F2542]">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11 rounded-lg border-[#E5EAF2]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fb-subject" className="text-[#0F2542]">
                  Subject
                </Label>
                <Input
                  id="fb-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Short summary"
                  className="h-11 rounded-lg border-[#E5EAF2]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fb-message" className="text-[#0F2542]">
                  Message
                </Label>
                <Textarea
                  id="fb-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or suggestion…"
                  rows={5}
                  className="resize-none rounded-lg border-[#E5EAF2]"
                />
              </div>
              <Button
                disabled={submitting || !category || !subject.trim() || !message.trim()}
                className="w-full bg-[#0B3B78] hover:bg-[#08315F]"
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    await createTicket({
                      category,
                      subject: subject.trim(),
                      message: message.trim(),
                    });
                    setCategory("");
                    setSubject("");
                    setMessage("");
                    toast.success("Ticket submitted");
                  } catch {
                    toast.error("Could not submit ticket");
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Submitting…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 size-4" /> Submit ticket
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Ticket list */}
        <div className="space-y-4 lg:col-span-3">
          <Card className="vcet-card border-[#E5EAF2] shadow-none">
            <CardHeader>
              <CardTitle className="text-[15px] text-[#0F2542]">Your tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tickets === undefined && (
                <>
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                </>
              )}
              {tickets?.length === 0 && (
                <div className="py-8 text-center">
                  <LifeBuoy className="mx-auto size-8 text-[#9AA7BC]" />
                  <p className="mt-3 text-sm text-[#5B6B83]">
                    No tickets yet. Submit one and track it here.
                  </p>
                </div>
              )}
              {tickets?.map((t) => (
                <div
                  key={t._id}
                  className="rounded-lg border border-[#E5EAF2] p-4 transition-colors hover:bg-[#F4F7FC]"
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-full bg-[#F1F5FB] px-2.5 py-0.5 text-[11px] font-medium text-[#5B6B83]">
                      {t.category}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        STATUS_STYLE[t.status] ?? "bg-[#F1F5FB] text-[#5B6B83]",
                      )}
                    >
                      {STATUS_LABEL[t.status] ?? t.status}
                    </span>
                    <span className="ml-auto text-[11px] text-[#5B6B83]">
                      {new Date(t.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-[#0F2542]">{t.subject}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#5B6B83]">{t.message}</p>
                  {t.adminReply && (
                    <div className="mt-3 rounded-lg bg-[#EAF2FC] px-3.5 py-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0B3B78]">
                        Office reply
                      </p>
                      <p className="mt-1 text-sm text-[#0F2542]">{t.adminReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
