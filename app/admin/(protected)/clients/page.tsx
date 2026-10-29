"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  Search,
  Users,
  X,
  RefreshCw,
} from "lucide-react";

type Client = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  createdAt: string;
  ordersCount: number;
  cartsCount: number;
  amountSpent: number;
};

type ClientsResponse = {
  data: Client[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalClients: number;
    totalOrders: number;
    totalAmountSpent: number;
  };
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);

const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [clients, setClients] = useState<Client[]>([]);
  const [summary, setSummary] = useState({
    totalClients: 0,
    totalOrders: 0,
    totalAmountSpent: 0,
  });
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        search: search.trim(),
        page: String(page),
        pageSize: String(pageSize),
      });

      const response = await fetch(`/api/admin/clients?${params}`, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load customer records.");
      }

      const payload = result as ClientsResponse;
      setClients(payload.data);
      setTotal(payload.pagination.total);
      setPageCount(Math.max(1, payload.pagination.totalPages));
      setSummary(payload.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function exportClients() {
    if (clients.length === 0) return;

    const headers = [
      "Customer ID",
      "Name",
      "Email",
      "Phone",
      "Joined",
      "Orders",
      "Amount Spent",
      "Cart Count",
    ];

    const rows = clients.map((client) => [
      client.id,
      client.name ?? "",
      client.email,
      client.phone ?? "",
      client.createdAt,
      client.ordersCount,
      client.amountSpent.toFixed(2),
      client.cartsCount,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `luring-invite-clients-page-${page}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const currentPage = Math.min(page, pageCount);

  return (
    <div className="min-h-full bg-[#FAFAFC]">
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
              <span>Admin</span>
              <span>/</span>
              <span className="font-medium text-[#A86DCD]">Clients</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Clients
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Real customer profiles and purchase summaries.
            </p>
          </div>

          <div className="flex gap-2 self-start">
            <button
              type="button"
              onClick={() => void loadClients()}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              type="button"
              onClick={exportClients}
              disabled={loading || clients.length === 0}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowDownToLine className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Total clients"
            value={summary.totalClients.toLocaleString("en-IN")}
            icon={<Users className="h-5 w-5" />}
          />
          <SummaryCard
            label="Total orders"
            value={summary.totalOrders.toLocaleString("en-IN")}
            icon={<Mail className="h-5 w-5" />}
          />
          <SummaryCard
            label="Paid amount"
            value={money(summary.totalAmountSpent)}
            icon={<ArrowDownToLine className="h-5 w-5" />}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                All clients
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {total.toLocaleString("en-IN")} customer records
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Search name, email, phone or customer ID"
                aria-label="Search customers"
                className="h-11 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#A86DCD] focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          {error && (
            <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                Could not load clients
              </p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => void loadClients()}
                className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-50"
              >
                Try again
              </button>
            </div>
          )}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px] text-left">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  {[
                    "Customer",
                    "Phone",
                    "Joined",
                    "Orders",
                    "Paid amount",
                    "Details",
                  ].map((heading, index) => (
                    <th
                      key={heading}
                      className={`px-5 py-3 text-xs font-semibold text-gray-500 ${
                        index >= 3 ? "text-right" : ""
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!loading &&
                  !error &&
                  clients.map((client) => (
                    <tr
                      key={client.id}
                      className="transition hover:bg-purple-50/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={client.name || client.email} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {client.name || "Name not provided"}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {client.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {client.phone || "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                        {dateLabel(client.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-gray-700">
                        {client.ordersCount}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-gray-900">
                        {money(client.amountSpent)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedClient(client)}
                          aria-label={`View ${client.name || client.email}`}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-purple-50 hover:text-[#A86DCD]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-3 md:hidden">
            {!loading &&
              !error &&
              clients.map((client) => (
                <article
                  key={client.id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={client.name || client.email} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {client.name || "Name not provided"}
                      </p>
                      <p className="mt-1 break-all text-xs text-gray-500">
                        {client.email}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {client.phone || "Phone not provided"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedClient(client)}
                      aria-label={`View ${client.name || client.email}`}
                      className="rounded-lg p-2 text-gray-500 hover:bg-purple-50 hover:text-[#A86DCD]"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                    <div>
                      <p className="text-xs text-gray-500">Orders</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {client.ordersCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Paid amount</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {money(client.amountSpent)}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Joined</p>
                      <p className="mt-1 text-sm text-gray-700">
                        {dateLabel(client.createdAt)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
          </div>

          {loading && (
            <div className="px-5 py-14 text-center">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#A86DCD]" />
              <p className="mt-3 text-sm text-gray-500">
                Loading customer records…
              </p>
            </div>
          )}

          {!loading && !error && clients.length === 0 && (
            <div className="px-5 py-14 text-center">
              <Users className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-3 font-medium text-gray-900">No clients found</p>
              <p className="mt-1 text-sm text-gray-500">
                Try another search or register a customer through the website.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-gray-500">
              {total === 0
                ? "No results"
                : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(
                    currentPage * pageSize,
                    total,
                  )} of ${total} clients`}
            </p>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                disabled={loading || currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                aria-label="Previous page"
                className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-20 text-center text-xs text-gray-500">
                Page {currentPage} of {pageCount}
              </span>
              <button
                type="button"
                disabled={loading || currentPage >= pageCount}
                onClick={() =>
                  setPage((value) => Math.min(pageCount, value + 1))
                }
                aria-label="Next page"
                className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <p className="text-center text-xs text-gray-400">
          Customer data is loaded from your database. Paid amount excludes
          unpaid and failed orders.
        </p>
      </div>

      {selectedClient && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedClient(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-dialog-title"
            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar
                  name={selectedClient.name || selectedClient.email}
                  large
                />
                <div className="min-w-0">
                  <h2
                    id="client-dialog-title"
                    className="font-semibold text-gray-900"
                  >
                    {selectedClient.name || "Name not provided"}
                  </h2>
                  <p className="mt-1 break-all text-sm text-gray-500">
                    {selectedClient.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                aria-label="Close customer details"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <DetailBox label="Customer ID" value={selectedClient.id} />
              <DetailBox
                label="Joined"
                value={dateLabel(selectedClient.createdAt)}
              />
              <DetailBox
                label="Total orders"
                value={String(selectedClient.ordersCount)}
              />
              <DetailBox
                label="Paid amount"
                value={money(selectedClient.amountSpent)}
              />
              <DetailBox
                label="Phone"
                value={selectedClient.phone || "Not provided"}
              />
              <DetailBox
                label="Carts"
                value={String(selectedClient.cartsCount)}
              />
            </div>

            <p className="mt-4 text-xs leading-5 text-gray-500">
              The order count includes all orders. Paid amount only includes
              orders marked PAID that have not been cancelled or refunded.
            </p>

            <button
              type="button"
              onClick={() => setSelectedClient(null)}
              className="mt-5 w-full rounded-xl bg-[#A86DCD] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#9458BB]"
            >
              Close details
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{label}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-[#A86DCD]">
          {icon}
        </span>
      </div>
      <p className="mt-3 break-words text-2xl font-bold tracking-tight text-gray-900">
        {value}
      </p>
    </div>
  );
}

function Avatar({ name, large = false }: { name: string; large?: boolean }) {
  const initials = name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-purple-100 font-semibold text-[#8D50B5] ${
        large ? "h-12 w-12 text-base" : "h-10 w-10 text-sm"
      }`}
    >
      {initials || "C"}
    </div>
  );
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-100 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-gray-900">
        {value}
      </p>
    </div>
  );
}
