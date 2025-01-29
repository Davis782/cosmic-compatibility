import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">
            LoveMeet
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost">Browse</Button>
            </Link>
            <Link to="/messages">
              <Button variant="ghost">Messages</Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};