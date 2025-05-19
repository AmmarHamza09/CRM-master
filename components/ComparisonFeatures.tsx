import React from "react";
import SectionHeading from "./global/SectionHeading";
import FeaturesCard from "./FeaturesCard";

export default function ComparisonFeatures() {
  const cons = [
"Manual task assignment and tracking",
"Scattered communication across platforms",
"Limited visibility into project progress",
"Difficult to manage resources effectively",
"Complex reporting and analytics",
  ];
  const pros = [
"Automated task workflows",
"Centralized team communication",
"Real-time project dashboards",
"Intelligent resource allocation",
"One-click comprehensive reports",
  ];
  return (
    <div className="text-center ">
      <div className="pb-6">
        <SectionHeading title="Tired of juggeling multiple project tools?" />
      </div>
      <div className="py-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FeaturesCard
          features={cons}
          title="Project Management without Our System:"
          className="bg-red-50 text-red-800"
        />
        <FeaturesCard
          features={pros}
          title="Project Management with Our System:"
          className="bg-green-50 text-green-800"
        />
      </div>
    </div>
  );
}
