function LoadingSkeleton() {
  return (
    <div className="equipment-details-skeleton">
      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <div className="equipment-panel equipment-panel--skeleton">
            <div className="placeholder-glow">
              <div className="placeholder equipment-skeleton-media" />
            </div>
            <div className="d-flex gap-2 mt-4">
              <div className="placeholder col-2 rounded-pill equipment-skeleton-chip" />
              <div className="placeholder col-1 rounded-pill equipment-skeleton-chip" />
            </div>
            <div className="placeholder-glow mt-3">
              <span className="placeholder col-7 equipment-skeleton-line" />
              <span className="placeholder col-4 equipment-skeleton-line" />
              <span className="placeholder col-10 equipment-skeleton-line" />
            </div>
            <div className="placeholder-glow mt-4">
              <span className="placeholder col-12 equipment-skeleton-block" />
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="equipment-panel equipment-panel--skeleton">
            <div className="placeholder-glow">
              <span className="placeholder col-6 equipment-skeleton-line" />
              <span className="placeholder col-10 equipment-skeleton-line" />
              <span className="placeholder col-8 equipment-skeleton-line" />
            </div>
            <div className="placeholder-glow mt-4">
              <span className="placeholder col-12 equipment-skeleton-block" />
            </div>
            <div className="placeholder-glow mt-4">
              <span className="placeholder col-12 equipment-skeleton-block" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingSkeleton;
