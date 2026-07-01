import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-hero">
      <div className="w-full max-w-md">
        <div className="luxury-card p-8 text-center">
          <h2 className="font-playfair text-2xl font-bold text-earth mb-4">Registration Disabled</h2>
          <p className="text-stone">Customer registration is disabled. Internal staff accounts are managed by the owner.</p>
          <div className="mt-6">
            <Link to="/login" className="btn-gold">Staff Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
