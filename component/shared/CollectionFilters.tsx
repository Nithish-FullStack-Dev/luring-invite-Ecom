// src\components\shared\CollectionFilters.tsx

"use client";
import { motion } from "framer-motion";
import { Filter, X, ChevronDown } from "lucide-react";
// import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface FilterOption {
  value: string;
  label: string;
}

interface CollectionFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  currentFilters: FilterState;
  collectionSlug: string; // Added to determine dynamic options
}

export interface FilterState {
  style: string[];
  deliveryTime: string[];
  budget: string;
  minPrice: string;
  maxPrice: string;
  language: string[];
  religion: string[];
  region: string[];
  subOccasion: string;
  sortBy: string;
}

const styleOptions: FilterOption[] = [
  { value: "Royal", label: "Royal" },
  { value: "Minimal", label: "Minimal" },
  { value: "Modern", label: "Modern" },
  { value: "Traditional", label: "Traditional" },
  { value: "Floral", label: "Floral" },
  { value: "Cinematic", label: "Cinematic" },
];

const deliveryOptions: FilterOption[] = [
  { value: "24h", label: "24 Hours" },
  { value: "48h", label: "48 Hours" },
  { value: "72h", label: "72 Hours" },
];

const budgetOptions: FilterOption[] = [
  { value: "under-1000", label: "Under ₹1,000" },
  { value: "1000-3000", label: "₹1,000 - ₹3,000" },
  { value: "above-3000", label: "Above ₹3,000" },
];

const languageOptions: FilterOption[] = [
  { value: "Telugu", label: "Telugu" },
  { value: "Hindi", label: "Hindi" },
  { value: "English", label: "English" },
];

const religionOptions: FilterOption[] = [
  { value: "Hindu", label: "Hindu" },
  { value: "Muslim", label: "Muslim" },
  { value: "Christian", label: "Christian" },
  { value: "Sikh", label: "Sikh" },
  { value: "Jain", label: "Jain" },
  { value: "Other", label: "Other" },
];

const regionOptions: FilterOption[] = [
  { value: "South Indian", label: "South Indian" },
  { value: "North Indian", label: "North Indian" },
  { value: "East Indian", label: "East Indian" },
  { value: "West Indian", label: "West Indian" },
  { value: "Other", label: "Other" },
];

const sortOptions: FilterOption[] = [
  { value: "best-selling", label: "Best Selling" },
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];
const priceRanges = [
  { label: "₹0 – ₹100", min: "0", max: "100" },
  { label: "₹100 – ₹250", min: "100", max: "250" },
  { label: "₹250 – ₹500", min: "250", max: "500" },
  { label: "₹500 – ₹750", min: "500", max: "750" },
  { label: "₹750 – ₹1,000", min: "750", max: "1000" },
  { label: "₹1,000 – ₹1,250", min: "1000", max: "2500" },
];
export default function CollectionFilters({
  onFilterChange,
  currentFilters,
  collectionSlug,
}: CollectionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isPriceOpen, setIsPriceOpen] = useState(false);

  // Dynamic subOccasion options based on collectionSlug
  let subOccasionOptions: FilterOption[] = [];
  if (collectionSlug === "wedding-invites") {
    subOccasionOptions = [
      { value: "save-the-date", label: "Save the Date" },
      { value: "Engagement", label: "Engagement" },
      { value: "wardrobe-planner", label: "Wardrobe Planner" },
      { value: "wedding-invite", label: "Wedding Invite" },
      { value: "reception-invite", label: "Reception Invite" },
      { value: "traditional-wedding", label: "Traditional Wedding" },
      { value: "modern-wedding", label: "Modern Wedding" },
      { value: "destination-wedding", label: "Destination Wedding" },
      { value: "wedding-stationery", label: "Wedding Stationery" },
    ];
  } else if (collectionSlug === "anniversary") {
    subOccasionOptions = [
      { value: "1st-anniversary", label: "1st Anniversary" },
      { value: "10th-anniversary", label: "10th Anniversary" },
      { value: "silver-jubilee", label: "Silver Jubilee (25th)" },
      { value: "golden-jubilee", label: "Golden Jubilee (50th)" },
      { value: "diamond-jubilee", label: "Diamond Jubilee (60th)" },
      { value: "anniversary-stationery", label: "Anniversary Stationery" },
    ];
  } else if (collectionSlug === "birthday") {
    subOccasionOptions = [
      { value: "1st-birthday", label: "1st Birthday" },
      { value: "sweet-16", label: "Sweet 16" },
      { value: "18th-birthday", label: "18th Birthday" },
      { value: "25th-birthday", label: "25th Birthday" },
      { value: "50th-birthday", label: "50th Birthday" },
      { value: "kids-birthday", label: "Kids Birthday" },
      { value: "baby-shower-birthday", label: "Baby Shower" },
      { value: "birthday-stationery", label: "Birthday Stationery" },
    ];
  } else if (collectionSlug === "house-warming") {
    subOccasionOptions = [
      { value: "griha-pravesh", label: "Griha Pravesh" },
      { value: "new-home", label: "New Home Celebration" },
      { value: "house-warming-stationery", label: "House Warming Stationery" },
    ];
  } else if (collectionSlug === "baby-showers") {
    subOccasionOptions = [
      { value: "boy", label: "Baby Boy Shower" },
      { value: "girl", label: "Baby Girl Shower" },
      { value: "gender-neutral", label: "Gender Neutral" },
    ];
  }
  // ... add for other collections if needed

  const toggleFilter = (
    type: keyof Omit<FilterState, "budget" | "sortBy" | "subOccasion">,
    value: string,
  ) => {
    const current = currentFilters[type] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ ...currentFilters, [type]: updated });
  };

  const setBudget = (value: string) => {
    onFilterChange({
      ...currentFilters,
      budget: currentFilters.budget === value ? "" : value,
    });
  };

  const setSort = (value: string) => {
    onFilterChange({ ...currentFilters, sortBy: value });
  };
  const setPriceRange = (field: "minPrice" | "maxPrice", value: string) => {
    onFilterChange({
      ...currentFilters,
      [field]: value,
      budget: "",
    });
  };
  const applyPriceRange = (min: string, max: string) => {
    onFilterChange({
      ...currentFilters,
      budget: "",
      minPrice: min,
      maxPrice: max,
    });

    setIsPriceOpen(false);
  };
  const setSubOccasion = (value: string) => {
    onFilterChange({ ...currentFilters, subOccasion: value });
  };

  const clearFilters = () => {
    onFilterChange({
      style: [],
      deliveryTime: [],
      budget: "",
      minPrice: "",
      maxPrice: "",
      language: [],
      religion: [],
      region: [],
      subOccasion: "",
      sortBy: "best-selling",
    });
  };

  const hasFilters =
    currentFilters.style.length > 0 ||
    currentFilters.deliveryTime.length > 0 ||
    currentFilters.budget !== "" ||
    currentFilters.minPrice !== "" ||
    currentFilters.maxPrice !== "" ||
    currentFilters.language.length > 0 ||
    currentFilters.religion.length > 0 ||
    currentFilters.region.length > 0 ||
    currentFilters.subOccasion !== "";

  const FilterSection = ({
    title,
    children,
    id,
  }: {
    title: string;
    children: React.ReactNode;
    id: string;
  }) => (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpenSection(openSection === id ? null : id)}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-sm">{title}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            openSection === id && "rotate-180",
          )}
        />
      </button>
      {openSection === id && (
        <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2">{children}</div>
      )}
    </div>
  );

  const FilterChip = ({
    selected,
    onClick,
    children,
  }: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
        selected
          ? "bg-primary text-primary-foreground"
          : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="mb-6 md:mb-8">
      {/* Mobile Filter Toggle + Sub Occasion + Sort */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasFilters && (
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {currentFilters.style.length +
                currentFilters.deliveryTime.length +
                currentFilters.language.length +
                currentFilters.religion.length +
                currentFilters.region.length +
                (currentFilters.subOccasion ? 1 : 0) +
                (currentFilters.budget ? 1 : 0)}
            </span>
          )}
        </Button>

        {/* Sub Occasion Dropdown - separate */}
        {subOccasionOptions.length > 0 && (
          <select
            value={currentFilters.subOccasion}
            onChange={(e) => setSubOccasion(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Sub Occasions</option>
            {subOccasionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {/* Sort Dropdown */}
        <select
          value={currentFilters.sortBy}
          onChange={(e) => setSort(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Price Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsPriceOpen((open) => !open)}
            aria-expanded={isPriceOpen}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors",
              currentFilters.minPrice !== "" || currentFilters.maxPrice !== ""
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            Price
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isPriceOpen && "rotate-180",
              )}
            />
          </button>

          {isPriceOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-[min(92vw,440px)] rounded-xl border border-border bg-card p-4 shadow-xl">
              <div className="mb-4">
                <h3 className="text-sm font-semibold">Price Range</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Click a price range to apply
                </p>
              </div>

              <div className="overflow-hidden rounded-md border border-border">
                {priceRanges.map((range) => {
                  const selected =
                    currentFilters.minPrice === range.min &&
                    currentFilters.maxPrice === range.max;

                  return (
                    <button
                      key={range.label}
                      type="button"
                      onClick={() => applyPriceRange(range.min, range.max)}
                      className={cn(
                        "w-full border-b border-border px-3 py-3 text-left text-sm last:border-b-0 hover:bg-muted",
                        selected && "bg-primary/10 font-medium text-primary",
                      )}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <h4 className="mb-3 text-sm font-medium">Custom Price</h4>

                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-muted-foreground">
                    From
                    <div className="mt-1 flex items-center rounded-md border border-border px-3">
                      <span className="mr-2">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="From"
                        value={currentFilters.minPrice}
                        onChange={(e) =>
                          setPriceRange("minPrice", e.target.value)
                        }
                        className="w-full min-w-0 bg-transparent py-2 text-sm text-foreground outline-none"
                      />
                    </div>
                  </label>

                  <label className="text-xs text-muted-foreground">
                    To
                    <div className="mt-1 flex items-center rounded-md border border-border px-3">
                      <span className="mr-2">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="To"
                        value={currentFilters.maxPrice}
                        onChange={(e) =>
                          setPriceRange("maxPrice", e.target.value)
                        }
                        className="w-full min-w-0 bg-transparent py-2 text-sm text-foreground outline-none"
                      />
                    </div>
                  </label>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Enter both values to apply your custom price range.
                </p>

                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onFilterChange({
                        ...currentFilters,
                        minPrice: "",
                        maxPrice: "",
                        budget: "",
                      });
                    }}
                    className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPriceOpen(false)}
                    disabled={
                      currentFilters.minPrice !== "" &&
                      currentFilters.maxPrice !== "" &&
                      Number(currentFilters.minPrice) >
                        Number(currentFilters.maxPrice)
                    }
                    className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card border border-border rounded-xl overflow-hidden mb-6"
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="font-semibold">Filters</span>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          <FilterSection title="Style" id="style">
            {styleOptions.map((option) => (
              <FilterChip
                key={option.value}
                selected={currentFilters.style.includes(option.value)}
                onClick={() => toggleFilter("style", option.value)}
              >
                {option.label}
              </FilterChip>
            ))}
          </FilterSection>

          {/* <FilterSection title="Delivery Time" id="delivery">
            {deliveryOptions.map((option) => (
              <FilterChip
                key={option.value}
                selected={currentFilters.deliveryTime.includes(option.value)}
                onClick={() => toggleFilter('deliveryTime', option.value)}
              >
                {option.label}
              </FilterChip>
            ))}
          </FilterSection> */}

          {/* <FilterSection title="Budget" id="budget">
            {budgetOptions.map((option) => (
              <FilterChip
                key={option.value}
                selected={currentFilters.budget === option.value}
                onClick={() => setBudget(option.value)}
              >
                {option.label}
              </FilterChip>
            ))}
          </FilterSection> */}

          <FilterSection title="Language" id="language">
            {languageOptions.map((option) => (
              <FilterChip
                key={option.value}
                selected={currentFilters.language.includes(option.value)}
                onClick={() => toggleFilter("language", option.value)}
              >
                {option.label}
              </FilterChip>
            ))}
          </FilterSection>

          <FilterSection title="Religion" id="religion">
            {religionOptions.map((option) => (
              <FilterChip
                key={option.value}
                selected={currentFilters.religion.includes(option.value)}
                onClick={() => toggleFilter("religion", option.value)}
              >
                {option.label}
              </FilterChip>
            ))}
          </FilterSection>

          <FilterSection title="Region" id="region">
            {regionOptions.map((option) => (
              <FilterChip
                key={option.value}
                selected={currentFilters.region.includes(option.value)}
                onClick={() => toggleFilter("region", option.value)}
              >
                {option.label}
              </FilterChip>
            ))}
          </FilterSection>
        </motion.div>
      )}

      {/* Active Filters Display */}
      {hasFilters && !isOpen && (
        <div className="flex flex-wrap gap-2 mb-4">
          {currentFilters.style.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
            >
              {s}
              <button onClick={() => toggleFilter("style", s)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {currentFilters.deliveryTime.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
            >
              {d}
              <button onClick={() => toggleFilter("deliveryTime", d)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {currentFilters.language.map((l) => (
            <span
              key={l}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
            >
              {l}
              <button onClick={() => toggleFilter("language", l)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {currentFilters.religion.map((r) => (
            <span
              key={r}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
            >
              {r}
              <button onClick={() => toggleFilter("religion", r)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {currentFilters.region.map((reg) => (
            <span
              key={reg}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
            >
              {reg}
              <button onClick={() => toggleFilter("region", reg)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {currentFilters.subOccasion && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
              {
                subOccasionOptions.find(
                  (b) => b.value === currentFilters.subOccasion,
                )?.label
              }
              <button onClick={() => setSubOccasion("")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentFilters.budget && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
              {
                budgetOptions.find((b) => b.value === currentFilters.budget)
                  ?.label
              }
              <button onClick={() => setBudget(currentFilters.budget)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-primary underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
