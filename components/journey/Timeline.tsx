"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { MilestoneCard } from "@/components/journey/MilestoneCard";
import { journeyEras, milestones } from "@/data/milestones";
import { CATEGORY_LABELS, type MilestoneCategory } from "@/types/milestone";

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as MilestoneCategory[];

export function Timeline() {
  const [activeFilter, setActiveFilter] = useState<MilestoneCategory | "all">("all");

  const milestonesById = useMemo(() => {
    const map = new Map(milestones.map((m) => [m.id, m]));
    return map;
  }, []);

  return (
    <Container>
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-heritage-blue text-3xl md:text-4xl font-semibold mb-4">
          How the Journey Unfolded
        </h2>
        <p className="text-charcoal/70 text-lg leading-relaxed">
          What began as a personal collection has grown, year by year, into
          something bigger. Explore the timeline below, or filter by what
          interests you most — awards, exhibitions, talks, workshops, or the
          moments that made the news.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-16" role="group" aria-label="Filter timeline by category">
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          aria-pressed={activeFilter === "all"}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            activeFilter === "all"
              ? "bg-heritage-blue text-white border-heritage-blue"
              : "bg-surface text-charcoal/70 border-border hover:border-heritage-blue"
          }`}
        >
          All
        </button>
        {ALL_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveFilter(category)}
            aria-pressed={activeFilter === category}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              activeFilter === category
                ? "bg-heritage-blue text-white border-heritage-blue"
                : "bg-surface text-charcoal/70 border-border hover:border-heritage-blue"
            }`}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      <div className="space-y-20">
        {journeyEras.map((era) => {
          const eraMilestones = era.milestoneIds
            .map((id) => milestonesById.get(id))
            .filter((m): m is NonNullable<typeof m> => Boolean(m))
            .filter((m) => activeFilter === "all" || m.categories.includes(activeFilter));

          if (eraMilestones.length === 0) return null;

          return (
            <div key={era.id}>
              <div className="mb-8">
                <p className="text-antique-gold text-sm font-semibold tracking-[0.2em] uppercase mb-2">
                  {era.yearRange}
                </p>
                <h3 className="text-heritage-blue text-2xl md:text-3xl font-semibold mb-3">
                  {era.label}
                </h3>
                <p className="text-charcoal/70 leading-relaxed max-w-2xl">{era.intro}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {eraMilestones.map((milestone) => (
                  <MilestoneCard key={milestone.id} milestone={milestone} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
}
