import React from "react";

const ProjectHealth = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">

      <h2 className="text-lg font-semibold mb-6">
        Overall Project Health
      </h2>

      <div className="flex justify-center">

        <div className="relative w-44 h-44 rounded-full border-[14px] border-green-500 flex items-center justify-center">

          <div className="text-center">

            <h1 className="text-5xl font-bold">
              87%
            </h1>

            <p className="text-slate-500">
              Healthy
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ProjectHealth;