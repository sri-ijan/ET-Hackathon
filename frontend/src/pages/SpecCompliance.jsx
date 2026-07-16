import {
  Sparkles,
  ShieldCheck,
  TriangleAlert,
  CircleCheckBig,
} from "lucide-react";

import UploadBox from "../components/common/UploadBox";
import ComparisonTable from "../components/spec/ComparisonTable";

function SpecCompliance() {
  return (
    <div className="space-y-10">

      {/* Hero */}

      <section className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-10 shadow-xl">

        <div className="flex justify-between items-center">

          <div>

            <p className="uppercase tracking-[0.3em] text-blue-200 text-sm font-semibold">
              AI MODULE
            </p>

            <h1 className="text-5xl font-bold mt-3">
              Spec Compliance Agent
            </h1>

            <p className="text-blue-100 mt-5 max-w-3xl leading-8">
              Upload the project specification and vendor
              submittal. AI extracts parameters, compares
              them automatically and highlights every
              deviation with reasons.
            </p>

          </div>

          <div className="hidden xl:flex w-28 h-28 rounded-3xl bg-white/10 backdrop-blur items-center justify-center">

            <Sparkles size={55} />

          </div>

        </div>

      </section>

      {/* Stats */}

      <section className="grid lg:grid-cols-3 gap-6">

        <div className="bg-white rounded-3xl border border-slate-200 p-7">

          <div className="flex justify-between">

            <div>

              <p className="text-slate-500">
                Parameters Checked
              </p>

              <h2 className="text-4xl font-bold mt-2">
                48
              </h2>

            </div>

            <CircleCheckBig
              className="text-green-600"
              size={40}
            />

          </div>

        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-7">

          <div className="flex justify-between">

            <div>

              <p className="text-slate-500">
                Passed
              </p>

              <h2 className="text-4xl font-bold mt-2">
                41
              </h2>

            </div>

            <ShieldCheck
              className="text-green-600"
              size={40}
            />

          </div>

        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-7">

          <div className="flex justify-between">

            <div>

              <p className="text-slate-500">
                Deviations
              </p>

              <h2 className="text-4xl font-bold mt-2">
                07
              </h2>

            </div>

            <TriangleAlert
              className="text-red-500"
              size={40}
            />

          </div>

        </div>

      </section>

      {/* Upload */}

      <section className="grid xl:grid-cols-2 gap-8">

        <UploadBox
          title="Specification Document"
          subtitle="Upload EPC specification PDF or DOCX."
        />

        <UploadBox
          title="Vendor Submittal"
          subtitle="Upload vendor submitted document."
        />

      </section>

      {/* Compare */}

      <section className="flex justify-center">

        <button className="bg-blue-600 hover:bg-blue-700 transition text-white text-lg px-12 py-4 rounded-2xl font-semibold shadow-lg">

          Compare Documents

        </button>

      </section>

      {/* Results */}

      <ComparisonTable />

    </div>
  );
}

export default SpecCompliance;