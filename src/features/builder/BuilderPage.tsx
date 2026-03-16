"use client";

import { useEffect } from "react";
import { useBuilderStore } from "@/store/builderStore";
import {
  RULES,
  computeArchetype,
  getPositionBodyLimits,
  getWingspanRangeForHeight
} from "@/utils/rulesEngine";
import { Position } from "@/types/builder";

const positions: { id: Position; label: string }[] = [
  { id: "PG", label: "Point Guard" },
  { id: "SG", label: "Shooting Guard" },
  { id: "SF", label: "Small Forward" },
  { id: "PF", label: "Power Forward" },
  { id: "C", label: "Center" }
];

export default function BuilderPage() {
  const {
    body,
    attributes,
    caps,
    remainingPoints,
    totalValueCapacity,
    completionProgress,
    overall,
    badgeTiers,
    lastAutoClampedFields,
    lastRaisedByDependency,
    lastClampedByCap,
    setPosition,
    setBody,
    setAttribute,
    reset,
    refreshCaps
  } = useBuilderStore();

  useEffect(() => {
    refreshCaps();
  }, [refreshCaps]);

  const archetype = computeArchetype(body.position, attributes, caps, body);
  const bodyLimits = getPositionBodyLimits(body.position, body.height);
  const wingspanRange = getWingspanRangeForHeight(body.height, body.position);
  const isCompleted = overall >= 99 && remainingPoints <= 0;
  const showClampHint =
    lastAutoClampedFields.length > 0 ||
    lastClampedByCap.length > 0 ||
    lastRaisedByDependency.length > 0;
  const attributeLabel = (key: string) =>
    RULES.attributeDefinitions.find((d) => d.key === key)?.label ?? key;

  return (
    <div className="grid flex-1 gap-6 lg:grid-cols-[1.1fr,0.9fr]">
      <section className="flex flex-col gap-4">
        <div className="card p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-title">Overview</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {archetype}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                All ratings, caps, and badges are driven by editable rules
                config. Values approximate modern pro-hoops builder styles and
                are not official 2K formulas.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Overall
                </p>
                <p className="text-3xl font-semibold text-emerald-400">
                  {overall}
                  <span className="ml-1 text-base font-normal text-slate-500">
                    / 99
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Value Left
                </p>
                <p className="text-lg font-medium text-sky-300">
                  {remainingPoints}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Overall uses weighted attribute contribution, normalized against
            your current body-valid caps. A completed build reaches 99 with 0
            value left.
          </p>
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>Completion Progress</span>
              <span>{Math.round(completionProgress * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800/90">
              <div
                className={`h-full transition-all ${
                  isCompleted ? "bg-emerald-500" : "bg-sky-500"
                }`}
                style={{ width: `${Math.round(completionProgress * 100)}%` }}
              />
            </div>
            {isCompleted && (
              <p className="mt-2 text-[11px] text-emerald-300">
                Build completed: 99 overall potential and 0 value left.
              </p>
            )}
          </div>
          {showClampHint && (
            <div className="mt-2 space-y-1 text-[11px] text-amber-200/90">
              <p>Values auto-adjusted to keep the build valid.</p>
              {lastAutoClampedFields.length > 0 && (
                <p className="text-amber-100/85">
                  Body clamped: {lastAutoClampedFields.join(", ")}.
                </p>
              )}
              {lastClampedByCap.length > 0 && (
                <p className="text-amber-100/85">
                  Capped by body limits:{" "}
                  {lastClampedByCap
                    .slice(0, 4)
                    .map((k) => attributeLabel(String(k)))
                    .join(", ")}
                  {lastClampedByCap.length > 4 ? "..." : ""}.
                </p>
              )}
              {lastRaisedByDependency.length > 0 && (
                <p className="text-amber-100/85">
                  Raised by linked floors:{" "}
                  {lastRaisedByDependency
                    .slice(0, 4)
                    .map((k) => attributeLabel(String(k)))
                    .join(", ")}
                  {lastRaisedByDependency.length > 4 ? "..." : ""}.
                </p>
              )}
            </div>
          )}
          <button
            onClick={reset}
            className="mt-4 rounded-full border border-slate-600/70 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-slate-300 hover:bg-slate-800/60"
          >
            Reset Build
          </button>
        </div>

        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-title">Body Settings</p>
              <p className="mt-1 text-sm text-slate-300">
                Position, height, weight, and wingspan dynamically drive caps
                and badge ceilings.
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Longer wingspan boosts defense/finishing ceilings but trims shooting and handle ceilings.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-slate-400">Position</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {positions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPosition(p.id)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                      body.position === p.id
                        ? "border-sky-400/80 bg-sky-500/10 text-sky-100"
                        : "border-slate-700/80 bg-slate-900/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/60"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <BodySlider
              label="Height"
              value={body.height}
              min={bodyLimits.height.min}
              max={bodyLimits.height.max}
              step={1}
              format={(v) => `${Math.floor(v / 12)}'${v % 12}"`}
              onChange={(v) => setBody("height", v)}
            />
            <BodySlider
              label="Weight"
              value={body.weight}
              min={bodyLimits.weight.min}
              max={bodyLimits.weight.max}
              step={1}
              format={(v) => `${v} lbs`}
              onChange={(v) => setBody("weight", v)}
            />
            <BodySlider
              label="Wingspan"
              value={body.wingspan}
              min={wingspanRange.min}
              max={wingspanRange.max}
              step={1}
              format={(v) => `${Math.floor(v / 12)}'${v % 12}"`}
              onChange={(v) => setBody("wingspan", v)}
            />
          </div>
        </div>

        <div className="card p-5">
            <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-title">Attributes</p>
              <p className="mt-1 text-sm text-slate-300">
                Caps depend on position and body. Higher tiers cost more value.
                Some attributes raise linked minimum floors automatically.
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Cost feel: 25-60 low, 61-75 moderate, 76-85 expensive, 86-92 very expensive, 93-99 premium.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {RULES.attributeGroups.map((group) => (
              <div key={group.id} className="rounded-xl bg-slate-900/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {group.label}
                </p>
                <div className="mt-3 space-y-3">
                  {group.attributeKeys.map((key) => {
                    const def = RULES.attributeDefinitions.find(
                      (d) => d.key === key
                    )!;
                    const value = attributes[key];
                    const cap = caps[key];
                    return (
                      <AttributeSlider
                        key={key}
                        label={def.label}
                        value={value}
                        min={def.min}
                        max={cap}
                        onChange={(v) => setAttribute(key, v)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="flex flex-col gap-4">
        <div className="card p-5">
          <p className="section-title">Summary</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <SummaryRow label="Position" value={body.position} />
            <SummaryRow
              label="Height"
              value={`${Math.floor(body.height / 12)}'${
                body.height % 12
              }"`}
            />
            <SummaryRow label="Weight" value={`${body.weight} lbs`} />
            <SummaryRow
              label="Wingspan"
              value={`${Math.floor(body.wingspan / 12)}'${
                body.wingspan % 12
              }"`}
            />
            <SummaryRow label="Overall" value={`${overall} / 99`} />
            <SummaryRow
              label="Value Left"
              value={remainingPoints.toString()}
            />
            <SummaryRow
              label="Value Used"
              value={`${totalValueCapacity - remainingPoints} / ${totalValueCapacity}`}
            />
          </div>
        </div>

        <div className="card p-5">
          <p className="section-title">Badges</p>
          <div className="mt-3 space-y-4">
            {RULES.badges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-start justify-between gap-3 rounded-lg bg-slate-900/70 px-3 py-2.5"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-100">
                    {badge.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {badge.description}
                  </p>
                </div>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-200">
                  {formatTier(badgeTiers[badge.id])}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 text-xs text-slate-400">
          Exact internal NBA 2K26 builder formulas are not public. This tool is
          a configurable simulation inspired by modern builder mechanics, not a
          replica of any official system.
        </div>
      </aside>
    </div>
  );
}

function BodySlider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  const { label, value, min, max, step, onChange, format } = props;
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <div className="mt-1 flex items-baseline justify-between text-[11px] text-slate-500">
        <span>
          {format(min)} – {format(max)}
        </span>
        <span className="text-slate-300">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-sky-400"
      />
    </div>
  );
}

function AttributeSlider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const { label, value, min, max, onChange } = props;
  const capped = value >= max;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <p className="font-medium text-slate-200">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">
            {value} / {max}
          </span>
          {capped && (
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
              Cap
            </span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-1 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-emerald-400"
      />
    </div>
  );
}

function SummaryRow(props: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-2.5 py-1.5">
      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
        {props.label}
      </span>
      <span className="text-xs font-medium text-slate-100">
        {props.value}
      </span>
    </div>
  );
}

function formatTier(tier?: string): string {
  if (!tier || tier === "none") return "None";
  if (tier === "hallOfFame") return "Hall of Fame";
  return tier[0].toUpperCase() + tier.slice(1);
}

