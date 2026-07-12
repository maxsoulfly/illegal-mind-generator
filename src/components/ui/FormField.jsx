export default function FormField({ label, children, className = '', id }) {
  return (
    <div id={id} className={`form-group${className ? ` ${className}` : ''}`}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}
