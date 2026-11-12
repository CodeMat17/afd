"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import type { FormState } from "@/app/admin/actions";
import { checkPayment } from "@/app/admin/(dashboard)/orders/actions";
import { Button } from "@/components/ui/button";

/** Re-checks an unpaid order with Pesapal and updates it with the answer. */
export function CheckPaymentButton({ orderNumber }: { orderNumber: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    checkPayment.bind(null, orderNumber),
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success("Payment checked", { description: state.message, duration: 7000 });
    else toast.error("Couldn't check payment", { description: state.message, duration: 7000 });
  }, [state]);

  return (
    <form action={action}>
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <RefreshCw aria-hidden="true" />
        )}
        {pending ? "Checking with Pesapal…" : "Check payment with Pesapal"}
      </Button>
    </form>
  );
}
