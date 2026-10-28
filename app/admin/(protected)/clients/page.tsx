
"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  Search,
  Users,
  X,
} from "lucide-react";

type Client = {
  id: string;
  email: string;
  name: string;
  location: string;
  orders: number;
  amountSpent: number;
  joinedAt: string;
  emailSubscription: "Subscribed" | "Not subscribed";
};

const clients: Client[] = [
  {
    id: "cus_1001",
    email: "priya.sharma@example.com",
    name: "Priya Sharma",
    location: "Hyderabad, Telangana, India",
    orders: 3,
    amountSpent: 897,
    joinedAt: "2026-10-28",
    emailSubscription: "Subscribed",
  },
  {
    id: "cus_1002",
    email: "rahul.kumar@example.com",
    name: "Rahul Kumar",
    location: "Bengaluru, Karnataka, India",
    orders: 2,
    amountSpent: 598,
    joinedAt: "2026-10-26",
    emailSubscription: "Not subscribed",
  },
  {
    id: "cus_1003",
    email: "ananya.reddy@example.com",
    name: "Ananya Reddy",
    location: "Hyderabad, Telangana, India",
    orders: 1,
    amountSpent: 399,
    joinedAt: "2026-10-25",
    emailSubscription: "Subscribed",
  },
  {
    id: "cus_1004",
    email: "arjun.patel@example.com",
    name: "Arjun Patel",
    location: "Mumbai, Maharashtra, India",
    orders: 0,
    amountSpent: 0,
    joinedAt: "2026-10-23",
    emailSubscription: "Not subscribed",
  },
  {
    id: "cus_1005",
    email: "sneha.verma@example.com",
    name: "Sneha Verma",
    location: "Delhi, India",
    orders: 4,
    amountSpent: 1196,
    joinedAt: "2026-10-20",
    emailSubscription: "Subscribed",
  },
  {
    id: "cus_1006",
    email: "vikram.rao@example.com",
    name: "Vikram Rao",
    location: "Chennai, Tamil Nadu, India",
    orders: 1,
    amountSpent: 349,
    joinedAt: "2026-10-18",
    emailSubscription: "Not subscribed",
  },
  {
    id: "cus_1007",
    email: "kavya.g@example.com",
    name: "Kavya G",
    location: "Warangal, Telangana, India",
    orders: 0,
    amountSpent: 0,
    joinedAt: "2026-10-15",
    emailSubscription: "Subscribed",
  },
  {
    id: "cus_1008",
    email: "aditya.mehta@example.com",
    name: "Aditya Mehta",
    location: "Pune, Maharashtra, India",
    orders: 2,
    amountSpent: 698,
    joinedAt: "2026-10-12",
    emailSubscription: "Not subscribed",
  },
];

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
  }).format(new Date(`${value}T00:00:00`));

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [subscription, setSubscription] = useState("ALL");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesSearch =
        !query ||
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.id.toLowerCase().includes(query) ||
        client.location.toLowerCase().includes(query);

      const matchesSubscription =
        subscription === "ALL" || client.emailSubscription === subscription;

      return matchesSearch && matchesSubscription;
    });
  }, [search, subscription]);

  const pageCount = Math.max(1, Math.ceil(filteredClients.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const totalSpent = clients.reduce(
    (total, client) => total + client.amountSpent,
    0,
  );
  const totalOrders = clients.reduce(
    (total, client) => total + client.orders,
    0,
  );

  function exportClients() {
    const headers = [
      "Customer ID",
      "Name",
      "Email",
      "Location",
      "Orders",
      "Amount Spent",
      "Email Subscription",
    ];

    const rows = filteredClients.map((client) => [
      client.id,
      client.name,
      client.email,
      client.location,
      client.orders,
      client.amountSpent.toFixed(2),
      client.emailSubscription,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "luring-invite-clients-demo.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updateSubscription(value: string) {
    setSubscription(value);
    setPage(1);
  }

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
              Manage customer profiles, order history and total spending.
            </p>
          </div>

          <button
            type="button"
            onClick={exportClients}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition hover:border-purple-200 hover:bg-purple-50"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Export CSV
          </button>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Total clients"
            value={String(clients.length)}
            icon={<Users className="h-5 w-5" />}
          />
          <SummaryCard
            label="Total orders"
            value={String(totalOrders)}
            icon={<Mail className="h-5 w-5" />}
          />
          <SummaryCard
            label="Total amount spent"
            value={money(totalSpent)}
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
                Customer records and purchase summaries.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => updateSearch(event.target.value)}
                  placeholder="Search customers"
                  aria-label="Search customers"
                  className="h-11 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#A86DCD] focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div className="relative sm:w-52">
                <select
                  value={subscription}
                  onChange={(event) => updateSubscription(event.target.value)}
                  aria-label="Filter email subscription"
                  className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 pr-9 text-sm text-gray-700 outline-none focus:border-[#A86DCD] focus:ring-2 focus:ring-purple-100"
                >
                  <option value="ALL">All subscriptions</option>
                  <option value="Subscribed">Subscribed</option>
                  <option value="Not subscribed">Not subscribed</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                    Customer
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                    Email subscription
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                    Location
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500">
                    Orders
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500">
                    Amount spent
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleClients.map((client) => (
                  <tr
                    key={client.id}
                    className="transition hover:bg-purple-50/30"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={client.name} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {client.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {client.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <SubscriptionBadge status={client.emailSubscription} />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {client.location}
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-gray-700">
                      {client.orders}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-gray-900">
                      {money(client.amountSpent)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedClient(client)}
                        aria-label={`View ${client.name}`}
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
            {visibleClients.map((client) => (
              <article
                key={client.id}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={client.name} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {client.name}
                    </p>
                    <p className="mt-1 break-all text-xs text-gray-500">
                      {client.email}
                    </p>
                    <div className="mt-2">
                      <SubscriptionBadge status={client.emailSubscription} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedClient(client)}
                    aria-label={`View ${client.name}`}
                    className="rounded-lg p-2 text-gray-500 hover:bg-purple-50 hover:text-[#A86DCD]"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                  <div>
                    <p className="text-xs text-gray-500">Orders</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {client.orders}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amount spent</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {money(client.amountSpent)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="mt-1 text-sm text-gray-700">
                      {client.location}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <div className="px-5 py-14 text-center">
              <Users className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-3 font-medium text-gray-900">No clients found</p>
              <p className="mt-1 text-sm text-gray-500">
                Try another search or subscription filter.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-gray-500">
              {filteredClients.length === 0
                ? "No results"
                : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredClients.length)} of ${filteredClients.length} clients`}
            </p>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                aria-label="Previous page"
                className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-16 text-center text-xs text-gray-500">
                Page {currentPage} of {pageCount}
              </span>
              <button
                type="button"
                disabled={currentPage >= pageCount}
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
          Static demonstration data. No customer records are read or modified.
        </p>
      </div>

      {selectedClient && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedClient(null);
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
                <Avatar name={selectedClient.name} large />
                <div>
                  <h2
                    id="client-dialog-title"
                    className="font-semibold text-gray-900"
                  >
                    {selectedClient.name}
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
                value={dateLabel(selectedClient.joinedAt)}
              />
              <DetailBox
                label="Total orders"
                value={String(selectedClient.orders)}
              />
              <DetailBox
                label="Amount spent"
                value={money(selectedClient.amountSpent)}
              />
              <div className="col-span-2 rounded-xl border border-gray-100 p-3">
                <p className="text-xs text-gray-500">Location</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {selectedClient.location}
                </p>
              </div>
              <div className="col-span-2 rounded-xl border border-gray-100 p-3">
                <p className="text-xs text-gray-500">Email subscription</p>
                <div className="mt-2">
                  <SubscriptionBadge
                    status={selectedClient.emailSubscription}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-purple-50 p-4">
              <p className="text-sm font-semibold text-gray-900">
                Order history
              </p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                This static profile shows {selectedClient.orders} sample
                {selectedClient.orders === 1 ? " order" : " orders"}. The
                actual order history and generated video links will be loaded
                after database integration.
              </p>
            </div>

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

function Avatar({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  const initials = name
    .split(" ")
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
      {initials}
    </div>
  );
}

function SubscriptionBadge({
  status,
}: {
  status: Client["emailSubscription"];
}) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
        status === "Subscribed"
          ? "bg-emerald-100 text-emerald-800"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
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
