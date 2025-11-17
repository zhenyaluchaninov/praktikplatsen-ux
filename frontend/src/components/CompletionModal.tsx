import confettiIcon from '../assets/congrats-confetti.svg'; // Twemoji (CC-BY 4.0)

interface CompletionModalProps {
  onClose: () => void;
}

export const CompletionModal = ({ onClose }: CompletionModalProps) => (
  <div className="completion-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="completionModalTitle" onClick={onClose}>
    <div className="completion-modal" onClick={(event) => event.stopPropagation()}>
      <div className="completion-modal__icon" aria-hidden="true">
        <img src={confettiIcon} alt="" />
      </div>
      <h3 id="completionModalTitle" className="completion-modal__title">
        Congrats!
      </h3>
      <p className="completion-modal__message">
        You've submitted 10 applications. Now wait for an employer to accept you - we'll email you as soon as it happens.
      </p>
      <button type="button" className="completion-modal__button" onClick={onClose}>
        Got it
      </button>
    </div>
  </div>
);
