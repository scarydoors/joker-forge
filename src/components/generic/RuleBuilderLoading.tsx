const RuleBuilderLoading = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div
          className="absolute inset-0 border-2 border-mint/20 border-t-mint rounded-full"
          style={{ animation: "spin 0.6s linear infinite" }}
        ></div>
        <div
          className="absolute inset-1 border-2 border-mint/30 border-b-mint rounded-full"
          style={{ animation: "spin 0.8s linear infinite reverse" }}
        ></div>
        <div
          className="absolute inset-2 w-8 h-8 bg-mint/80 rounded-full"
          style={{ animation: "pulse 0.4s ease-in-out infinite alternate" }}
        ></div>
      </div>
    </div>
  );
};

export default RuleBuilderLoading;
