import type { CSSProperties } from 'react';
import type { Placement } from '../types/placement';

interface ModalPlacementDetailsProps {
  placement: Placement;
  onClose: () => void;
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 200,
};

const modalStyle: CSSProperties = {
  background: '#fff',
  borderRadius: '16px',
  padding: '32px',
  maxWidth: '480px',
  width: '90%',
  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
  position: 'relative',
};

const closeButtonStyle: CSSProperties = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
};

export const ModalPlacementDetails = ({ placement, onClose }: ModalPlacementDetailsProps) => (
  <div style={overlayStyle} onClick={onClose}>
    <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
      <button type="button" style={closeButtonStyle} aria-label="Close details" onClick={onClose}>
        ×
      </button>
      <div className="company-logo" style={{ marginBottom: '16px' }}>
        {placement.logo}
      </div>
      <h3 className="card-title" style={{ marginBottom: '8px' }}>
        {placement.title}
      </h3>
      <p className="card-company" style={{ marginBottom: '16px' }}>
        {placement.company} — {placement.location}
      </p>
      <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.5 }}>
        This would open a modal with full details for placement #{placement.id}. In the prototype this action triggered an
        alert, and this placeholder keeps the same intent while fitting the redesigned UI.
      </p>
    </div>
  </div>
);
