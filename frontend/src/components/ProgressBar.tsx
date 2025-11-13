interface ProgressBarProps {
  countText: string;
  percentage: number;
  weekLabel: string;
  complete?: boolean;
}

export const ProgressBar = ({ countText, percentage, weekLabel, complete = false }: ProgressBarProps) => (
  <div className={`progress-section${complete ? ' progress-section--complete' : ''}`}>
    <div className="progress-content">
      <div className="progress-header">
        <div className="progress-text">
          {complete && <span className="progress-status-badge">All done!</span>}
          Your Applications:{' '}
          <span className={`progress-count${complete ? ' progress-count--complete' : ''}`} id="progressCount">
            {countText}
          </span>
        </div>
        <div className="progress-text">{weekLabel}</div>
      </div>
      <div className="progress-bar">
        <div
          className={`progress-fill${complete ? ' progress-fill--complete' : ''}`}
          id="progressFill"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  </div>
);
