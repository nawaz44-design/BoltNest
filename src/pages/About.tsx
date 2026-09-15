import { Link } from 'react-router-dom';
import { Feather, PenLine, Users, MessageCircle, Search, Shield, Sparkles, ArrowRight, Github, Linkedin } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: PenLine,
      title: 'Write & Publish',
      desc: 'Create beautiful blog posts with our intuitive editor. Draft, publish, and edit your stories with ease.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Search,
      title: 'Discover Stories',
      desc: 'Search and filter through hundreds of blog posts by category, author, or content. Find exactly what interests you.',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: MessageCircle,
      title: 'Engage & Comment',
      desc: 'Join the conversation. Share your thoughts on posts and connect with writers through comments.',
      gradient: 'from-coral-500 to-pink-500',
    },
    {
      icon: Users,
      title: 'Build Your Profile',
      desc: 'Create a personalized profile, track your stats, and showcase your published work to the community.',
      gradient: 'from-purple-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      desc: 'Your data is protected with industry-standard security. You control your content and profile.',
      gradient: 'from-green-500 to-cyan-500',
    },
    {
      icon: Sparkles,
      title: 'Modern Experience',
      desc: 'Enjoy a beautiful, responsive interface designed for readers and writers across all devices.',
      gradient: 'from-pink-500 to-purple-500',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-purple-900 to-navy-900 py-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Feather className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-white mb-6">
            About <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">BlogNest</span>
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            BlogNest is a modern blogging platform built for writers and readers who care about
            meaningful content. We believe everyone has a story to tell, and we provide the tools
            to share it beautifully.
          </p>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-navy-900">What You Can Do</h2>
          <p className="text-slate-500 mt-2">Everything you need to write, share, and connect.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="card p-6 group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-semibold text-lg text-navy-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Connect with creator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="card p-8 md:p-10 text-center">
          <h2 className="font-display font-bold text-2xl text-navy-900 mb-2">Connect with the Creator</h2>
          <p className="text-slate-500 mb-6">Follow along or reach out on social platforms.</p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://github.com/nawaz44-design"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
            >
              <Github className="w-5 h-5" /> GitHub
            </a>
            <a
              href=
              "https://www.linkedin.com/in/ahamed-nawaz-4b1a70275?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <Linkedin className="w-5 h-5" /> LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 p-10 md:p-16 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="font-display font-bold text-3xl text-white mb-4">Join Our Community</h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Start writing today and become part of a growing community of passionate storytellers.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 font-bold rounded-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
