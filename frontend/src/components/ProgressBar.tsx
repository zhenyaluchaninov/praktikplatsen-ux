interface ProgressBarProps {
  countText: string;
  percentage: number;
  weekLabel: string;
  requirementText: string;
}

export const ProgressBar = ({
  countText,
  percentage,
  weekLabel,
  requirementText,
}: ProgressBarProps) => (
  <div className="progress-section">
    <div className="progress-content">
      <div className="progress-header">
        <div className="progress-text">
          Your Applications: <span className="progress-count" id="progressCount">{countText}</span>
        </div>
        <div className="progress-text">{weekLabel}</div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" id="progressFill" style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="progress-requirements">
        ✓ <span className="requirement-met">{requirementText}</span>
      </div>
    </div>
  </div>
);

