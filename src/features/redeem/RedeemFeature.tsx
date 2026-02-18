export function RedeemFeature() {
  return (
    <div className="flex flex-row gap-card justify-center items-start">
      {/* Left Column: Main Pending Withdrawal Card */}
      <div className="bg-card text-card-foreground rounded-card size-card-primary p-8 flex flex-col transition-colors duration-300">
        {/* PendingWithdrawalCard content will go here */}
      </div>

      {/* Right Column: Claims + Portfolio */}
      <div className="flex flex-col gap-card">
        {/* Claims Card */}
        <div className="bg-card-claims text-card-claims-foreground rounded-card w-card-secondary h-card-claims p-4 flex flex-col transition-colors duration-300">
          {/* ClaimsCard content will go here */}
        </div>

        {/* Portfolio Card */}
        <div className="bg-card-tertiary text-card-tertiary-foreground rounded-card w-card-secondary h-card-tertiary p-8 flex flex-col transition-colors duration-300">
          {/* PortfolioCard content will go here */}
        </div>
      </div>
    </div>
  );
}
