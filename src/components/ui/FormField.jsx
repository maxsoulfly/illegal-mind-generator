export default function FormField({ label, children, className = '' }) {
  return (
    <div className={`form-group${className ? ` ${className}` : ''}`}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}
