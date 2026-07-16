function StatusBadge({ status }) {

  if (status === "Pass") {
    return (
      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
        Pass
      </span>
    );
  }

  if (status === "Flagged") {
    return (
      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
        Flagged
      </span>
    );
  }

  return (
    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
      Failed
    </span>
  );
}

export default StatusBadge;
