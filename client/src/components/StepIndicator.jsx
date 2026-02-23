const StepIndicator = ({ currentStep, totalSteps, label, labelHi }) => {
    return (
        <div className="mb-1">
            <p className="step-badge">STEP {currentStep} OF {totalSteps}</p>
            <h1 className="text-2xl font-bold text-foreground mt-1">{label}</h1>
            <p className="text-sm text-muted-foreground">{labelHi}</p>
        </div>
    );
};

export default StepIndicator;
