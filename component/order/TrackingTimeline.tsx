'use client';

import { Check, Clock, Loader2, MapPin, Package, PackageCheck, Truck, XCircle } from 'lucide-react';
import type { LiveTracking, Order } from '@/lib/api/types';
import { ORDER_STEPS, formatDate, formatDateTime, orderStepIndex } from '@/lib/orderUtils';

const STEP_ICONS = [Package, PackageCheck, Truck, Check];

export function OrderStatusStepper({ status }: { status: Order['orderStatus'] }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-clay/10 ring-1 ring-clay/25 px-4 py-3.5 text-clay">
        <XCircle size={20} />
        <div>
          <p className="font-semibold text-sm">Order cancelled</p>
          <p className="text-xs opacity-80">If you were charged, the refund is processed automatically.</p>
        </div>
      </div>
    );
  }

  const current = orderStepIndex(status);

  return (
    <ol className="grid grid-cols-4 gap-2">
      {ORDER_STEPS.map((step, i) => {
        const Icon = STEP_ICONS[i];
        const done = i < current;
        const active = i === current;
        return (
          <li key={step.key} className="relative flex flex-col items-center text-center">
            {i < ORDER_STEPS.length - 1 ? (
              <span
                aria-hidden="true"
                className={`absolute top-5 left-1/2 h-[2px] w-full ${i < current ? 'bg-basil' : 'bg-ink/10'}`}
              />
            ) : null}
            <span
              className={`relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-parchment transition-colors ${
                done
                  ? 'bg-basil text-parchment'
                  : active
                    ? 'bg-turmeric text-parchment shadow-lg shadow-turmeric/30'
                    : 'bg-white text-ink/30 border border-ink/10'
              }`}
            >
              {done ? <Check size={16} strokeWidth={3} /> : <Icon size={16} strokeWidth={2} />}
            </span>
            <p className={`mt-2 text-[11px] md:text-xs font-semibold leading-tight ${active || done ? 'text-ink' : 'text-ink/40'}`}>
              {step.label}
            </p>
            <p className="hidden md:block mt-0.5 text-[10px] text-ink/40 leading-tight max-w-[9rem]">{step.hint}</p>
          </li>
        );
      })}
    </ol>
  );
}

type TimelineItem = {
  title: string;
  note?: string;
  location?: string;
  at?: string;
  tone?: 'done' | 'alert' | 'neutral';
};

function toneFromStatus(status?: string): TimelineItem['tone'] {
  if (!status) return 'neutral';
  if (status === 'delivered') return 'done';
  if (status === 'failure' || status === 'cancelled' || status === 'return_to_sender') return 'alert';
  return 'neutral';
}

function buildTimeline(order: Order, tracking?: LiveTracking | null): TimelineItem[] {
  if (tracking?.events?.length) {
    return [...tracking.events]
      .map((e) => ({
        title: e.statusLabel || e.message || 'Update',
        note: e.message && e.message !== e.statusLabel ? e.message : undefined,
        location: e.location?.city || undefined,
        at: e.datetime || undefined,
        tone: toneFromStatus(e.status),
      }))
      .reverse();
  }
  if (order.trackingEvents?.length) {
    return [...order.trackingEvents]
      .map((e) => ({
        title: e.title,
        note: e.note,
        location: e.location,
        at: e.createdAt,
        tone: toneFromStatus(e.status),
      }))
      .reverse();
  }
  return [];
}

export default function TrackingTimeline({
  order,
  tracking,
  trackingLoading,
  trackingError,
}: {
  order: Order;
  tracking?: LiveTracking | null;
  trackingLoading?: boolean;
  trackingError?: string | null;
}) {
  const timeline = buildTimeline(order, tracking);
  const hasShipment = Boolean(order.trackingNumber);
  const liveStatus = tracking?.statusLabel;
  const eta = tracking?.estimatedDelivery || order.estimatedDeliveryAt;

  return (
    <div className="space-y-6">
      <div className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] p-5 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <p className="font-label text-[10px] tracking-[0.2em] uppercase text-clay">Order progress</p>
          {liveStatus ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-turmeric/10 text-clay px-3 py-1 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-turmeric animate-pulse" />
              {liveStatus}
            </span>
          ) : null}
        </div>
        <OrderStatusStepper status={order.orderStatus} />
      </div>

      {hasShipment ? (
        <div className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] p-5 md:p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-millet">
              <Truck size={18} />
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-lg text-ink leading-tight">Shipment details</h3>
              <p className="text-xs text-ink/50 mt-0.5">Live updates from the courier appear below as they happen.</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-ink/40">Tracking number</dt>
              <dd className="font-label text-ink mt-1 break-all">{order.trackingNumber}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-ink/40">Courier</dt>
              <dd className="font-semibold text-ink mt-1 uppercase">
                {tracking?.trackingProvider || order.courierPartner || 'Assigned soon'}
              </dd>
            </div>
            {eta ? (
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-ink/40">Expected by</dt>
                <dd className="font-semibold text-ink mt-1">{formatDate(eta)}</dd>
              </div>
            ) : tracking?.destinationCity ? (
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-ink/40">Destination</dt>
                <dd className="font-semibold text-ink mt-1">{tracking.destinationCity}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}

      <div className="rounded-[22px] bg-white ring-1 ring-ink/[0.08] p-5 md:p-6">
        <h3 className="font-display text-lg text-ink leading-tight mb-4">Activity</h3>

        {trackingLoading ? (
          <div className="flex items-center gap-2 text-sm text-ink/50 py-4">
            <Loader2 size={16} className="animate-spin" />
            Fetching live courier updates…
          </div>
        ) : null}

        {!trackingLoading && trackingError && hasShipment && timeline.length === 0 ? (
          <p className="text-xs text-ink/45 mb-3">{trackingError}</p>
        ) : null}

        {timeline.length > 0 ? (
          <ol className="relative ml-2 border-l border-ink/10">
            {timeline.map((item, idx) => {
              const dotCls =
                item.tone === 'done'
                  ? 'bg-basil ring-basil/20'
                  : item.tone === 'alert'
                    ? 'bg-clay ring-clay/20'
                    : idx === 0
                      ? 'bg-turmeric ring-turmeric/20'
                      : 'bg-ink/25 ring-ink/5';
              return (
                <li key={`${item.at}-${idx}`} className="relative pl-6 pb-6 last:pb-0">
                  <span className={`absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full ring-4 ${dotCls}`} />
                  <p className={`text-sm font-semibold ${idx === 0 ? 'text-ink' : 'text-ink/80'}`}>{item.title}</p>
                  {item.note ? <p className="text-xs text-ink/55 mt-0.5 leading-relaxed">{item.note}</p> : null}
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink/40">
                    {item.location ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} />
                        {item.location}
                      </span>
                    ) : null}
                    {item.at ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} />
                        {formatDateTime(item.at)}
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : !trackingLoading ? (
          <div className="rounded-2xl bg-parchment/70 ring-1 ring-ink/[0.06] px-4 py-5 text-sm text-ink/60">
            {hasShipment ? (
              <>
                <p className="font-semibold text-ink">Shipment booked with the courier.</p>
                <p className="mt-1">Scan updates usually appear within a few hours of pickup. Check back soon.</p>
              </>
            ) : order.orderStatus === 'delivered' ? (
              <p>This order has been delivered.</p>
            ) : (
              <>
                <p className="font-semibold text-ink">Not shipped yet.</p>
                <p className="mt-1">
                  We are packing your order. You will get a WhatsApp and email with the tracking number as soon as it ships.
                </p>
              </>
            )}
            <p className="mt-3 text-xs text-ink/40">Order placed {formatDateTime(order.createdAt)}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
