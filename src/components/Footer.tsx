import { Link } from 'react-router-dom';
import { Feather, Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Feather className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Blog<span className="text-purple-300">Nest</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              A modern blogging platform where writers share ideas, discover stories,
              and connect through meaningful content.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://github.com/nawaz44-design" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all" title="GitHub">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/in/ahamed-nawaz-9950a43aa/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all" title="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-purple-300 transition-colors">Home</Link></li>
              <li><Link to="/explore" className="hover:text-purple-300 transition-colors">Explore Blogs</Link></li>
              <li><Link to="/categories" className="hover:text-purple-300 transition-colors">Categories</Link></li>
              <li><Link to="/about" className="hover:text-purple-300 transition-colors">About</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-white mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-purple-300 transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-purple-300 transition-colors">Register</Link></li>
              <li><Link to="/dashboard" className="hover:text-purple-300 transition-colors">Dashboard</Link></li>
              <li><Link to="/create-post" className="hover:text-purple-300 transition-colors">Write a Post</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} BlogNest. Built with passion for writers.</p>
        </div>
      </div>
    </footer>
  );
}
