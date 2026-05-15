import { useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Search,
    Filter,
} from "lucide-react";

export default function FaultHistory() {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");

    // Dummy data (Replace with API response)
    const [faults, setFaults] = useState([
        {
            id: 1,
            deviceId: "SL-101",
            type: "Low Power Fault",
            power: 42,
            time: "2026-05-12 10:15 AM",
            marked: false,
        },
        {
            id: 2,
            deviceId: "SL-205",
            type: "Overpower Fault",
            power: 190,
            time: "2026-05-12 11:02 AM",
            marked: true,
        },
        {
            id: 3,
            deviceId: "SL-309",
            type: "Low Power Fault",
            power: 30,
            time: "2026-05-12 12:40 PM",
            marked: false,
        },
    ]);

    // Toggle Marked / Resolved
    const toggleMarked = (id) => {
        setFaults((prev) =>
            prev.map((fault) =>
                fault.id === id
                    ? { ...fault, marked: !fault.marked }
                    : fault
            )
        );
    };

    // Filter + Search
    const filteredFaults = faults.filter((fault) => {
        const matchesSearch =
            fault.deviceId.toLowerCase().includes(search.toLowerCase()) ||
            fault.type.toLowerCase().includes(search.toLowerCase());

        const matchesFilter =
            filter === "ALL"
                ? true
                : filter === "MARKED"
                    ? fault.marked
                    : !fault.marked;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Fault History
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Monitor and manage street light faults
                    </p>
                </div>

                {/* Search + Filter */}
                <div className="flex gap-3 flex-col sm:flex-row">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search faults..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-3 text-gray-400" size={18} />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">All</option>
                            <option value="MARKED">Marked</option>
                            <option value="UNMARKED">Unmarked</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Fault Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredFaults.map((fault) => (
                    <div
                        key={fault.id}
                        className={`rounded-2xl shadow-md p-5 transition-all duration-300 border ${fault.marked
                            ? "bg-green-50 border-green-300"
                            : "bg-white border-red-200"
                            } hover:shadow-xl`}
                    >
                        {/* Top */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {fault.deviceId}
                                </h2>

                                <div className="mt-2 flex items-center gap-2">
                                    {fault.marked ? (
                                        <CheckCircle2 className="text-green-600" size={18} />
                                    ) : (
                                        <AlertTriangle className="text-red-500" size={18} />
                                    )}

                                    <span
                                        className={`text-sm font-medium ${fault.marked
                                            ? "text-green-700"
                                            : "text-red-600"
                                            }`}
                                    >
                                        {fault.type}
                                    </span>
                                </div>
                            </div>

                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${fault.marked
                                    ? "bg-green-200 text-green-800"
                                    : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {fault.marked ? "MARKED" : "ACTIVE"}
                            </span>
                        </div>

                        {/* Info */}
                        <div className="mt-5 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Power</span>
                                <span className="font-semibold text-gray-800">
                                    {fault.power} W
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 flex items-center gap-1">
                                    <Clock3 size={15} />
                                    Time
                                </span>

                                <span className="text-sm text-gray-700">
                                    {fault.time}
                                </span>
                            </div>
                        </div>

                        {/* Action */}
                        <button
                            onClick={() => toggleMarked(fault.id)}
                            className={`w-full mt-5 py-2 rounded-xl font-medium transition-all duration-200 ${fault.marked
                                ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                : "bg-red-500 hover:bg-red-600 text-white"
                                }`}
                        >
                            {fault.marked
                                ? "Unmark Fault"
                                : "Mark as Resolved"}
                        </button>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredFaults.length === 0 && (
                <div className="mt-16 text-center">
                    <AlertTriangle
                        className="mx-auto text-gray-400"
                        size={50}
                    />
                    <h2 className="mt-4 text-xl font-semibold text-gray-700">
                        No Faults Found
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Try adjusting your search or filters
                    </p>
                </div>
            )}
        </div>
    );
}