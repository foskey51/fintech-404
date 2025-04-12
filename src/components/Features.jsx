import React from 'react';
import {
  AlertTriangle,
  Database,
  Server,
  BarChart2,
  Lock,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: <AlertTriangle className="h-8 w-8 text-purple-500" />,
    title: "Real-time Detection",
    description: "Identify and prevent fraudulent activities as they happen with our AI-powered system."
  },
  {
    icon: <Database className="h-8 w-8 text-purple-500" />,
    title: "Pattern Recognition",
    description: "Advanced algorithms that learn and adapt to new fraud patterns automatically."
  },
  {
    icon: <Server className="h-8 w-8 text-purple-500" />,
    title: "Secure Infrastructure",
    description: "Bank-grade security infrastructure keeping your data safe and protected."
  },
  {
    icon: <BarChart2 className="h-8 w-8 text-purple-500" />,
    title: "Analytics Dashboard",
    description: "Comprehensive analytics and reporting for full visibility into your security status."
  },
  {
    icon: <Lock className="h-8 w-8 text-purple-500" />,
    title: "Access Control",
    description: "Granular access controls and authentication for team management."
  },
  {
    icon: <Zap className="h-8 w-8 text-purple-500" />,
    title: "Instant Alerts",
    description: "Immediate notifications when suspicious activities are detected."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-[#0A0A0B]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#B97CFF]">
          Advanced Protection Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition-all hover:transform hover:scale-105"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
